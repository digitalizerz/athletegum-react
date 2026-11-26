import Link from "next/link";
import { requireUser } from "@/app/actions/auth";
import { AthleteAvatar } from "@/components/athlete-avatar";
import { campaignStatus, dealTypeName, fundingLabel, money } from "@/lib/deals";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RevenuePage() {
  const session = await requireUser("business");
  const deals = await prisma.deal.findMany({
    where: { businessId: session.id, status: { notIn: ["draft", "cancelled"] } },
    include: { athlete: true, invitations: true },
    orderBy: { createdAt: "desc" },
  });

  const committed = sum(deals, "compensationAmount");
  const charged = sum(deals.filter(chargedDeal), "compensationAmount");
  const fees = sum(deals, "platformFeeAmount");
  const feesCollected = sum(deals.filter(chargedDeal), "platformFeeAmount");
  const allocated = sum(deals, "athleteNetPayout");
  const released = sum(deals.filter((deal) => deal.paymentStatus === "released"), "athleteNetPayout");
  const held = sum(deals.filter((deal) => deal.paymentStatus === "paid_escrowed"), "athleteNetPayout");
  const notCharged = sum(deals.filter((deal) => deal.paymentStatus === "unpaid" || deal.paymentStatus === "failed"), "athleteNetPayout");
  const months = byMonth(deals);
  const max = Math.max(...months.map((item) => item.amount), 1);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-black/40">REVENUE</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Spending</h1>
          <p className="mt-2 max-w-2xl text-black/60">What you commit to athletes, what the card has been charged, and what has been paid out. This is NIL spending, not money AthleteGum pays your business.</p>
        </div>
        <a href="/dashboard/revenue/export" className="rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold">Export</a>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl bg-zinc-950 p-5 text-white">
          <p className="text-sm text-white/60">Committed</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{money(committed)}</p>
          <p className="mt-3 text-sm text-white/50">{deals.length === 1 ? "1 campaign" : `${deals.length} campaigns`}</p>
        </article>
        <article className="rounded-3xl border border-black/10 bg-white p-5">
          <p className="text-sm text-black/50">Charged</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{money(charged)}</p>
          <p className="mt-3 text-sm text-black/50">Held or released card charges</p>
        </article>
        <article className="rounded-3xl border border-black/10 bg-white p-5">
          <p className="text-sm text-black/50">Platform fees</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{money(feesCollected)}</p>
          <p className="mt-3 text-sm text-black/50">{money(fees)} allocated on open deals</p>
        </article>
        <article className="rounded-3xl border border-black/10 bg-white p-5">
          <p className="text-sm text-black/50">Athlete payouts</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{money(released)}</p>
          <p className="mt-3 text-sm text-black/50">{money(allocated)} allocated</p>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <article className="rounded-3xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold">Committed by month</h2>
          {months.length === 0 ? <p className="mt-8 text-sm text-black/50">No campaigns yet.</p> : (
            <div className="mt-8 flex h-48 items-end gap-8">
              {months.map((item) => (
                <div key={item.label} className="flex w-16 flex-col items-center justify-end gap-2">
                  <span className="text-xs text-black/50">{money(item.amount)}</span>
                  <span className="w-10 rounded-t-xl bg-zinc-950" style={{ height: `${Math.max(12, (item.amount / max) * 140)}px` }} />
                  <span className="text-center text-xs text-black/45">{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </article>
        <article className="rounded-3xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold">Payout status</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Allocated to athletes" value={money(allocated)} />
            <Row label="Held" value={money(held)} />
            <Row label="Released" value={money(released)} />
            <Row label="Not charged" value={money(notCharged)} />
            <Row label="Refunded" value={money(0)} />
          </dl>
          <p className="mt-4 text-sm text-black/45">Refunds show here when a charged deal is returned. None are on this account.</p>
          <Link href="/dashboard/deals" className="mt-5 inline-flex rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white">View deals</Link>
        </article>
      </section>

      <section className="mt-4 overflow-hidden rounded-3xl border border-black/10 bg-white">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-semibold">Transactions</h2>
        </div>
        {deals.length === 0 ? <p className="px-5 pb-8 text-sm text-black/50">No campaign charges yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-black/45">
                <tr>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 font-medium">Campaign</th>
                  <th className="px-3 py-3 font-medium">Athlete</th>
                  <th className="px-3 py-3 font-medium">Charge</th>
                  <th className="px-3 py-3 font-medium">Fee</th>
                  <th className="px-3 py-3 font-medium">Athlete payout</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => {
                  const who = deal.athlete?.name || deal.invitations[0]?.athleteEmail || "Athlete";
                  return (
                    <tr key={deal.id} className="border-t border-black/5">
                      <td className="px-5 py-4">{day(deal.createdAt)}</td>
                      <td className="px-3 py-4"><Link href={`/dashboard/deals/${deal.id}`} className="font-semibold">{dealTypeName(deal.dealType)}</Link></td>
                      <td className="px-3 py-4">
                        <span className="flex items-center gap-2">
                          <AthleteAvatar name={who} photo={deal.athlete?.profilePhoto ?? null} size={28} />
                          {who}
                        </span>
                      </td>
                      <td className="px-3 py-4">{money(deal.compensationAmount)}</td>
                      <td className="px-3 py-4">{money(deal.platformFeeAmount)}</td>
                      <td className="px-3 py-4">{money(deal.athleteNetPayout)}</td>
                      <td className="px-5 py-4">{fundingLabel(deal.paymentStatus)} · {campaignStatus(deal.status)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-black/50">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

function chargedDeal(deal: { paymentStatus: string }) {
  return deal.paymentStatus === "paid_escrowed" || deal.paymentStatus === "released";
}

function sum<T extends { compensationAmount: number; platformFeeAmount: number; athleteNetPayout: number }>(rows: T[], key: "compensationAmount" | "platformFeeAmount" | "athleteNetPayout") {
  return rows.reduce((total, row) => total + row[key], 0);
}

function byMonth(deals: { createdAt: Date; compensationAmount: number }[]) {
  const groups = new Map<string, number>();
  for (const deal of deals) {
    const key = `${deal.createdAt.getUTCFullYear()}-${deal.createdAt.getUTCMonth()}`;
    groups.set(key, (groups.get(key) ?? 0) + deal.compensationAmount);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, amount]) => {
      const [year, month] = key.split("-").map(Number);
      const label = new Date(Date.UTC(year, month, 1)).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
      return { label, amount };
    });
}

function day(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
