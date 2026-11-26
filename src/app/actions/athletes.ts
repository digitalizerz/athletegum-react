"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";

export async function toggleSavedAthlete(formData: FormData) {
  const session = await requireUser("business");
  const athleteId = String(formData.get("athleteId") ?? "");
  const returnTo = String(formData.get("returnTo") ?? "/dashboard/athletes");
  const athlete = await prisma.user.findFirst({
    where: { id: athleteId, role: "athlete", isActive: true, athleteLevel: "college" },
  });
  if (!athlete) redirect("/dashboard/athletes");

  const existing = await prisma.savedAthlete.findUnique({
    where: { businessId_athleteId: { businessId: session.id, athleteId } },
  });
  if (existing) {
    await prisma.savedAthlete.delete({ where: { id: existing.id } });
  } else {
    await prisma.savedAthlete.create({ data: { businessId: session.id, athleteId } });
  }

  revalidatePath("/dashboard/athletes");
  redirect(returnTo.startsWith("/dashboard/athletes") ? returnTo : "/dashboard/athletes");
}
