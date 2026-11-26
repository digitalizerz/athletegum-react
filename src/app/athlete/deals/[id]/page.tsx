import { notFound } from "next/navigation";
import { acceptDeal, postMessage, submitDeliverables } from "@/app/actions/deals";
import { requireUser } from "@/app/actions/auth";
import { AppHeader } from "@/components/app-header";
import { DealForm } from "@/components/deal-form";
import { dealTypeName, money, parsePlatforms, statusLabel } from "@/lib/deals";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AthleteDealPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireUser("athlete");
  const { id } = await params;
  const deal = await prisma.deal.findFirst({
    where: {
      id,
      OR: [
        { athleteId: session.id },
        { invitations: { some: { athleteEmail: session.email } } },
      ],
    },
    include: {
      business: true,
      messages: { orderBy: { createdAt: "asc" }, include: { sender: true } },
    },
  });
  if (!deal || deal.status === "draft") notFound();

  const accept = acceptDeal.bind(null, deal.id);
  const submit = submitDeliverables.bind(null, deal.id);
  const message = postMessage.bind(null, deal.id);

  return (
    <div className="min-h-full bg-zinc-50 text-black">
      <AppHeader href="/athlete/dashboard" label="Deals" />
      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-10 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="border border-black/10 bg-white p-6">
          <p className="text-sm text-black/50">{statusLabel(deal.status)}</p>
          <h1 className="mt-2 text-3xl font-bold">{dealTypeName(deal.dealType)}</h1>
          <p className="mt-2 text-black/60">{deal.business.businessName || deal.business.name}</p>
          <p className="mt-4 text-2xl font-semibold">{money(deal.athleteNetPayout)}</p>
          <p className="text-sm text-black/50">Your payout after the platform fee on a {money(deal.compensationAmount)} deal.</p>
          {deal.paymentStatus === "paid_escrowed" ? (
            <p className="mt-2 text-sm text-black/60">
              {deal.status === "approved"
                ? "Approved. The payout stays held until it is sent to you."
                : "The business already paid. Funds stay held until they approve your work."}
            </p>
          ) : null}
          {deal.deadline ? <p className="mt-4 text-sm">Deadline: {deal.deadline.toLocaleDateString()}</p> : null}
          {parsePlatforms(deal.platforms).length > 0 ? <p className="mt-2 text-sm">Platforms: {parsePlatforms(deal.platforms).join(", ")}</p> : null}
          {deal.notes ? <p className="mt-6 whitespace-pre-wrap text-sm">{deal.notes}</p> : null}
          {deal.status === "pending" ? (
            <form action={accept} className="mt-8">
              <button className="bg-black px-4 py-2 text-sm font-semibold text-white">Accept deal</button>
            </form>
          ) : null}
          {deal.status === "accepted" ? (
            <div className="mt-8">
              <DealForm action={submit} submitLabel="Submit deliverables">
                <textarea name="deliverables" required minLength={10} rows={4} placeholder="Links and a short description of the work" className="w-full border border-black/20 px-3 py-2 text-sm" />
              </DealForm>
            </div>
          ) : null}
        </section>
        <section className="border border-black/10 bg-white p-6">
          <h2 className="font-semibold">Messages</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {deal.messages.map((item) => (
              <li key={item.id} className={item.system ? "text-black/50" : ""}>
                <span className="font-medium">{item.system ? "System" : item.sender?.name ?? "Someone"}: </span>
                {item.body}
              </li>
            ))}
          </ul>
          {deal.status !== "pending" ? (
            <div className="mt-6">
              <DealForm action={message} submitLabel="Send" hidden={{ role: "athlete" }}>
                <textarea name="body" rows={3} className="w-full border border-black/20 px-3 py-2 text-sm" />
              </DealForm>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
