import type Stripe from "stripe";
import { applySubscription, syncCustomerSubscription } from "@/lib/billing";
import { settlePaidCheckout } from "@/lib/escrow";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return new Response("Stripe webhook is not configured.", { status: 500 });

  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature.", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return new Response("Invalid signature.", { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    if (session.mode === "subscription") await syncCheckoutSubscription(session);
    else await settlePaidCheckout(session);
  } else if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    await syncSubscription(event.data.object);
  } else if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
    await syncInvoice(event.data.object, event.type === "invoice.payment_failed");
  } else if (event.type === "transfer.created") {
    await markTransfer(event.data.object);
  } else if (event.type === "charge.refunded") {
    await markRefund(event.data.object);
  } else if (event.type === "charge.dispute.created") {
    await notifyPaymentProblem(paymentIntentFromUnknown(event.data.object.payment_intent), "A card payment was disputed.");
  } else if (event.type === "radar.early_fraud_warning.created") {
    await notifyPaymentProblem(await paymentIntentForCharge(stripe, event.data.object.charge), "Stripe flagged a card payment for review.");
  }

  return new Response("ok");
}

async function syncCheckoutSubscription(session: Stripe.Checkout.Session) {
  const customerId = idOf(session.customer);
  if (customerId) await syncCustomerSubscription(customerId);
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const customerId = idOf(subscription.customer);
  if (!customerId) return;
  const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId, role: "business" } });
  if (!user) return;
  if (subscription.status === "canceled" || subscription.status === "incomplete_expired") {
    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionPlan: "free", subscriptionStatus: "inactive", stripeSubscriptionId: subscription.id },
    });
    return;
  }
  await applySubscription(user.id, subscription);
}

async function syncInvoice(invoice: Stripe.Invoice, failed: boolean) {
  const dealId = invoice.metadata?.dealId;
  if (dealId && !failed) {
    await prisma.deal.updateMany({ where: { id: dealId }, data: { stripeInvoiceId: invoice.id } });
    return;
  }
  const customerId = idOf(invoice.customer);
  if (!customerId || !subscriptionId(invoice)) return;
  if (failed) {
    await prisma.user.updateMany({
      where: { stripeCustomerId: customerId, role: "business" },
      data: { subscriptionStatus: "past_due" },
    });
    return;
  }
  await syncCustomerSubscription(customerId);
}

async function markTransfer(transfer: Stripe.Transfer) {
  const dealId = transfer.metadata?.dealId;
  if (!dealId) return;
  await prisma.deal.updateMany({
    where: { id: dealId, paymentStatus: "paid_escrowed" },
    data: { paymentStatus: "released", stripeTransferId: transfer.id },
  });
}

async function markRefund(charge: Stripe.Charge) {
  const paymentIntentId = paymentIntentFromUnknown(charge.payment_intent);
  if (!paymentIntentId || charge.amount_refunded < charge.amount) return;
  const deal = await prisma.deal.findFirst({ where: { stripePaymentIntentId: paymentIntentId } });
  if (!deal || deal.paymentStatus === "released") return;
  await prisma.deal.update({ where: { id: deal.id }, data: { paymentStatus: "refunded" } });
  await prisma.message.create({
    data: { dealId: deal.id, body: "The card charge was refunded. The athlete payout was not sent.", system: true },
  });
}

async function notifyPaymentProblem(paymentIntentId: string | null, body: string) {
  if (!paymentIntentId) return;
  const deal = await prisma.deal.findFirst({ where: { stripePaymentIntentId: paymentIntentId } });
  if (!deal) return;
  await prisma.notification.create({
    data: { userId: deal.businessId, title: "Payment needs attention", body, href: `/dashboard/deals/${deal.id}` },
  });
}

async function paymentIntentForCharge(stripe: Stripe, charge: string | Stripe.Charge | null) {
  const chargeId = typeof charge === "string" ? charge : charge?.id;
  if (!chargeId) return null;
  const loaded = await stripe.charges.retrieve(chargeId);
  return paymentIntentFromUnknown(loaded.payment_intent);
}

function paymentIntentFromUnknown(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value && typeof value.id === "string") return value.id;
  return null;
}

function idOf(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value && typeof value.id === "string") return value.id;
  return null;
}

function subscriptionId(invoice: Stripe.Invoice) {
  const parent = invoice.parent;
  if (parent?.type === "subscription_details") return idOf(parent.subscription_details?.subscription);
  return null;
}
