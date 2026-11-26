import Link from "next/link";
import { notFound } from "next/navigation";
import { archiveDeal, cancelDeal, restoreDeal } from "@/app/actions/admin";
import { requireUser } from "@/app/actions/auth";
import { AdminBack, AdminNotice, PaymentPill, StatusPill, adminHref, ago, fieldClass } from "@/components/admin-ui";
import { campaignStatus, dealTypeName, fundingLabel, money, parsePlatforms, PLATFORMS, scheduleLabel } from "@/lib/deals";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "messages", label: "Messages" },
  { id: "activity", label: "Activity" },
  { id: "payments", label: "Payments" },
] as const;

export default async function AdminDealPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string; saved?: string; error?: string }> }) {
  await requireUser("admin");
  const { id } = await params;
  const query = await searchParams;
  const tab = TABS.some((item) => item.id === query.tab) ? query.tab! : "overview";
  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      business: true,
      athlete: true,
      messages: { orderBy: { createdAt: "asc" }, include: { sender: true } },
    },
  });
  if (!deal) notFound();
  const logs = await prisma.auditLog.findMany({ where: { entityType: "deal", entityId: id }, orderBy: { createdAt: "asc" }, include: { admin: true } });
  const platforms = parsePlatforms(deal.platforms).map((item) => PLATFORMS.find((platform) => platform.id === item)?.name ?? item);
  const input = fieldClass();
  const finished = deal.status === "cancelled" || deal.status === "approved" || deal.paymentStatus === "released";
  const held = deal.paymentStatus === "paid_escrowed";

  return (
    <div>
      <AdminBack href="/admin/deals" label="Deals" />
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{dealTypeName(deal.dealType)}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            <Link href={`/admin/businesses/${deal.businessId}`} className="hover:underline">{deal.business.businessName || deal.business.name}</Link>
            {" × "}
            {deal.athlete ? <Link href={`/admin/athletes/${deal.athleteId}`} className="hover:underline">{deal.athlete.name}</Link> : "Unassigned"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-sm ring-1 ring-black/10"><StatusPill status={deal.status} archived={Boolean(deal.archivedAt)} /></span>
          <span className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-sm ring-1 ring-black/10"><PaymentPill status={deal.paymentStatus} /></span>
        </div>
      </div>
      <AdminNotice saved={query.saved} error={query.error} />
      <div className="mt-6 flex flex-wrap gap-2 border-b border-black/10">
        {TABS.map((item) => (
          <Link key={item.id} href={adminHref(`/admin/deals/${id}`, { tab: item.id === "overview" ? undefined : item.id })} className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${tab === item.id ? "border-black text-black" : "border-transparent text-zinc-500"}`}>
            {item.label}{item.id === "messages" ? ` (${deal.messages.length})` : ""}
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          {tab === "overview" ? <Overview deal={deal} platforms={platforms} /> : null}
          {tab === "messages" ? <Messages messages={deal.messages} /> : null}
          {tab === "activity" ? <Activity deal={deal} logs={logs} /> : null}
          {tab === "payments" ? <Payments deal={deal} /> : null}
        </div>
        <aside className="space-y-4">
          <form action={cancelDeal.bind(null, deal.id)} className="rounded-2xl border border-black/10 bg-white p-5">
            <h2 className="font-semibold">Actions</h2>
            <p className="mt-2 text-sm text-zinc-500">
              {finished ? "This deal is finished or the charge has already been released." : held ? "Cancelling changes the deal status only. The card charge stays held. Refunds are not connected." : "Cancelling changes the deal status only. Nothing has been charged."}
            </p>
            {finished ? null : (
              <>
                <label className="mt-3 block text-sm font-medium">Reason, optional<textarea name="reason" rows={3} className={input} /></label>
                <button className="mt-3 w-full rounded-xl border border-black px-3 py-2 text-sm font-semibold">Cancel deal</button>
              </>
            )}
          </form>
          <section className="rounded-2xl border border-black/10 bg-white p-5 text-sm">
            <h2 className="font-semibold">Record</h2>
            <p className="mt-2 text-zinc-500">Funding is recorded only when Stripe confirms the charge. An admin cannot mark a deal funded.</p>
            {deal.stripePaymentIntentId ? <p className="mt-3 break-all text-xs text-zinc-500">Payment {deal.stripePaymentIntentId}</p> : <p className="mt-3 text-xs text-zinc-400">No Stripe payment on this deal.</p>}
          </section>
          {deal.archivedAt ? (
            <form action={restoreDeal.bind(null, deal.id)} className="rounded-2xl border border-black/10 bg-white p-5">
              <h2 className="font-semibold">Archived</h2>
              <p className="mt-2 text-sm text-zinc-500">Archived {scheduleLabel(deal.archivedAt)}. The messages and payment record were kept.</p>
              <button className="mt-3 text-sm font-semibold">Restore to the active list</button>
            </form>
          ) : (
            <form action={archiveDeal.bind(null, deal.id)} className="rounded-2xl border border-red-200 bg-white p-5">
              <h2 className="font-semibold text-red-700">Archive deal</h2>
              <p className="mt-2 text-sm text-zinc-500">Removes it from the active list. The deal, its messages, and any charge stay on the record.</p>
              <button className="mt-3 text-sm font-semibold text-red-700">Archive deal</button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}

function Overview({ deal, platforms }: { deal: DealView; platforms: string[] }) {
  return (
    <>
      <section className="rounded-2xl border border-black/10 bg-white p-5">
        <h2 className="font-semibold">Deal details</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-zinc-400">Business</dt><dd className="mt-1 font-medium">{deal.business.businessName || deal.business.name}</dd></div>
          <div><dt className="text-zinc-400">Deal type</dt><dd className="mt-1 font-medium">{dealTypeName(deal.dealType)}</dd></div>
          <div><dt className="text-zinc-400">Athlete</dt><dd className="mt-1 font-medium">{deal.athlete?.name ?? "Unassigned"}</dd></div>
          <div><dt className="text-zinc-400">Platforms</dt><dd className="mt-1 font-medium">{platforms.length ? platforms.join(", ") : "None"}</dd></div>
          <div className="sm:col-span-2"><dt className="text-zinc-400">Description</dt><dd className="mt-1 whitespace-pre-wrap">{deal.notes || "No description."}</dd></div>
          <div><dt className="text-zinc-400">Starts</dt><dd className="mt-1">{deal.startsAt ? scheduleLabel(deal.startsAt) : "No start time"}</dd></div>
          <div><dt className="text-zinc-400">Deadline</dt><dd className="mt-1">{deal.deadline ? scheduleLabel(deal.deadline) : "No deadline"}</dd></div>
        </dl>
      </section>
      <section className="rounded-2xl border border-black/10 bg-white p-5">
        <h2 className="font-semibold">Financials</h2>
        <p className="mt-1 text-sm text-zinc-500">These amounts are stored on the deal. Payment status says whether the card was actually charged.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Amount label="Total amount" value={money(deal.compensationAmount)} />
          <Amount label="Platform fee" value={money(deal.platformFeeAmount)} />
          <Amount label="Athlete receives" value={money(deal.athleteNetPayout)} />
        </div>
      </section>
      <section className="rounded-2xl border border-black/10 bg-white p-5">
        <h2 className="font-semibold">Progress</h2>
        <p className="mt-1 text-sm text-zinc-500">This follows the deal. The card charge is separate and is not a step here.</p>
        <ol className="mt-5 grid gap-4 sm:grid-cols-5">
          {progress(deal.status).map((step) => (
            <li key={step.label}>
              <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${step.state === "done" ? "bg-emerald-500 text-white" : step.state === "current" ? "bg-blue-500 text-white" : "bg-zinc-200 text-zinc-500"}`}>{step.state === "done" ? "✓" : ""}</span>
              <p className="mt-2 text-sm font-medium">{step.label}</p>
            </li>
          ))}
        </ol>
        {deal.deliverables ? <p className="mt-4 whitespace-pre-wrap border-t border-black/10 pt-4 text-sm"><span className="block text-zinc-400">Submitted work</span>{deal.deliverables}</p> : null}
      </section>
    </>
  );
}

function Messages({ messages }: { messages: DealView["messages"] }) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5">
      <h2 className="font-semibold">Messages</h2>
      <p className="mt-1 text-sm text-zinc-500">Read only. Admins do not send messages on a deal.</p>
      <ul className="mt-4 space-y-3">
        {messages.length === 0 ? <li className="text-sm text-zinc-500">No messages.</li> : null}
        {messages.map((message) => (
          <li key={message.id} className={message.system ? "text-center text-xs text-zinc-500" : "rounded-xl bg-zinc-100 px-3 py-2 text-sm"}>
            {message.system ? null : <span className="block text-xs font-semibold">{message.sender?.name ?? "Unknown"}</span>}
            <span className="whitespace-pre-wrap">{message.body}</span>
            <span className="mt-1 block text-[11px] text-zinc-400">{ago(message.createdAt)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Activity({ deal, logs }: { deal: DealView; logs: { id: string; summary: string; createdAt: Date; admin: { name: string } | null }[] }) {
  const events = [
    { id: "opened", at: deal.createdAt, title: "Deal opened", detail: campaignStatus(deal.status) },
    ...deal.messages.map((message) => ({ id: message.id, at: message.createdAt, title: message.system ? message.body : `${message.sender?.name ?? "Someone"} sent a message`, detail: message.system ? "" : message.body })),
    ...logs.map((log) => ({ id: log.id, at: log.createdAt, title: log.summary, detail: log.admin?.name ?? "Admin" })),
  ].sort((a, b) => a.at.getTime() - b.at.getTime());
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5">
      <h2 className="font-semibold">Activity</h2>
      <ul className="mt-4 space-y-4">
        {events.map((event) => (
          <li key={event.id} className="flex items-start justify-between gap-4 text-sm">
            <span>
              <span className="block font-medium">{event.title}</span>
              {event.detail ? <span className="text-zinc-500">{event.detail}</span> : null}
            </span>
            <span className="shrink-0 text-xs text-zinc-400">{ago(event.at)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Payments({ deal }: { deal: DealView }) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5">
      <h2 className="font-semibold">Payment</h2>
      <p className="mt-1 text-sm text-zinc-500">{fundingLabel(deal.paymentStatus)}. This is independent of {campaignStatus(deal.status).toLowerCase()}.</p>
      <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        <div><dt className="text-zinc-400">Charge</dt><dd className="mt-1 font-semibold">{money(deal.compensationAmount)}</dd></div>
        <div><dt className="text-zinc-400">Charged at</dt><dd className="mt-1">{deal.paidAt ? scheduleLabel(deal.paidAt) : "Not charged"}</dd></div>
        <div><dt className="text-zinc-400">Platform fee</dt><dd className="mt-1">{money(deal.platformFeeAmount)}</dd></div>
        <div><dt className="text-zinc-400">Athlete receives</dt><dd className="mt-1">{money(deal.athleteNetPayout)}</dd></div>
      </dl>
      <p className="mt-4 text-sm text-zinc-500">An admin cannot mark this funded, refund it, or release the payout from here. Those happen only from a confirmed Stripe event.</p>
    </section>
  );
}

function Amount({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-zinc-50 px-3 py-3"><p className="text-xs text-zinc-400">{label}</p><p className="mt-1 text-lg font-semibold">{value}</p></div>;
}

function progress(status: string) {
  const labels = ["Invitation sent", "Accepted", "In progress", "In review", "Approved"];
  const index = status === "draft" || status === "pending" ? 0 : status === "accepted" ? 2 : status === "completed" ? 3 : status === "approved" ? 4 : status === "cancelled" ? -1 : 0;
  return labels.map((label, step) => ({
    label,
    state: index < 0 ? "upcoming" : step < index ? "done" : step === index ? "current" : "upcoming",
  }));
}

type DealView = {
  dealType: string;
  status: string;
  paymentStatus: string;
  compensationAmount: number;
  platformFeeAmount: number;
  athleteNetPayout: number;
  notes: string | null;
  deliverables: string | null;
  startsAt: Date | null;
  deadline: Date | null;
  paidAt: Date | null;
  createdAt: Date;
  business: { businessName: string | null; name: string };
  athlete: { name: string } | null;
  messages: { id: string; body: string; system: boolean; createdAt: Date; sender: { name: string } | null }[];
};
