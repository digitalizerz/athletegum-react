import { DEFAULT_FEE_RATES, type FeeRates } from "@/lib/deals";
import { prisma } from "@/lib/prisma";

export async function getFeeSchedule(): Promise<FeeRates> {
  try {
    const row = await prisma.feeSchedule.findUnique({ where: { id: "default" } });
    if (!row) return DEFAULT_FEE_RATES;
    return { free: row.freePercent, pro: row.proPercent, growth: row.growthPercent };
  } catch {
    return DEFAULT_FEE_RATES;
  }
}
