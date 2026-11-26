import { requireUser } from "@/app/actions/auth";
import { CreateDealWizard } from "@/components/create-deal-wizard";
import { platformFeePercent } from "@/lib/deals";
import { getFeeSchedule } from "@/lib/fees";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewDealPage({ searchParams }: { searchParams: Promise<{ athlete?: string }> }) {
  const session = await requireUser("business");
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  const rates = await getFeeSchedule();
  const fee = user ? platformFeePercent(user.subscriptionPlan, user.subscriptionStatus, rates) : rates.free;
  const athleteEmail = (await searchParams).athlete?.trim().toLowerCase() ?? "";
  const listed = await prisma.user.findMany({
    where: { role: "athlete", isActive: true, athleteLevel: "college" },
    orderBy: { name: "asc" },
    select: { name: true, email: true, sport: true, school: true, profilePhoto: true },
  });
  const athletes = [...listed];
  if (athleteEmail && !athletes.some((athlete) => athlete.email === athleteEmail)) {
    const extra = await prisma.user.findFirst({
      where: { email: athleteEmail, role: "athlete", isActive: true },
      select: { name: true, email: true, sport: true, school: true, profilePhoto: true },
    });
    if (extra) athletes.unshift(extra);
  }

  return (
    <CreateDealWizard
      athletes={athletes.map((athlete) => ({ ...athlete, email: athlete.email.toLowerCase() }))}
      feePercent={fee}
      initialEmail={athleteEmail}
    />
  );
}
