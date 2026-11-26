import Link from "next/link";
import { requireUser } from "@/app/actions/auth";
import { AccountMenu, FilterSelect } from "@/components/admin-controls";
import { AthleteAvatar } from "@/components/athlete-avatar";
import { ActivePill, AdminHeader, AdminNotice, AdminTable, AdminTabs, PAGE_SIZE, RolePill, adminHref, joinedLabel } from "@/components/admin-ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const TABS = [
  { id: "all", label: "All users" },
  { id: "athlete", label: "Athletes" },
  { id: "business", label: "Businesses" },
  { id: "admin", label: "Admins" },
] as const;

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; tab?: string; status?: string; page?: string; saved?: string; error?: string }> }) {
  await requireUser("admin");
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const tab = TABS.some((item) => item.id === params.tab) ? params.tab! : "all";
  const status = params.status === "active" || params.status === "suspended" ? params.status : "";
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { dealsOwned: true, dealsReceived: true } } },
  });
  const needle = q.toLowerCase();
  const matches = (user: (typeof users)[number]) => {
    if (needle && ![user.name, user.email, user.businessName].join(" ").toLowerCase().includes(needle)) return false;
    if (status === "active" && !user.isActive) return false;
    if (status === "suspended" && user.isActive) return false;
    return true;
  };
  const visible = users.filter(matches);
  const rows = visible.filter((user) => tab === "all" || user.role === tab);
  const page = Math.max(1, Number(params.page) || 1);
  const slice = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const query = { q: q || undefined, tab: tab === "all" ? undefined : tab, status: status || undefined };

  return (
    <div>
      <AdminHeader title="Users" subtitle="Every account, its role, and whether it can sign in." />
      <AdminNotice saved={params.saved} error={params.error} />
      <AdminTabs
        tabs={TABS.map((item) => ({
          href: adminHref("/admin/users", { ...query, tab: item.id === "all" ? undefined : item.id }),
          label: item.label,
          count: (item.id === "all" ? visible : visible.filter((user) => user.role === item.id)).length,
          active: tab === item.id,
        }))}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <form className="flex min-w-0 flex-1 flex-wrap gap-2">
          {tab !== "all" ? <input type="hidden" name="tab" value={tab} /> : null}
          <input name="q" defaultValue={q} placeholder="Search by name or email" className="h-10 min-w-56 flex-1 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none" />
          <FilterSelect name="status" label="Status" value={status} options={[{ value: "", label: "All statuses" }, { value: "active", label: "Active" }, { value: "suspended", label: "Suspended" }]} />
        </form>
        <Link href="/admin/accounts/new?role=business" className="inline-flex h-10 items-center rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white">+ Add user</Link>
      </div>
      <AdminTable
        columns={["User", "Role", "Status", "Deals", "Joined", ""]}
        footer={<Pager page={page} pages={pages} total={rows.length} shown={slice.length} hrefFor={(next) => adminHref("/admin/users", { ...query, page: next > 1 ? String(next) : undefined })} />}
      >
        {slice.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-zinc-500">No accounts match.</td></tr> : null}
        {slice.map((user) => (
          <tr key={user.id} className="border-t border-black/5">
            <td className="px-4 py-3">
              <Link href={`/admin/users/${user.id}`} className="flex items-center gap-3">
                <AthleteAvatar name={user.businessName || user.name} photo={user.profilePhoto} size={36} />
                <span>
                  <span className="block font-semibold">{user.name}</span>
                  <span className="block text-xs text-zinc-500">{user.email}</span>
                </span>
              </Link>
            </td>
            <td className="px-4 py-3"><RolePill role={user.role} /></td>
            <td className="px-4 py-3"><ActivePill active={user.isActive} /></td>
            <td className="px-4 py-3">{user.role === "admin" ? "—" : user.role === "business" ? user._count.dealsOwned : user._count.dealsReceived}</td>
            <td className="px-4 py-3 text-zinc-500">{joinedLabel(user.createdAt)}</td>
            <td className="px-4 py-3"><AccountMenu userId={user.id} role={user.role} active={user.isActive} href={`/admin/users/${user.id}`} /></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}

function Pager({ page, pages, total, shown, hrefFor }: { page: number; pages: number; total: number; shown: number; hrefFor: (page: number) => string }) {
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  return (
    <>
      <span>Showing {start}–{start + shown - (shown ? 1 : 0)} of {total}</span>
      <span className="flex items-center gap-1">
        {Array.from({ length: pages }, (_, index) => index + 1).slice(0, 5).map((number) => (
          <Link key={number} href={hrefFor(number)} className={`grid h-7 min-w-7 place-items-center rounded-lg px-2 ${number === page ? "bg-zinc-950 text-white" : "hover:bg-zinc-100"}`}>{number}</Link>
        ))}
      </span>
    </>
  );
}
