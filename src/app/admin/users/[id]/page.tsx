import Link from "next/link";
import { notFound } from "next/navigation";
import { impersonateUser, setUserActive } from "@/app/actions/admin";
import { requireUser } from "@/app/actions/auth";
import { AdminBack, AdminNotice } from "@/components/admin-ui";
import { dealTypeName, money, statusLabel } from "@/lib/deals";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminUserPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireUser("admin");
  const { id } = await params;
  const query = await searchParams;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      dealsOwned: { orderBy: { createdAt: "desc" }, include: { athlete: true } },
      dealsReceived: { orderBy: { createdAt: "desc" }, include: { business: true } },
    },
  });
  if (!user) notFound();
  const deals = user.role === "athlete" ? user.dealsReceived : user.dealsOwned;

  return (
    <div>
      <AdminBack href="/admin/users" label="Users" />
      <h1 className="mt-3 text-3xl font-bold">{user.name}</h1>
      <p className="mt-2 text-sm text-black/60">{user.email} · {user.role} · {user.isActive ? "Active" : "Suspended"}</p>
      <AdminNotice saved={query.saved} error={query.error} />
      {user.role === "admin" ? <p className="mt-6 text-sm text-black/60">Admin accounts are not edited from this page.</p> : (
        <div className="mt-6 flex flex-wrap gap-2">
          <form action={setUserActive.bind(null, user.id, !user.isActive)}>
            <button className="border border-black px-3 py-1.5 text-sm font-semibold">{user.isActive ? "Suspend" : "Reactivate"}</button>
          </form>
          {user.isActive ? (
            <form action={impersonateUser.bind(null, user.id)}>
              <button className="bg-black px-3 py-1.5 text-sm font-semibold text-white">View their portal</button>
            </form>
          ) : null}
          {user.role === "athlete" ? <Link href={`/admin/athletes/${user.id}`} className="border border-black px-3 py-1.5 text-sm font-semibold">Edit athlete</Link> : null}
          {user.role === "business" ? <Link href={`/admin/businesses/${user.id}`} className="border border-black px-3 py-1.5 text-sm font-semibold">Edit business</Link> : null}
        </div>
      )}
      <h2 className="mt-10 text-lg font-semibold">Deals</h2>
      <ul className="mt-3 rounded-2xl border border-black/10 bg-white">
        {deals.length === 0 ? <li className="px-4 py-8 text-sm text-black/60">No deals.</li> : null}
        {deals.map((deal) => (
          <li key={deal.id} className="flex items-center justify-between gap-4 border-b border-black/10 px-4 py-4 last:border-b-0">
            <span>
              <Link href={`/admin/deals/${deal.id}`} className="font-semibold hover:underline">{dealTypeName(deal.dealType)}</Link>
              <span className="mt-1 block text-sm text-black/60">
                {"athlete" in deal && deal.athlete ? deal.athlete.name : "business" in deal ? deal.business.businessName || deal.business.name : "Unassigned"}
              </span>
            </span>
            <span className="text-right text-sm">
              <span className="block font-semibold">{money(deal.compensationAmount)}</span>
              <span className="text-black/60">{statusLabel(deal.status)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
