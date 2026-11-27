"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/app/actions/auth";
import { stopImpersonating } from "@/app/actions/admin";
import { AthleteAvatar } from "@/components/athlete-avatar";
import { Logo } from "@/components/brand";

export type WorkspaceIcon = "home" | "deals" | "earnings" | "messages" | "profile" | "athletes" | "billing" | "businesses" | "users" | "opportunities" | "audit";

export type WorkspaceItem = {
  href: string;
  label: string;
  icon: WorkspaceIcon;
  badge?: number;
  exact?: boolean;
  also?: string[];
};

export function WorkspaceFrame({
  name,
  photo,
  subtitle,
  unread,
  items,
  homeHref,
  notificationsHref,
  settingsHref,
  settingsLabel = "Profile settings",
  profilePrompt,
  profileHref,
  upgrade,
  impersonating,
  status,
  children,
}: {
  name: string;
  photo: string | null;
  subtitle: string;
  unread: number;
  items: WorkspaceItem[];
  homeHref: string;
  notificationsHref?: string;
  settingsHref?: string;
  settingsLabel?: string;
  profilePrompt?: string | null;
  profileHref?: string;
  upgrade?: { href: string; title: string; body: string; action?: string } | null;
  impersonating?: string | null;
  status?: { ok: boolean; label: string } | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem("athletegum-nav") === "collapsed");
  }, []);

  function toggleCollapsed() {
    setCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem("athletegum-nav", next ? "collapsed" : "open");
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-zinc-950 lg:flex">
      {open ? <button aria-label="Close menu" className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} /> : null}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-hidden bg-zinc-950 text-white transition-[width,transform] duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${collapsed ? "lg:w-20" : "lg:w-64"} ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className={`flex h-16 items-center justify-between px-4 ${collapsed ? "lg:justify-center lg:px-2" : ""}`}>
          <Link href={homeHref} onClick={() => setOpen(false)} className={collapsed ? "lg:[&_.logo-full]:hidden lg:[&_.logo-mark]:block" : ""}>
            <Logo />
          </Link>
          <button type="button" className="hidden h-8 w-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 lg:grid" aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} onClick={toggleCollapsed}>
            <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M15 6 9 12l6 6" />
            </svg>
          </button>
        </div>
        <div className={`mx-3 flex items-center gap-3 rounded-2xl px-2 py-3 ${collapsed ? "lg:justify-center lg:px-0" : ""}`}>
          <AthleteAvatar name={name} photo={photo} size={40} />
          <div className={`min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="truncate text-xs text-white/50">{subtitle}</p>
          </div>
        </div>
        <nav className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto px-3">
          {items.map((item) => {
            const active = isActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${collapsed ? "lg:justify-center lg:px-0" : ""} ${active ? "bg-white text-black" : "text-white/75 hover:bg-white/10 hover:text-white"}`}
              >
                <span className="relative">
                  <NavIcon name={item.icon} />
                  {item.badge ? <span className={`absolute -top-1 -right-1 hidden h-2 w-2 rounded-full bg-[#9f1239] ${collapsed ? "lg:block" : ""}`} /> : null}
                </span>
                <span className={`flex-1 ${collapsed ? "lg:hidden" : ""}`}>{item.label}</span>
                {item.badge ? <span className={`grid h-5 min-w-5 place-items-center rounded-full bg-[#9f1239] px-1.5 text-[11px] font-semibold text-white ${collapsed ? "lg:hidden" : ""}`}>{item.badge}</span> : null}
              </Link>
            );
          })}
        </nav>
        {upgrade ? (
          <div className={`m-3 mt-auto shrink-0 rounded-2xl border border-white/10 bg-white/5 p-4 ${collapsed ? "lg:flex lg:justify-center lg:border-0 lg:bg-transparent lg:p-2" : ""}`}>
            <div className={collapsed ? "lg:hidden" : ""}>
              <p className="text-sm font-semibold">{upgrade.title}</p>
              <p className="mt-1 text-xs leading-5 text-white/60">{upgrade.body}</p>
              <Link href={upgrade.href} onClick={() => setOpen(false)} className="mt-3 inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black">
                {upgrade.action ?? "Upgrade plan"}
              </Link>
            </div>
            <Link href={upgrade.href} title={upgrade.title} onClick={() => setOpen(false)} className={`hidden h-10 w-10 place-items-center rounded-xl bg-white text-black ${collapsed ? "lg:grid" : ""}`}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 16 8.5 7 12 12l3.5-5L20 16z" />
              </svg>
            </Link>
          </div>
        ) : null}
        {status ? (
          <div className={`mx-3 mb-4 mt-auto flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs text-white/80 ${collapsed ? "lg:justify-center lg:px-0" : ""}`}>
            <span className={`h-2 w-2 rounded-full ${status.ok ? "bg-emerald-400" : "bg-amber-400"}`} />
            <span className={collapsed ? "lg:hidden" : ""}>{status.label}</span>
          </div>
        ) : null}
        {profilePrompt && profileHref ? (
          <div className={`m-3 shrink-0 rounded-2xl border border-white/10 p-4 ${collapsed ? "lg:flex lg:justify-center lg:border-0 lg:p-2" : ""}`}>
            <div className={collapsed ? "lg:hidden" : ""}>
              <p className="text-sm font-semibold">Finish your profile</p>
              <p className="mt-1 text-xs leading-5 text-white/60">{profilePrompt}</p>
              <Link href={profileHref} onClick={() => setOpen(false)} className="mt-3 inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black">
                Complete profile
              </Link>
            </div>
            <Link href={profileHref} title="Finish your profile" onClick={() => setOpen(false)} className={`hidden h-10 w-10 place-items-center rounded-xl bg-white text-black ${collapsed ? "lg:grid" : ""}`}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </Link>
          </div>
        ) : null}
      </aside>
      <div className="min-w-0 flex-1">
        {impersonating ? (
          <div className="flex items-center justify-between gap-3 bg-zinc-950 px-4 py-2 text-sm text-white lg:px-8">
            <p>Viewing the portal as {impersonating}.</p>
            <form action={stopImpersonating}>
              <button className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">Return to admin</button>
            </form>
          </div>
        ) : null}
        <header className="flex h-16 items-center justify-between px-4 lg:px-8">
          <button type="button" className="grid h-10 w-10 place-items-center rounded-xl border border-black/10 bg-white lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <div className="ml-auto flex items-center gap-2">
            {notificationsHref ? (
              <Link href={notificationsHref} className="relative grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white" aria-label="Notifications">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
                  <path d="M10 19a2 2 0 0 0 4 0" />
                </svg>
                {unread > 0 ? <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#9f1239] px-1 text-[11px] font-semibold text-white">{unread}</span> : null}
              </Link>
            ) : null}
            <details className="relative">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-black/10 bg-white py-1 pr-3 pl-1 [&::-webkit-details-marker]:hidden">
                <AthleteAvatar name={name} photo={photo} size={32} />
                <span className="text-xs font-semibold">{initials(name)}</span>
              </summary>
              <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-black/10 bg-white p-2 text-sm shadow-lg">
                {settingsHref ? <Link href={settingsHref} className="block rounded-lg px-3 py-2 hover:bg-zinc-100">{settingsLabel}</Link> : null}
                <form action={logout}>
                  <button className="w-full rounded-lg px-3 py-2 text-left hover:bg-zinc-100">Sign out</button>
                </form>
              </div>
            </details>
          </div>
        </header>
        <main className="px-4 pb-12 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function isActive(pathname: string, item: WorkspaceItem) {
  if (item.exact && pathname === item.href) return true;
  if (item.also?.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return true;
  if (item.exact) return false;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AthleteWorkspace({
  name,
  photo,
  subtitle,
  pendingDeals,
  unread,
  profilePrompt,
  upgrade,
  impersonating,
  children,
}: {
  name: string;
  photo: string | null;
  subtitle: string;
  pendingDeals: number;
  unread: number;
  profilePrompt: string | null;
  upgrade?: { href: string; title: string; body: string; action?: string } | null;
  impersonating?: string | null;
  children: React.ReactNode;
}) {
  return (
    <WorkspaceFrame
      name={name}
      photo={photo}
      subtitle={subtitle}
      unread={unread}
      homeHref="/athlete/dashboard"
      notificationsHref="/athlete/notifications"
      settingsHref="/athlete/profile"
      profilePrompt={profilePrompt}
      profileHref="/athlete/profile"
      upgrade={upgrade}
      impersonating={impersonating}
      items={[
        { href: "/athlete/dashboard", label: "Overview", icon: "home", exact: true },
        { href: "/athlete/opportunities", label: "Opportunities", icon: "opportunities", badge: pendingDeals },
        { href: "/athlete/deals", label: "My Deals", icon: "deals" },
        { href: "/athlete/earnings", label: "Earnings & Payouts", icon: "earnings" },
        { href: "/athlete/messages", label: "Messages", icon: "messages" },
        { href: "/athlete/profile", label: "My Public Profile", icon: "profile" },
      ]}
    >
      {children}
    </WorkspaceFrame>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function NavIcon({ name }: { name: WorkspaceIcon }) {
  const common = { viewBox: "0 0 24 24", className: "h-5 w-5", fill: "none", stroke: "currentColor", strokeWidth: 1.8 };
  if (name === "home") {
    return (
      <svg {...common}>
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
      </svg>
    );
  }
  if (name === "opportunities") {
    return (
      <svg {...common}>
        <path d="M13 3 6 13h5l-1 8 8-12h-5z" />
      </svg>
    );
  }
  if (name === "deals") {
    return (
      <svg {...common}>
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <rect x="4" y="7" width="16" height="13" rx="2" />
      </svg>
    );
  }
  if (name === "earnings") {
    return (
      <svg {...common}>
        <path d="M12 3v18M16 7.5c0-1.5-1.8-2.5-4-2.5s-4 1-4 2.5 1.8 2.5 4 2.5 4 1 4 2.5-1.8 2.5-4 2.5-4-1-4-2.5" />
      </svg>
    );
  }
  if (name === "messages") {
    return (
      <svg {...common}>
        <path d="M5 6h14v9H8l-3 3z" />
      </svg>
    );
  }
  if (name === "billing") {
    return (
      <svg {...common}>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18" />
      </svg>
    );
  }
  if (name === "businesses") {
    return (
      <svg {...common}>
        <path d="M4 20V6l8-3 8 3v14" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }
  if (name === "audit") {
    return (
      <svg {...common}>
        <path d="M8 4h8v16H8z" />
        <path d="M11 8h4M11 12h4M11 16h2" />
      </svg>
    );
  }
  if (name === "users" || name === "athletes") {
    return (
      <svg {...common}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19c.8-2.5 2.8-3.5 5.5-3.5s4.7 1 5.5 3.5" />
        <circle cx="17" cy="9" r="2" />
        <path d="M16 15.5c1.6.4 2.8 1.2 3.5 2.5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="3" />
      <path d="M6 19c1.2-2.5 3.2-3.5 6-3.5s4.8 1 6 3.5" />
    </svg>
  );
}
