import Link from "next/link";
import { campaignStatus, fundingLabel } from "@/lib/deals";

export function AdminBack({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-sm font-semibold text-zinc-500 hover:text-black">
      ← {label}
    </Link>
  );
}

export function AdminNotice({ saved, error }: { saved?: string; error?: string }) {
  if (error) return <p className="mt-4 text-sm text-red-600">{error}</p>;
  if (saved) return <p className="mt-4 text-sm text-zinc-600">{saved}</p>;
  return null;
}

export function AdminHeader({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

export function AdminTabs({ tabs }: { tabs: { href: string; label: string; count: number; active: boolean }[] }) {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Link key={tab.href} href={tab.href} className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${tab.active ? "bg-zinc-950 text-white" : "bg-white text-zinc-700 ring-1 ring-black/10"}`}>
          {tab.label}
          <span className={tab.active ? "text-white/60" : "text-zinc-400"}>{tab.count}</span>
        </Link>
      ))}
    </div>
  );
}

export function AdminTable({ columns, children, footer }: { columns: string[]; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="text-xs text-zinc-400">
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 font-medium">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
      {footer ? <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 px-4 py-3 text-xs text-zinc-500">{footer}</div> : null}
    </div>
  );
}

export function ActivePill({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${active ? "text-emerald-600" : "text-zinc-500"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-zinc-400"}`} />
      {active ? "Active" : "Suspended"}
    </span>
  );
}

export function RolePill({ role }: { role: string }) {
  const label = role === "athlete" ? "Athlete" : role === "business" ? "Business" : "Admin";
  return <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">{label}</span>;
}

export function adminHref(path: string, params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export function joinedLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ago(date: Date) {
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return joinedLabel(date);
}

export function StatusPill({ status, archived }: { status: string; archived?: boolean }) {
  if (archived) return <span className="inline-flex items-center gap-1.5 text-zinc-500"><Dot className="bg-zinc-400" />Archived</span>;
  const tone = status === "accepted" ? "bg-blue-500" : status === "approved" ? "bg-emerald-500" : status === "completed" ? "bg-amber-500" : "bg-zinc-400";
  return <span className="inline-flex items-center gap-1.5"><Dot className={tone} />{campaignStatus(status)}</span>;
}

export function PaymentPill({ status }: { status: string }) {
  const tone = status === "paid_escrowed" || status === "released" ? "bg-emerald-500" : status === "failed" ? "bg-red-500" : "bg-zinc-300";
  return <span className="inline-flex items-center gap-1.5 text-zinc-600"><Dot className={tone} />{fundingLabel(status)}</span>;
}

function Dot({ className }: { className: string }) {
  return <span className={`h-1.5 w-1.5 rounded-full ${className}`} />;
}

export function fieldClass() {
  return "mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none";
}

export const PAGE_SIZE = 10;
