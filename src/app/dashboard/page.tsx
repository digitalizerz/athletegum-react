import Link from "next/link";
import { requireUser } from "@/app/actions/auth";
import { AthleteAvatar } from "@/components/athlete-avatar";
import { dealTypeName, effectivePlan, formatFeePercent, maxActiveDeals, money, platformFeePercent, statusLabel } from "@/lib/deals";
import { getFeeSchedule } from "@/lib/fees";
import { prisma } from "@/lib/prisma";
import { levelLabel } from "@/lib/profile";

export const dynamic = "force-dynamic";

const ACTIVE = ["pending", "accepted", "completed"];

const STEPS = [
  { status: "pending", label: "Invited" },
  { status: "accepted", label: "In progress" },
  { status: "completed", label: "In review" },
  { status: "approved", label: "Approved" },
] as const;

export default async function BusinessDashboard() {
  const session = await requireUser("business");
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  const [deals, notes, athletes, athleteCount] = await Promise.all([
    prisma.deal.findMany({
      where: { businessId: session.id },
      orderBy: { updatedAt: "desc" },
      include: { athlete: true, invitations: { include: { athlete: true } } },
    }),
    prisma.notification.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.user.findMany({
      where: { role: "athlete", isActive: true },
      orderBy: { name: "asc" },
      take: 3,
    }),
    prisma.user.count({ where: { role: "athlete", isActive: true } }),
  ]);

  const active = deals.filter((deal) => ACTIVE.includes(deal.status));
  const committed = active.reduce((sum, deal) => sum + deal.compensationAmount, 0);
  const featured = [
    ...deals.filter((deal) => deal.status === "accepted"),
    ...deals.filter((deal) => deal.status === "pending"),
    ...deals.filter((deal) => deal.status === "completed"),
    ...deals.filter((deal) => deal.status === "approved"),
  ][0];
  const limit = user ? maxActiveDeals(user.subscriptionPlan, user.subscriptionStatus) : 3;
  const rates = await getFeeSchedule();
  const fee = formatFeePercent(user ? platformFeePercent(user.subscriptionPlan, user.subscriptionStatus, rates) : rates.free);
  const plan = user ? effectivePlan(user.subscriptionPlan, user.subscriptionStatus) : "free";
  const planName = plan === "pro" ? "Pro plan" : plan === "growth" ? "Growth plan" : "Free plan";
  const name = user?.businessName || session.name;

  return (
    <div>
      <section className="relative overflow-hidden rounded-3xl bg-zinc-950 text-white">
        <img src="/media/court.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/35" />
        <div className="relative flex flex-wrap items-end justify-between gap-6 px-6 pt-8 pb-16 lg:px-8 lg:pt-10">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-white/70">BUSINESS DASHBOARD</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">Hello, {name}</h1>
            <p className="mt-2 max-w-xl text-white/75">Find athletes, run NIL deals, and grow your brand.</p>
          </div>
          <Link href="/dashboard/deals/new" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black">
            <span aria-hidden>+</span> New deal
          </Link>
        </div>
      </section>

      <section className="relative z-10 -mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl bg-zinc-950 p-5 text-white shadow-sm">
          <p className="text-sm text-white/60">Active deals</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{active.length}</p>
          <p className="mt-3 text-sm text-white/50">{limit === null ? planName : `${active.length} of ${limit} · ${planName}`}</p>
        </article>
        <article className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-sm text-black/50">Total committed</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{money(committed)}</p>
          <p className="mt-3 text-sm text-black/50">Compensation on open deals</p>
        </article>
        <article className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-sm text-black/50">Athletes</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{athleteCount}</p>
          <p className="mt-3 text-sm text-black/50">With a profile you can invite</p>
        </article>
        <article className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-sm text-black/50">Platform fee</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{fee}%</p>
          <p className="mt-3 text-sm text-black/50">Taken out of compensation</p>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_0.75fr]">
        <article className="rounded-3xl border border-black/10 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Active deals</h2>
            <Link href="/dashboard/deals" className="text-sm font-semibold text-black/50 hover:text-black">View all deals</Link>
          </div>
          {featured ? (
            <div className="mt-5">
              <Link href={`/dashboard/deals/${featured.id}`} className="flex items-center justify-between gap-4 rounded-2xl border border-black/10 p-4 hover:bg-zinc-50">
                <span className="flex min-w-0 items-center gap-3">
                  <AthleteAvatar name={athleteName(featured)} photo={featured.athlete?.profilePhoto ?? featured.invitations[0]?.athlete?.profilePhoto ?? null} size={48} />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{dealTypeName(featured.dealType)}</span>
                    <span className="mt-0.5 block truncate text-sm text-black/50">{athleteLine(featured)}</span>
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-semibold">{money(featured.compensationAmount)}</span>
                  <span className="text-sm text-black/50">{statusLabel(featured.status)}</span>
                </span>
              </Link>
              <DealSteps status={featured.status} />
            </div>
          ) : (
            <div className="mt-8">
              <p className="text-sm text-black/50">No deals yet. Invite an athlete and the deal shows up here.</p>
              <Link href="/dashboard/deals/new" className="mt-4 inline-flex rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white">Create a deal</Link>
            </div>
          )}
        </article>

        <article className="rounded-3xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold">Quick actions</h2>
          <ul className="mt-3 divide-y divide-black/5">
            <QuickAction href="/dashboard/deals/new" label="Create a new deal" />
            <QuickAction href="/dashboard/athletes" label="Find athletes" />
            <QuickAction href="/dashboard/messages" label="Messages" />
            <QuickAction href="/dashboard/billing" label="Plans and fees" />
          </ul>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_0.75fr]">
        <article className="rounded-3xl border border-black/10 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Athletes</h2>
              <p className="mt-1 text-sm text-black/50">Invite someone to your next deal.</p>
            </div>
            <Link href="/dashboard/athletes" className="text-sm font-semibold text-black/50 hover:text-black">Find athletes</Link>
          </div>
          {athletes.length === 0 ? (
            <p className="mt-6 text-sm text-black/50">No athlete profiles yet.</p>
          ) : (
            <ul className="mt-5 grid gap-4 sm:grid-cols-3">
              {athletes.map((athlete) => (
                <li key={athlete.id} className="rounded-2xl border border-black/10 p-3">
                  <AthletePhoto name={athlete.name} photo={athlete.profilePhoto} />
                  <p className="mt-3 font-semibold">{athlete.name}</p>
                  <p className="mt-1 text-sm text-black/50">{[athlete.sport, levelLabel(athlete.athleteLevel)].filter(Boolean).join(" · ") || "Athlete"}</p>
                  <Link href={`/dashboard/athletes/${athlete.id}`} className="mt-3 flex items-center justify-center rounded-full border border-black/10 px-3 py-2 text-sm font-semibold hover:bg-zinc-50">
                    View profile
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-3xl border border-black/10 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Recent activity</h2>
            <Link href="/dashboard/notifications" className="text-sm font-semibold text-black/50 hover:text-black">View all</Link>
          </div>
          {notes.length === 0 ? <p className="mt-4 text-sm text-black/50">Nothing yet.</p> : null}
          <ul className="mt-2 divide-y divide-black/5">
            {notes.map((note) => (
              <li key={note.id} className="py-3">
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block text-sm font-semibold">{note.title}</span>
                    <span className="mt-0.5 block text-sm text-black/50">{note.body}</span>
                  </span>
                  <span className="shrink-0 text-xs text-black/40">{ago(note.createdAt)}</span>
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link href={href} className="flex items-center justify-between gap-3 py-3 text-sm font-medium hover:text-black/70">
        {label}
        <span aria-hidden className="text-black/30">→</span>
      </Link>
    </li>
  );
}

function DealSteps({ status }: { status: string }) {
  const current = Math.max(0, STEPS.findIndex((step) => step.status === status));
  return (
    <ol className="mt-6 grid grid-cols-4">
      {STEPS.map((step, index) => {
        const reached = status !== "cancelled" && index <= current;
        const currentStep = status !== "cancelled" && index === current;
        return (
          <li key={step.status} className="relative text-center">
            {index > 0 ? <span className={`absolute top-2 right-1/2 left-0 h-0.5 ${index <= current && status !== "cancelled" ? "bg-zinc-950" : "bg-zinc-200"}`} /> : null}
            <span className={`relative mx-auto grid h-4 w-4 place-items-center rounded-full ${reached ? "bg-zinc-950" : "border border-zinc-300 bg-white"}`}>
              {reached && !currentStep ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
              {currentStep ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
            </span>
            <span className={`mt-2 block text-xs ${reached ? "font-semibold" : "text-black/40"}`}>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function AthletePhoto({ name, photo }: { name: string; photo: string | null }) {
  if (photo) {
    return <img src={photo} alt="" className="aspect-[4/5] w-full rounded-2xl object-cover" />;
  }
  return <span className="grid aspect-[4/5] w-full place-items-center rounded-2xl bg-zinc-200 text-3xl font-semibold">{name.trim().charAt(0).toUpperCase() || "A"}</span>;
}

function athleteName(deal: { athlete: { name: string } | null; invitations: { athleteEmail: string; athlete: { name: string } | null }[] }) {
  return deal.athlete?.name || deal.invitations[0]?.athlete?.name || deal.invitations[0]?.athleteEmail || "Athlete";
}

function athleteLine(deal: { athlete: { name: string; sport: string | null } | null; invitations: { athleteEmail: string; athlete: { name: string; sport: string | null } | null }[] }) {
  const person = deal.athlete || deal.invitations[0]?.athlete;
  if (!person) return deal.invitations[0]?.athleteEmail || "Invited athlete";
  return [person.name, person.sport].filter(Boolean).join(" · ");
}

function ago(date: Date) {
  const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
