import Link from "next/link";
import { postMessage } from "@/app/actions/deals";
import { requireUser } from "@/app/actions/auth";
import { AthleteAvatar } from "@/components/athlete-avatar";
import { DealForm } from "@/components/deal-form";
import { campaignStatus, dealTypeName, money, scheduleLabel } from "@/lib/deals";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BusinessMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ deal?: string; q?: string }>;
}) {
  const session = await requireUser("business");
  const query = await searchParams;
  const q = query.q?.trim() ?? "";
  const deals = await prisma.deal.findMany({
    where: { businessId: session.id, status: { not: "draft" } },
    include: {
      athlete: true,
      invitations: true,
      messages: { orderBy: { createdAt: "asc" }, include: { sender: true } },
    },
  });
  const sorted = [...deals].sort((a, b) => latest(b) - latest(a));
  const visible = sorted.filter((deal) => {
    if (!q) return true;
    const who = party(deal);
    const last = deal.messages.at(-1)?.body ?? "";
    return [who, dealTypeName(deal.dealType), last].join(" ").toLowerCase().includes(q.toLowerCase());
  });
  const selected = visible.find((deal) => deal.id === query.deal) ?? visible[0] ?? null;
  const message = selected ? postMessage.bind(null, selected.id) : null;

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.18em] text-black/40">MESSAGES</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Messages</h1>
      <p className="mt-2 text-black/60">Conversations stay on the deal. Deliverable updates show up in the same thread.</p>

      <section className="mt-6 grid overflow-hidden rounded-3xl border border-black/10 bg-white lg:min-h-[36rem] lg:grid-cols-[20rem_1fr]">
        <div className="border-b border-black/5 lg:border-r lg:border-b-0">
          <form action="/dashboard/messages" className="p-3">
            <input name="q" defaultValue={q} placeholder="Search conversations" className="h-11 w-full rounded-full border border-black/10 px-4 text-sm outline-none" />
          </form>
          {visible.length === 0 ? <p className="px-4 py-8 text-sm text-black/50">No conversations yet. Invite an athlete to a deal and the thread starts here.</p> : (
            <ul>
              {visible.map((deal) => {
                const who = party(deal);
                const last = deal.messages.at(-1);
                const active = selected?.id === deal.id;
                return (
                  <li key={deal.id}>
                    <Link href={`/dashboard/messages?deal=${deal.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={`flex gap-3 px-4 py-3 ${active ? "bg-zinc-100" : "hover:bg-zinc-50"}`}>
                      <AthleteAvatar name={who} photo={deal.athlete?.profilePhoto ?? null} size={40} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate font-semibold">{who}</span>
                          <span className="shrink-0 text-xs text-black/40">{last ? shortWhen(last.createdAt) : ""}</span>
                        </span>
                        <span className="mt-0.5 block truncate text-sm text-black/50">{last?.body ?? "No messages yet."}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {selected && message ? (
          <div className="flex min-h-[28rem] flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-5 py-4">
              <div className="flex items-center gap-3">
                <AthleteAvatar name={party(selected)} photo={selected.athlete?.profilePhoto ?? null} size={44} />
                <div>
                  <p className="font-semibold">{party(selected)}</p>
                  <p className="text-sm text-black/50">{[selected.athlete?.sport, selected.athlete?.school].filter(Boolean).join(" · ") || "Athlete"}</p>
                </div>
              </div>
              <Link href={`/dashboard/deals/${selected.id}`} className="rounded-full border border-black/10 px-3 py-2 text-sm font-semibold">View deal</Link>
            </div>
            <div className="mx-5 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-zinc-50 px-4 py-3 text-sm">
              <span>{dealTypeName(selected.dealType)} · {campaignStatus(selected.status)}</span>
              <span className="font-semibold">{money(selected.compensationAmount)}{selected.startsAt ? ` · Starts ${scheduleLabel(selected.startsAt)}` : ""}{selected.deadline ? ` · Due ${scheduleLabel(selected.deadline)}` : ""}</span>
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
              <DealForm action={message} submitLabel="Send" pendingLabel="Sending…" hidden={{ role: "business" }} className="flex items-end gap-2" buttonClassName="rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                <textarea name="body" rows={2} placeholder={`Message ${party(selected).split(" ")[0]}`} className="min-w-0 flex-1 rounded-2xl border border-black/10 px-3 py-2 text-sm" />
              </DealForm>
            </div>
          </div>
        ) : (
          <p className="grid place-items-center px-6 py-16 text-sm text-black/50">Pick a conversation.</p>
        )}
      </section>
    </div>
  );
}

function party(deal: { athlete: { name: string } | null; invitations: { athleteEmail: string }[] }) {
  return deal.athlete?.name || deal.invitations[0]?.athleteEmail || "Athlete";
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
