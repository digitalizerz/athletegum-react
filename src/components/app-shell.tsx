import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { Logo } from "@/components/brand";

export const businessLinks = [
  { href: "/dashboard", label: "Deals" },
  { href: "/dashboard/athletes", label: "Athletes" },
  { href: "/dashboard/revenue", label: "Revenue" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/messages", label: "Messages" },
];

export const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/athletes", label: "Athletes" },
  { href: "/admin/businesses", label: "Businesses" },
  { href: "/admin/deals", label: "Deals" },
  { href: "/admin/payments", label: "Payments" },
];

export function AppShell({
  current,
  links,
  children,
}: {
  current: string;
  links: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-zinc-50 text-black">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href={links[0]?.href ?? "/"}>
            <Logo light={false} />
          </Link>
          <form action={logout}>
            <button className="text-sm text-black/60 hover:text-black">Sign out</button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3 text-sm">
          {links.map((link) => {
            const active = current === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={active ? "bg-black px-3 py-1.5 font-semibold text-white" : "px-3 py-1.5 text-black/70 hover:text-black"}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
    </div>
  );
}
