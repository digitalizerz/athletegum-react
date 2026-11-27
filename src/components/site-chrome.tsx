import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getSession } from "@/lib/session";
import { Logo } from "./brand";
import { MarketingNav, MobileNav } from "./marketing-nav";

export async function SiteHeader() {
  const session = await getSession();
  const home = session?.role === "athlete" ? "/athlete/dashboard" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--ag-border)] bg-[var(--ag-background)]/92 text-[var(--ag-text)] backdrop-blur">
      <div className="relative mx-auto flex h-[76px] w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-6 lg:px-10">
        <Link href="/" className="shrink-0" aria-label="AthleteGum home">
          <Logo />
        </Link>
        <MarketingNav className="hidden items-center gap-9 xl:flex" />
        <div className="flex shrink-0 items-center gap-2">
          {session ? (
            <>
              <Link href={home} className="ag-btn !px-4 !py-2">
                Dashboard
              </Link>
              <form action={logout}>
                <button className="px-2 py-2 text-xs font-semibold text-[var(--ag-text-secondary)] hover:text-white sm:text-sm">Sign out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="ag-btn !px-3.5 !py-2 sm:!px-4">
                <span className="sm:hidden">Business</span>
                <span className="hidden sm:inline">Business Sign In</span>
              </Link>
              <Link href="/athlete/login" className="ag-btn-outline !px-3.5 !py-2 sm:!px-4">
                <span className="sm:hidden">Athlete</span>
                <span className="hidden sm:inline">Athlete Sign In</span>
              </Link>
            </>
          )}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--ag-border)] bg-[var(--ag-background)] py-14 text-[var(--ag-text)]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-6 lg:px-10">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-[var(--ag-text-secondary)]">Where athlete partnerships get done.</p>
        </div>
        <FooterColumn title="Platform" links={[
          ["/for-athletes", "For Athletes"],
          ["/for-businesses", "For Businesses"],
          ["/how-it-works", "How It Works"],
          ["/pricing", "Pricing"],
        ]} />
        <FooterColumn title="Company" links={[["/about", "About"], ["/contact", "Contact"]]} />
        <FooterColumn title="Legal" links={[["/terms", "Terms of Service"], ["/privacy", "Privacy Policy"]]} />
      </div>
      <p className="mx-auto mt-12 w-full max-w-7xl px-4 text-xs text-[var(--ag-text-secondary)] md:px-6 lg:px-10">© {new Date().getFullYear()} AthleteGum. All rights reserved.</p>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.16em] text-[var(--ag-primary)]">{title.toUpperCase()}</p>
      <div className="mt-4 flex flex-col gap-2 text-sm">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className="text-[var(--ag-text-secondary)] hover:text-white">{label}</Link>
        ))}
      </div>
    </div>
  );
}
