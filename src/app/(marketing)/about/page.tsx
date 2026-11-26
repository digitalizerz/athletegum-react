import type { Metadata } from "next";
export const metadata: Metadata = { title: "About — AthleteGum" };

export default function AboutPage() {
  return (
    <main>
      <section className="grid border-b border-white/10 bg-black lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-20 lg:px-12 lg:py-32">
          <h1 className="text-5xl font-bold uppercase leading-[1.1] lg:text-7xl">
            We built this for <span className="mt-2 inline-block bg-white px-3 py-2 text-black">you</span>
          </h1>
          <p className="mt-8 max-w-lg text-xl text-white/80">
            AthleteGum helps businesses pay athletes for real work — safely and transparently.
          </p>
        </div>
        <div className="relative min-h-[320px] lg:min-h-[560px]">
          <img src="/media/about-hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-center grayscale" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        </div>
      </section>
      <section className="mx-auto max-w-3xl space-y-6 px-6 py-16 text-lg text-white/80">
        <p>The product is being rebuilt as a Next.js app so it can run on Vercel. Accounts, deals, invitations, messages, and approvals are live in this version.</p>
        <p>Card charges, athlete payouts, and Pro or Growth subscriptions run through Stripe. Until the server has Stripe keys, deals record the fee split but do not charge a card.</p>
        <p>Questions go to business@athletegum.com.</p>
      </section>
      <section className="relative min-h-[420px] overflow-hidden">
        <img src="/media/about-break.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-center grayscale" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
          <p className="text-5xl font-bold uppercase lg:text-7xl">Not a marketplace.</p>
          <p className="mt-4 text-2xl text-white/80">A deal execution platform.</p>
        </div>
      </section>
    </main>
  );
}
