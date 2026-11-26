import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/brand";
import { dealTypeName } from "@/lib/deals";
import { levelLabel, socialUrl } from "@/lib/profile";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Props = { params: Promise<{ username: string }> };

async function findAthlete(identifier: string) {
  return prisma.user.findFirst({
    where: {
      role: "athlete",
      isActive: true,
      OR: [{ username: identifier }, { profileToken: identifier }],
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const athlete = await findAthlete(username);
  return { title: athlete ? `${athlete.name} — AthleteGum` : "Athlete — AthleteGum" };
}

export default async function PublicAthletePage({ params }: Props) {
  const { username } = await params;
  const athlete = await findAthlete(username);
  if (!athlete) notFound();

  const completed = await prisma.deal.findMany({
    where: { athleteId: athlete.id, status: "approved" },
    include: { business: true },
    orderBy: { updatedAt: "desc" },
  });
  const businesses = [...new Map(completed.map((deal) => [deal.businessId, deal.business])).values()];
  const dealTypes = [...new Set(completed.map((deal) => deal.dealType))];
  const socials = [
    athlete.instagramHandle ? ["Instagram", `@${athlete.instagramHandle}`, socialUrl("instagram", athlete.instagramHandle), "instagram"] : null,
    athlete.tiktokHandle ? ["TikTok", `@${athlete.tiktokHandle}`, socialUrl("tiktok", athlete.tiktokHandle), "tiktok"] : null,
    athlete.youtubeHandle ? ["YouTube", athlete.youtubeHandle, socialUrl("youtube", athlete.youtubeHandle), "youtube"] : null,
    athlete.twitterHandle ? ["X", `@${athlete.twitterHandle}`, socialUrl("x", athlete.twitterHandle), "x"] : null,
  ].filter((item): item is [string, string, string, SocialKind] => item !== null);

  const session = await getSession();
  const ownProfile = session?.role === "athlete" && session.id === athlete.id;
  const dealPath = `/dashboard/deals/new?athlete=${encodeURIComponent(athlete.email)}`;
  const workHref = ownProfile ? "/athlete/profile" : session?.role === "business" ? dealPath : `/login?next=${encodeURIComponent(dealPath)}`;
  const workLabel = ownProfile ? "Edit profile" : `Work with ${firstName(athlete.name)}`;
  const level = levelLabel(athlete.athleteLevel);
  const eyebrow = level === "Athlete" ? "ATHLETE" : `${level.toUpperCase()} ATHLETE`;
  const meta = [athlete.sport, [athlete.school, athlete.city].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ");
  const facts = [
    { label: "Sport", value: athlete.sport || "—" },
    { label: "School", value: athlete.school || "—" },
    { label: "City", value: athlete.city || "—" },
    { label: "Brand deals", value: completed.length ? String(completed.length) : "Open" },
  ];

  return (
    <div className="min-h-full bg-white text-zinc-950">
      <header className="bg-black text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
          <Link href="/"><Logo /></Link>
          <nav className="hidden items-center gap-8 text-sm text-white/80 md:flex">
            <Link href="/how-it-works" className="hover:text-white">How it works</Link>
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
            <Link href="/about" className="hover:text-white">About</Link>
          </nav>
          <Link href={workHref} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
            {workLabel}
          </Link>
        </div>
      </header>

      <section className="bg-black text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-white/60">{eyebrow}</p>
            <h1 className="mt-4 text-5xl font-bold tracking-tight sm:text-7xl">{athlete.name}</h1>
            <p className="mt-5 text-lg text-white/80">{meta || "Athlete on AthleteGum"}</p>
            {athlete.bio ? <p className="mt-6 max-w-xl text-base leading-7 text-white/70">{athlete.bio}</p> : null}
            <div className="mt-8">
              <Link href={workHref} className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">
                {ownProfile ? "Edit profile" : `${workLabel} →`}
              </Link>
            </div>
          </div>
          {athlete.profilePhoto ? (
            <img src={athlete.profilePhoto} alt="" className="h-[420px] w-full rounded-[28px] object-cover" />
          ) : (
            <div className="grid h-[280px] place-items-center rounded-[28px] bg-zinc-900 text-8xl font-bold text-white/90 sm:h-[420px]">
              {athlete.name.trim().charAt(0).toUpperCase() || "A"}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto -mt-8 max-w-5xl px-6">
        <ul className="grid grid-cols-2 overflow-hidden rounded-[28px] bg-zinc-950 text-white md:grid-cols-4">
          {facts.map((fact) => (
            <li key={fact.label} className="border-white/10 px-5 py-6 md:border-l md:first:border-l-0">
              <p className="text-2xl font-bold tracking-tight">{fact.value}</p>
              <p className="mt-1 text-xs text-white/50">{fact.label}</p>
            </li>
          ))}
        </ul>
      </div>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">About {firstName(athlete.name)}</h2>
          {athlete.bio ? <p className="mt-4 max-w-md leading-7 text-black/70">{athlete.bio}</p> : <p className="mt-4 text-black/60">Open to NIL deals with a clear scope and deadline.</p>}
          <ul className="mt-8 space-y-3 text-sm">
            {athlete.city ? <li>{athlete.city}</li> : null}
            {athlete.school ? <li>{athlete.school}</li> : null}
            <li>{level}</li>
            {athlete.sport ? <li>{athlete.sport}</li> : null}
          </ul>
        </div>
        {completed.length > 0 ? (
          <div>
            <p className="text-sm font-semibold">Worked with</p>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {businesses.slice(0, 6).map((business) => (
                <li key={business.id} className="flex h-20 items-center justify-center rounded-2xl bg-zinc-100 px-3 text-center text-sm font-semibold">
                  {business.businessName || business.name}
                </li>
              ))}
            </ul>
            <ul className="mt-4 flex flex-wrap gap-2">
              {dealTypes.map((type) => (
                <li key={type} className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-semibold text-white">{dealTypeName(type)}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="grid min-h-56 place-items-center rounded-[28px] bg-zinc-100 px-8 text-center">
            <p className="max-w-sm text-lg font-medium">Ready for a first brand partnership.</p>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid overflow-hidden rounded-[28px] bg-zinc-950 text-white lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-8 sm:p-12">
            <h2 className="text-4xl font-bold tracking-tight">Partner with {firstName(athlete.name)}</h2>
            <p className="mt-4 max-w-md leading-7 text-white/70">
              {ownProfile
                ? "This is the page brands open from your link. They can start a deal from here."
                : "Send a deal for a post, video, appearance, or a custom campaign. You pay when the deal is created, and the payout stays held until you approve the work."}
            </p>
            <Link href={workHref} className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">
              {ownProfile ? "Edit profile" : "Send a deal request →"}
            </Link>
          </div>
          <img src="/media/court.jpg" alt="" className="h-56 w-full object-cover lg:h-full" />
        </div>
      </section>

      {socials.length > 0 ? (
        <section className="border-t border-black/10">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center">
            <h2 className="text-2xl font-bold">Connect</h2>
            <ul className="flex flex-1 flex-wrap items-center gap-x-8 gap-y-3 text-sm">
              {socials.map(([label, handle, href, kind]) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-medium hover:underline">
                    <SocialIcon kind={kind} />
                    {handle}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

type SocialKind = "instagram" | "tiktok" | "youtube" | "x";

function SocialIcon({ kind }: { kind: SocialKind }) {
  const common = { viewBox: "0 0 24 24", className: "h-4 w-4", fill: "currentColor", "aria-hidden": true };
  if (kind === "instagram") {
    return (
      <svg {...common}>
        <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 4.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm6.2-.9a1.1 1.1 0 1 0 1.1 1.1 1.1 1.1 0 0 0-1.1-1.1zM12 9.2A2.8 2.8 0 1 1 9.2 12 2.8 2.8 0 0 1 12 9.2z" />
      </svg>
    );
  }
  if (kind === "tiktok") {
    return (
      <svg {...common}>
        <path d="M14 3h2.2a5.2 5.2 0 0 0 3.8 3.6v2.3a7.4 7.4 0 0 1-3.8-1.1v6.7a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v2.5a3.2 3.2 0 1 0 2.2 3V3z" />
      </svg>
    );
  }
  if (kind === "youtube") {
    return (
      <svg {...common}>
        <path d="M23 12.2s0-3.2-.4-4.6a3 3 0 0 0-2.1-2.1C18.9 5 12 5 12 5s-6.9 0-8.5.5a3 3 0 0 0-2.1 2.1C1 9 1 12.2 1 12.2s0 3.2.4 4.6a3 3 0 0 0 2.1 2.1C5.1 19.4 12 19.4 12 19.4s6.9 0 8.5-.5a3 3 0 0 0 2.1-2.1c.4-1.4.4-4.6.4-4.6zM9.8 15.5v-6.6l6.2 3.3z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M17.6 3H20l-6.2 7.1L21 21h-5.6l-4.4-5.8L6.2 21H3.7l6.6-7.6L3 3h5.7l4 5.3zM16.5 19.2h1.5L7.6 4.7H6z" />
    </svg>
  );
}
