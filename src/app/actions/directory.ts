"use server";

import { createHash, randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser, type AuthState } from "@/app/actions/auth";
import { appOrigin } from "@/lib/app-origin";
import { accountLevelFromListing, isDirectoryLevel, isDirectorySquad } from "@/lib/directory";
import { sendClaimInvite } from "@/lib/mail";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/session";

const listingFields = z.object({
  name: z.string().trim().min(2, "Enter the athlete's name.").max(80),
  level: z.string().refine(isDirectoryLevel, "Choose a level."),
  sport: z.string().trim().min(2, "Enter a sport.").max(80),
  squad: z.string(),
  position: z.string().trim().max(40),
  teamOrSchool: z.string().trim().min(2, "Enter a team or school.").max(120),
  city: z.string().trim().max(80),
  state: z.string().trim().max(40),
});

function blank(value: string) {
  return value.length ? value : null;
}

export async function createListing(formData: FormData) {
  await requireUser("admin");
  const parsed = listingFields.safeParse({
    name: formData.get("name"),
    level: formData.get("level"),
    sport: formData.get("sport"),
    squad: String(formData.get("squad") ?? ""),
    position: String(formData.get("position") ?? ""),
    teamOrSchool: formData.get("teamOrSchool"),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
  });
  if (!parsed.success) {
    redirect(`/admin/directory?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Check the listing.")}`);
  }

  await prisma.directoryListing.create({
    data: {
      name: parsed.data.name,
      level: parsed.data.level,
      sport: parsed.data.sport,
      squad: isDirectorySquad(parsed.data.squad) ? parsed.data.squad : null,
      position: blank(parsed.data.position),
      teamOrSchool: parsed.data.teamOrSchool,
      city: blank(parsed.data.city),
      state: blank(parsed.data.state),
      status: "listed",
    },
  });

  revalidatePath("/admin/directory");
  revalidatePath("/dashboard/athletes");
  redirect("/admin/directory?saved=Listing added");
}

export async function updateListing(listingId: string, formData: FormData) {
  await requireUser("admin");
  const back = `/admin/directory/${listingId}`;
  const parsed = listingFields.safeParse({
    name: formData.get("name"),
    level: formData.get("level"),
    sport: formData.get("sport"),
    squad: String(formData.get("squad") ?? ""),
    position: String(formData.get("position") ?? ""),
    teamOrSchool: formData.get("teamOrSchool"),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
  });
  if (!parsed.success) redirect(`${back}?edit=1&error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Check the listing.")}`);
  const listing = await prisma.directoryListing.findUnique({ where: { id: listingId } });
  if (!listing) redirect("/admin/directory?error=Listing%20not%20found.");
  await prisma.directoryListing.update({
    where: { id: listingId },
    data: {
      name: parsed.data.name,
      level: parsed.data.level,
      sport: parsed.data.sport,
      squad: isDirectorySquad(parsed.data.squad) ? parsed.data.squad : null,
      position: blank(parsed.data.position),
      teamOrSchool: parsed.data.teamOrSchool,
      city: blank(parsed.data.city),
      state: blank(parsed.data.state),
    },
  });
  revalidatePath("/admin/directory");
  revalidatePath("/dashboard/athletes");
  redirect(`${back}?saved=1`);
}

export async function deleteListing(listingId: string, formData: FormData) {
  await requireUser("admin");
  if (String(formData.get("confirm") ?? "") !== "delete") {
    redirect(`/admin/directory/${listingId}?error=${encodeURIComponent("Confirm the delete in the dialog.")}`);
  }
  const listing = await prisma.directoryListing.findUnique({ where: { id: listingId } });
  if (!listing) redirect("/admin/directory?error=Listing%20not%20found.");
  await prisma.directoryListing.delete({ where: { id: listingId } });
  revalidatePath("/admin/directory");
  revalidatePath("/dashboard/athletes");
  redirect("/admin/directory?saved=Listing%20removed.");
}

export async function requestIntro(formData: FormData) {
  const session = await requireUser("business");
  const listingId = String(formData.get("listingId") ?? "").trim();
  const athleteId = String(formData.get("athleteId") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);
  const returnTo = safeReturn(formData.get("returnTo"));

  if (!listingId && !athleteId) redirect(`${returnTo}${join(returnTo)}error=${encodeURIComponent("Choose an athlete first.")}`);

  if (listingId) {
    const listing = await prisma.directoryListing.findUnique({ where: { id: listingId } });
    if (!listing || listing.status !== "listed") {
      redirect(`${returnTo}${join(returnTo)}error=${encodeURIComponent("That listing is not open for an introduction.")}`);
    }
    const existing = await prisma.introRequest.findFirst({ where: { businessId: session.id, listingId } });
    if (!existing) {
      await prisma.introRequest.create({
        data: { businessId: session.id, listingId, note: note || null },
      });
    }
  } else {
    const athlete = await prisma.user.findFirst({ where: { id: athleteId, role: "athlete", isActive: true } });
    if (!athlete || athlete.athleteLevel !== "highschool") {
      redirect(`${returnTo}${join(returnTo)}error=${encodeURIComponent("Invite this athlete to a deal instead.")}`);
    }
    const existing = await prisma.introRequest.findFirst({ where: { businessId: session.id, athleteId } });
    if (!existing) {
      await prisma.introRequest.create({
        data: { businessId: session.id, athleteId, note: note || null },
      });
    }
  }

  revalidatePath("/dashboard/athletes");
  revalidatePath("/admin/directory");
  redirect(`${returnTo}${join(returnTo)}interested=1`);
}

export async function sendClaimInviteToListing(listingId: string, formData: FormData) {
  await requireUser("admin");
  const back = `/admin/directory/${listingId}`;
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!z.email().safeParse(email).success) redirect(`${back}?error=${encodeURIComponent("Enter a valid email.")}`);
  const listing = await prisma.directoryListing.findUnique({ where: { id: listingId } });
  if (!listing) redirect("/admin/directory?error=Listing%20not%20found.");
  if (listing.claimedUserId) redirect(`${back}?error=${encodeURIComponent("This profile is already claimed.")}`);
  const taken = await prisma.user.findUnique({ where: { email } });
  if (taken) redirect(`${back}?error=${encodeURIComponent("That email already has an account.")}`);
  const other = await prisma.directoryListing.findFirst({ where: { email, NOT: { id: listingId } } });
  if (other) redirect(`${back}?error=${encodeURIComponent("That email is already on another listing.")}`);

  const token = randomBytes(32).toString("hex");
  await prisma.directoryListing.update({
    where: { id: listingId },
    data: {
      email,
      claimTokenHash: createHash("sha256").update(token).digest("hex"),
      claimExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  const link = `${await appOrigin()}/claim?token=${token}`;
  const sent = await sendClaimInvite(email, listing.name, listing.teamOrSchool, listing.sport, link, listing.level === "high_school");
  revalidatePath("/admin/directory");
  if (!sent) {
    redirect(`${back}?error=${encodeURIComponent("Email is not set up on this server. Copy this claim link and send it yourself.")}&link=${encodeURIComponent(link)}`);
  }
  redirect(`${back}?saved=${encodeURIComponent(`Claim link sent to ${email}.`)}`);
}

export async function claimListing(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };
  const listing = token
    ? await prisma.directoryListing.findUnique({ where: { claimTokenHash: createHash("sha256").update(token).digest("hex") } })
    : null;
  if (!listing || !listing.email || listing.claimedUserId || !listing.claimExpiresAt || listing.claimExpiresAt.getTime() < Date.now()) {
    return { error: "This claim link is invalid or expired. Ask AthleteGum to send a new one." };
  }
  const existing = await prisma.user.findUnique({ where: { email: listing.email } });
  if (existing) return { error: "That email already has an account. Sign in instead." };

  const user = await prisma.user.create({
    data: {
      name: listing.name,
      email: listing.email,
      passwordHash: await hashPassword(password),
      role: "athlete",
      sport: listing.sport,
      school: listing.teamOrSchool,
      city: listing.city,
      athleteLevel: accountLevelFromListing(listing.level),
      profileToken: randomBytes(16).toString("hex"),
      subscriptionPlan: "free",
      subscriptionStatus: "inactive",
    },
  });
  await prisma.directoryListing.update({
    where: { id: listing.id },
    data: { claimedUserId: user.id, claimTokenHash: null, claimExpiresAt: null },
  });
  revalidatePath("/admin/directory");
  revalidatePath("/dashboard/athletes");
  await setSession({ id: user.id, email: user.email, name: user.name, role: "athlete" });
  return { error: "", href: "/athlete/profile" };
}

function safeReturn(value: FormDataEntryValue | null) {
  const path = String(value ?? "");
  if (path !== "/dashboard/athletes" && !path.startsWith("/dashboard/athletes?") && !path.startsWith("/dashboard/athletes/")) {
    return "/dashboard/athletes";
  }
  return path;
}

function join(path: string) {
  return path.includes("?") ? "&" : "?";
}
