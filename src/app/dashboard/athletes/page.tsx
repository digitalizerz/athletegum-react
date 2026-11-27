import Link from "next/link";
import { requestIntro } from "@/app/actions/directory";
import { toggleSavedAthlete } from "@/app/actions/athletes";
import { requireUser } from "@/app/actions/auth";
import { canInviteToDeal, DIRECTORY_LEVELS, DIRECTORY_SQUADS, directoryLevelLabel, levelFromAccount, placeLabel, squadLabel, type DirectoryLevel } from "@/lib/directory";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const VIEWS = [
  { id: "all", label: "All athletes" },
  { id: "shortlist", label: "Shortlist" },
  { id: "invited", label: "Invited" },
  { id: "partnered", label: "Partnered" },
] as const;

type Filters = {
  q: string;
  level: string;
  sport: string;
  squad: string;
  team: string;
  city: string;
  position: string;
  status: string;
  view: string;
};

type Row = {
  key: string;
  href: string;
  name: string;
  level: DirectoryLevel;
  sport: string | null;
  squad: string | null;
  position: string | null;
  team: string | null;
  city: string | null;
  state: string | null;
  photo: string | null;
  status: "listed" | "claimed";
  canInvite: boolean;
  email: string | null;
  listingId: string | null;
  athleteId: string | null;
  saved: boolean;
  invited: boolean;
  partnered: boolean;
  interested: boolean;
};

export default async function AthletesPage({
  searchParams,
}: {
  searchParams: Promise<Filters & { interested?: string; error?: string }>;
}) {
  const session = await requireUser("business");
  const query = await searchParams;
  const filters: Filters = {
    q: query.q?.trim() ?? "",
    level: query.level?.trim() ?? "",
    sport: query.sport?.trim() ?? "",
    squad: query.squad === "men" || query.squad === "women" ? query.squad : "",
    team: query.team?.trim() ?? "",
    city: query.city?.trim() ?? "",
    position: query.position?.trim() ?? "",
    status: query.status === "listed" || query.status === "claimed" ? query.status : "",
    view: VIEWS.some((item) => item.id === query.view) ? query.view! : "all",
  };

  const [accounts, listings, saves, invitations, partnerships, intros] = await Promise.all([
    prisma.user.findMany({
      where: { role: "athlete", isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, sport: true, school: true, city: true, athleteLevel: true, profilePhoto: true },
    }),
    prisma.directoryListing.findMany({
      where: { claimedUserId: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, level: true, sport: true, squad: true, position: true, teamOrSchool: true, city: true, state: true },
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
    prisma.introRequest.findMany({ where: { businessId: session.id }, select: { listingId: true, athleteId: true } }),
  ]);

  const savedIds = new Set(saves.map((item) => item.athleteId));
  const invitedIds = new Set(invitations.filter((item) => item.status === "pending" && item.athleteId).map((item) => item.athleteId as string));
  const invitedEmails = new Set(invitations.filter((item) => item.status === "pending").map((item) => item.athleteEmail.toLowerCase()));
  const partnerIds = new Set(partnerships.map((item) => item.athleteId).filter((id): id is string => Boolean(id)));
  const activePartners = partnerships.filter((item) => item.status === "accepted" || item.status === "completed");
  const interestedListings = new Set(intros.map((item) => item.listingId).filter((id): id is string => Boolean(id)));
  const interestedAthletes = new Set(intros.map((item) => item.athleteId).filter((id): id is string => Boolean(id)));

  const rows: Row[] = [
    ...accounts.flatMap((athlete) => {
      const level = levelFromAccount(athlete.athleteLevel);
      if (!level) return [];
      const email = athlete.email.toLowerCase();
      return [{
        key: `account-${athlete.id}`,
        href: `/dashboard/athletes/${athlete.id}`,
        name: athlete.name,
        level,
        sport: athlete.sport,
        squad: null,
        position: null,
        team: athlete.school,
        city: athlete.city,
        state: null,
        photo: athlete.profilePhoto,
        status: "claimed" as const,
        canInvite: canInviteToDeal(level),
        email: athlete.email,
        listingId: null,
        athleteId: athlete.id,
        saved: savedIds.has(athlete.id),
        invited: invitedIds.has(athlete.id) || invitedEmails.has(email),
        partnered: partnerIds.has(athlete.id),
        interested: interestedAthletes.has(athlete.id),
      }];
    }),
    ...listings.flatMap((listing) => {
      if (!isLevel(listing.level)) return [];
      return [{
        key: `listing-${listing.id}`,
        href: `/dashboard/athletes/${listing.id}`,
        name: listing.name,
        level: listing.level,
        sport: listing.sport,
        squad: listing.squad,
        position: listing.position,
        team: listing.teamOrSchool,
        city: listing.city,
        state: listing.state,
        photo: null,
        status: "listed" as const,
        canInvite: false,
        email: null,
        listingId: listing.id,
        athleteId: null,
        saved: false,
        invited: false,
        partnered: false,
        interested: interestedListings.has(listing.id),
      }];
    }),
  ].sort((a, b) => a.name.localeCompare(b.name));

  const viewed = rows.filter((row) => {
    if (filters.view === "shortlist") return row.saved;
    if (filters.view === "invited") return row.invited;
    if (filters.view === "partnered") return row.partnered;
    return true;
  });
  const visible = viewed.filter((row) => matches(row, filters));
  const returnTo = queryString(filters);
  const sports = unique(rows.map((row) => row.sport));
  const teams = unique(rows.map((row) => row.team));
  const cities = unique(rows.map((row) => row.city));
  const positions = unique(rows.map((row) => row.position));

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.18em] text-black/40">ATHLETES</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Find athletes</h1>
      <p className="mt-2 max-w-2xl text-black/60">Search college, pro, retired, and high school athletes. Listed profiles have no login yet. High school athletes cannot be added to a paid deal.</p>
      {query.interested ? <p className="mt-4 text-sm text-black/70">Interest saved. AthleteGum will follow up. Nothing was charged.</p> : null}
      {query.error ? <p className="mt-4 text-sm text-red-600">{query.error}</p> : null}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="In the directory" value={String(rows.length)} detail="Accounts and listings" />
        <Stat label="Listed, no login" value={String(rows.filter((row) => row.status === "listed").length)} detail="You contact them" />
        <Stat label="Shortlisted" value={String(savedIds.size)} detail="Saved accounts" />
        <Stat label="Active partnerships" value={String(activePartners.length)} detail="Deals in progress" />
      </section>

      <form action="/dashboard/athletes" className="mt-6 grid gap-2 md:grid-cols-3 xl:grid-cols-6">
        <input type="hidden" name="view" value={filters.view} />
        <input name="q" defaultValue={filters.q} placeholder="Name" className={field} />
        <Select name="level" value={filters.level} placeholder="Level" options={DIRECTORY_LEVELS.map((level) => ({ value: level.id, label: level.label }))} />
        <Select name="sport" value={filters.sport} placeholder="Sport" options={sports.map((sport) => ({ value: sport, label: sport }))} />
        <Select name="squad" value={filters.squad} placeholder="Men or women" options={DIRECTORY_SQUADS.map((squad) => ({ value: squad.id, label: squad.label }))} />
        <Select name="team" value={filters.team} placeholder="Team or school" options={teams.map((team) => ({ value: team, label: team }))} />
        <Select name="city" value={filters.city} placeholder="City" options={cities.map((city) => ({ value: city, label: city }))} />
        <Select name="position" value={filters.position} placeholder="Position" options={positions.map((position) => ({ value: position, label: position }))} />
        <Select name="status" value={filters.status} placeholder="Account status" options={[{ value: "claimed", label: "Has a login" }, { value: "listed", label: "Listed by AthleteGum" }]} />
        <button className="h-11 rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white md:col-span-2 xl:col-span-1">Search</button>
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        {VIEWS.map((item) => {
          const count = rows.filter((row) => item.id === "all" || (item.id === "shortlist" ? row.saved : item.id === "invited" ? row.invited : row.partnered)).length;
          return (
            <Link key={item.id} href={queryString({ ...filters, view: item.id })} className={`rounded-full px-4 py-2 text-sm font-semibold ${filters.view === item.id ? "bg-zinc-950 text-white" : "bg-white text-black/60"}`}>
              {item.label} ({count})
            </Link>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="mt-6 rounded-3xl border border-black/10 bg-white px-5 py-10 text-sm text-black/50">No athletes match that search.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((row) => (
            <li key={row.key} className="rounded-3xl border border-black/10 bg-white p-4">
              <div className="relative">
                <AthletePhoto name={row.name} photo={row.photo} />
                {row.athleteId ? (
                  <form action={toggleSavedAthlete} className="absolute top-3 right-3">
                    <input type="hidden" name="athleteId" value={row.athleteId} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <button aria-label={row.saved ? "Remove from shortlist" : "Save athlete"} className={`grid h-9 w-9 place-items-center rounded-full ${row.saved ? "bg-zinc-950 text-white" : "bg-white/90 text-black"}`}>
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill={row.saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
                        <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3-6 3V5a1 1 0 0 1 1-1z" />
                      </svg>
                    </button>
                  </form>
                ) : null}
              </div>
              <h2 className="mt-4 text-xl font-semibold">{row.name}</h2>
              <p className="mt-1 text-sm text-black/55">{[squadLabel(row.squad), row.sport, row.position, directoryLevelLabel(row.level)].filter(Boolean).join(" · ")}</p>
              <p className="mt-1 text-sm text-black/45">{[row.team, placeLabel(row.city, row.state)].filter(Boolean).join(" · ") || "Location not listed"}</p>
              <p className="mt-3 text-xs font-medium text-black/50">{row.status === "listed" ? "Listed by AthleteGum. No login yet." : row.canInvite ? "Has a login and can be invited." : "High school. Introduction only."}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {row.canInvite && row.email ? (
                  <Link href={`/dashboard/deals/new?athlete=${encodeURIComponent(row.email)}`} className="rounded-full bg-zinc-950 px-3 py-2 text-sm font-semibold text-white">Invite to deal</Link>
                ) : (
                  <InterestForm row={row} returnTo={returnTo} />
                )}
                <Link href={row.href} className="rounded-full border border-black/10 px-3 py-2 text-sm font-semibold">View profile</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-sm text-black/40">Showing {visible.length} of {viewed.length}.</p>
    </div>
  );
}

function InterestForm({ row, returnTo }: { row: Row; returnTo: string }) {
  if (row.interested) return <span className="rounded-full bg-zinc-100 px-3 py-2 text-sm font-semibold">Interest saved</span>;
  return (
    <form action={requestIntro}>
      {row.listingId ? <input type="hidden" name="listingId" value={row.listingId} /> : null}
      {row.athleteId ? <input type="hidden" name="athleteId" value={row.athleteId} /> : null}
      <input type="hidden" name="returnTo" value={returnTo} />
      <button className="rounded-full bg-zinc-950 px-3 py-2 text-sm font-semibold text-white">I&apos;m interested</button>
    </form>
  );
}

function Select({ name, value, placeholder, options }: { name: string; value: string; placeholder: string; options: { value: string; label: string }[] }) {
  return (
    <select name={name} defaultValue={value} className={field}>
      <option value="">{placeholder}</option>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
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

function matches(row: Row, filters: Filters) {
  if (filters.level && row.level !== filters.level) return false;
  if (filters.sport && row.sport !== filters.sport) return false;
  if (filters.squad && row.squad !== filters.squad) return false;
  if (filters.team && row.team !== filters.team) return false;
  if (filters.city && row.city !== filters.city) return false;
  if (filters.position && row.position !== filters.position) return false;
  if (filters.status && row.status !== filters.status) return false;
  if (filters.q) {
    const haystack = [row.name, row.team, row.city, row.sport, row.position].filter(Boolean).join(" ").toLowerCase();
    if (!haystack.includes(filters.q.toLowerCase())) return false;
  }
  return true;
}

function unique(values: Array<string | null>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b));
}

function isLevel(value: string): value is DirectoryLevel {
  return DIRECTORY_LEVELS.some((level) => level.id === value);
}

function queryString(input: Filters) {
  const params = new URLSearchParams();
  if (input.q) params.set("q", input.q);
  if (input.level) params.set("level", input.level);
  if (input.sport) params.set("sport", input.sport);
  if (input.squad) params.set("squad", input.squad);
  if (input.team) params.set("team", input.team);
  if (input.city) params.set("city", input.city);
  if (input.position) params.set("position", input.position);
  if (input.status) params.set("status", input.status);
  if (input.view !== "all") params.set("view", input.view);
  const query = params.toString();
  return query ? `/dashboard/athletes?${query}` : "/dashboard/athletes";
}

const field = "h-11 w-full rounded-full border border-black/10 bg-white px-4 text-sm outline-none";
