import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { integrationLabel, requireStripe } from "@/lib/stripe";

const PLANS = {
  pro: { name: "AthleteGum Pro", amount: 4900, lookupKey: "athletegum_pro_monthly" },
  growth: { name: "AthleteGum Growth", amount: 9900, lookupKey: "athletegum_growth_monthly" },
} as const;

export type PaidPlan = keyof typeof PLANS;

export async function ensureCustomer(userId: string) {
  const stripe = requireStripe();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "business") throw new Error("Business account not found.");
  if (user.stripeCustomerId) return { stripe, user, customerId: user.stripeCustomerId };

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.businessName || user.name,
    metadata: { userId: user.id },
  });
  await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customer.id } });
  return { stripe, user, customerId: customer.id };
}

export async function planPrice(stripe: Stripe, plan: PaidPlan) {
  const spec = PLANS[plan];
  const existing = await stripe.prices.list({ lookup_keys: [spec.lookupKey], active: true, limit: 1 });
  if (existing.data[0]) return existing.data[0];
  const product = await stripe.products.create({ name: spec.name });
  return stripe.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: spec.amount,
    recurring: { interval: "month" },
    lookup_key: spec.lookupKey,
  });
}

export function planFromPrice(price: Stripe.Price | null | undefined): PaidPlan | null {
  if (price?.lookup_key === PLANS.pro.lookupKey) return "pro";
  if (price?.lookup_key === PLANS.growth.lookupKey) return "growth";
  return null;
}

export async function createSubscriptionCheckout(userId: string, plan: PaidPlan, origin: string) {
  const { stripe, customerId } = await ensureCustomer(userId);
  const price = await planPrice(stripe, plan);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: userId,
    line_items: [{ price: price.id, quantity: 1 }],
    success_url: `${origin}/dashboard/billing?checkout=success`,
    cancel_url: `${origin}/dashboard/billing?checkout=cancel`,
    metadata: { userId, plan },
    subscription_data: { metadata: { userId, plan } },
    integration_identifier: integrationLabel("subscription"),
  });
  if (!session.url) throw new Error("Stripe did not return a checkout page.");
  return session.url;
}

export async function createBillingPortal(userId: string, returnUrl: string) {
  const { stripe, customerId } = await ensureCustomer(userId);
  const [pro, growth] = await Promise.all([planPrice(stripe, "pro"), planPrice(stripe, "growth")]);
  const configuration = await stripe.billingPortal.configurations.create({
    features: {
      payment_method_update: { enabled: true },
      subscription_cancel: { enabled: true, mode: "at_period_end" },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ["price"],
        products: [
          { product: productId(pro), prices: [pro.id] },
          { product: productId(growth), prices: [growth.id] },
        ],
      },
    },
  });
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
    configuration: configuration.id,
  });
  return session.url;
}

export async function syncCustomerSubscription(customerId: string) {
  const stripe = requireStripe();
  const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId, role: "business" } });
  if (!user) return;
  const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 10 });
  const current = subscriptions.data.find((item) => item.status === "active" || item.status === "trialing" || item.status === "past_due") ?? null;
  if (!current) {
    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionPlan: "free", subscriptionStatus: "inactive", stripeSubscriptionId: null },
    });
    return;
  }
  await applySubscription(user.id, current);
}

export async function applySubscription(userId: string, subscription: Stripe.Subscription) {
  const price = subscription.items.data[0]?.price ?? null;
  const plan = planFromPrice(price) ?? (subscription.metadata.plan === "growth" ? "growth" : subscription.metadata.plan === "pro" ? "pro" : null);
  const status = subscription.status === "active" || subscription.status === "trialing" ? "active" : subscription.status === "past_due" ? "past_due" : "inactive";
  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeSubscriptionId: subscription.id,
      subscriptionPlan: status === "inactive" || !plan ? "free" : plan,
      subscriptionStatus: status,
    },
  });
}

function productId(price: Stripe.Price) {
  return typeof price.product === "string" ? price.product : price.product.id;
}
