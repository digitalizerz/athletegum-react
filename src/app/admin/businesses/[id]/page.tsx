import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteUser, impersonateUser, setUserActive, updateBusiness } from "@/app/actions/admin";
import { requireUser } from "@/app/actions/auth";
import { AdminBack, AdminNotice, fieldClass } from "@/components/admin-ui";
import { dealTypeName, formatFeePercent, money, platformFeePercent, statusLabel } from "@/lib/deals";
import { getFeeSchedule } from "@/lib/fees";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminBusinessPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireUser("admin");
  const { id } = await params;
  const query = await searchParams;
  const business = await prisma.user.findUnique({
    where: { id },
    include: { dealsOwned: { orderBy: { createdAt: "desc" }, include: { athlete: true } } },
  });
  if (!business || business.role !== "business") notFound();
  const input = fieldClass();
  const fee = formatFeePercent(platformFeePercent(business.subscriptionPlan, business.subscriptionStatus, await getFeeSchedule()));

  return (
    <div>
      <AdminBack href="/admin/businesses" label="Businesses" />
      <h1 className="mt-3 text-3xl font-bold">{business.businessName || business.name}</h1>
      <p className="mt-2 text-sm text-black/60">{business.subscriptionPlan} plan · {fee}% fee · {business.subscriptionStatus === "active" ? "Subscription active" : "No active subscription"}</p>
      <AdminNotice saved={query.saved === "1" ? "Saved." : query.saved} error={query.error} />
      <div className="mt-6 flex flex-wrap gap-2">
        <form action={setUserActive.bind(null, business.id, !business.isActive)}>
          <button className="border border-black px-3 py-1.5 text-sm font-semibold">{business.isActive ? "Suspend" : "Reactivate"}</button>
        </form>
        {business.isActive ? (
          <form action={impersonateUser.bind(null, business.id)}>
            <button className="bg-black px-3 py-1.5 text-sm font-semibold text-white">View their portal</button>
          </form>
        ) : null}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form action={updateBusiness.bind(null, business.id)} className="rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="text-lg font-semibold">Company</h2>
          <label className="mt-4 block text-sm font-medium">Contact name<input name="name" defaultValue={business.name} className={input} /></label>
          <label className="mt-4 block text-sm font-medium">Email<input name="email" type="email" defaultValue={business.email} className={input} /></label>
          <label className="mt-4 block text-sm font-medium">Company<input name="businessName" defaultValue={business.businessName ?? ""} className={input} /></label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">Phone<input name="phone" defaultValue={business.phone ?? ""} className={input} /></label>
            <label className="block text-sm font-medium">City<input name="city" defaultValue={business.city ?? ""} className={input} /></label>
          </div>
          <label className="mt-4 block text-sm font-medium">Description
            <textarea name="bio" defaultValue={business.bio ?? ""} rows={4} className={input} />
          </label>
          <button className="mt-5 bg-black px-4 py-2 text-sm font-semibold text-white">Save changes</button>
        </form>
        <div className="space-y-6">
          <section className="rounded-2xl border border-black/10 bg-white p-5">
            <h2 className="text-lg font-semibold">Deals</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {business.dealsOwned.length === 0 ? <li className="text-black/60">No deals.</li> : null}
              {business.dealsOwned.map((deal) => (
                <li key={deal.id}>
                  <Link href={`/admin/deals/${deal.id}`} className="font-semibold hover:underline">{dealTypeName(deal.dealType)}</Link>
                  <span className="mt-1 block text-black/60">{deal.athlete?.name ?? "Unassigned"} · {money(deal.compensationAmount)} · {statusLabel(deal.status)}</span>
                </li>
              ))}
            </ul>
          </section>
          <form action={deleteUser.bind(null, business.id)} className="rounded-2xl border border-red-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Delete account</h2>
            <p className="mt-2 text-sm text-black/60">
              {business.dealsOwned.length > 0 ? "This business still has deals, so the account cannot be deleted." : "Type delete to remove the login. This cannot be undone."}
            </p>
            {business.dealsOwned.length === 0 ? (
              <>
                <input name="confirm" placeholder="delete" className={`${input} mt-3`} />
                <button className="mt-3 text-sm font-semibold text-red-700">Delete business</button>
              </>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}
