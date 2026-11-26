import Link from "next/link";
import { requireUser } from "@/app/actions/auth";
import { CopyLink } from "@/components/copy-link";
import { AthleteAvatar } from "@/components/athlete-avatar";
import { appOrigin } from "@/lib/app-origin";
import { dealTypeName, money, statusLabel } from "@/lib/deals";
import { prisma } from "@/lib/prisma";
import { levelLabel, profileSlug } from "@/lib/profile";
import { ensureProfileToken } from "@/lib/profile-media";

export const dynamic = "force-dynamic";

const STEPS = [
  { status: "pending", label: "Invited" },
  { status: "accepted", label: "In progress" },
  { status: "completed", label: "In review" },
  { status: "approved", label: "Approved" },
] as const;

export default async function AthleteDashboard() {
  const session = await requireUser("athlete");
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  const [deals, notes] = await Promise.all([
    prisma.deal.findMany({
      where: {
        status: { not: "draft" },
        OR: [{ athleteId: session.id }, { invitations: { some: { athleteEmail: session.email } } }],
      },
      orderBy: { updatedAt: "desc" },
      include: { business: true },
    }),
    prisma.notification.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);
  const pending = deals.filter((deal) => deal.status === "pending");
  const active = deals.filter((deal) => deal.status === "accepted" || deal.status === "completed");
  const approved = deals.filter((deal) => deal.status === "approved");
  const earnings = approved.reduce((sum, deal) => sum + deal.athleteNetPayout, 0);
  const inProgressValue = active.reduce((sum, deal) => sum + deal.athleteNetPayout, 0);
  const featured = [...pending, ...deals.filter((deal) => deal.status === "accepted"), ...deals.filter((deal) => deal.status === "completed"), ...approved][0];
  const token = user ? await ensureProfileToken(user.id, user.profileToken) : null;
  const slug = user && token ? profileSlug({ username: user.username, profileToken: token }) : null;
  const origin = await appOrigin();
  const profileUrl = slug ? `${origin}/a/${slug}` : null;
  const first = session.name.split(" ")[0];
  const sportLine = [user?.sport, user?.school, levelLabel(user?.athleteLevel)].filter(Boolean).join(" · ");

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.18em] text-black/40">ATHLETE DASHBOARD</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Welcome back, {first}</h1>
      <p className="mt-2 text-black/60">{sportLine || "Finish your profile so businesses can find you."}</p>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <article className="rounded-3xl bg-zinc-950 p-5 text-white">
          <p className="text-sm text-white/60">Total earnings</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{money(earnings)}</p>
          <p className="mt-3 text-sm text-white/50">Approved deals. Payouts are sent after your payout account is ready.</p>
        </article>
        <article className="rounded-3xl border border-black/10 bg-white p-5">
          <p className="text-sm text-black/50">Active deals</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{active.length}</p>
          <p className="mt-3 text-sm text-black/50">{active.length === 1 ? "1 in progress" : `${active.length} in progress`}</p>
        </article>
        <article className="rounded-3xl border border-black/10 bg-white p-5">
          <p className="text-sm text-black/50">{pending.length ? "Waiting on you" : "In progress value"}</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{pending.length ? pending.length : money(inProgressValue)}</p>
          <p className="mt-3 text-sm text-black/50">{pending.length ? "Invitations to accept" : "Held until the business approves the work"}</p>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <article className="rounded-3xl border border-black/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Active deal</h2>
            <Link href="/athlete/deals" className="text-sm font-semibold text-black/60 hover:text-black">View all deals</Link>
          </div>
          {featured ? (
            <div className="mt-5">
              <Link href={`/athlete/deals/${featured.id}`} className="flex items-center justify-between gap-4 rounded-2xl border border-black/10 p-4 hover:bg-zinc-50">
                <span className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-zinc-950 text-xs font-bold text-white">{initials(featured.business.businessName || featured.business.name)}</span>
                  <span>
                    <span className="block font-semibold">{dealTypeName(featured.dealType)}</span>
                    <span className="mt-0.5 block text-sm text-black/50">{featured.business.businessName || featured.business.name}</span>
                  </span>
                </span>
                <span className="text-right">
                  <span className="block font-semibold">{money(featured.athleteNetPayout)}</span>
                  <span className="text-sm text-black/50">{statusLabel(featured.status)}</span>
                </span>
              </Link>
              <DealSteps status={featured.status} />
              {featured.status === "pending" ? (
                <Link href={`/athlete/deals/${featured.id}`} className="mt-5 inline-flex rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white">Review invitation</Link>
              ) : null}
              {featured.status === "accepted" ? (
                <Link href={`/athlete/deals/${featured.id}`} className="mt-5 inline-flex rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white">Submit work</Link>
              ) : null}
            </div>
          ) : (
            <p className="mt-8 text-sm text-black/50">No deals yet. When a business invites {session.email}, it shows up here.</p>
          )}
        </article>

        <article className="rounded-3xl bg-zinc-950 p-5 text-white">
          <h2 className="font-semibold">Your public profile</h2>
          <p className="mt-1 text-sm text-white/60">Share this page with brands.</p>
          <div className="mt-5 flex items-center gap-3">
            <AthleteAvatar name={session.name} photo={user?.profilePhoto ?? null} size={56} />
            <div>
              <p className="font-semibold">{session.name}</p>
              <p className="text-sm text-white/60">{sportLine || "Athlete"}</p>
            </div>
          </div>
          {profileUrl && slug ? (
            <div className="mt-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <p className="min-w-0 flex-1 truncate text-sm text-white/80">{profileUrl.replace(/^https?:\/\//, "")}</p>
              <CopyLink value={profileUrl} variant="icon" />
            </div>
          ) : null}
          {slug ? (
            <Link href={`/a/${slug}`} className="mt-4 flex items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black">
              View public profile
            </Link>
          ) : null}
        </article>
      </section>

      <section className="mt-4 rounded-3xl border border-black/10 bg-white p-5">
        <h2 className="font-semibold">Recent activity</h2>
        {notes.length === 0 && deals.length === 0 ? <p className="mt-4 text-sm text-black/50">Nothing yet.</p> : null}
        <ul className="mt-3 divide-y divide-black/5">
          {notes.length > 0
            ? notes.map((note) => (
                <li key={note.id} className="flex items-center justify-between gap-4 py-3">
                  <span>
                    <span className="block text-sm font-semibold">{note.title}</span>
                    <span className="block text-sm text-black/50">{note.body}</span>
                  </span>
                  <span className="shrink-0 text-xs text-black/40">{ago(note.createdAt)}</span>
                </li>
              ))
            : deals.slice(0, 4).map((deal) => (
                <li key={deal.id}>
                  <Link href={`/athlete/deals/${deal.id}`} className="flex items-center justify-between gap-4 py-3">
                    <span>
                      <span className="block text-sm font-semibold">{statusLabel(deal.status)}</span>
                      <span className="block text-sm text-black/50">{deal.business.businessName || deal.business.name} · {dealTypeName(deal.dealType)}</span>
                    </span>
                    <span className="shrink-0 text-xs text-black/40">{ago(deal.updatedAt)}</span>
                  </Link>
                </li>
              ))}
        </ul>
      </section>
    </div>
  );
}

function DealSteps({ status }: { status: string }) {
  const current = Math.max(0, STEPS.findIndex((step) => step.status === status));
  return (
    <ol className="mt-6 grid grid-cols-4 gap-2">
      {STEPS.map((step, index) => {
        const reached = index <= current && status !== "cancelled";
        return (
          <li key={step.status} className="text-center">
            <span className={`mx-auto block h-1.5 rounded-full ${reached ? "bg-zinc-950" : "bg-zinc-200"}`} />
            <span className={`mt-2 block text-xs ${reached ? "font-semibold" : "text-black/40"}`}>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "AG";
}

function ago(date: Date) {
  const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
