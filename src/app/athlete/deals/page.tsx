import Link from "next/link";
import { requireUser } from "@/app/actions/auth";
import { campaignStatus, dealTypeName, money, scheduleLabel } from "@/lib/deals";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const VIEWS = [
  { id: "all", label: "All deals" },
  { id: "progress", label: "In progress" },
  { id: "approved", label: "Approved" },
  { id: "completed", label: "Completed" },
] as const;

export default async function AthleteDealsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const session = await requireUser("athlete");
  const query = await searchParams;
  const view = VIEWS.some((item) => item.id === query.view) ? query.view! : "all";
  const deals = await prisma.deal.findMany({
    where: {
      status: { not: "draft" },
      OR: [{ athleteId: session.id }, { invitations: { some: { athleteEmail: session.email } } }],
    },
    orderBy: { updatedAt: "desc" },
    include: { business: true },
  });
  const open = deals.filter((deal) => ["accepted", "completed", "approved"].includes(deal.status));
  const total = open.reduce((sum, deal) => sum + deal.athleteNetPayout, 0);
  const approved = deals.filter((deal) => deal.status === "approved").reduce((sum, deal) => sum + deal.athleteNetPayout, 0);
  const paid = deals.filter((deal) => deal.paymentStatus === "released").reduce((sum, deal) => sum + deal.athleteNetPayout, 0);
  const groups = {
    all: deals,
    progress: deals.filter((deal) => deal.status === "accepted" || deal.status === "completed"),
    approved: deals.filter((deal) => deal.status === "approved" && deal.paymentStatus !== "released"),
    completed: deals.filter((deal) => deal.paymentStatus === "released"),
  };
  const visible = groups[view as keyof typeof groups];

  return (
    <div>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">My deals</h1>
          <p className="mt-2 text-black/60">Track your current deal, deliverables, and payments.</p>
        </div>
        <img src="/media/court.jpg" alt="" className="hidden h-28 w-48 rounded-3xl object-cover grayscale lg:block" />
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="rounded-3xl bg-zinc-950 p-5 text-white">
          <p className="text-sm text-white/60">Total earnings</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{money(total)}</p>
          <p className="mt-3 text-sm text-white/50">Your share on open deals. Paid is what has been sent.</p>
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

      <div className="mt-6 flex flex-wrap gap-2">
        {VIEWS.map((item) => {
          const count = groups[item.id].length;
          const active = view === item.id;
          return (
            <Link key={item.id} href={item.id === "all" ? "/athlete/deals" : `/athlete/deals?view=${item.id}`} className={`rounded-full px-4 py-2 text-sm font-semibold ${active ? "bg-zinc-950 text-white" : "border border-black/10 bg-white text-black/70"}`}>
              {item.label} ({count})
            </Link>
          );
        })}
      </div>

      <section className="mt-4 overflow-hidden rounded-3xl border border-black/10 bg-white">
        {visible.length === 0 ? (
          <p className="px-5 py-10 text-sm text-black/60">{view === "all" ? "No deals yet. Invitations show up here and under Opportunities." : "Nothing in this group."}</p>
        ) : (
          <ul>
            {visible.map((deal) => {
              const company = deal.business.businessName || deal.business.name;
              return (
                <li key={deal.id} className="border-b border-black/5 last:border-b-0">
                  <Link href={`/athlete/deals/${deal.id}`} className="flex items-center gap-4 px-4 py-4 hover:bg-zinc-50">
                    <Mark name={company} photo={deal.business.profilePhoto} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{company}</span>
                      <span className="mt-0.5 block text-sm text-black/70">{dealTypeName(deal.dealType)}</span>
                      <span className="mt-0.5 block truncate text-sm text-black/50">{deal.notes || "Deal details are on the next page."}</span>
                      <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-black/60">
                        {deal.startsAt ? <span>Starts {scheduleLabel(deal.startsAt)}</span> : null}
                        {deal.deadline ? <span>Due {scheduleLabel(deal.deadline)}</span> : null}
                        <span>{money(deal.athleteNetPayout)} your share</span>
                      </span>
                    </span>
                    <span className="hidden rounded-full border border-black/10 px-3 py-1 text-xs font-semibold sm:inline">{athleteStatus(deal.status)}</span>
                    <span className="text-black/30" aria-hidden>›</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function athleteStatus(status: string) {
  if (status === "pending") return "Invited";
  return campaignStatus(status);
}

function Mark({ name, photo }: { name: string; photo: string | null }) {
  if (photo) return <img src={photo} alt="" className="h-14 w-14 rounded-2xl object-cover" />;
  const letters = name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "AG";
  return <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-zinc-100 text-lg font-bold">{letters}</span>;
}
