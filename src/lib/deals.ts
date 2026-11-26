export const DEAL_TYPES = [
  { id: "social_post", name: "Social Post", detail: "Post on social media", requiresPlatforms: true },
  { id: "short_video", name: "Short Video", detail: "Create a short video", requiresPlatforms: true },
  { id: "in_person_appearance", name: "In-Person Appearance", detail: "Come to your location", requiresPlatforms: false },
  { id: "monthly_partnership", name: "Monthly Partnership", detail: "Ongoing for one month", requiresPlatforms: false },
  { id: "product_review", name: "Product Review", detail: "Review your product", requiresPlatforms: false },
  { id: "custom", name: "Custom Deal", detail: "Custom arrangement", requiresPlatforms: false },
] as const;

export const PLATFORMS = [
  { id: "instagram", name: "Instagram" },
  { id: "tiktok", name: "TikTok" },
  { id: "x", name: "X (Twitter)" },
  { id: "youtube", name: "YouTube" },
  { id: "facebook", name: "Facebook" },
] as const;

export type PlanId = "free" | "pro" | "growth";

export type FeeRates = Record<PlanId, number>;

export const DEFAULT_FEE_RATES: FeeRates = {
  free: 10,
  pro: 8,
  growth: 6,
};

export function effectivePlan(plan: string, status: string): PlanId {
  if ((plan === "pro" || plan === "growth") && status === "active") {
    return plan;
  }
  return "free";
}

export function platformFeePercent(plan: string, status: string, rates: FeeRates = DEFAULT_FEE_RATES) {
  return rates[effectivePlan(plan, status)];
}

export function formatFeePercent(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
}

export function maxActiveDeals(plan: string, status: string) {
  return effectivePlan(plan, status) === "free" ? 3 : null;
}

export function splitCompensation(amount: number, feePercent: number) {
  const platformFeeAmount = Math.round(amount * (feePercent / 100) * 100) / 100;
  const athleteNetPayout = Math.max(0, Math.round((amount - platformFeeAmount) * 100) / 100);
  return { platformFeeAmount, athleteFeeAmount: 0, athleteNetPayout };
}

export function dealTypeName(id: string) {
  return DEAL_TYPES.find((type) => type.id === id)?.name ?? id;
}

export function parsePlatforms(value: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function money(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function scheduleLabel(date: Date) {
  return date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function toCents(amount: number) {
  return Math.round((amount + Number.EPSILON) * 100);
}

export function fundingLabel(status: string) {
  switch (status) {
    case "paid_escrowed":
      return "Held";
    case "released":
      return "Released";
    case "failed":
      return "Charge failed";
    case "refunded":
      return "Refunded";
    default:
      return "Not charged";
  }
}

export function campaignStatus(status: string) {
  switch (status) {
    case "draft":
      return "Not sent";
    case "pending":
      return "Waiting for athlete";
    case "accepted":
      return "In progress";
    case "completed":
      return "In review";
    case "approved":
      return "Approved";
    case "cancelled":
      return "Cancelled";
    default:
      return statusLabel(status);
  }
}

export function paymentLabel(status: string) {
  switch (status) {
    case "paid_escrowed":
      return "Held until approval";
    case "released":
      return "Released to the athlete";
    case "failed":
      return "Payment failed";
    case "refunded":
      return "Refunded";
    default:
      return "Not paid";
  }
}

export function statusLabel(status: string) {
  switch (status) {
    case "draft":
      return "Payment incomplete";
    case "pending":
      return "Waiting for athlete";
    case "accepted":
      return "In progress";
    case "completed":
      return "Deliverables submitted";
    case "approved":
      return "Approved";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}
