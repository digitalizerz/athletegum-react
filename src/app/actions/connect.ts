"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { requireUser } from "@/app/actions/auth";
import { appOrigin } from "@/lib/app-origin";
import { ensureRecipientAccount, onboardingLink, stripeFailureReason } from "@/lib/connect";
import { publishableKey, PaymentsNotConfiguredError } from "@/lib/stripe";

export async function startPayoutSetup() {
  const session = await requireUser("athlete");
  try {
    await ensureRecipientAccount(session.id);
    if (publishableKey()) redirect("/athlete/earnings?setup=1");
    const origin = await appOrigin();
    const url = await onboardingLink(session.id, origin);
    redirect(url);
  } catch (error) {
    unstable_rethrow(error);
    console.error(error);
    const reason = error instanceof PaymentsNotConfiguredError ? "unavailable" : stripeFailureReason(error);
    redirect(`/athlete/earnings?setup=error&reason=${reason}`);
  }
}

export async function openPayoutDashboard() {
  const session = await requireUser("athlete");
  const origin = await appOrigin();
  redirect(`${origin}/athlete/earnings/stripe-link?purpose=dashboard`);
}
