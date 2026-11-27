"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const marketingLinks = [
  { href: "/", label: "Home" },
  { href: "/for-athletes", label: "For Athletes" },
  { href: "/for-businesses", label: "For Businesses" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MarketingNav({ className = "" }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={className} aria-label="Primary">
      {marketingLinks.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 text-sm font-semibold ${active ? "text-white" : "text-[var(--ag-text-secondary)] hover:text-white"}`}
          >
            <span className={active ? "border-b-2 border-[var(--ag-primary)] pb-1" : ""}>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav({
  signedIn = false,
  home = "/dashboard",
  logoutAction,
}: {
  signedIn?: boolean;
  home?: string;
  logoutAction?: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        className="ag-btn-outline !px-3 !py-2"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Close" : "Menu"}
      </button>
      {open ? (
        <div id="mobile-nav" className="absolute inset-x-0 top-full border-b border-[var(--ag-border)] bg-[var(--ag-background)] px-5 py-5 shadow-2xl">
          <MarketingNav className="flex flex-col items-start gap-4" />
          <div className="mt-5 flex flex-col gap-2 border-t border-[var(--ag-border)] pt-5 md:hidden">
            {signedIn ? (
              <>
                <Link href={home} className="ag-btn">Dashboard</Link>
                <form action={logoutAction}>
                  <button className="ag-btn-outline w-full">Sign out</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="ag-btn">Business Sign In</Link>
                <Link href="/athlete/login" className="ag-btn-outline">Athlete Sign In</Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
