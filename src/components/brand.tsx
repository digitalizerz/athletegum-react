import Link from "next/link";

export function Logo({ light = true }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center">
      <img src="/brand/mark-white.png" alt="" className="logo-mark hidden h-8 w-auto" />
      <img src={light ? "/brand/logo-white.png" : "/brand/logo-dark.png"} alt="AthleteGum" className="logo-full h-7 w-auto max-w-[9.5rem] sm:h-9 sm:max-w-none" />
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
