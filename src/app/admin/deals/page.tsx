import Link from "next/link";
import { requireUser } from "@/app/actions/auth";
import { FilterSelect } from "@/components/admin-controls";
import { AdminHeader, AdminNotice, AdminTable, AdminTabs, PaymentPill, StatusPill, adminHref, joinedLabel } from "@/components/admin-ui";
import { dealTypeName, money, scheduleLabel } from "@/lib/deals";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const TABS = [
  { id: "all", label: "All deals" },
  { id: "progress", label: "In progress" },
  { id: "waiting", label: "Waiting" },
  { id: "review", label: "In review" },
  { id: "approved", label: "Approved" },
  { id: "cancelled", label: "Cancelled" },
  { id: "archived", label: "Archived" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default async function AdminDealsPage({ searchParams }: { searchParams: Promise<{ q?: string; tab?: string; pay?: string; saved?: string; error?: string }> }) {
  await requireUser("admin");
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const tab: TabId = TABS.some((item) => item.id === params.tab) ? (params.tab as TabId) : "all";
  const pay = ["funded", "unpaid", "held", "released", "failed"].includes(params.pay ?? "") ? params.pay! : "";
  const deals = await prisma.deal.findMany({
    orderBy: { createdAt: "desc" },
    include: { business: true, athlete: true },
  });
  const active = deals.filter((deal) => !deal.archivedAt);
  const needle = q.toLowerCase();
  const searched = deals.filter((deal) => {
    if (needle && ![dealTypeName(deal.dealType), deal.notes, deal.business.businessName, deal.business.name, deal.athlete?.name].join(" ").toLowerCase().includes(needle)) return false;
    if (pay === "funded" && deal.paymentStatus !== "paid_escrowed" && deal.paymentStatus !== "released") return false;
    if (pay === "held" && deal.paymentStatus !== "paid_escrowed") return false;
    if (pay === "released" && deal.paymentStatus !== "released") return false;
    if (pay === "failed" && deal.paymentStatus !== "failed") return false;
    if (pay === "unpaid" && deal.paymentStatus !== "unpaid") return false;
    return true;
  });
  const rows = searched.filter((deal) => matchesTab(tab, deal.status, deal.archivedAt));
  const query = { q: q || undefined, pay: pay || undefined };

  return (
    <div>
      <AdminHeader title="Deals" subtitle="Deal status and the card charge are tracked separately. A deal can be in progress while it is still not charged." />
      <AdminNotice saved={params.saved} error={params.error} />
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric href="/admin/deals" label="All deals" value={active.length} icon="all" />
        <Metric href={adminHref("/admin/deals", { tab: "progress" })} label="In progress" value={active.filter((deal) => deal.status === "accepted").length} icon="progress" />
        <Metric href={adminHref("/admin/deals", { pay: "funded" })} label="Funded" value={active.filter((deal) => deal.paymentStatus === "paid_escrowed" || deal.paymentStatus === "released").length} icon="funded" caption="Card charged" />
        <Metric href={adminHref("/admin/deals", { tab: "cancelled" })} label="Cancelled" value={active.filter((deal) => deal.status === "cancelled").length} icon="cancelled" />
      </section>
      <AdminTabs
        tabs={TABS.map((item) => ({
          href: adminHref("/admin/deals", { ...query, tab: item.id === "all" ? undefined : item.id }),
          label: item.label,
          count: searched.filter((deal) => matchesTab(item.id, deal.status, deal.archivedAt)).length,
          active: tab === item.id,
        }))}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <form className="flex min-w-0 flex-1 flex-wrap gap-2">
          {tab !== "all" ? <input type="hidden" name="tab" value={tab} /> : null}
          <input name="q" defaultValue={q} placeholder="Search by business, athlete, or deal" className="h-10 min-w-56 flex-1 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none" />
          <FilterSelect
            name="pay"
            label="Payment"
            value={pay}
            options={[
              { value: "", label: "Any payment" },
              { value: "unpaid", label: "Not charged" },
              { value: "held", label: "Held" },
              { value: "released", label: "Released" },
              { value: "failed", label: "Charge failed" },
              { value: "funded", label: "Funded" },
            ]}
          />
        </form>
        <Link href="/admin/deals/export" className="inline-flex h-10 items-center rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold">Export</Link>
      </div>
      <AdminTable columns={["Deal", "Business", "Athlete", "Amount", "Status", "Payment", "Deadline", ""]} footer={<span>Showing {rows.length === 0 ? 0 : 1}–{rows.length} of {rows.length}</span>}>
        {rows.length === 0 ? <tr><td colSpan={8} className="px-4 py-10 text-zinc-500">No deals match.</td></tr> : null}
        {rows.map((deal) => (
          <tr key={deal.id} className="border-t border-black/5">
            <td className="px-4 py-3">
              <Link href={`/admin/deals/${deal.id}`} className="font-semibold hover:underline">{dealTypeName(deal.dealType)}</Link>
              <span className="mt-0.5 block text-xs text-zinc-400">{joinedLabel(deal.createdAt)}</span>
            </td>
            <td className="px-4 py-3">{deal.business.businessName || deal.business.name}</td>
            <td className="px-4 py-3">{deal.athlete?.name ?? "Unassigned"}</td>
            <td className="px-4 py-3 font-semibold">{money(deal.compensationAmount)}</td>
            <td className="px-4 py-3"><StatusPill status={deal.status} archived={Boolean(deal.archivedAt)} /></td>
            <td className="px-4 py-3"><PaymentPill status={deal.paymentStatus} /></td>
            <td className="px-4 py-3 text-zinc-500">{deal.deadline ? scheduleLabel(deal.deadline) : "—"}</td>
            <td className="px-4 py-3 text-right"><Link href={`/admin/deals/${deal.id}`} aria-label="Open deal" className="text-lg text-zinc-400">···</Link></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}

function matchesTab(tab: TabId, status: string, archivedAt: Date | null) {
  if (tab === "archived") return Boolean(archivedAt);
  if (archivedAt) return false;
  if (tab === "all") return true;
  if (tab === "progress") return status === "accepted";
  if (tab === "waiting") return status === "pending" || status === "draft";
  if (tab === "review") return status === "completed";
  if (tab === "approved") return status === "approved";
  return status === "cancelled";
}

function Metric({ href, label, value, icon, caption }: { href: string; label: string; value: number; icon: string; caption?: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-black/10 bg-white p-4">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-100 text-zinc-700"><MetricIcon name={icon} /></span>
      <p className="mt-4 text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
      {caption ? <p className="text-xs text-zinc-400">{caption}</p> : null}
    </Link>
  );
}

function MetricIcon({ name }: { name: string }) {
  const common = { viewBox: "0 0 24 24", className: "h-4 w-4", fill: "none", stroke: "currentColor", strokeWidth: 1.8 };
  if (name === "progress") return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="M12 8v4l2 2" /></svg>;
  if (name === "funded") return <svg {...common}><path d="M12 3v18M16 7.5c0-1.5-1.8-2.5-4-2.5S8 6 8 7.5 9.8 10 12 10s4 1 4 2.5-1.8 2.5-4 2.5-4-1-4-2.5" /></svg>;
  if (name === "cancelled") return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="m9 9 6 6M15 9l-6 6" /></svg>;
  return <svg {...common}><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M8 9h8M8 13h5" /></svg>;
}
