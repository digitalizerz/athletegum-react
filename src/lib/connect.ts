import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { toCents } from "@/lib/deals";
import { getStripe, requireStripe } from "@/lib/stripe";

const embeddedFeatures = {
  disable_stripe_user_authentication: false,
  external_account_collection: true,
};

export async function ensureRecipientAccount(userId: string) {
  const stripe = requireStripe();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "athlete") throw new Error("Athlete account not found.");
  if (user.stripeAccountId) return user.stripeAccountId;

  const account = await stripe.v2.core.accounts.create({
    display_name: user.name,
    contact_email: user.email,
    dashboard: "express",
    identity: { country: "us", entity_type: "individual" },
    defaults: {
      currency: "usd",
      responsibilities: {
        fees_collector: "application",
        losses_collector: "application",
      },
    },
    configuration: {
      recipient: {
        capabilities: {
          stripe_balance: {
            stripe_transfers: { requested: true },
          },
        },
      },
    },
    include: ["configuration.recipient"],
    metadata: { userId: user.id },
  });

  await prisma.user.update({ where: { id: user.id }, data: { stripeAccountId: account.id } });
  return account.id;
}

export async function transfersActive(accountId: string) {
  const stripe = getStripe();
  if (!stripe) return false;
  const account = await stripe.v2.core.accounts.retrieve(accountId, { include: ["configuration.recipient"] });
  return account.configuration?.recipient?.capabilities?.stripe_balance?.stripe_transfers?.status === "active";
}

export async function accountSessionClientSecret(userId: string) {
  const stripe = requireStripe();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.stripeAccountId) throw new Error("Payout account is not set up yet.");
  const session = await stripe.accountSessions.create({
    account: user.stripeAccountId,
    components: {
      account_onboarding: { enabled: true, features: embeddedFeatures },
      account_management: { enabled: true, features: embeddedFeatures },
      notification_banner: { enabled: true, features: embeddedFeatures },
      payouts: {
        enabled: true,
        features: {
          ...embeddedFeatures,
          edit_payout_schedule: false,
          instant_payouts: false,
          standard_payouts: false,
        },
      },
    },
  });
  if (!session.client_secret) throw new Error("Stripe did not return a payout session.");
  return session.client_secret;
}

export async function onboardingLink(userId: string, origin: string) {
  const stripe = requireStripe();
  const accountId = await ensureRecipientAccount(userId);
  const refreshUrl = `${origin}/athlete/earnings/stripe-link?purpose=onboarding`;
  const link = await stripe.v2.core.accountLinks.create({
    account: accountId,
    use_case: {
      type: "account_onboarding",
      account_onboarding: {
        refresh_url: refreshUrl,
        return_url: `${origin}/athlete/earnings`,
        collection_options: { fields: "eventually_due" },
      },
    },
  });
  return link.url;
}

export async function dashboardLink(userId: string, origin: string) {
  const stripe = requireStripe();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.stripeAccountId) throw new Error("Payout account is not set up yet.");
  const link = await stripe.v2.core.accountLinks.create({
    account: user.stripeAccountId,
    use_case: {
      type: "account_dashboard",
      account_dashboard: { refresh_url: `${origin}/athlete/earnings/stripe-link?purpose=dashboard` },
    },
  });
  return link.url;
}

export async function releaseAthletePayout(dealId: string) {
  const stripe = getStripe();
  if (!stripe) return { sent: false, note: "Card payments are not set up on this server yet." };

  const deal = await prisma.deal.findUnique({ where: { id: dealId }, include: { athlete: true } });
  if (!deal || deal.paymentStatus === "released" || deal.stripeTransferId) {
    return { sent: Boolean(deal?.stripeTransferId), note: "The athlete payout was already sent." };
  }
  if (deal.paymentStatus !== "paid_escrowed" || !deal.stripePaymentIntentId) {
    return { sent: false, note: "There is no held card payment to send." };
  }
  if (!deal.athlete?.stripeAccountId) {
    return { sent: false, note: "The athlete has not finished payout setup, so the payment stays held." };
  }

  const ready = await transfersActive(deal.athlete.stripeAccountId);
  if (!ready) {
    return { sent: false, note: "The athlete's payout account is not ready yet, so the payment stays held." };
  }

  const amount = toCents(deal.athleteNetPayout);
  if (amount <= 0) return { sent: false, note: "There is no athlete share to send." };

  const paymentIntent = await stripe.paymentIntents.retrieve(deal.stripePaymentIntentId);
  const chargeId = typeof paymentIntent.latest_charge === "string" ? paymentIntent.latest_charge : paymentIntent.latest_charge?.id;
  if (!chargeId) return { sent: false, note: "The card charge is not ready to pay out yet." };

  try {
    const transfer = await stripe.transfers.create(
      {
        amount,
        currency: "usd",
        destination: deal.athlete.stripeAccountId,
        source_transaction: chargeId,
        metadata: { dealId: deal.id },
      },
      { idempotencyKey: `athletegum-payout-${deal.id}` },
    );
    await prisma.deal.update({
      where: { id: deal.id },
      data: { paymentStatus: "released", stripeTransferId: transfer.id },
    });
    return { sent: true, note: "The athlete's share was sent." };
  } catch (error) {
    console.error("Athlete payout failed", error);
    return { sent: false, note: payoutFailureNote(error) };
  }
}

function payoutFailureNote(error: unknown) {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  if (code === "balance_insufficient" || code === "insufficient_funds") {
    return "The card payment is still settling. The payout stays held until it can be sent.";
  }
  return "The payout could not be sent yet. The payment stays held.";
}

export function stripeFailureReason(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("loss") || message.includes("platform profile") || message.includes("responsibilit")) return "liability";
  return "failed";
}

export type TransferEvent = Stripe.Transfer;
