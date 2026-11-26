import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getSession } from "@/lib/session";
import { Logo } from "./brand";

const links = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export async function SiteHeader() {
  const session = await getSession();
  const home = session?.role === "athlete" ? "/athlete/dashboard" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 text-white backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-12">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-semibold text-white/80 hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          {session ? (
            <>
              <Link href={home} className="border-2 border-white px-4 py-2 text-sm font-medium hover:bg-white hover:text-black">
                Dashboard
              </Link>
              <form action={logout}>
                <button className="px-3 py-2 text-sm text-white/70 hover:text-white">Sign out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="border-2 border-white px-4 py-2 text-sm font-medium hover:bg-white hover:text-black">
                Business Sign In
              </Link>
              <Link href="/athlete/login" className="border-2 border-white px-4 py-2 text-sm font-medium hover:bg-white hover:text-black">
                Athlete Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black py-12 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 px-6 md:flex-row lg:px-12">
        <p className="text-xs text-white/60">© {new Date().getFullYear()} AthleteGum. All rights reserved.</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/about" className="text-white/50 hover:text-white">About</Link>
          <Link href="/privacy" className="text-white/50 hover:text-white">Privacy</Link>
          <Link href="/terms" className="text-white/50 hover:text-white">Terms</Link>
          <Link href="/contact" className="text-white/50 hover:text-white">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
