import Link from "next/link";
import { requireUser } from "@/app/actions/auth";
import { AccountMenu, FilterSelect } from "@/components/admin-controls";
import { AthleteAvatar } from "@/components/athlete-avatar";
import { AdminNotice, adminHref } from "@/components/admin-ui";
import { CompletionBar, ProfilePager, ProfileStat, SortHeader, StorefrontPill, accountCompletion, activityLabel } from "@/components/admin-profiles";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

const SORTS = ["name", "sport", "status", "completion", "activity"] as const;
type AthleteSort = (typeof SORTS)[number];

export default async function AdminAthletesPage({ searchParams }: { searchParams: Promise<{ q?: string; sport?: string; status?: string; sort?: string; dir?: string; page?: string; saved?: string; error?: string }> }) {
  await requireUser("admin");
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const status = params.status === "active" || params.status === "inactive" ? params.status : "";
  const sort: AthleteSort = SORTS.includes(params.sort as AthleteSort) ? (params.sort as AthleteSort) : "activity";
  const dir = params.dir === "asc" ? "asc" : "desc";
  const athletes = await prisma.user.findMany({
    where: { role: "athlete" },
    include: { _count: { select: { dealsReceived: true } } },
  });
  const sports = [...new Set(athletes.map((athlete) => athlete.sport).filter((sport): sport is string => Boolean(sport)))].sort();
  const needle = q.toLowerCase();
  const filtered = athletes.filter((athlete) => {
    if (needle && ![athlete.name, athlete.email, athlete.sport, athlete.school, athlete.city].join(" ").toLowerCase().includes(needle)) return false;
    if (params.sport && athlete.sport !== params.sport) return false;
    if (status === "active" && !athlete.isActive) return false;
    if (status === "inactive" && athlete.isActive) return false;
    return true;
  });
  filtered.sort((a, b) => {
    const result = sort === "name"
      ? a.name.localeCompare(b.name)
      : sort === "sport"
        ? (a.sport ?? "").localeCompare(b.sport ?? "")
        : sort === "status"
          ? (a.isActive ? "Active" : "Inactive").localeCompare(b.isActive ? "Active" : "Inactive")
          : sort === "completion"
            ? accountCompletion(a) - accountCompletion(b)
            : a.updatedAt.getTime() - b.updatedAt.getTime();
    return dir === "asc" ? result : -result;
  });
  const page = Math.min(Math.max(1, Number(params.page) || 1), Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const query = { q: q || undefined, sport: params.sport || undefined, status: status || undefined, sort, dir };
  const scored = athletes.map((athlete) => accountCompletion(athlete));
  const needsAttention = athletes.filter((athlete, index) => !athlete.isActive || scored[index] < 70).length;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Athlete Profiles</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage athlete accounts, profile visibility, and whether a business can invite them.</p>
        </div>
        <Link href="/admin/athletes/new" className="inline-flex h-10 items-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white">
          <span className="text-base leading-none">+</span> Add Athlete
        </Link>
      </div>
      <AdminNotice saved={params.saved} error={params.error} />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ProfileStat label="Total Athletes" value={String(athletes.length)} icon="people" />
        <ProfileStat label="Active" value={String(athletes.filter((athlete) => athlete.isActive).length)} icon="check" />
        <ProfileStat label="Storefronts Live" value="0" hint="Storefronts are not turned on" icon="store" />
        <ProfileStat label="Needs Attention" value={String(needsAttention)} hint="Inactive or under 70% complete" icon="alert" />
      </div>

      <form className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-black/10 bg-white p-3">
        <label className="relative min-w-56 flex-1">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          </span>
          <input name="q" defaultValue={q} placeholder="Search athletes by name, school, or email..." className="h-10 w-full rounded-xl border border-black/10 bg-zinc-50 pr-3 pl-9 text-sm outline-none" />
        </label>
        <FilterSelect name="sport" label="Sport" value={params.sport ?? ""} options={[{ value: "", label: "All Sports" }, ...sports.map((sport) => ({ value: sport, label: sport }))]} />
        <FilterSelect name="status" label="Status" value={status} options={[{ value: "", label: "All Statuses" }, { value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]} />
        <Link href="/admin/directory" className="inline-flex h-10 items-center rounded-xl border border-black/10 px-3 text-sm font-medium">Directory</Link>
        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="dir" value={dir} />
        <button className="h-10 rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white">Search</button>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-500">
        <p>{filtered.length} athletes</p>
        <a href={exportHref(query)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 text-sm font-medium text-zinc-700">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 4v10M8 10l4 4 4-4M5 19h14" /></svg>
            Export
          </a>
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-black/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="text-[11px] tracking-wide text-zinc-400">
                <th className="px-4 py-3 font-medium"><SortHeader label="Athlete" column="name" sort={sort} dir={dir} base="/admin/athletes" query={query} /></th>
                <th className="px-4 py-3 font-medium"><SortHeader label="Sport" column="sport" sort={sort} dir={dir} base="/admin/athletes" query={query} /></th>
                <th className="px-4 py-3 font-medium"><SortHeader label="Status" column="status" sort={sort} dir={dir} base="/admin/athletes" query={query} /></th>
                <th className="px-4 py-3 font-medium"><SortHeader label="Profile completion" column="completion" sort={sort} dir={dir} base="/admin/athletes" query={query} /></th>
                <th className="px-4 py-3 font-medium uppercase">Storefront</th>
                <th className="px-4 py-3 font-medium"><SortHeader label="Last activity" column="activity" sort={sort} dir={dir} base="/admin/athletes" query={query} /></th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? <tr><td colSpan={7} className="px-4 py-12 text-zinc-500">No athlete accounts match. Listed roster athletes live in the directory.</td></tr> : null}
              {slice.map((athlete) => (
                <tr key={athlete.id} className="border-t border-black/5">
                  <td className="px-4 py-3">
                    <Link href={`/admin/athletes/${athlete.id}`} className="flex items-center gap-3">
                      <AthleteAvatar name={athlete.name} photo={athlete.profilePhoto} size={36} />
                      <span>
                        <span className="block font-semibold">{athlete.name}</span>
                        <span className="block text-xs text-zinc-500">{athlete.school || athlete.email}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">{athlete.sport || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 ${athlete.isActive ? "text-emerald-600" : "text-zinc-500"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${athlete.isActive ? "bg-emerald-500" : "bg-zinc-400"}`} />
                      {athlete.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3"><CompletionBar value={accountCompletion(athlete)} /></td>
                  <td className="px-4 py-3"><StorefrontPill live={false} /></td>
                  <td className="px-4 py-3 text-zinc-500">{activityLabel(athlete.updatedAt)}</td>
                  <td className="px-4 py-3"><AccountMenu userId={athlete.id} role="athlete" active={athlete.isActive} href={`/admin/athletes/${athlete.id}`} editHref={`/admin/athletes/${athlete.id}?edit=1`} deleteName={athlete.name} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 px-4 py-3 text-xs text-zinc-500">
          <span>Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + slice.length} of {filtered.length}</span>
          <ProfilePager page={page} pages={pages} hrefFor={(number) => adminHref("/admin/athletes", { ...query, page: number === 1 ? undefined : String(number) })} />
        </div>
      </div>
    </div>
  );
}

function exportHref(query: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value) search.set(key, value);
  const text = search.toString();
  return text ? `/admin/athletes/export?${text}` : "/admin/athletes/export";
}
