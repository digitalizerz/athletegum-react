import { randomBytes } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

export async function ensureProfileToken(userId: string, current: string | null) {
  if (current) return current;
  const profileToken = randomBytes(16).toString("hex");
  await prisma.user.update({ where: { id: userId }, data: { profileToken } });
  return profileToken;
}

export async function saveProfilePhoto(userId: string, file: File, previous: string | null) {
  if (file.size === 0) return previous;
  if (process.env.VERCEL) {
    return { error: "Profile photos cannot be stored on this server yet. Save the profile without a new photo." } as const;
  }
  const extension = PHOTO_TYPES[file.type];
  if (!extension) return { error: "Use a JPG, PNG, GIF, or WebP photo." } as const;
  if (file.size > MAX_PHOTO_BYTES) return { error: "Profile photo must be 2MB or smaller." } as const;

  const directory = path.join(process.cwd(), "public", "uploads", "athletes");
  await mkdir(directory, { recursive: true });
  const filename = `${userId}-${Date.now()}.${extension}`;
  await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));

  if (previous?.startsWith("/uploads/athletes/")) {
    await unlink(path.join(process.cwd(), "public", previous)).catch(() => undefined);
  }
  return { path: `/uploads/athletes/${filename}` } as const;
}
