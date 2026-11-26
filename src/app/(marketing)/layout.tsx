import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-black text-white">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}

export function PageIntro({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-white/10 bg-black px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-5xl font-bold tracking-tight lg:text-6xl">{title}</h1>
        <p className="mt-6 max-w-2xl text-lg text-white/75">{children}</p>
      </div>
    </section>
  );
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-semibold text-white underline">
      {children}
    </Link>
  );
}
