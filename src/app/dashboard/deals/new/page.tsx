import { createDeal } from "@/app/actions/deals";
import { requireUser } from "@/app/actions/auth";
import { AppHeader } from "@/components/app-header";
import { DealForm } from "@/components/deal-form";
import { DEAL_TYPES, PLATFORMS, platformFeePercent } from "@/lib/deals";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewDealPage() {
  const session = await requireUser("business");
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  const fee = user ? platformFeePercent(user.subscriptionPlan, user.subscriptionStatus) : 10;

  return (
    <div className="min-h-full bg-zinc-50 text-black">
      <AppHeader href="/dashboard" label="Deals" />
      <main className="mx-auto max-w-xl px-4 py-10">
        <h1 className="text-3xl font-bold">New deal</h1>
        <p className="mt-2 text-sm text-black/60">
          A {fee}% platform fee comes out of the compensation. The athlete receives the rest. You pay the full amount by card now, and it stays held until you approve the work.
        </p>
        <div className="mt-8 border border-black/10 bg-white p-6">
          <DealForm action={createDeal} submitLabel="Pay and invite" pendingLabel="Opening secure payment…">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Deal type</span>
              <select name="dealType" className="w-full border border-black/20 px-3 py-2" defaultValue="social_post">
                {DEAL_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </label>
            <fieldset>
              <legend className="mb-2 text-sm font-medium">Platforms</legend>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {PLATFORMS.map((platform) => (
                  <label key={platform.id} className="flex items-center gap-2">
                    <input type="checkbox" name={`platform_${platform.id}`} />
                    {platform.name}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Compensation (USD)</span>
              <input name="compensation" type="number" min="1" step="0.01" required className="w-full border border-black/20 px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Deadline</span>
              <input name="deadline" type="date" required className="w-full border border-black/20 px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Athlete email</span>
              <input name="athleteEmail" type="email" required className="w-full border border-black/20 px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Notes</span>
              <textarea name="notes" rows={4} className="w-full border border-black/20 px-3 py-2" />
            </label>
          </DealForm>
        </div>
      </main>
    </div>
  );
}
