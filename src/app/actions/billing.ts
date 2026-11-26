"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { requireUser } from "@/app/actions/auth";
import { appOrigin } from "@/lib/app-origin";
import { createBillingPortal, createSubscriptionCheckout, type PaidPlan } from "@/lib/billing";
import { PaymentsNotConfiguredError } from "@/lib/stripe";

export async function subscribeToPlan(plan: PaidPlan) {
  const session = await requireUser("business");
  try {
    const origin = await appOrigin();
    const url = await createSubscriptionCheckout(session.id, plan, origin);
    redirect(url);
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof PaymentsNotConfiguredError) redirect("/dashboard/billing?checkout=unavailable");
    console.error(error);
    redirect("/dashboard/billing?checkout=error");
  }
}

export async function openBillingPortal() {
  const session = await requireUser("business");
  try {
    const origin = await appOrigin();
    const url = await createBillingPortal(session.id, `${origin}/dashboard/billing`);
    redirect(url);
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof PaymentsNotConfiguredError) redirect("/dashboard/billing?checkout=unavailable");
    console.error(error);
    redirect("/dashboard/billing?checkout=error");
  }
}
