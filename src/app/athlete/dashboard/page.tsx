import Link from "next/link";
import { requireUser } from "@/app/actions/auth";
import { AppHeader } from "@/components/app-header";
import { dealTypeName, money, statusLabel } from "@/lib/deals";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AthleteDashboard() {
  const session = await requireUser("athlete");
  const deals = await prisma.deal.findMany({
    where: {
      status: { not: "draft" },
      OR: [
        { athleteId: session.id },
        { invitations: { some: { athleteEmail: session.email, status: "pending" } } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { business: true },
  });
  const notes = await prisma.notification.findMany({
    where: { userId: session.id, readAt: null },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="min-h-full bg-zinc-50 text-black">
      <AppHeader href="/athlete/dashboard" label="Deals" />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-bold">Hello, {session.name}</h1>
        <p className="mt-2 text-black/60">Invitations sent to {session.email} show up here.</p>
        {notes.length > 0 ? (
          <ul className="mt-8 space-y-2">
            {notes.map((note) => (
              <li key={note.id} className="border border-black/10 bg-white px-4 py-3 text-sm">
                <span className="font-semibold">{note.title}.</span> {note.body}
              </li>
            ))}
          </ul>
        ) : null}
        <section className="mt-8 border border-black/10 bg-white">
          {deals.length === 0 ? (
            <p className="px-4 py-10 text-black/60">No deals yet. When a business invites this email, it will land here.</p>
          ) : (
            <ul>
              {deals.map((deal) => (
                <li key={deal.id} className="border-b border-black/10 last:border-b-0">
                  <Link href={`/athlete/deals/${deal.id}`} className="flex items-center justify-between px-4 py-4 hover:bg-zinc-50">
                    <span>
                      <span className="font-semibold">{dealTypeName(deal.dealType)}</span>
                      <span className="mt-1 block text-sm text-black/60">{deal.business.businessName || deal.business.name}</span>
                    </span>
                    <span className="text-right text-sm">
                      <span className="block font-semibold">{money(deal.athleteNetPayout)}</span>
                      <span className="text-black/60">{statusLabel(deal.status)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
