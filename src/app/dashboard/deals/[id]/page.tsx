import Link from "next/link";
import { notFound } from "next/navigation";
import { approveDeal, postMessage, requestRevisions, startCheckout } from "@/app/actions/deals";
import { requireUser } from "@/app/actions/auth";
import { AthleteAvatar } from "@/components/athlete-avatar";
import { DealForm } from "@/components/deal-form";
import { confirmDealCheckout } from "@/lib/escrow";
import { DEAL_TYPES, dealTypeName, money, parsePlatforms, PLATFORMS, scheduleLabel } from "@/lib/deals";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "deliverables", label: "Deliverables" },
  { id: "messages", label: "Messages" },
  { id: "activity", label: "Activity" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const STEPS = [
  { id: "progress", label: "In progress" },
  { id: "review", label: "In review" },
  { id: "approved", label: "Approved" },
  { id: "paid", label: "Paid out" },
] as const;

export default async function BusinessDealPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkout?: string; tab?: string }>;
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
      business: true,
      invitations: true,
      messages: { orderBy: { createdAt: "asc" }, include: { sender: true } },
    },
  });
  if (!deal) notFound();

  const tab: TabId = TABS.some((item) => item.id === query.tab) ? (query.tab as TabId) : "overview";
  const invite = deal.invitations[0];
  const athleteName = deal.athlete?.name || invite?.athleteEmail || "the athlete";
  const first = athleteName.split(" ")[0];
  const platforms = parsePlatforms(deal.platforms).map(platformName);
  const type = DEAL_TYPES.find((item) => item.id === deal.dealType);
  const feePercent = deal.compensationAmount > 0 ? Math.round((deal.platformFeeAmount / deal.compensationAmount) * 100) : 0;
  const pay = startCheckout.bind(null, deal.id);
  const approve = approveDeal.bind(null, deal.id);
  const revisions = requestRevisions.bind(null, deal.id);
  const message = postMessage.bind(null, deal.id);
  const businessInitials = (deal.business.businessName || deal.business.name)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div>
      <Link href="/dashboard/deals" className="text-sm font-semibold text-black/50 hover:text-black">← Back to deals</Link>

      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <Link
            key={item.id}
            href={`/dashboard/deals/${deal.id}?tab=${item.id}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === item.id ? "bg-zinc-950 text-white" : "bg-white text-black/60 hover:text-black"}`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {query.checkout === "cancel" ? <p className="mt-4 text-sm text-red-600">Payment was canceled. The athlete has not been invited.</p> : null}
      {query.checkout === "error" ? <p className="mt-4 text-sm text-red-600">Payment could not be started. Try again.</p> : null}

      {tab === "overview" ? (
        <div className="mt-4 space-y-4">
          <section className="grid gap-4 rounded-3xl border border-black/10 bg-white p-4 lg:grid-cols-[16rem_1fr] lg:p-5">
            <div className="relative overflow-hidden rounded-2xl bg-zinc-950">
              <img src="/media/court.jpg" alt="" className="h-52 w-full object-cover lg:h-full" />
              <span className="absolute top-3 right-3 grid h-10 w-10 place-items-center rounded-xl bg-zinc-950 text-xs font-bold text-white">{businessInitials || "AG"}</span>
            </div>
            <div className="py-2">
              <p className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium">{businessStatus(deal.status)}</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight">{dealTypeName(deal.dealType)} campaign</h1>
              <p className="mt-2 max-w-xl text-black/60">{deal.notes || type?.detail || "Deal with an athlete."}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {platforms.map((name) => (
                  <span key={name} className="rounded-full bg-zinc-100 px-3 py-1 text-sm">{name}</span>
                ))}
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm">{type?.name}</span>
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <article className="rounded-3xl border border-black/10 bg-white p-5">
              <p className="text-sm text-black/50">Your charge</p>
              <p className="mt-2 text-4xl font-bold tracking-tight">{money(deal.compensationAmount)}</p>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-black/50">Platform fee ({feePercent}%)</dt>
                  <dd>−{money(deal.platformFeeAmount)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-black/10 pt-3 font-semibold">
                  <dt>Athlete payout</dt>
                  <dd>{money(deal.athleteNetPayout)}</dd>
                </div>
              </dl>
            </article>
            <article className="rounded-3xl border border-black/10 bg-zinc-950 p-5 text-white">
              <p className="text-sm text-white/60">{feePercent}% platform fee</p>
              <p className="mt-3 text-lg font-semibold">{first} receives {money(deal.athleteNetPayout)}.</p>
              <p className="mt-2 text-sm leading-6 text-white/60">The fee comes out of your {money(deal.compensationAmount)} charge. It is not added on top.</p>
            </article>
            <article className="rounded-3xl border border-black/10 bg-white p-5">
              <div className="flex items-center gap-3">
                <AthleteAvatar name={athleteName} photo={deal.athlete?.profilePhoto ?? null} size={48} />
                <div>
                  <p className="font-semibold">{athleteName}</p>
                  <p className="text-sm text-black/50">{[deal.athlete?.sport, deal.athlete?.school].filter(Boolean).join(" · ") || "Athlete"}</p>
                </div>
              </div>
              {deal.athlete ? (
                <Link href={`/dashboard/athletes/${deal.athlete.id}`} className="mt-4 inline-flex text-sm font-semibold">View profile →</Link>
              ) : (
                <p className="mt-4 text-sm text-black/50">Invited at {invite?.athleteEmail}</p>
              )}
            </article>
          </section>

          <section id="details" className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-3xl border border-black/10 bg-white p-5">
              <h2 className="font-semibold">Deal details</h2>
              <dl className="mt-4 divide-y divide-black/5 text-sm">
                <Row label="Athlete" value={athleteName} />
                <Row label="Starts" value={deal.startsAt ? scheduleLabel(deal.startsAt) : "No start time"} />
                <Row label="Deadline" value={deal.deadline ? scheduleLabel(deal.deadline) : "No deadline"} />
                <Row label="Deliverable" value={type ? `${type.name}. ${type.detail}.` : dealTypeName(deal.dealType)} />
                <Row label="Platforms" value={platforms.length ? platforms.join(", ") : "None specified"} />
              </dl>
            </article>
            <article className="rounded-3xl border border-black/10 bg-white p-5">
              <h2 className="font-semibold">Brief</h2>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-black/70">{deal.notes || "No extra notes were added to this deal."}</p>
              <div className="mt-6 border-t border-black/5 pt-4">
                <p className="text-sm font-semibold">Contact</p>
                <p className="mt-1 text-sm text-black/60">{deal.business.businessName || deal.business.name}</p>
                <p className="text-sm text-black/50">{deal.business.email}</p>
                <Link href={`/dashboard/deals/${deal.id}?tab=messages`} className="mt-3 inline-flex rounded-full border border-black/10 px-3 py-1.5 text-sm font-semibold">Message {first}</Link>
              </div>
            </article>
          </section>
        </div>
      ) : null}

      {tab === "deliverables" ? (
        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-black/10 bg-white p-5">
            <h2 className="font-semibold">Requested</h2>
            <p className="mt-3 text-sm leading-6 text-black/70">{deal.notes || type?.detail || "No brief was added."}</p>
            {platforms.length ? <p className="mt-3 text-sm text-black/50">{platforms.join(", ")}</p> : null}
            {deal.startsAt ? <p className="mt-3 text-sm text-black/50">Starts {scheduleLabel(deal.startsAt)}</p> : null}
            {deal.deadline ? <p className="mt-1 text-sm text-black/50">Due {scheduleLabel(deal.deadline)}</p> : null}
          </article>
          <article className="rounded-3xl border border-black/10 bg-white p-5">
            <h2 className="font-semibold">Submitted</h2>
            {deal.deliverables ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{deal.deliverables}</p>
            ) : (
              <p className="mt-3 text-sm text-black/50">
                {deal.status === "accepted"
                  ? `${first} has not submitted the work yet.`
                  : deal.status === "pending"
                    ? "Deliverables open after the athlete accepts."
                    : "Nothing has been submitted."}
              </p>
            )}
          </article>
        </section>
      ) : null}

      {tab === "messages" ? (
        <section className="mt-4 rounded-3xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold">Messages with {first}</h2>
          <ul className="mt-4 space-y-3">
            {deal.messages.length === 0 ? <li className="text-sm text-black/50">No messages yet.</li> : null}
            {deal.messages.map((item) => (
              <li key={item.id} className={item.system ? "text-center text-sm text-black/45" : item.senderId === session.id ? "ml-auto max-w-lg rounded-2xl bg-zinc-950 px-4 py-3 text-sm text-white" : "max-w-lg rounded-2xl border border-black/10 px-4 py-3 text-sm"}>
                {item.system ? (
                  <span>{item.body} · {when(item.createdAt)}</span>
                ) : (
                  <>
                    <span className="block text-xs opacity-60">{item.sender?.name ?? "Someone"} · {when(item.createdAt)}</span>
                    <span className="mt-1 block whitespace-pre-wrap">{item.body}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
          {deal.status === "draft" ? null : (
            <div className="mt-6 border-t border-black/5 pt-4">
              <DealForm
                action={message}
                submitLabel={`Message ${first}`}
                pendingLabel="Sending…"
                hidden={{ role: "business" }}
                buttonClassName="rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                <textarea name="body" rows={3} placeholder={`Write ${first} about this deal`} className="w-full rounded-2xl border border-black/10 px-3 py-2 text-sm" />
              </DealForm>
            </div>
          )}
        </section>
      ) : null}

      {tab === "activity" ? (
        <section className="mt-4 rounded-3xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold">Activity</h2>
          <ol className="mt-4 space-y-4">
            <li className="flex gap-3 text-sm">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-zinc-950" />
              <span>
                <span className="block font-semibold">Deal opened</span>
                <span className="text-black/50">{when(deal.createdAt)} · {money(deal.compensationAmount)} charge, {money(deal.platformFeeAmount)} fee, {money(deal.athleteNetPayout)} athlete payout</span>
              </span>
            </li>
            {deal.messages.map((item) => (
              <li key={item.id} className="flex gap-3 text-sm">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-zinc-300" />
                <span>
                  <span className="block font-semibold">{item.system ? "Update" : item.sender?.name ?? "Message"}</span>
                  <span className="text-black/50">{item.body} · {when(item.createdAt)}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <WorkspaceActions
        status={deal.status}
        paymentStatus={deal.paymentStatus}
        athlete={first}
        charge={deal.compensationAmount}
        fee={deal.platformFeeAmount}
        payout={deal.athleteNetPayout}
        dealId={deal.id}
        approve={approve}
        revisions={revisions}
        pay={pay}
      />
    </div>
  );
}

function WorkspaceActions({
  status,
  paymentStatus,
  athlete,
  charge,
  fee,
  payout,
  dealId,
  approve,
  revisions,
  pay,
}: {
  status: string;
  paymentStatus: string;
  athlete: string;
  charge: number;
  fee: number;
  payout: number;
  dealId: string;
  approve: () => Promise<void>;
  revisions: (prev: { error: string }, formData: FormData) => Promise<{ error: string }>;
  pay: (prev: { error: string }, formData: FormData) => Promise<{ error: string }>;
}) {
  if (status === "cancelled") {
    return <p className="mt-4 rounded-3xl border border-black/10 bg-white px-5 py-4 text-sm text-black/60">This deal was cancelled.</p>;
  }
  if (status === "draft") {
    return (
      <section className="mt-4 rounded-3xl border border-black/10 bg-white p-5">
        <h2 className="font-semibold">Charge the card to invite {athlete}</h2>
        <p className="mt-2 text-sm text-black/60">The {money(charge)} charge is held until you approve the work. {money(fee)} is the platform fee. {athlete} would receive {money(payout)}.</p>
        <div className="mt-4">
          <DealForm action={pay} submitLabel={`Pay ${money(charge)}`} pendingLabel="Opening secure payment…" buttonClassName="rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            <span className="sr-only">Pay</span>
          </DealForm>
        </div>
      </section>
    );
  }

  const current = stepIndex(status, paymentStatus);
  const moneyStates = [
    fundingState(paymentStatus, charge),
    approvalState(status, athlete),
    payoutState(status, paymentStatus, payout, athlete),
  ];

  return (
    <section className="mt-4 rounded-3xl border border-black/10 bg-white p-5">
      <ol className="grid grid-cols-4">
        {STEPS.map((step, index) => {
          const reached = index <= current;
          return (
            <li key={step.id} className="relative text-center">
              {index > 0 ? <span className={`absolute top-2 right-1/2 left-0 h-0.5 ${index <= current ? "bg-zinc-950" : "bg-zinc-200"}`} /> : null}
              <span className={`relative mx-auto grid h-4 w-4 place-items-center rounded-full ${reached ? "bg-zinc-950" : "border border-zinc-300 bg-white"}`}>
                {reached ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
              </span>
              <span className={`mt-2 block text-xs ${reached ? "font-semibold" : "text-black/40"}`}>{step.label}</span>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {moneyStates.map((item) => (
          <div key={item.title} className="rounded-2xl bg-zinc-50 px-4 py-3">
            <p className="text-xs font-semibold tracking-wide text-black/40">{item.title}</p>
            <p className="mt-1 font-semibold">{item.label}</p>
            <p className="mt-1 text-sm text-black/50">{item.detail}</p>
          </div>
        ))}
      </div>

      {status === "pending" ? <p className="mt-5 text-sm text-black/60">Waiting for {athlete} to accept. You review the work after they submit it.</p> : null}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {status === "accepted" || status === "pending" ? (
          <>
            <Link href={`/dashboard/deals/${dealId}?tab=deliverables`} className="rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white">View deliverables</Link>
            <Link href={`/dashboard/deals/${dealId}?tab=messages`} className="rounded-full border border-black/10 px-4 py-2.5 text-sm font-semibold">Message {athlete}</Link>
            <Link href={`/dashboard/deals/${dealId}?tab=overview#details`} className="rounded-full border border-black/10 px-4 py-2.5 text-sm font-semibold">Manage deal</Link>
          </>
        ) : null}
        {status === "completed" ? (
          <>
            <Link href={`/dashboard/deals/${dealId}?tab=deliverables`} className="rounded-full border border-black/10 px-4 py-2.5 text-sm font-semibold">Preview deliverables</Link>
            <form action={approve}>
              <button className="rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white">Approve work</button>
            </form>
          </>
        ) : null}
        {status === "approved" ? (
          <>
            <Link href={`/dashboard/deals/${dealId}?tab=deliverables`} className="rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white">View deliverables</Link>
            <Link href={`/dashboard/deals/${dealId}?tab=overview`} className="rounded-full border border-black/10 px-4 py-2.5 text-sm font-semibold">Transaction details</Link>
          </>
        ) : null}
      </div>

      {status === "completed" ? (
        <div className="mt-4 max-w-xl">
          <DealForm
            action={revisions}
            submitLabel="Request revisions"
            className="space-y-3"
            buttonClassName="rounded-full border border-black/10 px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            <textarea name="revisionNotes" required minLength={10} rows={3} placeholder={`Tell ${athlete} what to change`} className="w-full rounded-2xl border border-black/10 px-3 py-2 text-sm" />
          </DealForm>
        </div>
      ) : null}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-black/45">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function stepIndex(status: string, paymentStatus: string) {
  if (paymentStatus === "released" && status === "approved") return 3;
  if (status === "approved") return 2;
  if (status === "completed") return 1;
  if (status === "accepted") return 0;
  return -1;
}

function fundingState(paymentStatus: string, charge: number) {
  if (paymentStatus === "released") return { title: "Funded", label: "Collected", detail: `${money(charge)} was charged to your card.` };
  if (paymentStatus === "paid_escrowed") return { title: "Funded", label: "Held", detail: `${money(charge)} is charged and held until you approve the work.` };
  if (paymentStatus === "failed") return { title: "Funded", label: "Failed", detail: "The card charge did not go through." };
  return { title: "Funded", label: "Not charged", detail: `${money(charge)} has not been charged on this deal.` };
}

function approvalState(status: string, athlete: string) {
  if (status === "approved") return { title: "Approved", label: "Approved", detail: "You approved the work." };
  if (status === "completed") return { title: "Approved", label: "Ready to review", detail: `${athlete} submitted the work.` };
  return { title: "Approved", label: "Not yet", detail: `Approve after ${athlete} submits the work.` };
}

function payoutState(status: string, paymentStatus: string, payout: number, athlete: string) {
  if (paymentStatus === "released") return { title: "Paid out", label: "Sent", detail: `${money(payout)} was sent to ${athlete}.` };
  if (status === "approved" && paymentStatus === "paid_escrowed") {
    return { title: "Paid out", label: "Processing", detail: `${money(payout)} stays held until the athlete's payout account can receive it.` };
  }
  if (status === "approved") return { title: "Paid out", label: "Nothing to send", detail: "The work is approved, but the card was not charged." };
  return { title: "Paid out", label: "Not sent", detail: `${athlete} is paid ${money(payout)} after you approve the work.` };
}

function businessStatus(status: string) {
  switch (status) {
    case "draft":
      return "Not charged";
    case "pending":
      return "Waiting for athlete";
    case "accepted":
      return "In progress";
    case "completed":
      return "In review";
    case "approved":
      return "Approved";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

function platformName(id: string) {
  return PLATFORMS.find((item) => item.id === id)?.name ?? id;
}

function when(date: Date) {
  return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
