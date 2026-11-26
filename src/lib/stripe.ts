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

export function publishableKey() {
  return process.env.STRIPE_PUBLISHABLE_KEY || null;
}

export function integrationLabel(flow: string) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let suffix = "";
  for (let index = 0; index < 8; index += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `athletegum_${flow}_${suffix}`;
}
