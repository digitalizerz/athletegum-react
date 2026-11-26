"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/app/actions/auth";
import { createDealCheckout } from "@/lib/escrow";
import {
  DEAL_TYPES,
  maxActiveDeals,
  PLATFORMS,
  platformFeePercent,
  splitCompensation,
} from "@/lib/deals";
import { prisma } from "@/lib/prisma";
import { getStripe, PaymentsNotConfiguredError } from "@/lib/stripe";

export type FormState = { error: string };

const dealSchema = z.object({
  dealType: z.string(),
  compensation: z.coerce.number().positive("Compensation must be greater than 0."),
  deadline: z.string().min(1, "Choose a deadline."),
  athleteEmail: z.email("Enter the athlete's email."),
  notes: z.string().max(2000).optional(),
});

export async function createDeal(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireUser("business");
  const business = await prisma.user.findUnique({ where: { id: session.id } });
  if (!business) return { error: "Account not found." };

  const parsed = dealSchema.safeParse({
    dealType: formData.get("dealType"),
    compensation: formData.get("compensation"),
    deadline: formData.get("deadline"),
    athleteEmail: formData.get("athleteEmail"),
    notes: String(formData.get("notes") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };

  const dealType = DEAL_TYPES.find((type) => type.id === parsed.data.dealType);
  if (!dealType) return { error: "Choose a deal type." };

  const platforms = PLATFORMS.map((platform) => platform.id).filter((id) => formData.get(`platform_${id}`) === "on");
  if (dealType.requiresPlatforms && platforms.length === 0) {
    return { error: "Choose at least one platform for this deal type." };
  }

  const deadline = new Date(`${parsed.data.deadline}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (Number.isNaN(deadline.getTime()) || deadline <= today) {
    return { error: "Deadline must be a future date." };
  }

  const athleteEmail = parsed.data.athleteEmail.toLowerCase();
  if (athleteEmail === business.email) return { error: "Invite an athlete, not your own account." };

  const limit = maxActiveDeals(business.subscriptionPlan, business.subscriptionStatus);
  if (limit !== null) {
    const active = await prisma.deal.count({
      where: { businessId: business.id, status: { in: ["pending", "accepted", "completed"] } },
    });
    if (active >= limit) {
      return { error: `The Free plan allows ${limit} active deals. Approve or cancel one before creating another.` };
    }
  }

  if (!getStripe()) return { error: new PaymentsNotConfiguredError().message };

  const feePercent = platformFeePercent(business.subscriptionPlan, business.subscriptionStatus);
  const split = splitCompensation(parsed.data.compensation, feePercent);
  const athlete = await prisma.user.findUnique({ where: { email: athleteEmail } });
  const token = randomBytes(16).toString("hex");

  const deal = await prisma.deal.create({
    data: {
      businessId: business.id,
      dealType: dealType.id,
      platforms: platforms.length ? JSON.stringify(platforms) : null,
      compensationAmount: parsed.data.compensation,
      platformFeeAmount: split.platformFeeAmount,
      athleteFeeAmount: split.athleteFeeAmount,
      athleteNetPayout: split.athleteNetPayout,
      deadline,
      notes: parsed.data.notes?.trim() || null,
      status: "draft",
      paymentStatus: "unpaid",
      token,
      invitations: {
        create: {
          athleteEmail,
          athleteId: athlete?.role === "athlete" ? athlete.id : null,
          token: randomBytes(16).toString("hex"),
        },
      },
      messages: {
        create: { body: "Deal saved. Finish card payment to invite the athlete.", system: true },
      },
    },
  });

  const checkoutUrl = await beginCheckout(deal.id);
  redirect(typeof checkoutUrl === "string" ? checkoutUrl : `/dashboard/deals/${deal.id}?checkout=error`);
}

export async function startCheckout(dealId: string, _prev: FormState, _formData: FormData): Promise<FormState> {
  const session = await requireUser("business");
  const deal = await prisma.deal.findFirst({
    where: { id: dealId, businessId: session.id, status: "draft", paymentStatus: "unpaid" },
  });
  if (!deal) return { error: "This deal is not waiting for payment." };

  const checkoutUrl = await beginCheckout(deal.id);
  if (typeof checkoutUrl !== "string") return checkoutUrl;
  redirect(checkoutUrl);
}

async function beginCheckout(dealId: string): Promise<string | FormState> {
  try {
    const url = await createDealCheckout(dealId);
    if (!url) return { error: "This deal is already paid." };
    return url;
  } catch (error) {
    if (error instanceof PaymentsNotConfiguredError) return { error: error.message };
    console.error(error);
    return { error: "Payment could not be started. Try again." };
  }
}

export async function acceptDeal(dealId: string) {
  const session = await requireUser("athlete");
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: { invitations: true, business: true },
  });
  if (!deal || deal.status !== "pending" || deal.paymentStatus !== "paid_escrowed") return;

  const invitation = deal.invitations.find(
    (item) => item.status === "pending" && item.athleteEmail.toLowerCase() === session.email.toLowerCase(),
  );
  if (!invitation) return;

  await prisma.$transaction([
    prisma.dealInvitation.update({
      where: { id: invitation.id },
      data: { status: "accepted", athleteId: session.id },
    }),
    prisma.deal.update({
      where: { id: deal.id },
      data: { status: "accepted", athleteId: session.id },
    }),
    prisma.message.create({
      data: { dealId: deal.id, body: "Athlete accepted the deal.", system: true },
    }),
    prisma.notification.create({
      data: {
        userId: deal.businessId,
        title: "Deal accepted",
        body: `${session.name} accepted your deal.`,
        href: `/dashboard/deals/${deal.id}`,
      },
    }),
  ]);

  revalidatePath(`/athlete/deals/${deal.id}`);
  revalidatePath(`/dashboard/deals/${deal.id}`);
  redirect(`/athlete/deals/${deal.id}`);
}

export async function submitDeliverables(dealId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireUser("athlete");
  const notes = String(formData.get("deliverables") ?? "").trim();
  if (notes.length < 10) return { error: "Describe the work you submitted, at least 10 characters." };

  const deal = await prisma.deal.findFirst({ where: { id: dealId, athleteId: session.id, status: "accepted" } });
  if (!deal) return { error: "This deal is not ready for submission." };

  await prisma.$transaction([
    prisma.deal.update({ where: { id: deal.id }, data: { status: "completed", deliverables: notes } }),
    prisma.message.create({
      data: { dealId: deal.id, senderId: session.id, body: notes },
    }),
    prisma.message.create({
      data: { dealId: deal.id, body: "Athlete submitted deliverables.", system: true },
    }),
    prisma.notification.create({
      data: {
        userId: deal.businessId,
        title: "Deliverables submitted",
        body: `${session.name} submitted work for review.`,
        href: `/dashboard/deals/${deal.id}`,
      },
    }),
  ]);

  revalidatePath(`/athlete/deals/${deal.id}`);
  redirect(`/athlete/deals/${deal.id}`);
}

export async function approveDeal(dealId: string) {
  const session = await requireUser("business");
  const deal = await prisma.deal.findFirst({
    where: { id: dealId, businessId: session.id, status: "completed" },
  });
  if (!deal) return;

  await prisma.$transaction([
    prisma.deal.update({ where: { id: deal.id }, data: { status: "approved" } }),
    prisma.message.create({
      data: { dealId: deal.id, body: "Business approved the work.", system: true },
    }),
    ...(deal.athleteId
      ? [
          prisma.notification.create({
            data: {
              userId: deal.athleteId,
              title: "Work approved",
              body: "Your work was approved. The payment stays held until the payout is sent.",
              href: `/athlete/deals/${deal.id}`,
            },
          }),
        ]
      : []),
  ]);

  revalidatePath(`/dashboard/deals/${deal.id}`);
  redirect(`/dashboard/deals/${deal.id}`);
}

export async function requestRevisions(dealId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireUser("business");
  const notes = String(formData.get("revisionNotes") ?? "").trim();
  if (notes.length < 10) return { error: "Tell the athlete what to change, at least 10 characters." };

  const deal = await prisma.deal.findFirst({
    where: { id: dealId, businessId: session.id, status: "completed" },
  });
  if (!deal) return { error: "Revisions can only be requested after deliverables are submitted." };

  await prisma.$transaction([
    prisma.deal.update({ where: { id: deal.id }, data: { status: "accepted" } }),
    prisma.message.create({
      data: { dealId: deal.id, senderId: session.id, body: `Revisions requested: ${notes}` },
    }),
    ...(deal.athleteId
      ? [
          prisma.notification.create({
            data: {
              userId: deal.athleteId,
              title: "Revisions requested",
              body: notes,
              href: `/athlete/deals/${deal.id}`,
            },
          }),
        ]
      : []),
  ]);

  revalidatePath(`/dashboard/deals/${deal.id}`);
  redirect(`/dashboard/deals/${deal.id}`);
}

export async function postMessage(dealId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireUser(formData.get("role") === "athlete" ? "athlete" : "business");
  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 1) return { error: "Write a message first." };

  const deal = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!deal) return { error: "Deal not found." };
  const allowed = session.role === "athlete" ? deal.athleteId === session.id : deal.businessId === session.id;
  if (!allowed) return { error: "You cannot message on this deal." };

  const recipientId = session.role === "athlete" ? deal.businessId : deal.athleteId;
  await prisma.message.create({ data: { dealId, senderId: session.id, body } });
  if (recipientId) {
    await prisma.notification.create({
      data: {
        userId: recipientId,
        title: "New deal message",
        body,
        href: session.role === "athlete" ? `/dashboard/deals/${deal.id}` : `/athlete/deals/${deal.id}`,
      },
    });
  }

  revalidatePath(`/dashboard/deals/${deal.id}`);
  revalidatePath(`/athlete/deals/${deal.id}`);
  return { error: "" };
}
