import Link from "next/link";
import { adminHref } from "@/components/admin-ui";

export function SortHeader({ label, column, sort, dir, base, query }: { label: string; column: string; sort: string; dir: "asc" | "desc"; base: string; query: Record<string, string | undefined> }) {
  const active = sort === column;
  const next = active && dir === "asc" ? "desc" : "asc";
  const first = column === "activity" || column === "completion" || column === "interest" ? "desc" : "asc";
  return (
    <Link href={adminHref(base, { ...query, sort: column, dir: active ? next : first, page: undefined })} className={`inline-flex items-center gap-1 uppercase hover:text-zinc-700 ${active ? "text-zinc-800" : ""}`}>
      {label}
      <span aria-hidden="true" className="text-[10px]">{active ? (dir === "asc" ? "↑" : "↓") : "↕"}</span>
    </Link>
  );
}

export function ProfileStat({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon: "people" | "check" | "store" | "alert" }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white px-4 py-4">
      <div className="flex items-center justify-between gap-3 text-sm text-zinc-500">
        <span>{label}</span>
        <StatIcon name={icon} />
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-zinc-400">{hint}</p> : null}
    </div>
  );
}

export function CompletionBar({ value }: { value: number }) {
  return (
    <div className="flex min-w-36 items-center gap-3">
      <span className="w-10 text-sm font-medium">{value}%</span>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200">
        <span className="block h-full rounded-full bg-zinc-950" style={{ width: `${value}%` }} />
      </span>
    </div>
  );
}

export function StorefrontPill({ live }: { live: boolean }) {
  if (!live) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500">
        <StoreIcon />
        Off
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-950 px-2.5 py-1 text-xs font-medium text-white">
      <StoreIcon />
      Live
    </span>
  );
}

export function ProfilePager({ page, pages, hrefFor }: { page: number; pages: number; hrefFor: (page: number) => string }) {
  if (pages <= 1) return <span />;
  const numbers = Array.from({ length: pages }, (_, index) => index + 1).filter((number) => number === 1 || number === pages || Math.abs(number - page) <= 1);
  return (
    <div className="flex items-center gap-1">
      <Link href={hrefFor(Math.max(1, page - 1))} aria-label="Previous page" className="grid h-8 w-8 place-items-center rounded-lg border border-black/10 text-sm">‹</Link>
      {numbers.map((number, index) => (
        <span key={number} className="flex items-center">
          {index > 0 && numbers[index - 1] !== number - 1 ? <span className="px-1 text-zinc-400">…</span> : null}
          <Link href={hrefFor(number)} className={`grid h-8 min-w-8 place-items-center rounded-lg px-2 text-sm ${number === page ? "bg-zinc-950 text-white" : "hover:bg-zinc-100"}`}>{number}</Link>
        </span>
      ))}
      <Link href={hrefFor(Math.min(pages, page + 1))} aria-label="Next page" className="grid h-8 w-8 place-items-center rounded-lg border border-black/10 text-sm">›</Link>
    </div>
  );
}

export function activityLabel(date: Date) {
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "1 day ago";
  if (days < 14) return `${days} days ago`;
  if (days < 45) return "1 week ago";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function accountCompletion(athlete: {
  name: string;
  email: string;
  sport: string | null;
  school: string | null;
  city: string | null;
  athleteLevel: string | null;
  profilePhoto: string | null;
  bio: string | null;
  instagramHandle: string | null;
  tiktokHandle: string | null;
  twitterHandle: string | null;
  youtubeHandle: string | null;
}) {
  const checks = [
    athlete.name,
    athlete.email,
    athlete.sport,
    athlete.school,
    athlete.city,
    athlete.athleteLevel,
    athlete.profilePhoto,
    athlete.bio,
    athlete.instagramHandle || athlete.tiktokHandle || athlete.twitterHandle || athlete.youtubeHandle,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function listingCompletion(listing: { name: string; sport: string; teamOrSchool: string; city: string | null; position: string | null; squad: string | null; level: string }) {
  const checks = [listing.name, listing.sport, listing.teamOrSchool, listing.city, listing.position, listing.squad, listing.level];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function StatIcon({ name }: { name: "people" | "check" | "store" | "alert" }) {
  const path = name === "people"
    ? "M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 19v-1a3 3 0 0 0-2.2-2.9M16.5 5.1a3 3 0 0 1 0 5.8"
    : name === "check"
      ? "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M8 12l2.5 2.5L16 9"
      : name === "store"
        ? "M4 10h16v9H4zM3 10l1.5-5h15L21 10M9 14h6"
        : "M12 9v4M12 17h.01M10.3 4.8 2.8 18a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.8a2 2 0 0 0-3.4 0";
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d={path} />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 10h16v9H4zM3 10l1.5-5h15L21 10" />
    </svg>
  );
}
