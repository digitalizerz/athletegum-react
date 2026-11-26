import Link from "next/link";
import { requireUser } from "@/app/actions/auth";
import { AppHeader } from "@/components/app-header";
import { dealTypeName, maxActiveDeals, money, statusLabel } from "@/lib/deals";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BusinessDashboard() {
  const session = await requireUser("business");
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  const deals = await prisma.deal.findMany({
    where: { businessId: session.id },
    orderBy: { createdAt: "desc" },
    include: { athlete: true },
  });
  const notifications = await prisma.notification.findMany({
    where: { userId: session.id, readAt: null },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  const limit = user ? maxActiveDeals(user.subscriptionPlan, user.subscriptionStatus) : 3;
  const active = deals.filter((deal) => ["pending", "accepted", "completed"].includes(deal.status)).length;

  return (
    <div className="min-h-full bg-zinc-50 text-black">
      <AppHeader href="/dashboard" label="Deals" />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Hello, {user?.businessName || session.name}</h1>
            <p className="mt-2 text-black/60">
              Free plan. {active} of {limit ?? "unlimited"} active deals.
            </p>
          </div>
          <Link href="/dashboard/deals/new" className="bg-black px-4 py-2 text-sm font-semibold text-white">New deal</Link>
        </div>

        {notifications.length > 0 ? (
          <ul className="mt-8 space-y-2">
            {notifications.map((note) => (
              <li key={note.id} className="border border-black/10 bg-white px-4 py-3 text-sm">
                <span className="font-semibold">{note.title}.</span> {note.body}
              </li>
            ))}
          </ul>
        ) : null}

        <section className="mt-8 border border-black/10 bg-white">
          {deals.length === 0 ? (
            <p className="px-4 py-10 text-black/60">No deals yet. Create one and invite an athlete by email.</p>
          ) : (
            <ul>
              {deals.map((deal) => (
                <li key={deal.id} className="border-b border-black/10 last:border-b-0">
                  <Link href={`/dashboard/deals/${deal.id}`} className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-zinc-50">
                    <span>
                      <span className="font-semibold">{dealTypeName(deal.dealType)}</span>
                      <span className="mt-1 block text-sm text-black/60">{deal.athlete?.name ?? deal.status}</span>
                    </span>
                    <span className="text-right text-sm">
                      <span className="block font-semibold">{money(deal.compensationAmount)}</span>
                      <span className="text-black/60">{statusLabel(deal.status)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <p className="mt-6 text-sm text-black/50">The card charge is held until you approve the work. Sending the athlete their payout is the next step.</p>
      </main>
    </div>
  );
}
