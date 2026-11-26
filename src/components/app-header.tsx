import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { Logo } from "@/components/brand";

export function AppHeader({ href, label }: { href: string; label: string }) {
  return (
    <header className="border-b border-black/10 bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href={href}>
          <Logo light={false} />
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href={href} className="font-semibold">{label}</Link>
          <form action={logout}>
            <button className="text-black/60 hover:text-black">Sign out</button>
          </form>
        </div>
      </div>
    </header>
  );
}
