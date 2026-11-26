import Link from "next/link";
import { toggleSavedAthlete } from "@/app/actions/athletes";
import { requireUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const VIEWS = [
  { id: "all", label: "All athletes" },
  { id: "shortlist", label: "Shortlist" },
  { id: "invited", label: "Invited" },
  { id: "partnered", label: "Partnered" },
] as const;

export default async function AthletesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sport?: string; school?: string; view?: string }>;
}) {
  const session = await requireUser("business");
  const query = await searchParams;
  const q = query.q?.trim() ?? "";
  const sport = query.sport?.trim() ?? "";
  const school = query.school?.trim() ?? "";
  const view = VIEWS.some((item) => item.id === query.view) ? query.view! : "all";

  const [athletes, saves, invitations, partnerships] = await Promise.all([
    prisma.user.findMany({
      where: { role: "athlete", isActive: true, athleteLevel: "college" },
      orderBy: { name: "asc" },
    }),
    prisma.savedAthlete.findMany({ where: { businessId: session.id }, select: { athleteId: true } }),
    prisma.dealInvitation.findMany({
      where: { deal: { businessId: session.id } },
      select: { athleteEmail: true, athleteId: true, status: true },
    }),
    prisma.deal.findMany({
      where: { businessId: session.id, athleteId: { not: null }, status: { in: ["accepted", "completed", "approved"] } },
      select: { athleteId: true, status: true },
    }),
  ]);

  const savedIds = new Set(saves.map((item) => item.athleteId));
  const invitedIds = new Set(
    invitations.filter((item) => item.status === "pending").flatMap((item) => (item.athleteId ? [item.athleteId] : [])),
  );
  const invitedEmails = new Set(
    invitations.filter((item) => item.status === "pending").map((item) => item.athleteEmail.toLowerCase()),
  );
  const partnerIds = new Set(partnerships.map((item) => item.athleteId).filter((id): id is string => Boolean(id)));
  const activePartners = new Set(
    partnerships.filter((item) => item.status === "accepted" || item.status === "completed").map((item) => item.athleteId),
  );
  const sports = [...new Set(athletes.map((athlete) => athlete.sport).filter((item): item is string => Boolean(item)))].sort();
  const schools = [...new Set(athletes.map((athlete) => athlete.school).filter((item): item is string => Boolean(item)))].sort();

  const visible = athletes.filter((athlete) => {
    if (sport && athlete.sport !== sport) return false;
    if (school && athlete.school !== school) return false;
    if (q) {
      const haystack = [athlete.name, athlete.school, athlete.username, athlete.sport, athlete.city].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q.toLowerCase())) return false;
    }
    if (view === "shortlist") return savedIds.has(athlete.id);
    if (view === "invited") return invitedIds.has(athlete.id) || invitedEmails.has(athlete.email.toLowerCase());
    if (view === "partnered") return partnerIds.has(athlete.id);
    return true;
  });

  const returnTo = queryString({ q, sport, school, view });

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.18em] text-black/40">ATHLETES</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Find athletes</h1>
      <p className="mt-2 max-w-2xl text-black/60">College athletes you can invite to a funded deal. The card is charged when you send the deal, and that charge stays held until you approve the work.</p>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="College athletes" value={String(athletes.length)} detail="With a public profile" />
        <Stat label="Shortlisted" value={String(savedIds.size)} detail="Saved for later" />
        <Stat label="Invitations sent" value={String(invitations.length)} detail="Tied to a deal" />
        <Stat label="Active partnerships" value={String(activePartners.size)} detail="Deals in progress" />
      </section>

      <form action="/dashboard/athletes" className="mt-6 flex flex-wrap items-center gap-2">
        <input type="hidden" name="view" value={view} />
        <input name="q" defaultValue={q} placeholder="Search by name, school, or username" className="h-11 min-w-56 flex-1 rounded-full border border-black/10 bg-white px-4 text-sm outline-none" />
        <select name="sport" defaultValue={sport} className="h-11 rounded-full border border-black/10 bg-white px-4 text-sm">
          <option value="">All sports</option>
          {sports.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select name="school" defaultValue={school} className="h-11 rounded-full border border-black/10 bg-white px-4 text-sm">
          <option value="">All schools</option>
          {schools.map((item) => <option key={item}>{item}</option>)}
        </select>
        <button className="h-11 rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white">Search</button>
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        {VIEWS.map((item) => {
          const count = item.id === "all" ? athletes.length : item.id === "shortlist" ? savedIds.size : item.id === "invited" ? athletes.filter((athlete) => invitedIds.has(athlete.id) || invitedEmails.has(athlete.email.toLowerCase())).length : partnerIds.size;
          return (
            <Link key={item.id} href={queryString({ q, sport, school, view: item.id })} className={`rounded-full px-4 py-2 text-sm font-semibold ${view === item.id ? "bg-zinc-950 text-white" : "bg-white text-black/60"}`}>
              {item.label} ({count})
            </Link>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="mt-6 rounded-3xl border border-black/10 bg-white px-5 py-10 text-sm text-black/50">
          {view === "shortlist" ? "No saved athletes yet. Save someone from the directory. Saving does not send an invitation." : view === "invited" ? "No open invitations. An invitation is created when you fund a deal." : view === "partnered" ? "No partnerships yet." : "No college athletes match that search."}
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((athlete) => {
            const networks = [athlete.instagramHandle && "Instagram", athlete.tiktokHandle && "TikTok", athlete.twitterHandle && "X", athlete.youtubeHandle && "YouTube"].filter((item): item is string => Boolean(item));
            const saved = savedIds.has(athlete.id);
            return (
              <li key={athlete.id} className="rounded-3xl border border-black/10 bg-white p-4">
                <div className="relative">
                  <AthletePhoto name={athlete.name} photo={athlete.profilePhoto} />
                  <form action={toggleSavedAthlete} className="absolute top-3 right-3">
                    <input type="hidden" name="athleteId" value={athlete.id} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <button aria-label={saved ? "Remove from shortlist" : "Save athlete"} className={`grid h-9 w-9 place-items-center rounded-full ${saved ? "bg-zinc-950 text-white" : "bg-white/90 text-black"}`}>
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
                        <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3-6 3V5a1 1 0 0 1 1-1z" />
                      </svg>
                    </button>
                  </form>
                </div>
                <h2 className="mt-4 text-xl font-semibold">{athlete.name}</h2>
                <p className="mt-1 text-sm text-black/55">{[athlete.sport, "College"].filter(Boolean).join(" · ")}</p>
                <p className="mt-1 text-sm text-black/45">{[athlete.school, athlete.city].filter(Boolean).join(" · ") || "School not listed"}</p>
                {networks.length > 0 ? <p className="mt-3 text-xs font-medium text-black/50">{networks.join(" · ")} connected. Follower counts are not on the profile.</p> : <p className="mt-3 text-xs text-black/40">No social accounts connected.</p>}
                <div className="mt-4 flex gap-2">
                  <Link href={`/dashboard/deals/new?athlete=${encodeURIComponent(athlete.email)}`} className="rounded-full bg-zinc-950 px-3 py-2 text-sm font-semibold text-white">Invite to deal</Link>
                  <Link href={`/dashboard/athletes/${athlete.id}`} className="rounded-full border border-black/10 px-3 py-2 text-sm font-semibold">View profile</Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-4 text-sm text-black/40">Showing {visible.length} of {athletes.length} college athletes. Division labels such as NCAA, NAIA, and JUCO appear when an athlete adds them.</p>
    </div>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="rounded-3xl border border-black/10 bg-white p-5">
      <p className="text-sm text-black/50">{label}</p>
      <p className="mt-3 text-4xl font-bold tracking-tight">{value}</p>
      <p className="mt-3 text-sm text-black/45">{detail}</p>
    </article>
  );
}

function AthletePhoto({ name, photo }: { name: string; photo: string | null }) {
  if (photo) return <img src={photo} alt="" className="h-56 w-full rounded-2xl object-cover grayscale" />;
  return <span className="grid h-56 w-full place-items-center rounded-2xl bg-zinc-200 text-4xl font-semibold">{name.trim().charAt(0).toUpperCase() || "A"}</span>;
}

function queryString(input: { q?: string; sport?: string; school?: string; view?: string }) {
  const params = new URLSearchParams();
  if (input.q) params.set("q", input.q);
  if (input.sport) params.set("sport", input.sport);
  if (input.school) params.set("school", input.school);
  if (input.view && input.view !== "all") params.set("view", input.view);
  const query = params.toString();
  return query ? `/dashboard/athletes?${query}` : "/dashboard/athletes";
}
