"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/app/actions/auth";
import { handle } from "@/lib/profile";
import { ensureProfileToken, saveProfilePhoto } from "@/lib/profile-media";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/session";

export type ProfileState = { error: string; saved?: boolean };

const athleteProfile = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  athleteLevel: z.enum(["pro", "college", "highschool"], { message: "Choose a level." }),
  sport: z.string().trim().max(80).optional(),
  school: z.string().trim().max(120).optional(),
  city: z.string().trim().max(80).optional(),
  bio: z.string().trim().max(1000).optional(),
  username: z.string().trim().max(40).optional(),
  instagramHandle: z.string().trim().max(40).optional(),
  tiktokHandle: z.string().trim().max(40).optional(),
  twitterHandle: z.string().trim().max(40).optional(),
  youtubeHandle: z.string().trim().max(80).optional(),
});

function blank(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length ? trimmed : null;
}

export async function updateAthleteProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const session = await requireUser("athlete");
  const parsed = athleteProfile.safeParse({
    name: formData.get("name"),
    athleteLevel: formData.get("athleteLevel"),
    sport: String(formData.get("sport") ?? ""),
    school: String(formData.get("school") ?? ""),
    city: String(formData.get("city") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    username: String(formData.get("username") ?? ""),
    instagramHandle: socialHandle(formData.get("instagramHandle")) ?? "",
    tiktokHandle: socialHandle(formData.get("tiktokHandle")) ?? "",
    twitterHandle: socialHandle(formData.get("twitterHandle")) ?? "",
    youtubeHandle: socialHandle(formData.get("youtubeHandle")) ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the profile." };

  const username = blank(parsed.data.username)?.toLowerCase() ?? null;
  if (username && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(username)) {
    return { error: "Usernames use lowercase letters, numbers, and hyphens." };
  }
  if (username) {
    const taken = await prisma.user.findFirst({ where: { username, NOT: { id: session.id } } });
    if (taken) return { error: "That username is already taken." };
  }

  const current = await prisma.user.findUnique({ where: { id: session.id } });
  if (!current) return { error: "Account not found." };

  const photo = formData.get("profilePhoto");
  let profilePhoto = current.profilePhoto;
  if (photo instanceof File && photo.size > 0) {
    const saved = await saveProfilePhoto(session.id, photo, current.profilePhoto);
    if ("error" in saved) return { error: saved.error };
    profilePhoto = saved.path;
  } else if (formData.get("removePhoto") === "1") {
    profilePhoto = null;
  }

  const profileToken = await ensureProfileToken(session.id, current.profileToken);
  await prisma.user.update({
    where: { id: session.id },
    data: {
      name: parsed.data.name,
      athleteLevel: parsed.data.athleteLevel,
      sport: blank(parsed.data.sport),
      school: blank(parsed.data.school),
      city: blank(parsed.data.city),
      bio: blank(parsed.data.bio),
      username,
      profilePhoto,
      profileToken,
      instagramHandle: handle(parsed.data.instagramHandle),
      tiktokHandle: handle(parsed.data.tiktokHandle),
      twitterHandle: handle(parsed.data.twitterHandle),
      youtubeHandle: handle(parsed.data.youtubeHandle),
    },
  });

  revalidatePath("/athlete/profile");
  revalidatePath("/athlete", "layout");
  revalidatePath("/athlete/dashboard");
  revalidatePath("/dashboard/athletes");
  if (current.username) revalidatePath(`/a/${current.username}`);
  if (username) revalidatePath(`/a/${username}`);
  if (profileToken) revalidatePath(`/a/${profileToken}`);
  await setSession({ ...session, name: parsed.data.name });
  return { error: "", saved: true };
}

export async function updateBusinessProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const session = await requireUser("business");
  const name = String(formData.get("name") ?? "").trim();
  const businessName = String(formData.get("businessName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  if (name.length < 2) return { error: "Your name must be at least 2 characters." };
  if (businessName.length < 2) return { error: "Company name must be at least 2 characters." };
  if (bio.length > 300) return { error: "The company description must be 300 characters or less." };

  const current = await prisma.user.findUnique({ where: { id: session.id } });
  if (!current) return { error: "Account not found." };

  const photo = formData.get("logo");
  let profilePhoto = current.profilePhoto;
  if (photo instanceof File && photo.size > 0) {
    const saved = await saveProfilePhoto(session.id, photo, current.profilePhoto);
    if ("error" in saved) return { error: saved.error };
    profilePhoto = saved.path;
  } else if (formData.get("removeLogo") === "1") {
    profilePhoto = null;
  }

  await prisma.user.update({
    where: { id: session.id },
    data: {
      name,
      businessName,
      phone: phone || null,
      city: city || null,
      bio: bio || null,
      profilePhoto,
      instagramHandle: socialHandle(formData.get("instagramHandle")),
      tiktokHandle: socialHandle(formData.get("tiktokHandle")),
      twitterHandle: socialHandle(formData.get("twitterHandle")),
      youtubeHandle: socialHandle(formData.get("youtubeHandle")),
    },
  });
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard", "layout");
  await setSession({ ...session, name });
  return { error: "", saved: true };
}

function socialHandle(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const last = new URL(raw).pathname.split("/").filter(Boolean).pop() ?? "";
      return handle(last);
    } catch {
      return handle(raw);
    }
  }
  return handle(raw);
}
