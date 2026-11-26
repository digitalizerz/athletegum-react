import Link from "next/link";
import { requireUser } from "@/app/actions/auth";
import { AccountMenu, FilterSelect } from "@/components/admin-controls";
import { AthleteAvatar } from "@/components/athlete-avatar";
import { ActivePill, AdminHeader, AdminNotice, AdminTable, AdminTabs, PAGE_SIZE, adminHref } from "@/components/admin-ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAthletesPage({ searchParams }: { searchParams: Promise<{ q?: string; tab?: string; sport?: string; school?: string; page?: string; saved?: string; error?: string }> }) {
  await requireUser("admin");
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const tab = params.tab === "active" || params.tab === "suspended" ? params.tab : "all";
  const athletes = await prisma.user.findMany({
    where: { role: "athlete" },
    orderBy: { name: "asc" },
    include: { _count: { select: { dealsReceived: true } } },
  });
  const sports = [...new Set(athletes.map((athlete) => athlete.sport).filter((sport): sport is string => Boolean(sport)))].sort();
  const schools = [...new Set(athletes.map((athlete) => athlete.school).filter((school): school is string => Boolean(school)))].sort();
  const needle = q.toLowerCase();
  const filtered = athletes.filter((athlete) => {
    if (needle && ![athlete.name, athlete.email, athlete.sport, athlete.school].join(" ").toLowerCase().includes(needle)) return false;
    if (params.sport && athlete.sport !== params.sport) return false;
    if (params.school && athlete.school !== params.school) return false;
    return true;
  });
  const rows = filtered.filter((athlete) => tab === "all" || (tab === "active" ? athlete.isActive : !athlete.isActive));
  const page = Math.max(1, Number(params.page) || 1);
  const slice = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const query = { q: q || undefined, sport: params.sport || undefined, school: params.school || undefined, tab: tab === "all" ? undefined : tab };

  return (
    <div>
      <AdminHeader title="Athletes" subtitle="Athlete accounts and whether they appear in the business directory." />
      <AdminNotice saved={params.saved} error={params.error} />
      <AdminTabs
        tabs={[
          { id: "all", label: "All athletes" },
          { id: "active", label: "Active" },
          { id: "suspended", label: "Suspended" },
        ].map((item) => ({
          href: adminHref("/admin/athletes", { ...query, tab: item.id === "all" ? undefined : item.id }),
          label: item.label,
          count: item.id === "all" ? filtered.length : filtered.filter((athlete) => (item.id === "active" ? athlete.isActive : !athlete.isActive)).length,
          active: tab === item.id,
        }))}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <form className="flex min-w-0 flex-1 flex-wrap gap-2">
          {tab !== "all" ? <input type="hidden" name="tab" value={tab} /> : null}
          <input name="q" defaultValue={q} placeholder="Search by name, school, or sport" className="h-10 min-w-56 flex-1 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none" />
          <FilterSelect name="sport" label="Sport" value={params.sport ?? ""} options={[{ value: "", label: "Sport" }, ...sports.map((sport) => ({ value: sport, label: sport }))]} />
          <FilterSelect name="school" label="School" value={params.school ?? ""} options={[{ value: "", label: "School" }, ...schools.map((school) => ({ value: school, label: school }))]} />
        </form>
        <Link href="/admin/accounts/new?role=athlete" className="inline-flex h-10 items-center rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white">+ Add athlete</Link>
      </div>
      <AdminTable
        columns={["Athlete", "School", "Sport", "Status", "Deals", ""]}
        footer={<span>Showing {rows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + slice.length} of {rows.length}{pages > 1 ? ` · Page ${page} of ${pages}` : ""}</span>}
      >
        {slice.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-zinc-500">No athletes match.</td></tr> : null}
        {slice.map((athlete) => (
          <tr key={athlete.id} className="border-t border-black/5">
            <td className="px-4 py-3">
              <Link href={`/admin/athletes/${athlete.id}`} className="flex items-center gap-3">
                <AthleteAvatar name={athlete.name} photo={athlete.profilePhoto} size={36} />
                <span>
                  <span className="block font-semibold">{athlete.name}</span>
                  <span className="block text-xs text-zinc-500">{athlete.email}</span>
                </span>
              </Link>
            </td>
            <td className="px-4 py-3">{athlete.school || "—"}</td>
            <td className="px-4 py-3">{athlete.sport || "—"}</td>
            <td className="px-4 py-3"><ActivePill active={athlete.isActive} /></td>
            <td className="px-4 py-3">{athlete._count.dealsReceived}</td>
            <td className="px-4 py-3"><AccountMenu userId={athlete.id} role="athlete" active={athlete.isActive} href={`/admin/athletes/${athlete.id}`} /></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
