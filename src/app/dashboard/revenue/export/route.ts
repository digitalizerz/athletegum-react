import { campaignStatus, dealTypeName, fundingLabel } from "@/lib/deals";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "business") {
    return new Response("Sign in as a business to export spending.", { status: 401 });
  }

  const deals = await prisma.deal.findMany({
    where: { businessId: session.id, status: { notIn: ["draft", "cancelled"] } },
    include: { athlete: true, invitations: true },
    orderBy: { createdAt: "desc" },
  });

  const lines = [
    ["Date", "Campaign", "Athlete", "Charge", "Platform fee", "Athlete payout", "Funding", "Deal status"],
    ...deals.map((deal) => [
      deal.createdAt.toISOString().slice(0, 10),
      dealTypeName(deal.dealType),
      deal.athlete?.name || deal.invitations[0]?.athleteEmail || "",
      deal.compensationAmount.toFixed(2),
      deal.platformFeeAmount.toFixed(2),
      deal.athleteNetPayout.toFixed(2),
      fundingLabel(deal.paymentStatus),
      campaignStatus(deal.status),
    ]),
  ];
  const csv = lines.map((line) => line.map(csvCell).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"athletegum-spending.csv\"",
    },
  });
}

function csvCell(value: string) {
  return `"${value.replaceAll("\"", "\"\"")}"`;
}
