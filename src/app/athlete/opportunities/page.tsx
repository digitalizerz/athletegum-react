import Link from "next/link";
import { requireUser } from "@/app/actions/auth";
import { AthleteOpportunityFilters } from "@/components/athlete-opportunity-filters";
import { DEAL_TYPES, dealTypeName, money, scheduleLabel } from "@/lib/deals";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AthleteOpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; pay?: string; sort?: string }>;
}) {
  const session = await requireUser("athlete");
  const query = await searchParams;
  const q = query.q?.trim() ?? "";
  const type = query.type ?? "all";
  const pay = query.pay ?? "all";
  const sort = query.sort ?? "newest";
  const deals = await prisma.deal.findMany({
    where: {
      status: "pending",
      OR: [{ athleteId: session.id }, { invitations: { some: { athleteEmail: session.email } } }],
    },
    include: { business: true },
  });
  const visible = deals
    .filter((deal) => {
      const company = deal.business.businessName || deal.business.name;
      const haystack = [company, dealTypeName(deal.dealType), deal.notes ?? ""].join(" ").toLowerCase();
      if (q && !haystack.includes(q.toLowerCase())) return false;
      if (type !== "all" && deal.dealType !== type) return false;
      if (pay === "under-500" && deal.athleteNetPayout >= 500) return false;
      if (pay === "500-1500" && (deal.athleteNetPayout < 500 || deal.athleteNetPayout > 1500)) return false;
      if (pay === "over-1500" && deal.athleteNetPayout <= 1500) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "oldest") return a.createdAt.getTime() - b.createdAt.getTime();
      if (sort === "amount") return b.athleteNetPayout - a.athleteNetPayout;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  const featured = visible[0] ?? null;

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.18em] text-black/40">OPPORTUNITIES</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Find NIL opportunities</h1>
      <p className="mt-2 max-w-2xl text-black/60">Invitations sent to you. A business creates a deal and invites you. Open campaigns from other companies are not listed here.</p>

      {featured ? <Featured deal={featured} /> : null}

      <div className="mt-6">
        <AthleteOpportunityFilters q={q} type={type} pay={pay} sort={sort} types={DEAL_TYPES.map((item) => ({ id: item.id, name: item.name }))} />
      </div>

      <div className="mt-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Available opportunities</h2>
          <p className="text-sm text-black/50">{visible.length === 1 ? "1 invitation" : `${visible.length} invitations`}</p>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-4 rounded-3xl border border-black/10 bg-white px-5 py-10 text-sm text-black/60">No open invitations. When a business sends you a deal, it shows up here until you accept it.</p>
      ) : (
        <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((deal) => {
            const company = deal.business.businessName || deal.business.name;
            return (
              <li key={deal.id} className="rounded-3xl border border-black/10 bg-white p-4">
                <span className="inline-flex rounded-full border border-black/10 px-2.5 py-1 text-xs font-semibold">Invited</span>
                <div className="mt-4 flex items-center gap-3">
                  <Mark name={company} photo={deal.business.profilePhoto} />
                  <div>
                    <p className="font-semibold">{company}</p>
                    <p className="text-sm text-black/50">{dealTypeName(deal.dealType)}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-lg font-semibold">{money(deal.athleteNetPayout)}</span>
                  {deal.deadline ? <span className="text-black/50">Due {scheduleLabel(deal.deadline)}</span> : null}
                </div>
                <div className="mt-4 flex gap-2">
                  <Link href={`/athlete/deals/${deal.id}`} className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white">Review invitation</Link>
                  <Link href={`/athlete/deals/${deal.id}`} className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold">View details</Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Featured({ deal }: { deal: { id: string; dealType: string; notes: string | null; athleteNetPayout: number; deadline: Date | null; business: { name: string; businessName: string | null } } }) {
  const company = deal.business.businessName || deal.business.name;
  return (
    <section className="relative mt-6 overflow-hidden rounded-3xl bg-zinc-950 text-white">
      <img src="/media/court.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40 grayscale" />
      <div className="relative max-w-xl p-6 sm:p-8">
        <p className="text-xs font-semibold tracking-[0.16em] text-white/70">INVITATION</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight">{company}</h2>
        <p className="text-xl font-semibold">{dealTypeName(deal.dealType)}</p>
        {deal.notes ? <p className="mt-3 text-sm leading-6 text-white/80">{deal.notes}</p> : null}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span>{money(deal.athleteNetPayout)} your share</span>
          {deal.deadline ? <span>Due {scheduleLabel(deal.deadline)}</span> : null}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/athlete/deals/${deal.id}`} className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black">Review invitation</Link>
          <Link href={`/athlete/deals/${deal.id}`} className="rounded-full border border-white/40 px-4 py-2.5 text-sm font-semibold">View details</Link>
        </div>
      </div>
    </section>
  );
}

function Mark({ name, photo }: { name: string; photo: string | null }) {
  if (photo) return <img src={photo} alt="" className="h-11 w-11 rounded-2xl object-cover" />;
  const letters = name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "AG";
  return <span className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-950 text-sm font-bold text-white">{letters}</span>;
}
