import Link from "next/link";
import { requireUser } from "@/app/actions/auth";
import { AdminHeader } from "@/components/admin-ui";
import { dealTypeName, money, paymentLabel } from "@/lib/deals";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  await requireUser("admin");
  const deals = await prisma.deal.findMany({
    orderBy: { updatedAt: "desc" },
    include: { business: true, athlete: true },
  });
  const charged = deals.filter((deal) => deal.paymentStatus === "paid_escrowed" || deal.paymentStatus === "released");
  const held = charged.filter((deal) => deal.paymentStatus === "paid_escrowed").reduce((sum, deal) => sum + deal.compensationAmount, 0);
  const fees = charged.reduce((sum, deal) => sum + deal.platformFeeAmount, 0);
  const released = deals.filter((deal) => deal.paymentStatus === "released").reduce((sum, deal) => sum + deal.athleteNetPayout, 0);
  const unpaid = deals.filter((deal) => deal.paymentStatus === "unpaid" || deal.paymentStatus === "failed");

  return (
    <div>
      <AdminHeader title="Payments" subtitle="Card charges on deals. There is no wallet ledger. A deal created before card checkout stays unpaid." />
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-black/10 bg-white p-4"><p className="text-sm text-zinc-500">Platform fees</p><p className="mt-2 text-2xl font-bold">{money(fees)}</p></article>
        <article className="rounded-2xl border border-black/10 bg-white p-4"><p className="text-sm text-zinc-500">Held on card</p><p className="mt-2 text-2xl font-bold">{money(held)}</p></article>
        <article className="rounded-2xl border border-black/10 bg-white p-4"><p className="text-sm text-zinc-500">Released to athletes</p><p className="mt-2 text-2xl font-bold">{money(released)}</p></article>
      </section>
      <h2 className="mt-10 text-lg font-semibold">Charges</h2>
      <ul className="mt-3 overflow-hidden rounded-2xl border border-black/10 bg-white">
        {charged.length === 0 ? <li className="px-4 py-10 text-sm text-black/60">No card payments have been recorded yet.</li> : null}
        {charged.map((deal) => (
          <li key={deal.id} className="flex items-center justify-between border-b border-black/10 px-4 py-4 text-sm last:border-b-0">
            <Link href={`/admin/deals/${deal.id}`} className="hover:underline">{deal.business.businessName || deal.business.name} → {deal.athlete?.name ?? "Athlete"}</Link>
            <span className="text-right">
              <span className="block font-semibold">{money(deal.compensationAmount)}</span>
              <span className="text-black/60">{paymentLabel(deal.paymentStatus)}</span>
            </span>
          </li>
        ))}
      </ul>
      <h2 className="mt-10 text-lg font-semibold">Not charged</h2>
      <ul className="mt-3 overflow-hidden rounded-2xl border border-black/10 bg-white">
        {unpaid.length === 0 ? <li className="px-4 py-8 text-sm text-black/60">Every deal has a card charge.</li> : null}
        {unpaid.map((deal) => (
          <li key={deal.id} className="flex items-center justify-between border-b border-black/10 px-4 py-4 text-sm last:border-b-0">
            <Link href={`/admin/deals/${deal.id}`} className="hover:underline">{dealTypeName(deal.dealType)} · {deal.business.businessName || deal.business.name}</Link>
            <span className="text-right">
              <span className="block font-semibold">{money(deal.compensationAmount)}</span>
              <span className="text-black/60">{paymentLabel(deal.paymentStatus)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
