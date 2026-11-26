"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { formatFeePercent } from "@/lib/deals";
import { hashPassword } from "@/lib/password";
import { requireUser } from "@/app/actions/auth";
import { handle } from "@/lib/profile";
import { prisma } from "@/lib/prisma";
import { getSession, setSession } from "@/lib/session";

const athleteFields = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  email: z.email("Enter a valid email."),
  sport: z.string().trim().max(80),
  school: z.string().trim().max(120),
  city: z.string().trim().max(80),
  athleteLevel: z.enum(["", "pro", "college", "highschool"]),
  instagramHandle: z.string().trim().max(80),
  tiktokHandle: z.string().trim().max(80),
  twitterHandle: z.string().trim().max(80),
  youtubeHandle: z.string().trim().max(80),
});

const businessFields = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  email: z.email("Enter a valid email."),
  businessName: z.string().trim().max(120),
  phone: z.string().trim().max(40),
  city: z.string().trim().max(80),
  bio: z.string().trim().max(300, "Keep the description under 300 characters."),
});

function blank(value: string) {
  return value || null;
}

async function record(adminId: string, action: string, summary: string, entityType?: string, entityId?: string) {
  await prisma.auditLog.create({
    data: { adminId, action, summary, entityType: entityType ?? null, entityId: entityId ?? null },
  });
}

function bounce(path: string, error: string): never {
  redirect(`${path}?error=${encodeURIComponent(error)}`);
}

export async function setUserActive(userId: string, active: boolean) {
  const admin = await requireUser("admin");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role === "admin" || user.id === admin.id) return;
  await prisma.user.update({ where: { id: userId }, data: { isActive: active } });
  const verb = active ? "reactivated" : user.role === "athlete" ? "hidden" : "suspended";
  await record(admin.id, active ? "user.reactivated" : "user.suspended", `${user.email} was ${verb}.`, "user", user.id);
  revalidatePath("/admin", "layout");
}

export async function updateAthlete(userId: string, formData: FormData) {
  const admin = await requireUser("admin");
  const back = `/admin/athletes/${userId}`;
  const parsed = athleteFields.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    sport: formData.get("sport") ?? "",
    school: formData.get("school") ?? "",
    city: formData.get("city") ?? "",
    athleteLevel: formData.get("athleteLevel") ?? "",
    instagramHandle: formData.get("instagramHandle") ?? "",
    tiktokHandle: formData.get("tiktokHandle") ?? "",
    twitterHandle: formData.get("twitterHandle") ?? "",
    youtubeHandle: formData.get("youtubeHandle") ?? "",
  });
  if (!parsed.success) bounce(back, parsed.error.issues[0]?.message ?? "Check the form.");
  const athlete = await prisma.user.findUnique({ where: { id: userId } });
  if (!athlete || athlete.role !== "athlete") bounce(back, "Athlete not found.");
  const email = parsed.data.email.toLowerCase();
  const taken = await prisma.user.findFirst({ where: { email, NOT: { id: userId } } });
  if (taken) bounce(back, "That email is already in use.");
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name,
      email,
      sport: blank(parsed.data.sport),
      school: blank(parsed.data.school),
      city: blank(parsed.data.city),
      athleteLevel: parsed.data.athleteLevel || null,
      instagramHandle: handle(parsed.data.instagramHandle),
      tiktokHandle: handle(parsed.data.tiktokHandle),
      twitterHandle: handle(parsed.data.twitterHandle),
      youtubeHandle: handle(parsed.data.youtubeHandle),
    },
  });
  await record(admin.id, "athlete.updated", `Athlete ${email} was updated.`, "user", userId);
  revalidatePath("/admin/athletes");
  redirect(`${back}?saved=1`);
}

export async function updateBusiness(userId: string, formData: FormData) {
  const admin = await requireUser("admin");
  const back = `/admin/businesses/${userId}`;
  const parsed = businessFields.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    businessName: formData.get("businessName") ?? "",
    phone: formData.get("phone") ?? "",
    city: formData.get("city") ?? "",
    bio: formData.get("bio") ?? "",
  });
  if (!parsed.success) bounce(back, parsed.error.issues[0]?.message ?? "Check the form.");
  const business = await prisma.user.findUnique({ where: { id: userId } });
  if (!business || business.role !== "business") bounce(back, "Business not found.");
  const email = parsed.data.email.toLowerCase();
  const taken = await prisma.user.findFirst({ where: { email, NOT: { id: userId } } });
  if (taken) bounce(back, "That email is already in use.");
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name,
      email,
      businessName: blank(parsed.data.businessName),
      phone: blank(parsed.data.phone),
      city: blank(parsed.data.city),
      bio: blank(parsed.data.bio),
    },
  });
  await record(admin.id, "business.updated", `Business ${email} was updated.`, "user", userId);
  revalidatePath("/admin/businesses");
  redirect(`${back}?saved=1`);
}

export async function deleteUser(userId: string, formData: FormData) {
  const admin = await requireUser("admin");
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { _count: { select: { dealsOwned: true } } } });
  const back = user?.role === "athlete" ? `/admin/athletes/${userId}` : `/admin/businesses/${userId}`;
  if (String(formData.get("confirm") ?? "").trim().toLowerCase() !== "delete") bounce(back, "Type delete to confirm.");
  if (!user || user.role === "admin" || user.id === admin.id) bounce(back, "This account cannot be deleted.");
  if (user.role === "business" && user._count.dealsOwned > 0) {
    bounce(back, "This business still has deals. Cancel those deals before deleting the account.");
  }
  await prisma.$transaction(async (tx) => {
    await tx.deal.updateMany({ where: { athleteId: userId }, data: { athleteId: null } });
    await tx.dealInvitation.updateMany({ where: { athleteId: userId }, data: { athleteId: null } });
    await tx.message.updateMany({ where: { senderId: userId }, data: { senderId: null } });
    await tx.savedAthlete.deleteMany({ where: { OR: [{ athleteId: userId }, { businessId: userId }] } });
    await tx.notification.deleteMany({ where: { userId } });
    await tx.user.delete({ where: { id: userId } });
  });
  await record(admin.id, "user.deleted", `${user.email} was deleted.`, "user", userId);
  redirect(user.role === "athlete" ? "/admin/athletes?saved=Account%20deleted." : "/admin/businesses?saved=Account%20deleted.");
}

export async function cancelDeal(dealId: string, formData: FormData) {
  const admin = await requireUser("admin");
  const back = `/admin/deals/${dealId}`;
  const deal = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!deal) bounce(back, "Deal not found.");
  if (deal.status === "cancelled") bounce(back, "This deal is already cancelled.");
  if (deal.status === "approved" || deal.paymentStatus === "released") {
    bounce(back, "An approved or paid-out deal cannot be cancelled.");
  }
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 300);
  await prisma.deal.update({ where: { id: dealId }, data: { status: "cancelled" } });
  await prisma.message.create({
    data: {
      dealId,
      system: true,
      body: reason ? `An admin cancelled this deal. ${reason}` : "An admin cancelled this deal.",
    },
  });
  const held = deal.paymentStatus === "paid_escrowed";
  await record(admin.id, "deal.cancelled", `Deal ${dealId} was cancelled.${held ? " The card charge is still held." : ""}`, "deal", dealId);
  revalidatePath(`/dashboard/deals/${dealId}`);
  revalidatePath(`/athlete/deals/${dealId}`);
  redirect(`${back}?saved=${encodeURIComponent(held ? "Deal cancelled. The card charge is still held. Refunds are not connected." : "Deal cancelled.")}`);
}

export async function archiveDeal(dealId: string) {
  const admin = await requireUser("admin");
  const back = `/admin/deals/${dealId}`;
  const deal = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!deal) bounce(back, "Deal not found.");
  if (deal.archivedAt) bounce(back, "This deal is already archived.");
  await prisma.deal.update({ where: { id: dealId }, data: { archivedAt: new Date() } });
  await record(admin.id, "deal.archived", `Deal ${dealId} was archived. The record, messages, and payment stay.`, "deal", dealId);
  revalidatePath("/admin/deals");
  redirect("/admin/deals?tab=archived&saved=Deal%20archived.%20The%20record%20is%20kept.");
}

export async function restoreDeal(dealId: string) {
  const admin = await requireUser("admin");
  const deal = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!deal) bounce("/admin/deals", "Deal not found.");
  await prisma.deal.update({ where: { id: dealId }, data: { archivedAt: null } });
  await record(admin.id, "deal.restored", `Deal ${dealId} was restored to the active list.`, "deal", dealId);
  revalidatePath("/admin/deals");
  redirect(`/admin/deals/${dealId}?saved=Deal%20restored.`);
}

export async function impersonateUser(userId: string) {
  const admin = await requireUser("admin");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role === "admin") redirect("/admin/users?error=That%20account%20cannot%20be%20viewed.");
  if (!user.isActive) redirect(`/admin/users/${userId}?error=${encodeURIComponent("Reactivate this account before viewing it.")}`);
  const role = user.role === "athlete" ? "athlete" : "business";
  await record(admin.id, "user.impersonated", `Viewed the portal as ${user.email}.`, "user", user.id);
  await setSession({ id: user.id, email: user.email, name: user.name, role, impersonatorId: admin.id });
  redirect(role === "athlete" ? "/athlete/dashboard" : "/dashboard");
}

export async function stopImpersonating() {
  const session = await getSession();
  if (!session?.impersonatorId) redirect("/admin");
  const admin = await prisma.user.findUnique({ where: { id: session.impersonatorId } });
  if (!admin || admin.role !== "admin" || !admin.isActive) {
    redirect("/login");
  }
  await record(admin.id, "user.impersonation_ended", `Stopped viewing the portal as ${session.email}.`, "user", session.id);
  await setSession({ id: admin.id, email: admin.email, name: admin.name, role: "admin" });
  redirect("/admin");
}

const accountFields = z.object({
  role: z.enum(["athlete", "business", "admin"]),
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  email: z.email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  businessName: z.string().trim().max(120),
  sport: z.string().trim().max(80),
  school: z.string().trim().max(120),
});

export async function createAccount(formData: FormData) {
  const admin = await requireUser("admin");
  const roleValue = String(formData.get("role") ?? "business");
  const back = `/admin/accounts/new?role=${roleValue}`;
  const parsed = accountFields.safeParse({
    role: roleValue,
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    businessName: formData.get("businessName") ?? "",
    sport: formData.get("sport") ?? "",
    school: formData.get("school") ?? "",
  });
  if (!parsed.success) bounce(back, parsed.error.issues[0]?.message ?? "Check the form.");
  const email = parsed.data.email.toLowerCase();
  const taken = await prisma.user.findUnique({ where: { email } });
  if (taken) bounce(back, "That email is already in use.");
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash: await hashPassword(parsed.data.password),
      role: parsed.data.role,
      businessName: parsed.data.role === "business" ? blank(parsed.data.businessName) : null,
      sport: parsed.data.role === "athlete" ? blank(parsed.data.sport) : null,
      school: parsed.data.role === "athlete" ? blank(parsed.data.school) : null,
      profileToken: parsed.data.role === "athlete" ? randomBytes(16).toString("hex") : null,
      subscriptionPlan: "free",
      subscriptionStatus: "inactive",
    },
  });
  await record(admin.id, "user.created", `${parsed.data.role} account ${email} was created.`, "user", user.id);
  const next = parsed.data.role === "athlete" ? "/admin/athletes" : parsed.data.role === "business" ? "/admin/businesses" : "/admin/users?tab=admin";
  redirect(`${next}${next.includes("?") ? "&" : "?"}saved=${encodeURIComponent("Account created.")}`);
}

function readPercent(value: FormDataEntryValue | null, label: string): { error?: string; value?: number } {
  const text = String(value ?? "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return { error: `${label} must be from 0 to 100, with up to 2 decimal places.` };
  const amount = Number(text);
  if (amount > 100) return { error: `${label} must be 100 or less.` };
  return { value: amount };
}

export async function updateFeeSchedule(formData: FormData) {
  const admin = await requireUser("admin");
  const free = readPercent(formData.get("freePercent"), "Free");
  const pro = readPercent(formData.get("proPercent"), "Pro");
  const growth = readPercent(formData.get("growthPercent"), "Growth");
  const error = free.error || pro.error || growth.error;
  if (error || free.value === undefined || pro.value === undefined || growth.value === undefined) bounce("/admin/fees", error ?? "Check the fee percentages.");
  await prisma.feeSchedule.upsert({
    where: { id: "default" },
    update: { freePercent: free.value, proPercent: pro.value, growthPercent: growth.value },
    create: { id: "default", freePercent: free.value, proPercent: pro.value, growthPercent: growth.value },
  });
  const summary = `Platform fees set to Free ${formatFeePercent(free.value)}%, Pro ${formatFeePercent(pro.value)}%, Growth ${formatFeePercent(growth.value)}%.`;
  await record(admin.id, "fees.updated", summary, "fees", "default");
  revalidatePath("/admin/fees");
  revalidatePath("/admin/businesses");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard/deals/new");
  revalidatePath("/pricing");
  redirect(`/admin/fees?saved=${encodeURIComponent("Fees saved. New deals use these rates. Existing deals keep the fee already recorded.")}`);
}
