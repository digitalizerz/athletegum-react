import Link from "next/link";
import { requireUser } from "@/app/actions/auth";
import { AthleteAvatar } from "@/components/athlete-avatar";
import { DealFilters } from "@/components/deal-filters";
import { DEAL_TYPES, dealTypeName, money, parsePlatforms, PLATFORMS, scheduleLabel } from "@/lib/deals";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ACTIVE = ["pending", "accepted", "completed"];

export default async function BusinessDealsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; platform?: string; athlete?: string; sort?: string }>;
}) {
  const session = await requireUser("business");
  const query = await searchParams;
  const q = query.q?.trim() ?? "";
  const status = query.status || "all";
  const platform = query.platform || "all";
  const athlete = query.athlete || "all";
  const sort = query.sort || "newest";

  const deals = await prisma.deal.findMany({
    where: { businessId: session.id },
    include: { athlete: true, invitations: true },
  });

  const book = deals.filter((deal) => deal.status !== "cancelled" && deal.status !== "draft");
  const committed = book.reduce((sum, deal) => sum + deal.compensationAmount, 0);
  const fees = book.reduce((sum, deal) => sum + deal.platformFeeAmount, 0);
  const payouts = book.reduce((sum, deal) => sum + deal.athleteNetPayout, 0);
  const active = deals.filter((deal) => ACTIVE.includes(deal.status));
  const inProgress = deals.filter((deal) => deal.status === "accepted").length;
  const athletes = [...new Set(deals.map(partyName))].sort();
  const platformIds = [...new Set(deals.flatMap((deal) => parsePlatforms(deal.platforms)))];
  const platforms = PLATFORMS.filter((item) => platformIds.includes(item.id));

  const visible = deals
    .filter((deal) => {
      if (status !== "all" && deal.status !== status) return false;
      if (platform !== "all" && !parsePlatforms(deal.platforms).includes(platform)) return false;
      if (athlete !== "all" && partyName(deal) !== athlete) return false;
      if (!q) return true;
      const haystack = [dealTypeName(deal.dealType), deal.notes, partyName(deal), deal.invitations[0]?.athleteEmail]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q.toLowerCase());
    })
    .sort((a, b) => {
      if (sort === "oldest") return a.createdAt.getTime() - b.createdAt.getTime();
      if (sort === "amount") return b.compensationAmount - a.compensationAmount;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Deals</h1>
          <p className="mt-2 text-black/60">Invitations, work in progress, and approved deals for your brand.</p>
        </div>
        <Link href="/dashboard/deals/new" className="rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white">New deal</Link>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl bg-zinc-950 p-5 text-white">
          <p className="text-sm text-white/60">Total deal value</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{money(committed)}</p>
          <p className="mt-3 text-sm text-white/50">Open and approved compensation</p>
        </article>
        <article className="rounded-3xl border border-black/10 bg-white p-5">
          <p className="text-sm text-black/50">Active deals</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{active.length}</p>
          <p className="mt-3 text-sm text-black/50">{inProgress === 1 ? "1 in progress" : `${inProgress} in progress`}</p>
        </article>
        <article className="rounded-3xl border border-black/10 bg-white p-5">
          <p className="text-sm text-black/50">Platform fees</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{money(fees)}</p>
          <p className="mt-3 text-sm text-black/50">Taken out of compensation</p>
        </article>
        <article className="rounded-3xl border border-black/10 bg-white p-5">
          <p className="text-sm text-black/50">Athlete payouts</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{money(payouts)}</p>
          <p className="mt-3 text-sm text-black/50">What athletes receive</p>
        </article>
      </section>

      <div className="mt-6">
        <DealFilters q={q} status={status} platform={platform} athlete={athlete} sort={sort} platforms={platforms} athletes={athletes} />
      </div>

      {visible.length === 0 ? (
        <p className="mt-6 rounded-3xl border border-black/10 bg-white px-5 py-10 text-sm text-black/50">
          {deals.length === 0 ? "No deals yet. Create one and invite an athlete by email." : "No deals match that search."}
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((deal) => {
            const who = partyName(deal);
            const platformsOnDeal = parsePlatforms(deal.platforms).map(platformName);
            const detail = deal.notes || DEAL_TYPES.find((type) => type.id === deal.dealType)?.detail;
            return (
              <li key={deal.id}>
                <Link href={`/dashboard/deals/${deal.id}`} className="flex flex-wrap items-center gap-4 rounded-3xl border border-black/10 bg-white p-4 hover:bg-zinc-50">
                  <AthleteAvatar name={who} photo={deal.athlete?.profilePhoto ?? null} size={72} />
                  <span className="min-w-[12rem] flex-1">
                    <span className="block text-lg font-semibold">{dealTypeName(deal.dealType)}</span>
                    {detail ? <span className="mt-1 block text-sm text-black/50">{detail}</span> : null}
                    <span className="mt-3 flex flex-wrap gap-2">
                      {platformsOnDeal.map((name) => (
                        <span key={name} className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium">{name}</span>
                      ))}
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium">{who}</span>
                    </span>
                  </span>
                  <span className="min-w-36 text-sm">
                    <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 font-medium">{businessStatus(deal.status)}</span>
                    {deal.startsAt ? <span className="mt-2 block text-black/50">Starts {scheduleLabel(deal.startsAt)}</span> : null}
                    {deal.deadline ? <span className="mt-1 block text-black/50">Due {scheduleLabel(deal.deadline)}</span> : null}
                  </span>
                  <span className="min-w-36 text-right">
                    <span className="block text-xl font-semibold">{money(deal.compensationAmount)}</span>
                    <span className="mt-1 block text-xs text-black/50">Fee {money(deal.platformFeeAmount)} · Athlete {money(deal.athleteNetPayout)}</span>
                  </span>
                  <span aria-hidden className="grid h-10 w-10 place-items-center rounded-full border border-black/10 text-black/40">→</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function partyName(deal: { athlete: { name: string } | null; invitations: { athleteEmail: string }[] }) {
  return deal.athlete?.name || deal.invitations[0]?.athleteEmail || "Athlete";
}

function platformName(id: string) {
  return PLATFORMS.find((item) => item.id === id)?.name ?? id;
}

function businessStatus(status: string) {
  switch (status) {
    case "draft":
      return "Not charged";
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
      return status;
  }
}
