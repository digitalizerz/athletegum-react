import Link from "next/link";
import { requireUser } from "@/app/actions/auth";
import { openPayoutDashboard, startPayoutSetup } from "@/app/actions/connect";
import { ConnectOnboarding } from "@/components/connect-onboarding";
import { transfersActive } from "@/lib/connect";
import { campaignStatus, dealTypeName, money } from "@/lib/deals";
import { prisma } from "@/lib/prisma";
import { getStripe, publishableKey } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function AthleteEarningsPage({ searchParams }: { searchParams: Promise<{ tab?: string; setup?: string; reason?: string }> }) {
  const session = await requireUser("athlete");
  const query = await searchParams;
  const tab = query.tab === "payouts" ? "payouts" : "deals";
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  const paymentsReady = Boolean(getStripe());
  const key = publishableKey();
  const payoutReady = user?.stripeAccountId ? await transfersActive(user.stripeAccountId).catch(() => false) : false;
  const deals = await prisma.deal.findMany({
    where: { athleteId: session.id, status: { in: ["accepted", "completed", "approved"] } },
    orderBy: { updatedAt: "desc" },
    include: { business: true },
  });
  const total = deals.reduce((sum, deal) => sum + deal.athleteNetPayout, 0);
  const approved = deals.filter((deal) => deal.status === "approved").reduce((sum, deal) => sum + deal.athleteNetPayout, 0);
  const paid = deals.filter((deal) => deal.paymentStatus === "released").reduce((sum, deal) => sum + deal.athleteNetPayout, 0);
  const payouts = deals.filter((deal) => deal.paymentStatus === "released");

  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight">Earnings & payouts</h1>
      <p className="mt-2 max-w-2xl text-black/60">Your share of each deal, what the business has approved, and what has been sent. Approved money is paid to the payout account below.</p>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="rounded-3xl bg-zinc-950 p-5 text-white">
          <p className="text-sm text-white/60">Total earnings</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{money(total)}</p>
          <p className="mt-3 text-sm text-white/50">Your share on these deals. This is not money sent to you.</p>
        </article>
        <article className="rounded-3xl border border-black/10 bg-white p-5">
          <p className="text-sm text-black/50">Approved</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{money(approved)}</p>
          <p className="mt-3 text-sm text-black/50">Approved by the business</p>
        </article>
        <article className="rounded-3xl border border-black/10 bg-white p-5">
          <p className="text-sm text-black/50">Paid</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{money(paid)}</p>
          <p className="mt-3 text-sm text-black/50">Sent to you</p>
        </article>
      </section>

      <div className="mt-6 flex gap-2">
        <Link href="/athlete/earnings" className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === "deals" ? "bg-zinc-950 text-white" : "border border-black/10 bg-white text-black/70"}`}>Deals ({deals.length})</Link>
        <Link href="/athlete/earnings?tab=payouts" className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === "payouts" ? "bg-zinc-950 text-white" : "border border-black/10 bg-white text-black/70"}`}>Payouts ({payouts.length})</Link>
      </div>

      <section className="mt-4 overflow-hidden rounded-3xl border border-black/10 bg-white">
        {tab === "deals" ? (
          deals.length === 0 ? <p className="px-5 py-10 text-sm text-black/60">No deal earnings yet. Accepted deals show your share here.</p> : (
            <ul>
              {deals.map((deal) => {
                const company = deal.business.businessName || deal.business.name;
                const approvedAmount = deal.status === "approved" ? deal.athleteNetPayout : 0;
                const paidAmount = deal.paymentStatus === "released" ? deal.athleteNetPayout : 0;
                return (
                  <li key={deal.id} className="border-b border-black/5 last:border-b-0">
                    <Link href={`/athlete/deals/${deal.id}`} className="flex flex-wrap items-center gap-4 px-4 py-4 hover:bg-zinc-50">
                      <Mark name={company} photo={deal.business.profilePhoto} />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{company}</span>
                        <span className="text-sm text-black/60">{dealTypeName(deal.dealType)}</span>
                        {deal.notes ? <span className="mt-0.5 block truncate text-sm text-black/50">{deal.notes}</span> : null}
                      </span>
                      <span className="grid grid-cols-3 gap-4 text-sm">
                        <span><span className="block text-xs text-black/40">Total value</span><span className="font-semibold">{money(deal.athleteNetPayout)}</span></span>
                        <span><span className="block text-xs text-black/40">Approved</span><span className="font-semibold">{money(approvedAmount)}</span></span>
                        <span><span className="block text-xs text-black/40">Paid</span><span className="font-semibold">{money(paidAmount)}</span></span>
                      </span>
                      <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold">{campaignStatus(deal.status)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )
        ) : payouts.length === 0 ? (
          <p className="px-5 py-10 text-sm text-black/60">No payouts yet. Approved money stays here until your payout account can receive it.</p>
        ) : (
          <ul>
            {payouts.map((deal) => (
              <li key={deal.id} className="flex items-center justify-between border-b border-black/5 px-4 py-4 last:border-b-0">
                <span>
                  <span className="font-semibold">{deal.business.businessName || deal.business.name}</span>
                  <span className="mt-1 block text-sm text-black/50">{dealTypeName(deal.dealType)}</span>
                </span>
                <span className="font-semibold">{money(deal.athleteNetPayout)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold">Payout account</h2>
          <p className="mt-1 text-sm text-black/50">Get paid for approved deals. The business is charged first, and your share is sent after approval.</p>
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-black/10 px-4 py-3">
            <span>
              <span className="block text-sm font-semibold">Payouts</span>
              <span className="text-sm text-black/50">{payoutReady ? "Ready" : user?.stripeAccountId ? "Finish setup" : "Not set up"}</span>
            </span>
            {payoutReady ? (
              <form action={openPayoutDashboard}>
                <button className="rounded-full bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white">Open Stripe</button>
              </form>
            ) : paymentsReady ? (
              <form action={startPayoutSetup}>
                <button className="rounded-full bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white">{user?.stripeAccountId ? "Continue setup" : "Set up payouts"}</button>
              </form>
            ) : <span className="text-xs font-semibold text-black/50">Payments are not set up on this server yet.</span>}
          </div>
          {query.reason === "liability" ? <p className="mt-3 text-sm text-black/60">Payout accounts can be created after the platform accepts responsibility for negative balances in Stripe.</p> : null}
          {query.reason === "unavailable" ? <p className="mt-3 text-sm text-black/60">Card payments are not set up on this server yet.</p> : null}
          {query.reason === "failed" ? <p className="mt-3 text-sm text-black/60">Payout setup could not be started. Try again.</p> : null}
          {key && user?.stripeAccountId ? <ConnectOnboarding publishableKey={key} showOnboarding={!payoutReady || query.setup === "1"} /> : null}
        </article>
        <article className="rounded-3xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold">How payouts work</h2>
          <ol className="mt-4 space-y-3 text-sm text-black/70">
            <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-zinc-950 text-xs font-semibold text-white">1</span>The business pays the deal by card. That money stays with AthleteGum.</li>
            <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-zinc-950 text-xs font-semibold text-white">2</span>The business approves the finished work.</li>
            <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-zinc-950 text-xs font-semibold text-white">3</span>Your share is sent to this payout account. The platform fee stays behind.</li>
          </ol>
        </article>
      </section>
    </div>
  );
}

function Mark({ name, photo }: { name: string; photo: string | null }) {
  if (photo) return <img src={photo} alt="" className="h-12 w-12 rounded-2xl object-cover" />;
  const letters = name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "AG";
  return <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-zinc-950 text-sm font-bold text-white">{letters}</span>;
}
