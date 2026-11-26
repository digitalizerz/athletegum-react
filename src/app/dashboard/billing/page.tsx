import Link from "next/link";
import { requireUser } from "@/app/actions/auth";
import { campaignStatus, dealTypeName, effectivePlan, formatFeePercent, fundingLabel, maxActiveDeals, money, platformFeePercent } from "@/lib/deals";
import { getFeeSchedule } from "@/lib/fees";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PLANS = [
  { id: "free", name: "Free", price: "$0", detail: "Up to 3 active deals." },
  { id: "pro", name: "Pro", price: "$49", detail: "Unlimited active deals." },
  { id: "growth", name: "Growth", price: "$99", detail: "Unlimited active deals." },
] as const;

export default async function BillingPage() {
  const session = await requireUser("business");
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  const plan = user ? effectivePlan(user.subscriptionPlan, user.subscriptionStatus) : "free";
  const rates = await getFeeSchedule();
  const fee = formatFeePercent(user ? platformFeePercent(user.subscriptionPlan, user.subscriptionStatus, rates) : rates.free);
  const limit = user ? maxActiveDeals(user.subscriptionPlan, user.subscriptionStatus) : 3;
  const [activeDeals, deals] = await Promise.all([
    prisma.deal.count({ where: { businessId: session.id, status: { in: ["pending", "accepted", "completed"] } } }),
    prisma.deal.findMany({
      where: { businessId: session.id, status: { not: "cancelled" } },
      orderBy: { createdAt: "desc" },
      include: { athlete: true },
    }),
  ]);
  const charged = deals.filter((deal) => deal.paymentStatus === "paid_escrowed" || deal.paymentStatus === "released").reduce((sum, deal) => sum + deal.compensationAmount, 0);
  const committed = deals.filter((deal) => deal.status !== "draft").reduce((sum, deal) => sum + deal.compensationAmount, 0);
  const usage = limit ? Math.min(100, Math.round((activeDeals / limit) * 100)) : 100;
  const current = PLANS.find((item) => item.id === plan) ?? PLANS[0];

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.18em] text-black/40">BILLING</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Billing and payments</h1>
      <p className="mt-2 max-w-2xl text-black/60">Your subscription and deal funding are separate. The plan sets the platform fee. Funding a deal charges the campaign amount and holds it until you approve the work.</p>

      <section className="mt-8 grid gap-4 xl:grid-cols-3">
        <article className="rounded-3xl bg-zinc-950 p-6 text-white">
          <p className="text-sm text-white/60">Current plan</p>
          <p className="mt-3 text-4xl font-bold">{current.name}</p>
          <p className="mt-2 text-lg">{current.price}<span className="text-sm text-white/60"> / month</span></p>
          <p className="mt-4 text-sm text-white/70">{fee}% platform fee on deal compensation. {current.detail}</p>
          <Link href="#plans" className="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">View plans</Link>
        </article>
        <article className="rounded-3xl border border-black/10 bg-white p-6">
          <p className="text-sm text-black/50">Deal funding</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{money(charged)}</p>
          <p className="mt-2 text-sm text-black/50">Charged and held or released. Not a subscription balance.</p>
          <p className="mt-4 text-sm">Committed on open deals: {money(committed)}</p>
        </article>
        <article className="rounded-3xl border border-black/10 bg-white p-6">
          <p className="text-sm text-black/50">Payment method</p>
          <p className="mt-3 text-lg font-semibold">No card on file</p>
          <p className="mt-2 text-sm leading-6 text-black/55">Cards are entered when you fund a deal. AthleteGum does not store a card for the subscription yet.</p>
        </article>
      </section>

      <section className="mt-4 rounded-3xl border border-black/10 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-semibold">Plan usage</h2>
          <p className="text-sm text-black/50">{current.name} plan</p>
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span>Active deals</span>
            <span className="font-semibold">{limit === null ? activeDeals : `${activeDeals} of ${limit}`}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
            <span className="block h-full rounded-full bg-zinc-950" style={{ width: `${usage}%` }} />
          </div>
        </div>
      </section>

      <section id="plans" className="mt-4 grid gap-4 lg:grid-cols-3">
        {PLANS.map((item) => {
          const selected = item.id === plan;
          return (
            <article key={item.id} className={`rounded-3xl border p-6 ${selected ? "border-zinc-950 bg-zinc-950 text-white" : "border-black/10 bg-white"}`}>
              <p className="text-sm opacity-70">{item.name}</p>
              <p className="mt-2 text-4xl font-bold">{item.price}<span className="text-base font-medium opacity-70">/mo</span></p>
              <p className="mt-4 text-sm">{formatFeePercent(rates[item.id])}% platform fee</p>
              <p className="mt-1 text-sm opacity-70">{item.detail}</p>
              <p className="mt-6 text-sm font-semibold">{selected ? "Current plan" : "Subscription checkout is not connected yet."}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-4 overflow-hidden rounded-3xl border border-black/10 bg-white">
        <div className="px-5 py-4">
          <h2 className="font-semibold">Deal funding history</h2>
          <p className="mt-1 text-sm text-black/50">These are campaign charges, not subscription invoices. There are no subscription invoices on the {current.name} plan.</p>
        </div>
        {deals.length === 0 ? <p className="px-5 pb-8 text-sm text-black/50">No deals yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-black/45">
                <tr>
                  <th className="px-5 py-3 font-medium">Campaign</th>
                  <th className="px-3 py-3 font-medium">Athlete</th>
                  <th className="px-3 py-3 font-medium">Charge</th>
                  <th className="px-3 py-3 font-medium">Funding</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.id} className="border-t border-black/5">
                    <td className="px-5 py-4 font-semibold">{dealTypeName(deal.dealType)}</td>
                    <td className="px-3 py-4">{deal.athlete?.name ?? "Not assigned"} · {campaignStatus(deal.status)}</td>
                    <td className="px-3 py-4">{money(deal.compensationAmount)}</td>
                    <td className="px-3 py-4">{fundingLabel(deal.paymentStatus)}</td>
                    <td className="px-5 py-4">{deal.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
