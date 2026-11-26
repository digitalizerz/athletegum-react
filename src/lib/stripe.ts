import Stripe from "stripe";

export class PaymentsNotConfiguredError extends Error {
  constructor() {
    super("Card payments are not set up on this server yet.");
    this.name = "PaymentsNotConfiguredError";
  }
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export function requireStripe() {
  const stripe = getStripe();
  if (!stripe) throw new PaymentsNotConfiguredError();
  return stripe;
}
