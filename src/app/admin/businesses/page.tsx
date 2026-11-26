import Link from "next/link";
import { requireUser } from "@/app/actions/auth";
import { AccountMenu, FilterSelect } from "@/components/admin-controls";
import { AthleteAvatar } from "@/components/athlete-avatar";
import { ActivePill, AdminHeader, AdminNotice, AdminTable, AdminTabs, PAGE_SIZE, adminHref, joinedLabel } from "@/components/admin-ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminBusinessesPage({ searchParams }: { searchParams: Promise<{ q?: string; tab?: string; plan?: string; page?: string; saved?: string; error?: string }> }) {
  await requireUser("admin");
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const tab = params.tab === "active" || params.tab === "suspended" ? params.tab : "all";
  const businesses = await prisma.user.findMany({
    where: { role: "business" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { dealsOwned: true } } },
  });
  const needle = q.toLowerCase();
  const filtered = businesses.filter((business) => {
    if (needle && ![business.name, business.email, business.businessName, business.city].join(" ").toLowerCase().includes(needle)) return false;
    if (params.plan && business.subscriptionPlan !== params.plan) return false;
    return true;
  });
  const rows = filtered.filter((business) => tab === "all" || (tab === "active" ? business.isActive : !business.isActive));
  const page = Math.max(1, Number(params.page) || 1);
  const slice = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const query = { q: q || undefined, plan: params.plan || undefined, tab: tab === "all" ? undefined : tab };

  return (
    <div>
      <AdminHeader title="Businesses" subtitle="Business accounts, their plan, and the deals they have opened." />
      <AdminNotice saved={params.saved} error={params.error} />
      <AdminTabs
        tabs={[
          { id: "all", label: "All businesses" },
          { id: "active", label: "Active" },
          { id: "suspended", label: "Suspended" },
        ].map((item) => ({
          href: adminHref("/admin/businesses", { ...query, tab: item.id === "all" ? undefined : item.id }),
          label: item.label,
          count: item.id === "all" ? filtered.length : filtered.filter((business) => (item.id === "active" ? business.isActive : !business.isActive)).length,
          active: tab === item.id,
        }))}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <form className="flex min-w-0 flex-1 flex-wrap gap-2">
          {tab !== "all" ? <input type="hidden" name="tab" value={tab} /> : null}
          <input name="q" defaultValue={q} placeholder="Search by company or email" className="h-10 min-w-56 flex-1 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none" />
          <FilterSelect name="plan" label="Plan" value={params.plan ?? ""} options={[{ value: "", label: "Plan" }, { value: "free", label: "Free" }, { value: "pro", label: "Pro" }, { value: "growth", label: "Growth" }]} />
        </form>
        <Link href="/admin/accounts/new?role=business" className="inline-flex h-10 items-center rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white">+ Add business</Link>
      </div>
      <AdminTable
        columns={["Business", "Plan", "Status", "Deals", "Joined", ""]}
        footer={<span>Showing {rows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + slice.length} of {rows.length}</span>}
      >
        {slice.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-zinc-500">No businesses match.</td></tr> : null}
        {slice.map((business) => (
          <tr key={business.id} className="border-t border-black/5">
            <td className="px-4 py-3">
              <Link href={`/admin/businesses/${business.id}`} className="flex items-center gap-3">
                <AthleteAvatar name={business.businessName || business.name} photo={business.profilePhoto} size={36} />
                <span>
                  <span className="block font-semibold">{business.businessName || business.name}</span>
                  <span className="block text-xs text-zinc-500">{business.email}</span>
                </span>
              </Link>
            </td>
            <td className="px-4 py-3 capitalize">{business.subscriptionPlan}</td>
            <td className="px-4 py-3"><ActivePill active={business.isActive} /></td>
            <td className="px-4 py-3">{business._count.dealsOwned}</td>
            <td className="px-4 py-3 text-zinc-500">{joinedLabel(business.createdAt)}</td>
            <td className="px-4 py-3"><AccountMenu userId={business.id} role="business" active={business.isActive} href={`/admin/businesses/${business.id}`} /></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
