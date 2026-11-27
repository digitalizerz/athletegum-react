import Link from "next/link";
import { notFound } from "next/navigation";
import { impersonateUser, setUserActive, updateAthlete } from "@/app/actions/admin";
import { requireUser } from "@/app/actions/auth";
import { DeleteAthleteButton } from "@/components/admin-controls";
import { AthleteAvatar } from "@/components/athlete-avatar";
import { AdminNotice, fieldClass } from "@/components/admin-ui";
import { accountCompletion } from "@/components/admin-profiles";
import { dealTypeName, money, statusLabel } from "@/lib/deals";
import { ATHLETE_LEVELS, levelLabel } from "@/lib/profile";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAthletePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string; edit?: string; tab?: string }> }) {
  await requireUser("admin");
  const { id } = await params;
  const query = await searchParams;
  const athlete = await prisma.user.findUnique({
    where: { id },
    include: { dealsReceived: { orderBy: { createdAt: "desc" }, include: { business: true } } },
  });
  if (!athlete || athlete.role !== "athlete") notFound();
  const tab = query.tab === "deals" || query.tab === "activity" ? query.tab : "profile";
  const editing = query.edit === "1" && tab === "profile";
  const completion = accountCompletion(athlete);
  const paid = athlete.dealsReceived.filter((deal) => deal.paymentStatus === "released");
  const earnings = paid.reduce((sum, deal) => sum + deal.athleteNetPayout, 0);
  const activeDeals = athlete.dealsReceived.filter((deal) => !["cancelled", "declined", "approved"].includes(deal.status)).length;
  const input = fieldClass();
  const schoolLine = [athlete.school, athlete.sport].filter(Boolean).join(" · ");

  return (
    <div>
      <p className="text-sm text-zinc-500">
        <Link href="/admin/athletes" className="hover:text-black">Athletes</Link>
        <span className="px-1.5">/</span>
        <span className="text-zinc-800">{athlete.name}</span>
      </p>

      <section className="mt-4 rounded-3xl border border-black/10 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <AthleteAvatar name={athlete.name} photo={athlete.profilePhoto} size={72} />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{athlete.name}</h1>
              <p className="mt-1 text-sm text-zinc-500">{schoolLine || athlete.email}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium">
                <span className="rounded-full bg-zinc-100 px-2.5 py-1">{levelLabel(athlete.athleteLevel)}</span>
                <span className={`rounded-full px-2.5 py-1 ${athlete.isActive ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>{athlete.isActive ? "Active" : "Inactive"}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {athlete.isActive ? (
              <form action={impersonateUser.bind(null, athlete.id)}>
                <button className="h-10 rounded-xl border border-black/10 px-3 text-sm font-semibold">View portal</button>
              </form>
            ) : null}
            <form action={setUserActive.bind(null, athlete.id, !athlete.isActive)}>
              <button className="h-10 rounded-xl border border-black/10 px-3 text-sm font-semibold">{athlete.isActive ? "Suspend" : "Reactivate"}</button>
            </form>
            <DeleteAthleteButton userId={athlete.id} name={athlete.name} />
            <Link href={editing ? `/admin/athletes/${athlete.id}` : `/admin/athletes/${athlete.id}?edit=1`} className="inline-flex h-10 items-center rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white">
              {editing ? "Close editor" : "Edit Athlete"}
            </Link>
          </div>
        </div>
        <AdminNotice saved={query.saved === "1" ? "Saved." : query.saved} error={query.error} />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MiniStat label="Profile completion" value={`${completion}%`} hint="Filled fields on the account" />
          <MiniStat label="Storefront" value="Off" hint="Not turned on" />
          <MiniStat label="Deals" value={String(athlete.dealsReceived.length)} hint={`${activeDeals} open · ${paid.length} paid out`} />
          <MiniStat label="Earnings" value={money(earnings)} hint="Paid out to the athlete" />
        </div>
      </section>

      <div className="mt-4 flex gap-1 border-b border-black/10">
        {[
          ["profile", "Profile"],
          ["deals", "Deals"],
          ["activity", "Activity"],
        ].map(([id, label]) => (
          <Link key={id} href={`/admin/athletes/${athlete.id}?tab=${id}`} className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold ${tab === id ? "border-zinc-950 text-zinc-950" : "border-transparent text-zinc-500"}`}>
            {label}
          </Link>
        ))}
      </div>

      {tab === "profile" ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            {editing ? (
              <form action={updateAthlete.bind(null, athlete.id)} className="rounded-2xl border border-black/10 bg-white p-5">
                <h2 className="font-semibold">Edit profile</h2>
                <label className="mt-4 block text-sm font-medium">Full name<input name="name" defaultValue={athlete.name} className={input} /></label>
                <label className="mt-4 block text-sm font-medium">Email<input name="email" type="email" defaultValue={athlete.email} className={input} /></label>
                <label className="mt-4 block text-sm font-medium">Level
                  <select name="athleteLevel" defaultValue={athlete.athleteLevel ?? ""} className={input}>
                    <option value="">Not set</option>
                    {ATHLETE_LEVELS.map((level) => <option key={level.id} value={level.id}>{level.label}</option>)}
                  </select>
                </label>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium">Sport<input name="sport" defaultValue={athlete.sport ?? ""} className={input} /></label>
                  <label className="block text-sm font-medium">School<input name="school" defaultValue={athlete.school ?? ""} className={input} /></label>
                </div>
                <label className="mt-4 block text-sm font-medium">City<input name="city" defaultValue={athlete.city ?? ""} className={input} /></label>
                <label className="mt-4 block text-sm font-medium">Bio<textarea name="bio" defaultValue={athlete.bio ?? ""} rows={3} className={input} /></label>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium">Instagram<input name="instagramHandle" defaultValue={athlete.instagramHandle ?? ""} className={input} /></label>
                  <label className="block text-sm font-medium">TikTok<input name="tiktokHandle" defaultValue={athlete.tiktokHandle ?? ""} className={input} /></label>
                  <label className="block text-sm font-medium">YouTube<input name="youtubeHandle" defaultValue={athlete.youtubeHandle ?? ""} className={input} /></label>
                  <label className="block text-sm font-medium">X<input name="twitterHandle" defaultValue={athlete.twitterHandle ?? ""} className={input} /></label>
                </div>
                <button className="mt-5 rounded-xl bg-zinc-950 px-4 py-2 text-sm font-semibold text-white">Save changes</button>
              </form>
            ) : (
              <>
                <InfoCard title="Basic information">
                  <InfoRow label="Full name" value={athlete.name} />
                  <InfoRow label="Email" value={athlete.email} />
                  <InfoRow label="Location" value={athlete.city || "—"} />
                </InfoCard>
                <InfoCard title="Athletic information">
                  <InfoRow label="Level" value={levelLabel(athlete.athleteLevel)} />
                  <InfoRow label="School" value={athlete.school || "—"} />
                  <InfoRow label="Sport" value={athlete.sport || "—"} />
                </InfoCard>
                <InfoCard title="Profile & visibility">
                  <InfoRow label="Profile status" value={athlete.isActive ? "Public in the directory" : "Hidden. Sign-in is blocked."} />
                  <InfoRow label="Storefront" value="Off" />
                  <InfoRow label="Payout account" value={athlete.stripeAccountId ? "Connected" : "Not connected"} />
                </InfoCard>
              </>
            )}
          </div>
          <div className="space-y-4">
            <section className="rounded-2xl border border-black/10 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Activity</h2>
                <Link href={`/admin/athletes/${athlete.id}?tab=activity`} className="text-xs font-semibold text-zinc-500">View all</Link>
              </div>
              <ActivityList athlete={athlete} limit={4} />
            </section>
          </div>
        </div>
      ) : null}

      {tab === "deals" ? (
        <section className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-white">
          {athlete.dealsReceived.length === 0 ? <p className="px-5 py-10 text-sm text-zinc-500">No deals yet.</p> : null}
          {athlete.dealsReceived.map((deal) => (
            <Link key={deal.id} href={`/admin/deals/${deal.id}`} className="flex items-center justify-between gap-3 border-t border-black/5 px-5 py-4 first:border-t-0">
              <span>
                <span className="block font-semibold">{dealTypeName(deal.dealType)}</span>
                <span className="block text-xs text-zinc-500">{deal.business.businessName || deal.business.name}</span>
              </span>
              <span className="text-right text-sm">
                <span className="block font-semibold">{money(deal.compensationAmount)}</span>
                <span className="block text-xs text-zinc-500">{statusLabel(deal.status)}</span>
              </span>
            </Link>
          ))}
        </section>
      ) : null}

      {tab === "activity" ? (
        <section className="mt-4 rounded-2xl border border-black/10 bg-white p-5">
          <ActivityList athlete={athlete} />
        </section>
      ) : null}
    </div>
  );
}

function MiniStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-zinc-50 px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-zinc-400">{hint}</p>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5">
      <h2 className="font-semibold">{title}</h2>
      <dl className="mt-3 divide-y divide-black/5 text-sm">{children}</dl>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function ActivityList({ athlete, limit }: { athlete: { createdAt: Date; dealsReceived: { id: string; createdAt: Date; paidAt: Date | null; status: string; dealType: string; business: { name: string; businessName: string | null } }[] }; limit?: number }) {
  const events = [
    { at: athlete.createdAt, title: "Account created", detail: "Admin or signup" },
    ...athlete.dealsReceived.flatMap((deal) => {
      const who = deal.business.businessName || deal.business.name;
      const rows = [{ at: deal.createdAt, title: "Deal opened", detail: `${dealTypeName(deal.dealType)} · ${who}` }];
      if (deal.paidAt) rows.push({ at: deal.paidAt, title: "Business paid", detail: who });
      if (deal.status === "approved") rows.push({ at: deal.paidAt ?? deal.createdAt, title: "Deal approved", detail: who });
      return rows;
    }),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());
  const shown = limit ? events.slice(0, limit) : events;
  if (shown.length === 0) return <p className="mt-3 text-sm text-zinc-500">No activity yet.</p>;
  return (
    <ul className="mt-3 space-y-3 text-sm">
      {shown.map((event) => (
        <li key={`${event.title}-${event.at.toISOString()}`} className="flex items-start justify-between gap-3">
          <span>
            <span className="block font-medium">{event.title}</span>
            <span className="block text-xs text-zinc-500">{event.detail}</span>
          </span>
          <span className="shrink-0 text-xs text-zinc-400">{event.at.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        </li>
      ))}
    </ul>
  );
}
