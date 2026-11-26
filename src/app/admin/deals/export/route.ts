import { campaignStatus, dealTypeName, fundingLabel } from "@/lib/deals";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return new Response("Sign in as an admin to export deals.", { status: 401 });
  }
  const deals = await prisma.deal.findMany({
    orderBy: { createdAt: "desc" },
    include: { business: true, athlete: true },
  });
  const lines = [
    ["Opened", "Deal", "Business", "Athlete", "Amount", "Platform fee", "Athlete receives", "Deal status", "Payment status", "Deadline", "Archived"],
    ...deals.map((deal) => [
      deal.createdAt.toISOString(),
      dealTypeName(deal.dealType),
      deal.business.businessName || deal.business.name,
      deal.athlete?.name ?? "",
      deal.compensationAmount.toFixed(2),
      deal.platformFeeAmount.toFixed(2),
      deal.athleteNetPayout.toFixed(2),
      campaignStatus(deal.status),
      fundingLabel(deal.paymentStatus),
      deal.deadline?.toISOString() ?? "",
      deal.archivedAt?.toISOString() ?? "",
    ]),
  ];
  const csv = lines.map((line) => line.map(csvCell).join(",")).join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"athletegum-deals.csv\"",
    },
  });
}

function csvCell(value: string) {
  return `"${value.replaceAll("\"", "\"\"")}"`;
}
