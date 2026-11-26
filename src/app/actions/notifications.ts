"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";

export async function markNotificationRead(notificationId: string) {
  const session = await requireUser(await roleOfSession());
  await prisma.notification.updateMany({
    where: { id: notificationId, userId: session.id },
    data: { readAt: new Date() },
  });
  revalidatePath("/athlete/notifications");
  revalidatePath("/athlete", "layout");
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard", "layout");
}

export async function markAllNotificationsRead() {
  const session = await requireUser(await roleOfSession());
  await prisma.notification.updateMany({
    where: { userId: session.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/athlete/notifications");
  revalidatePath("/athlete", "layout");
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard", "layout");
}

async function roleOfSession(): Promise<"athlete" | "business"> {
  const { getSession } = await import("@/lib/session");
  const session = await getSession();
  return session?.role === "athlete" ? "athlete" : "business";
}
