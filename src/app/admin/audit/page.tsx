import Link from "next/link";
import { requireUser } from "@/app/actions/auth";
import { AdminHeader } from "@/components/admin-ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireUser("admin");
  const params = await searchParams;
  const q = params.q?.trim().toLowerCase() ?? "";
  const logs = (await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { admin: true },
  })).filter((log) => !q || [log.action, log.summary, log.admin?.email].join(" ").toLowerCase().includes(q));

  return (
    <div>
      <AdminHeader title="Audit log" subtitle="Admin changes from this portal. Older Laravel logs were not copied." />
      <form className="mt-4">
        <input name="q" defaultValue={params.q ?? ""} placeholder="Search action or account" className="h-10 w-full max-w-md rounded-xl border border-black/10 bg-white px-3 text-sm outline-none" />
      </form>
      <ul className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-white">
        {logs.length === 0 ? <li className="px-4 py-10 text-sm text-black/60">No admin actions recorded yet.</li> : null}
        {logs.map((log) => (
          <li key={log.id} className="border-b border-black/10 px-4 py-4 text-sm last:border-b-0">
            <span className="font-semibold">{log.summary}</span>
            <span className="mt-1 block text-black/50">
              {log.action} · {log.admin?.email ?? "Unknown admin"} · {log.createdAt.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
              {log.entityType === "deal" && log.entityId ? <> · <Link href={`/admin/deals/${log.entityId}`} className="underline">Deal</Link></> : null}
              {log.entityType === "user" && log.entityId ? <> · <Link href={`/admin/users/${log.entityId}`} className="underline">Account</Link></> : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
