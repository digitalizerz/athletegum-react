import { updateFeeSchedule } from "@/app/actions/admin";
import { requireUser } from "@/app/actions/auth";
import { AdminHeader, AdminNotice } from "@/components/admin-ui";
import { formatFeePercent } from "@/lib/deals";
import { getFeeSchedule } from "@/lib/fees";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

const PLANS = [
  { name: "freePercent", title: "Free", price: "Default", detail: "Used for Free, and for Pro or Growth when the subscription is not active. Up to 3 active deals." },
  { name: "proPercent", title: "Pro", price: "$49/mo", detail: "Used only while the Pro subscription status is active." },
  { name: "growthPercent", title: "Growth", price: "$99/mo", detail: "Used only while the Growth subscription status is active." },
] as const;

export default async function AdminFeesPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireUser("admin");
  const query = await searchParams;
  const stripe = getStripe();
  const rates = await getFeeSchedule();
  const values = { freePercent: rates.free, proPercent: rates.pro, growthPercent: rates.growth };
  const businesses = await prisma.user.groupBy({
    by: ["subscriptionPlan", "subscriptionStatus"],
    where: { role: "business" },
    _count: true,
  });

  return (
    <div>
      <AdminHeader title="Fees" subtitle="The fee comes out of the business charge. Athletes are not billed a separate fee." />
      <AdminNotice saved={query.saved} error={query.error} />
      <form action={updateFeeSchedule} className="mt-6">
        <section className="grid gap-4 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <label key={plan.name} className="rounded-2xl border border-black/10 bg-white p-4">
              <span className="text-sm text-zinc-500">{plan.title}</span>
              <span className="mt-1 block text-xs text-zinc-400">{plan.price}</span>
              <span className="mt-4 flex items-center gap-2">
                <input name={plan.name} type="number" min={0} max={100} step="0.01" required defaultValue={formatFeePercent(values[plan.name])} className="h-12 w-24 rounded-xl border border-black/10 px-3 text-2xl font-bold outline-none" />
                <span className="text-2xl font-bold">%</span>
              </span>
              <span className="mt-3 block text-sm text-zinc-500">{plan.detail}</span>
            </label>
          ))}
        </section>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white">Save fees</button>
          <p className="text-sm text-zinc-500">Saving changes the rate on new deals. A deal that already exists keeps the fee recorded on it.</p>
        </div>
      </form>
      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-5 text-sm">
        <h2 className="text-lg font-semibold">Card payments</h2>
        <p className="mt-2 text-black/70">{stripe ? "A Stripe secret key is set on this server." : "Card payments are not set up on this server yet."}</p>
        <p className="mt-2 text-black/50">Keys stay in the server environment. This page does not store or display them.</p>
      </section>
      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
        <h2 className="text-lg font-semibold">Businesses by plan</h2>
        <ul className="mt-3 text-sm">
          {businesses.length === 0 ? <li className="text-black/60">No businesses.</li> : null}
          {businesses.map((row) => (
            <li key={`${row.subscriptionPlan}-${row.subscriptionStatus}`} className="flex justify-between border-b border-black/10 py-2 last:border-b-0">
              <span>{row.subscriptionPlan} · {row.subscriptionStatus}</span>
              <span className="font-semibold">{row._count}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
