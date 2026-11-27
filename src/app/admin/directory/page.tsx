import Link from "next/link";
import { createListing } from "@/app/actions/directory";
import { requireUser } from "@/app/actions/auth";
import { FilterSelect, ListingMenu } from "@/components/admin-controls";
import { AthleteAvatar } from "@/components/athlete-avatar";
import { AdminNotice, adminHref, fieldClass } from "@/components/admin-ui";
import { CompletionBar, ProfilePager, ProfileStat, SortHeader, StorefrontPill, activityLabel, listingCompletion } from "@/components/admin-profiles";
import { DIRECTORY_LEVELS, DIRECTORY_SPORTS, DIRECTORY_SQUADS, directoryLevelLabel, squadLabel } from "@/lib/directory";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;
const SORTS = ["name", "sport", "status", "completion", "interest"] as const;
type ListingSort = (typeof SORTS)[number];

export default async function AdminDirectoryPage({ searchParams }: { searchParams: Promise<{ q?: string; sport?: string; squad?: string; school?: string; sort?: string; dir?: string; page?: string; add?: string; saved?: string; error?: string }> }) {
  await requireUser("admin");
  const params = await searchParams;
  const sort: ListingSort = SORTS.includes(params.sort as ListingSort) ? (params.sort as ListingSort) : "name";
  const dir = params.dir === "desc" ? "desc" : "asc";
  const q = params.q?.trim() ?? "";
  const [listings, requests] = await Promise.all([
    prisma.directoryListing.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        sport: true,
        teamOrSchool: true,
        position: true,
        city: true,
        squad: true,
        level: true,
        claimedUserId: true,
        _count: { select: { interests: true } },
      },
    }),
    prisma.introRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        createdAt: true,
        note: true,
        business: { select: { name: true, businessName: true } },
        listing: { select: { name: true } },
        athlete: { select: { name: true } },
      },
    }),
  ]);
  const sports = [...new Set(listings.map((listing) => listing.sport))].sort();
  const schools = [...new Set(listings.map((listing) => listing.teamOrSchool))].sort();
  const needle = q.toLowerCase();
  const filtered = listings.filter((listing) => {
    if (needle && ![listing.name, listing.sport, listing.teamOrSchool, listing.position, listing.city].join(" ").toLowerCase().includes(needle)) return false;
    if (params.sport && listing.sport !== params.sport) return false;
    if (params.squad && listing.squad !== params.squad) return false;
    if (params.school && listing.teamOrSchool !== params.school) return false;
    return true;
  });
  filtered.sort((a, b) => {
    const result = sort === "sport"
      ? a.sport.localeCompare(b.sport)
      : sort === "status"
        ? (a.claimedUserId ? "Claimed" : "Listed").localeCompare(b.claimedUserId ? "Claimed" : "Listed")
        : sort === "completion"
          ? listingCompletion(a) - listingCompletion(b)
          : sort === "interest"
            ? a._count.interests - b._count.interests
            : a.name.localeCompare(b.name);
    return dir === "asc" ? result : -result;
  });
  const page = Math.min(Math.max(1, Number(params.page) || 1), Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const query = { q: q || undefined, sport: params.sport || undefined, squad: params.squad || undefined, school: params.school || undefined, sort, dir };
  const waiting = listings.filter((listing) => listing._count.interests > 0).length;
  const input = fieldClass();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Directory</h1>
          <p className="mt-1 text-sm text-zinc-500">Roster listings without a login. A business can ask for an introduction. You contact the athlete.</p>
        </div>
        <Link href={params.add === "1" ? "/admin/directory" : "/admin/directory?add=1"} className="inline-flex h-10 items-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white">
          {params.add === "1" ? "Close" : "+ Add listing"}
        </Link>
      </div>
      <AdminNotice saved={params.saved} error={params.error} />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ProfileStat label="Listed athletes" value={String(listings.length)} icon="people" />
        <ProfileStat label="Unclaimed" value={String(listings.filter((listing) => !listing.claimedUserId).length)} icon="check" />
        <ProfileStat label="Schools" value={String(schools.length)} icon="store" />
        <ProfileStat label="Waiting on you" value={String(waiting)} hint="Businesses asked for an introduction" icon="alert" />
      </div>

      {params.add === "1" ? (
        <form action={createListing} className="mt-4 rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold">Add a listing</h2>
          <p className="mt-1 text-sm text-zinc-500">Name, team, and city only. No email and no password.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">Name<input name="name" required className={input} /></label>
            <label className="block text-sm font-medium">Level
              <select name="level" defaultValue="college" className={input}>
                {DIRECTORY_LEVELS.map((level) => <option key={level.id} value={level.id}>{level.label}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium">Sport
              <input name="sport" required list="directory-sports" className={input} />
              <datalist id="directory-sports">{DIRECTORY_SPORTS.map((sport) => <option key={sport} value={sport} />)}</datalist>
            </label>
            <label className="block text-sm font-medium">Squad
              <select name="squad" defaultValue="men" className={input}>
                <option value="">Not set</option>
                {DIRECTORY_SQUADS.map((squad) => <option key={squad.id} value={squad.id}>{squad.label}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium">Position<input name="position" placeholder="Guard, WR" className={input} /></label>
            <label className="block text-sm font-medium">Team or school<input name="teamOrSchool" required className={input} /></label>
            <label className="block text-sm font-medium">City<input name="city" className={input} /></label>
            <label className="block text-sm font-medium">State<input name="state" className={input} /></label>
          </div>
          <button className="mt-5 rounded-xl bg-zinc-950 px-4 py-2 text-sm font-semibold text-white">Add listing</button>
        </form>
      ) : null}

      <form className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-black/10 bg-white p-3">
        <label className="relative min-w-56 flex-1">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          </span>
          <input name="q" defaultValue={q} placeholder="Search athletes by name, school, or position..." className="h-10 w-full rounded-xl border border-black/10 bg-zinc-50 pr-3 pl-9 text-sm outline-none" />
        </label>
        <FilterSelect name="sport" label="Sport" value={params.sport ?? ""} options={[{ value: "", label: "All Sports" }, ...sports.map((sport) => ({ value: sport, label: sport }))]} />
        <FilterSelect name="squad" label="Squad" value={params.squad ?? ""} options={[{ value: "", label: "All squads" }, ...DIRECTORY_SQUADS.map((squad) => ({ value: squad.id, label: squad.label }))]} />
        <FilterSelect name="school" label="School" value={params.school ?? ""} options={[{ value: "", label: "All schools" }, ...schools.map((school) => ({ value: school, label: school }))]} />
        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="dir" value={dir} />
        <button className="h-10 rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white">Search</button>
      </form>

      <p className="mt-4 text-sm text-zinc-500">{filtered.length} listings</p>

      <div className="mt-3 overflow-hidden rounded-2xl border border-black/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="text-[11px] tracking-wide text-zinc-400">
                <th className="px-4 py-3 font-medium"><SortHeader label="Athlete" column="name" sort={sort} dir={dir} base="/admin/directory" query={query} /></th>
                <th className="px-4 py-3 font-medium"><SortHeader label="Sport" column="sport" sort={sort} dir={dir} base="/admin/directory" query={query} /></th>
                <th className="px-4 py-3 font-medium"><SortHeader label="Status" column="status" sort={sort} dir={dir} base="/admin/directory" query={query} /></th>
                <th className="px-4 py-3 font-medium"><SortHeader label="Profile completion" column="completion" sort={sort} dir={dir} base="/admin/directory" query={query} /></th>
                <th className="px-4 py-3 font-medium uppercase">Storefront</th>
                <th className="px-4 py-3 font-medium"><SortHeader label="Interest" column="interest" sort={sort} dir={dir} base="/admin/directory" query={query} /></th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? <tr><td colSpan={7} className="px-4 py-12 text-zinc-500">No listings match.</td></tr> : null}
              {slice.map((listing) => (
                <tr key={listing.id} className="border-t border-black/5">
                  <td className="px-4 py-3">
                    <Link href={`/admin/directory/${listing.id}`} className="flex items-center gap-3">
                      <AthleteAvatar name={listing.name} photo={null} size={36} />
                      <span>
                        <span className="block font-semibold">{listing.name}</span>
                        <span className="block text-xs text-zinc-500">{[listing.teamOrSchool, squadLabel(listing.squad), directoryLevelLabel(listing.level)].filter(Boolean).join(" · ")}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">{listing.sport}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-zinc-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                      {listing.claimedUserId ? "Claimed" : "Listed"}
                    </span>
                  </td>
                  <td className="px-4 py-3"><CompletionBar value={listingCompletion(listing)} /></td>
                  <td className="px-4 py-3"><StorefrontPill live={false} /></td>
                  <td className="px-4 py-3 text-zinc-500">{listing._count.interests === 0 ? "None" : listing._count.interests}</td>
                  <td className="px-4 py-3"><ListingMenu listingId={listing.id} name={listing.name} interests={listing._count.interests} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 px-4 py-3 text-xs text-zinc-500">
          <span>Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + slice.length} of {filtered.length}</span>
          <ProfilePager page={page} pages={pages} hrefFor={(number) => adminHref("/admin/directory", { ...query, page: number === 1 ? undefined : String(number) })} />
        </div>
      </div>

      <section className="mt-8 overflow-hidden rounded-2xl border border-black/10 bg-white">
        <div className="px-5 py-4">
          <h2 className="font-semibold">Introduction requests</h2>
          <p className="mt-1 text-sm text-zinc-500">A business asked you to reach out. Nothing has been charged.</p>
        </div>
        {requests.length === 0 ? <p className="border-t border-black/5 px-5 py-8 text-sm text-zinc-500">No requests yet.</p> : null}
        {requests.map((request) => (
          <div key={request.id} className="grid gap-2 border-t border-black/5 px-5 py-3 text-sm sm:grid-cols-[120px_1fr_1fr]">
            <span className="text-zinc-500">{activityLabel(request.createdAt)}</span>
            <span className="font-medium">{request.business.businessName || request.business.name}</span>
            <span>{request.listing?.name || request.athlete?.name || "—"}{request.note ? <span className="block text-xs text-zinc-500">{request.note}</span> : null}</span>
          </div>
        ))}
      </section>
      <p className="mt-4 text-sm text-zinc-500">
        Accounts with a login are on <Link href="/admin/athletes" className="font-semibold text-black">Athlete Profiles</Link>.
      </p>
    </div>
  );
}
