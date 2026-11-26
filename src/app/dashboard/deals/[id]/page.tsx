import { notFound } from "next/navigation";
import { approveDeal, postMessage, requestRevisions, startCheckout } from "@/app/actions/deals";
import { requireUser } from "@/app/actions/auth";
import { AppHeader } from "@/components/app-header";
import { DealForm } from "@/components/deal-form";
import { confirmDealCheckout } from "@/lib/escrow";
import { dealTypeName, money, parsePlatforms, paymentLabel, statusLabel } from "@/lib/deals";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BusinessDealPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkout?: string }>;
}) {
  const session = await requireUser("business");
  const { id } = await params;
  const query = await searchParams;
  if (query.checkout === "success") {
    try {
      await confirmDealCheckout(id, session.id);
    } catch (error) {
      console.error(error);
    }
  }
  const deal = await prisma.deal.findFirst({
    where: { id, businessId: session.id },
    include: {
      athlete: true,
      invitations: true,
      messages: { orderBy: { createdAt: "asc" }, include: { sender: true } },
    },
  });
  if (!deal) notFound();

  const invite = deal.invitations[0];
  const pay = startCheckout.bind(null, deal.id);
  const approve = approveDeal.bind(null, deal.id);
  const revisions = requestRevisions.bind(null, deal.id);
  const message = postMessage.bind(null, deal.id);

  return (
    <div className="min-h-full bg-zinc-50 text-black">
      <AppHeader href="/dashboard" label="Deals" />
      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-10 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="border border-black/10 bg-white p-6">
          <p className="text-sm text-black/50">{statusLabel(deal.status)}</p>
          <h1 className="mt-2 text-3xl font-bold">{dealTypeName(deal.dealType)}</h1>
          <p className="mt-4 text-2xl font-semibold">{money(deal.compensationAmount)}</p>
          <p className="mt-1 text-sm text-black/60">
            Platform fee {money(deal.platformFeeAmount)} · Athlete receives {money(deal.athleteNetPayout)}
          </p>
          <dl className="mt-6 space-y-2 text-sm">
            <div>Athlete: {deal.athlete?.name ?? invite?.athleteEmail ?? "Not assigned"}</div>
            <div>
              Payment: {deal.status === "approved" && deal.paymentStatus === "paid_escrowed"
                ? "Approved. Funds stay held until the athlete is paid."
                : paymentLabel(deal.paymentStatus)}
            </div>
            {deal.deadline ? <div>Deadline: {deal.deadline.toLocaleDateString()}</div> : null}
            {parsePlatforms(deal.platforms).length > 0 ? <div>Platforms: {parsePlatforms(deal.platforms).join(", ")}</div> : null}
          </dl>
          {deal.notes ? <p className="mt-6 whitespace-pre-wrap text-sm">{deal.notes}</p> : null}
          {deal.deliverables ? (
            <div className="mt-6 border-t border-black/10 pt-4">
              <h2 className="font-semibold">Deliverables</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm">{deal.deliverables}</p>
            </div>
          ) : null}
          {deal.status === "draft" ? (
            <div className="mt-8 border-t border-black/10 pt-6">
              {query.checkout === "cancel" ? (
                <p className="mb-3 text-sm text-red-600">Payment was canceled. The athlete has not been invited.</p>
              ) : null}
              {query.checkout === "error" ? (
                <p className="mb-3 text-sm text-red-600">Payment could not be started. Try again.</p>
              ) : null}
              <DealForm action={pay} submitLabel={`Pay ${money(deal.compensationAmount)}`} pendingLabel="Opening secure payment…">
                <p className="text-sm text-black/60">The card charge is held until you approve the work.</p>
              </DealForm>
            </div>
          ) : null}
          {deal.status === "completed" ? (
            <div className="mt-8 space-y-6 border-t border-black/10 pt-6">
              <form action={approve}>
                <button className="bg-black px-4 py-2 text-sm font-semibold text-white">Approve work</button>
              </form>
              <DealForm action={revisions} submitLabel="Request revisions">
                <textarea name="revisionNotes" required minLength={10} rows={3} placeholder="What needs to change?" className="w-full border border-black/20 px-3 py-2 text-sm" />
              </DealForm>
            </div>
          ) : null}
        </section>
        <section className="border border-black/10 bg-white p-6">
          <h2 className="font-semibold">Messages</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {deal.messages.map((messageItem) => (
              <li key={messageItem.id} className={messageItem.system ? "text-black/50" : ""}>
                <span className="font-medium">{messageItem.system ? "System" : messageItem.sender?.name ?? "Someone"}: </span>
                {messageItem.body}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <DealForm action={message} submitLabel="Send" hidden={{ role: "business" }}>
              <textarea name="body" rows={3} className="w-full border border-black/20 px-3 py-2 text-sm" />
            </DealForm>
          </div>
        </section>
      </main>
    </div>
  );
}
