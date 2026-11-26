import Link from "next/link";

export function Logo({ light = true }: { light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight ${light ? "text-white" : "text-black"}`}>
      <span className={`grid h-8 w-8 place-items-center text-sm ${light ? "bg-white text-black" : "bg-black text-white"}`}>A</span>
      <span className="logo-word">AthleteGum</span>
    </span>
  );
}

export function PrimaryLink({ href, children, dark = false }: { href: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center border-2 px-5 py-2.5 text-sm font-semibold ${
        dark ? "border-black bg-black text-white hover:bg-white hover:text-black" : "border-white bg-white text-black hover:bg-zinc-100"
      }`}
    >
      {children}
    </Link>
  );
}
