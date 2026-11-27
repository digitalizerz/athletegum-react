import Link from "next/link";
import { notFound } from "next/navigation";
import { requestIntro } from "@/app/actions/directory";
import { requireUser } from "@/app/actions/auth";
import { AthleteAvatar } from "@/components/athlete-avatar";
import { directoryLevelLabel, isDirectoryLevel, placeLabel, squadLabel } from "@/lib/directory";
import { levelLabel, profileSlug, socialUrl } from "@/lib/profile";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AthleteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireUser("business");
  const { id } = await params;
  const athlete = await prisma.user.findFirst({ where: { id, role: "athlete", isActive: true } });
  if (!athlete) {
    const listing = await prisma.directoryListing.findUnique({ where: { id } });
    if (!listing || !isDirectoryLevel(listing.level)) notFound();
    const interest = await prisma.introRequest.findFirst({ where: { businessId: session.id, listingId: listing.id } });
    return (
      <div>
        <Link href="/dashboard/athletes" className="text-sm font-semibold text-black/50 hover:text-black">← Athletes</Link>
        <section className="mt-4 rounded-3xl border border-black/10 bg-white p-6">
          <p className="text-sm text-black/50">{[squadLabel(listing.squad), directoryLevelLabel(listing.level)].filter(Boolean).join(" · ")} · Listed by AthleteGum</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{listing.name}</h1>
          <p className="mt-1 text-black/60">{[listing.sport, listing.position, listing.teamOrSchool, placeLabel(listing.city, listing.state)].filter(Boolean).join(" · ")}</p>
          <p className="mt-6 max-w-2xl text-sm leading-6 text-black/70">This athlete does not have an AthleteGum login. Asking for an introduction does not charge a card or send them a deal.</p>
          {interest ? <p className="mt-6 text-sm font-semibold">Interest saved. AthleteGum will follow up.</p> : (
            <form action={requestIntro} className="mt-6 max-w-xl">
              <input type="hidden" name="listingId" value={listing.id} />
              <input type="hidden" name="returnTo" value={`/dashboard/athletes/${listing.id}`} />
              <label className="block text-sm font-medium">Note for AthleteGum
                <textarea name="note" rows={3} className="mt-1 w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none" placeholder="What do you want them for?" />
              </label>
              <button className="mt-3 rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white">I&apos;m interested</button>
            </form>
          )}
        </section>
      </div>
    );
  }
  const highSchool = athlete.athleteLevel === "highschool";
  const interest = highSchool
    ? await prisma.introRequest.findFirst({ where: { businessId: session.id, athleteId: athlete.id } })
    : null;
  const deals = await prisma.deal.count({
    where: { businessId: session.id, athleteId: athlete.id, status: { notIn: ["draft", "cancelled"] } },
  });
  const socials = [
    athlete.instagramHandle ? ["Instagram", socialUrl("instagram", athlete.instagramHandle)] : null,
    athlete.tiktokHandle ? ["TikTok", socialUrl("tiktok", athlete.tiktokHandle)] : null,
    athlete.twitterHandle ? ["X", socialUrl("x", athlete.twitterHandle)] : null,
    athlete.youtubeHandle ? ["YouTube", socialUrl("youtube", athlete.youtubeHandle)] : null,
  ].filter((item): item is [string, string] => item !== null);
  const slug = profileSlug(athlete);

  return (
    <div>
      <Link href="/dashboard/athletes" className="text-sm font-semibold text-black/50 hover:text-black">← Athletes</Link>
      <section className="mt-4 rounded-3xl border border-black/10 bg-white p-6">
        <div className="flex flex-wrap items-center gap-4">
          <AthleteAvatar name={athlete.name} photo={athlete.profilePhoto} size={84} />
          <div>
            <p className="text-sm text-black/50">{levelLabel(athlete.athleteLevel)}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{athlete.name}</h1>
            <p className="mt-1 text-black/60">{[athlete.sport, athlete.school, athlete.city].filter(Boolean).join(" · ")}</p>
          </div>
        </div>
        {athlete.bio ? <p className="mt-6 max-w-2xl text-sm leading-6">{athlete.bio}</p> : null}
        {highSchool ? null : <p className="mt-6 text-sm">Invite by email: {athlete.email}</p>}
        <p className="mt-1 text-sm text-black/50">Deals with your business: {deals}</p>
        {socials.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {socials.map(([label, href]) => (
              <li key={label}><a className="rounded-full bg-zinc-100 px-3 py-1 text-sm" href={href} target="_blank" rel="noreferrer">{label}</a></li>
            ))}
          </ul>
        ) : <p className="mt-4 text-sm text-black/45">No social accounts connected, so there are no follower counts.</p>}
        <div className="mt-6 flex flex-wrap gap-2">
          {highSchool ? (
            interest ? <span className="rounded-full bg-zinc-100 px-4 py-2.5 text-sm font-semibold">Interest saved</span> : (
            <form action={requestIntro}>
              <input type="hidden" name="athleteId" value={athlete.id} />
              <input type="hidden" name="returnTo" value={`/dashboard/athletes/${athlete.id}`} />
              <button className="rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white">I&apos;m interested</button>
            </form>
            )
          ) : (
            <Link href={`/dashboard/deals/new?athlete=${encodeURIComponent(athlete.email)}`} className="rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white">Invite to deal</Link>
          )}
          {slug ? <Link href={`/a/${slug}`} className="rounded-full border border-black/10 px-4 py-2.5 text-sm font-semibold">Public profile</Link> : null}
        </div>
        {highSchool ? <p className="mt-3 text-sm text-black/50">High school athletes are introduction-only. Checkout stays closed.</p> : null}
      </section>
    </div>
  );
}
