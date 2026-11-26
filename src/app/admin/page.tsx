import Link from "next/link";
import { requireUser } from "@/app/actions/auth";
import { RangeSelect } from "@/components/admin-controls";
import { AdminHeader, ago } from "@/components/admin-ui";
import { dealTypeName, money } from "@/lib/deals";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const RANGES = ["7d", "30d", "90d", "all"] as const;
type RangeId = (typeof RANGES)[number];

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  await requireUser("admin");
  const params = await searchParams;
  const range: RangeId = RANGES.includes(params.range as RangeId) ? (params.range as RangeId) : "30d";
  const days = range === "all" ? null : Number(range.replace("d", ""));
  const start = days ? new Date(Date.now() - days * 86400000) : null;
  const prior = days ? new Date(Date.now() - days * 2 * 86400000) : null;

  const [people, deals, charged, messages] = await Promise.all([
    prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } }),
    prisma.deal.findMany({ include: { business: true, athlete: true }, orderBy: { createdAt: "desc" } }),
    prisma.deal.findMany({ where: { paymentStatus: { in: ["paid_escrowed", "released"] } }, select: { platformFeeAmount: true, paidAt: true, createdAt: true } }),
    prisma.message.findMany({ where: { system: true }, orderBy: { createdAt: "desc" }, take: 8, include: { deal: { include: { business: true, athlete: true } } } }),
  ]);

  const inWindow = (date: Date) => !start || date >= start;
  const inPrior = (date: Date) => Boolean(prior && start && date >= prior && date < start);
  const groups = {
    users: people,
    athletes: people.filter((person) => person.role === "athlete"),
    businesses: people.filter((person) => person.role === "business"),
    deals,
  };
  const cards = [
    { href: "/admin/users", label: "Total users", icon: "users", count: groups.users.length, current: groups.users.filter((person) => inWindow(person.createdAt)).length, prior: groups.users.filter((person) => inPrior(person.createdAt)).length },
    { href: "/admin/athletes", label: "Athletes", icon: "athletes", count: groups.athletes.length, current: groups.athletes.filter((person) => inWindow(person.createdAt)).length, prior: groups.athletes.filter((person) => inPrior(person.createdAt)).length },
    { href: "/admin/businesses", label: "Businesses", icon: "businesses", count: groups.businesses.length, current: groups.businesses.filter((person) => inWindow(person.createdAt)).length, prior: groups.businesses.filter((person) => inPrior(person.createdAt)).length },
    { href: "/admin/deals", label: "Deals", icon: "deals", count: groups.deals.length, current: groups.deals.filter((deal) => inWindow(deal.createdAt)).length, prior: groups.deals.filter((deal) => inPrior(deal.createdAt)).length },
  ];
  const fees = charged.filter((deal) => inWindow(deal.paidAt ?? deal.createdAt)).reduce((sum, deal) => sum + deal.platformFeeAmount, 0);
  const priorFees = charged.filter((deal) => inPrior(deal.paidAt ?? deal.createdAt)).reduce((sum, deal) => sum + deal.platformFeeAmount, 0);

  const activity = [
    ...people.map((person) => ({
      id: `user-${person.id}`,
      at: person.createdAt,
      title: person.role === "athlete" ? "Athlete registered" : person.role === "business" ? "Business registered" : "Admin account added",
      detail: person.name,
      href: `/admin/users/${person.id}`,
    })),
    ...deals.map((deal) => ({
      id: `deal-${deal.id}`,
      at: deal.createdAt,
      title: "Deal opened",
      detail: `${deal.business.businessName || deal.business.name} · ${money(deal.compensationAmount)}`,
      href: `/admin/deals/${deal.id}`,
    })),
    ...messages
      .filter((message) => message.body !== "Deal created and invitation sent.")
      .map((message) => ({
        id: `message-${message.id}`,
        at: message.createdAt,
        title: message.body,
        detail: `${message.deal.business.businessName || message.deal.business.name}${message.deal.athlete ? ` · ${message.deal.athlete.name}` : ""} · ${dealTypeName(message.deal.dealType)}`,
        href: `/admin/deals/${message.dealId}`,
      })),
  ]
    .filter((item) => inWindow(item.at))
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 6);

  return (
    <div>
      <AdminHeader title="Platform overview" subtitle="Accounts, deals, and card charges on the platform.">
        <RangeSelect value={range} />
      </AdminHeader>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="rounded-2xl border border-black/10 bg-white p-4">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-100 text-zinc-700">
              <CardIcon name={card.icon} />
            </span>
            <p className="mt-4 text-sm text-zinc-500">{card.label}</p>
            <p className="mt-1 flex items-end gap-2">
              <span className="text-3xl font-bold tracking-tight">{card.count}</span>
              <Change current={card.current} previous={range === "all" ? null : card.prior} />
            </p>
          </Link>
        ))}
      </section>
      <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <article className="rounded-2xl border border-black/10 bg-white p-5">
          <p className="text-sm text-zinc-500">Platform revenue</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{money(fees)}</p>
          <p className="mt-1 text-sm text-zinc-500">{range === "all" ? "Fees from card charges." : <FeeChange current={fees} previous={priorFees} />}</p>
          {fees === 0 ? <p className="mt-10 text-sm text-zinc-400">No card charges in this range.</p> : null}
        </article>
        <article className="rounded-2xl border border-black/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent activity</h2>
            <Link href="/admin/audit" className="text-sm font-medium text-zinc-500">View all</Link>
          </div>
          <ul className="mt-4 space-y-4">
            {activity.length === 0 ? <li className="text-sm text-zinc-500">Nothing has happened in this range.</li> : null}
            {activity.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="block">
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-medium">{item.title}</span>
                    <span className="shrink-0 text-xs text-zinc-400">{ago(item.at)}</span>
                  </span>
                  <span className="mt-0.5 block text-sm text-zinc-500">{item.detail}</span>
                </Link>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}

function Change({ current, previous }: { current: number; previous: number | null }) {
  if (previous === null) return null;
  if (previous === 0 && current === 0) return null;
  const label = previous === 0 ? "New" : `${current - previous >= 0 ? "+" : ""}${Math.round(((current - previous) / previous) * 100)}%`;
  const up = current - previous >= 0;
  return <span className={`pb-1 text-xs font-semibold ${up ? "text-emerald-600" : "text-red-600"}`}>{label}</span>;
}

function FeeChange({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) return "Fees collected from card charges.";
  if (previous === 0) return "First charges in this period.";
  const pct = Math.round(((current - previous) / previous) * 100);
  return `${pct >= 0 ? "+" : ""}${pct}% vs the prior period.`;
}

function CardIcon({ name }: { name: string }) {
  const common = { viewBox: "0 0 24 24", className: "h-4 w-4", fill: "none", stroke: "currentColor", strokeWidth: 1.8 };
  if (name === "athletes") {
    return <svg {...common}><circle cx="12" cy="8" r="3" /><path d="M6 19c1.2-2.5 3.2-3.5 6-3.5s4.8 1 6 3.5" /></svg>;
  }
  if (name === "businesses") {
    return <svg {...common}><path d="M4 20V8l8-4 8 4v12" /><path d="M10 20v-5h4v5" /></svg>;
  }
  if (name === "deals") {
    return <svg {...common}><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><rect x="4" y="7" width="16" height="13" rx="2" /></svg>;
  }
  return <svg {...common}><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.8-2.5 2.8-3.5 5.5-3.5s4.7 1 5.5 3.5" /><circle cx="17" cy="9" r="2" /></svg>;
}
