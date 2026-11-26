import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteUser, impersonateUser, setUserActive, updateAthlete } from "@/app/actions/admin";
import { requireUser } from "@/app/actions/auth";
import { AdminBack, AdminNotice, fieldClass } from "@/components/admin-ui";
import { dealTypeName, money, statusLabel } from "@/lib/deals";
import { ATHLETE_LEVELS } from "@/lib/profile";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAthletePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireUser("admin");
  const { id } = await params;
  const query = await searchParams;
  const athlete = await prisma.user.findUnique({
    where: { id },
    include: { dealsReceived: { orderBy: { createdAt: "desc" }, include: { business: true } } },
  });
  if (!athlete || athlete.role !== "athlete") notFound();
  const input = fieldClass();

  return (
    <div>
      <AdminBack href="/admin/athletes" label="Athletes" />
      <h1 className="mt-3 text-3xl font-bold">{athlete.name}</h1>
      <p className="mt-2 text-sm text-black/60">{athlete.isActive ? "Visible in the directory." : "Hidden from the directory. Sign-in is blocked."}</p>
      <AdminNotice saved={query.saved === "1" ? "Saved." : query.saved} error={query.error} />
      <div className="mt-6 flex flex-wrap gap-2">
        <form action={setUserActive.bind(null, athlete.id, !athlete.isActive)}>
          <button className="border border-black px-3 py-1.5 text-sm font-semibold">{athlete.isActive ? "Hide profile" : "Show profile"}</button>
        </form>
        {athlete.isActive ? (
          <form action={impersonateUser.bind(null, athlete.id)}>
            <button className="bg-black px-3 py-1.5 text-sm font-semibold text-white">View their portal</button>
          </form>
        ) : null}
        {athlete.username ? <Link href={`/a/${athlete.username}`} className="border border-black px-3 py-1.5 text-sm font-semibold">Public profile</Link> : null}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form action={updateAthlete.bind(null, athlete.id)} className="rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="text-lg font-semibold">Profile</h2>
          <label className="mt-4 block text-sm font-medium">Name<input name="name" defaultValue={athlete.name} className={input} /></label>
          <label className="mt-4 block text-sm font-medium">Email<input name="email" type="email" defaultValue={athlete.email} className={input} /></label>
          <label className="mt-4 block text-sm font-medium">Level
            <select name="athleteLevel" defaultValue={athlete.athleteLevel ?? ""} className={input}>
              <option value="">Not set</option>
              {ATHLETE_LEVELS.map((level) => <option key={level.id} value={level.id}>{level.label}</option>)}
            </select>
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">Sport<input name="sport" defaultValue={athlete.sport ?? ""} className={input} /></label>
            <label className="block text-sm font-medium">School<input name="school" defaultValue={athlete.school ?? ""} className={input} /></label>
          </div>
          <label className="mt-4 block text-sm font-medium">City<input name="city" defaultValue={athlete.city ?? ""} className={input} /></label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">Instagram<input name="instagramHandle" defaultValue={athlete.instagramHandle ?? ""} className={input} /></label>
            <label className="block text-sm font-medium">TikTok<input name="tiktokHandle" defaultValue={athlete.tiktokHandle ?? ""} className={input} /></label>
            <label className="block text-sm font-medium">YouTube<input name="youtubeHandle" defaultValue={athlete.youtubeHandle ?? ""} className={input} /></label>
            <label className="block text-sm font-medium">X<input name="twitterHandle" defaultValue={athlete.twitterHandle ?? ""} className={input} /></label>
          </div>
          <button className="mt-5 bg-black px-4 py-2 text-sm font-semibold text-white">Save changes</button>
        </form>
        <div className="space-y-6">
          <section className="rounded-2xl border border-black/10 bg-white p-5">
            <h2 className="text-lg font-semibold">Deals</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {athlete.dealsReceived.length === 0 ? <li className="text-black/60">No deals.</li> : null}
              {athlete.dealsReceived.map((deal) => (
                <li key={deal.id} className="flex items-start justify-between gap-3">
                  <Link href={`/admin/deals/${deal.id}`} className="font-semibold hover:underline">{dealTypeName(deal.dealType)}</Link>
                  <span className="text-right text-black/60">{money(deal.compensationAmount)}<span className="block">{statusLabel(deal.status)}</span></span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-5 text-black/50">Deleting the account keeps those deals and clears the athlete from them.</p>
          </section>
          <form action={deleteUser.bind(null, athlete.id)} className="rounded-2xl border border-red-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Delete account</h2>
            <p className="mt-2 text-sm text-black/60">Type delete to remove the login. This cannot be undone.</p>
            <input name="confirm" placeholder="delete" className={`${input} mt-3`} />
            <button className="mt-3 text-sm font-semibold text-red-700">Delete athlete</button>
          </form>
        </div>
      </div>
    </div>
  );
}
