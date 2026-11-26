import Link from "next/link";
import { requireUser } from "@/app/actions/auth";
import { AdminHeader } from "@/components/admin-ui";
import { dealTypeName, money } from "@/lib/deals";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const RANGES = [
  { id: "all", label: "All time" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
] as const;

export default async function AdminRevenuePage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  await requireUser("admin");
  const params = await searchParams;
  const filter = RANGES.some((item) => item.id === params.filter) ? params.filter! : "all";
  const since = filter === "all" ? null : new Date(Date.now() - Number(filter.replace("d", "")) * 24 * 60 * 60 * 1000);
  const deals = await prisma.deal.findMany({
    where: {
      paymentStatus: { in: ["paid_escrowed", "released"] },
      ...(since ? { paidAt: { gte: since } } : {}),
    },
    orderBy: { paidAt: "desc" },
    include: { business: true, athlete: true },
  });
  const volume = deals.reduce((sum, deal) => sum + deal.compensationAmount, 0);
  const fees = deals.reduce((sum, deal) => sum + deal.platformFeeAmount, 0);
  const athleteFees = deals.reduce((sum, deal) => sum + deal.athleteFeeAmount, 0);
  const paidOut = deals.filter((deal) => deal.paymentStatus === "released").reduce((sum, deal) => sum + deal.athleteNetPayout, 0);

  return (
    <div>
      <AdminHeader title="Revenue" subtitle="Platform fees from card charges. Athlete payouts count only after a deal is released." />
      <div className="mt-6 flex flex-wrap gap-2">
        {RANGES.map((range) => (
          <Link key={range.id} href={range.id === "all" ? "/admin/revenue" : `/admin/revenue?filter=${range.id}`} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${filter === range.id ? "bg-black text-white" : "border border-black/10 bg-white"}`}>
            {range.label}
          </Link>
        ))}
      </div>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-black/10 bg-white p-4"><p className="text-sm text-black/50">Charged volume</p><p className="mt-2 text-2xl font-bold">{money(volume)}</p></article>
        <article className="rounded-2xl border border-black/10 bg-white p-4"><p className="text-sm text-black/50">Platform fees</p><p className="mt-2 text-2xl font-bold">{money(fees)}</p></article>
        <article className="rounded-2xl border border-black/10 bg-white p-4"><p className="text-sm text-black/50">Athlete fees</p><p className="mt-2 text-2xl font-bold">{money(athleteFees)}</p></article>
        <article className="rounded-2xl border border-black/10 bg-white p-4"><p className="text-sm text-black/50">Released to athletes</p><p className="mt-2 text-2xl font-bold">{money(paidOut)}</p></article>
      </section>
      <ul className="mt-8 overflow-hidden rounded-2xl border border-black/10 bg-white">
        {deals.length === 0 ? <li className="px-4 py-10 text-sm text-black/60">No charged deals in this range.</li> : null}
        {deals.map((deal) => (
          <li key={deal.id} className="flex items-center justify-between gap-4 border-b border-black/10 px-4 py-4 text-sm last:border-b-0">
            <span>
              <Link href={`/admin/deals/${deal.id}`} className="font-semibold hover:underline">{dealTypeName(deal.dealType)}</Link>
              <span className="mt-1 block text-black/60">{deal.business.businessName || deal.business.name} → {deal.athlete?.name ?? "Unassigned"}</span>
            </span>
            <span className="text-right">
              <span className="block font-semibold">{money(deal.platformFeeAmount)} fee</span>
              <span className="text-black/60">{money(deal.compensationAmount)} charge</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
