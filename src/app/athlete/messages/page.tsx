import Link from "next/link";
import { postMessage } from "@/app/actions/deals";
import { requireUser } from "@/app/actions/auth";
import { DealForm } from "@/components/deal-form";
import { campaignStatus, dealTypeName, money, scheduleLabel } from "@/lib/deals";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AthleteMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ deal?: string; q?: string }>;
}) {
  const session = await requireUser("athlete");
  const query = await searchParams;
  const q = query.q?.trim() ?? "";
  const deals = await prisma.deal.findMany({
    where: {
      status: { not: "draft" },
      OR: [{ athleteId: session.id }, { invitations: { some: { athleteEmail: session.email } } }],
    },
    include: {
      business: true,
      messages: { orderBy: { createdAt: "asc" }, include: { sender: true } },
    },
  });
  const sorted = [...deals].sort((a, b) => latest(b) - latest(a));
  const visible = sorted.filter((deal) => {
    if (!q) return true;
    const company = deal.business.businessName || deal.business.name;
    const last = deal.messages.at(-1)?.body ?? "";
    return [company, dealTypeName(deal.dealType), last].join(" ").toLowerCase().includes(q.toLowerCase());
  });
  const selected = visible.find((deal) => deal.id === query.deal) ?? visible[0] ?? null;
  const message = selected && selected.status !== "pending" ? postMessage.bind(null, selected.id) : null;

  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight">Messages</h1>
      <p className="mt-2 text-black/60">Conversations with businesses stay on the deal.</p>

      <section className="mt-6 grid overflow-hidden rounded-3xl border border-black/10 bg-white lg:min-h-[36rem] lg:grid-cols-[20rem_1fr]">
        <div className="border-b border-black/5 lg:border-r lg:border-b-0">
          <form action="/athlete/messages" className="p-3">
            <input name="q" defaultValue={q} placeholder="Search conversations" className="h-11 w-full rounded-full border border-black/10 px-4 text-sm outline-none" />
          </form>
          {visible.length === 0 ? <p className="px-4 py-8 text-sm text-black/50">No conversations yet. A thread starts when a business invites you to a deal.</p> : (
            <ul>
              {visible.map((deal) => {
                const company = deal.business.businessName || deal.business.name;
                const last = deal.messages.at(-1);
                const active = selected?.id === deal.id;
                return (
                  <li key={deal.id}>
                    <Link href={`/athlete/messages?deal=${deal.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={`flex gap-3 px-4 py-3 ${active ? "bg-zinc-100" : "hover:bg-zinc-50"}`}>
                      <Mark name={company} photo={deal.business.profilePhoto} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate font-semibold">{company}</span>
                          <span className="shrink-0 text-xs text-black/40">{last ? shortWhen(last.createdAt) : ""}</span>
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-black/40">{money(deal.athleteNetPayout)} · {dealTypeName(deal.dealType)}</span>
                        <span className="mt-0.5 block truncate text-sm text-black/50">{last?.body ?? "No messages yet."}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {selected ? (
          <div className="flex min-h-[28rem] flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-5 py-4">
              <div className="flex items-center gap-3">
                <Mark name={selected.business.businessName || selected.business.name} photo={selected.business.profilePhoto} />
                <div>
                  <p className="font-semibold">{selected.business.businessName || selected.business.name}</p>
                  <p className="text-sm text-black/50">{dealTypeName(selected.dealType)} · {money(selected.athleteNetPayout)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold">{athleteStatus(selected.status)}</span>
                <Link href={`/athlete/deals/${selected.id}`} className="rounded-full border border-black/10 px-3 py-2 text-sm font-semibold">View deal</Link>
              </div>
            </div>
            <div className="mx-5 mt-4 rounded-2xl border border-black/10 p-4">
              <p className="text-xs font-semibold tracking-[0.14em] text-black/40">DEAL</p>
              <p className="mt-1 font-semibold">{dealTypeName(selected.dealType)}</p>
              {selected.notes ? <p className="mt-1 text-sm text-black/60">{selected.notes}</p> : null}
              <p className="mt-3 text-sm text-black/60">
                {selected.startsAt ? `Starts ${scheduleLabel(selected.startsAt)} · ` : ""}
                {selected.deadline ? `Due ${scheduleLabel(selected.deadline)} · ` : ""}
                {money(selected.athleteNetPayout)} your share
              </p>
            </div>
            <ul className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {selected.messages.map((item) => (
                <li key={item.id} className={item.system ? "text-center text-xs text-black/45" : item.senderId === session.id ? "ml-auto max-w-md rounded-2xl bg-zinc-950 px-4 py-3 text-sm text-white" : "max-w-md rounded-2xl bg-zinc-100 px-4 py-3 text-sm"}>
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
            <div className="border-t border-black/5 px-5 py-4">
              {message ? (
                <DealForm action={message} submitLabel="Send" pendingLabel="Sending…" hidden={{ role: "athlete" }} className="flex items-end gap-2" buttonClassName="rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                  <textarea name="body" rows={2} placeholder="Type a message" className="min-w-0 flex-1 rounded-2xl border border-black/10 px-3 py-2 text-sm" />
                </DealForm>
              ) : (
                <p className="text-sm text-black/50">Accept the invitation before sending a message.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="grid place-items-center px-6 py-16 text-sm text-black/50">Pick a conversation.</p>
        )}
      </section>
    </div>
  );
}

function athleteStatus(status: string) {
  if (status === "pending") return "Invited";
  return campaignStatus(status);
}

function Mark({ name, photo }: { name: string; photo: string | null }) {
  if (photo) return <img src={photo} alt="" className="h-10 w-10 rounded-2xl object-cover" />;
  const letters = name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "AG";
  return <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-zinc-950 text-xs font-bold text-white">{letters}</span>;
}

function latest(deal: { messages: { createdAt: Date }[]; updatedAt: Date }) {
  return deal.messages.at(-1)?.createdAt.getTime() ?? deal.updatedAt.getTime();
}

function when(date: Date) {
  return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function shortWhen(date: Date) {
  const hours = (Date.now() - date.getTime()) / 36e5;
  if (hours < 24) return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
