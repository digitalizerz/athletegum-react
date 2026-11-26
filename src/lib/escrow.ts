import type Stripe from "stripe";
import { dealTypeName, money, toCents } from "@/lib/deals";
import { sendDealInvitation } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { appOrigin } from "@/lib/app-origin";
import { integrationLabel, requireStripe } from "@/lib/stripe";

export async function createDealCheckout(dealId: string) {
  const stripe = requireStripe();
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: { business: true },
  });
  if (!deal) throw new Error("Deal not found.");
  if (deal.paymentStatus === "paid_escrowed" || deal.paymentStatus === "released") return null;

  let customerId = deal.business.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: deal.business.email,
      name: deal.business.businessName || deal.business.name,
      metadata: { userId: deal.business.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: deal.business.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const origin = await appOrigin();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    client_reference_id: deal.id,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: toCents(deal.compensationAmount),
          product_data: {
            name: `${dealTypeName(deal.dealType)} deal`,
            description: "Charged now and held until the work is approved.",
          },
        },
      },
    ],
    metadata: { dealId: deal.id },
    payment_intent_data: { metadata: { dealId: deal.id } },
    invoice_creation: {
      enabled: true,
      invoice_data: {
        description: `${dealTypeName(deal.dealType)} deal`,
        footer: "AthleteGum",
        metadata: { dealId: deal.id },
      },
    },
    integration_identifier: integrationLabel("deal"),
    success_url: `${origin}/dashboard/deals/${deal.id}?checkout=success`,
    cancel_url: `${origin}/dashboard/deals/${deal.id}?checkout=cancel`,
  });

  await prisma.deal.update({
    where: { id: deal.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  if (!session.url) throw new Error("Stripe did not return a checkout page.");
  return session.url;
}

export async function settlePaidCheckout(session: Stripe.Checkout.Session) {
  const dealId = session.metadata?.dealId ?? session.client_reference_id;
  if (!dealId || session.payment_status !== "paid") return;

  const deal = await prisma.deal.findUnique({ where: { id: dealId }, include: { business: true, invitations: true } });
  if (!deal) return;
  if (session.amount_total !== toCents(deal.compensationAmount)) return;

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
  const invoiceId = typeof session.invoice === "string" ? session.invoice : session.invoice?.id ?? null;

  const updated = await prisma.deal.updateMany({
    where: { id: deal.id, status: "draft", paymentStatus: "unpaid" },
    data: {
      status: "pending",
      paymentStatus: "paid_escrowed",
      stripePaymentIntentId: paymentIntentId,
      stripeInvoiceId: invoiceId,
      paidAt: new Date(),
    },
  });
  if (updated.count === 0) return;

  const invite = deal.invitations[0];
  const athlete = invite
    ? await prisma.user.findUnique({ where: { email: invite.athleteEmail } })
    : null;

  await prisma.message.create({
    data: {
      dealId: deal.id,
      body: "Card payment received. Funds are held until the work is approved.",
      system: true,
    },
  });

  if (athlete?.role === "athlete") {
    if (invite && invite.athleteId !== athlete.id) {
      await prisma.dealInvitation.update({
        where: { id: invite.id },
        data: { athleteId: athlete.id },
      });
    }
    await prisma.notification.create({
      data: {
        userId: athlete.id,
        title: "New deal invitation",
        body: `${deal.business.businessName || deal.business.name} invited you to a ${dealTypeName(deal.dealType).toLowerCase()} deal. The payment is already held.`,
        href: `/athlete/deals/${deal.id}`,
      },
    });
  }

  if (invite) {
    const origin = await appOrigin();
    await sendDealInvitation(
      invite.athleteEmail,
      athlete?.name || "there",
      deal.business.businessName || deal.business.name,
      dealTypeName(deal.dealType).toLowerCase(),
      money(deal.athleteNetPayout),
      athlete ? `${origin}/athlete/deals/${deal.id}` : `${origin}/athlete/login`,
    );
  }
}

export async function confirmDealCheckout(dealId: string, businessId: string) {
  const deal = await prisma.deal.findFirst({ where: { id: dealId, businessId } });
  if (!deal || deal.paymentStatus !== "unpaid" || !deal.stripeCheckoutSessionId) return;
  const stripe = requireStripe();
  const session = await stripe.checkout.sessions.retrieve(deal.stripeCheckoutSessionId);
  await settlePaidCheckout(session);
}
