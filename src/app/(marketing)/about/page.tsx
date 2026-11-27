import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About — AthleteGum" };

const principles = [
  { title: "Connect", copy: "Bring athletes and businesses together.", icon: LayersIcon },
  { title: "Collaborate", copy: "Manage deals, work, and approvals in one place.", icon: BoltIcon },
  { title: "Get it done", copy: "Turn ideas into real partnerships.", icon: ChartIcon },
];

const differences = [
  { title: "Built for both sides", copy: "A platform for athletes and businesses, not just one.", icon: HandshakeIcon },
  { title: "Clear and organized", copy: "Funded deals, defined work, and a straightforward process.", icon: ShieldIcon },
  { title: "Real partnerships", copy: "From local businesses to growing brands, AthleteGum supports individual athlete collaborations.", icon: PeopleIcon },
];

export default function AboutPage() {
  return (
    <main>
      <section className="relative min-h-[560px] overflow-hidden border-b border-white/10">
        <img
          src="/media/about-celebrate.jpg"
          alt="College basketball team celebrating with a trophy"
          className="absolute inset-0 h-full w-full object-cover object-[72%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,16,28,0.94)_0%,rgba(11,16,28,0.78)_40%,rgba(11,16,28,0.28)_72%,rgba(11,16,28,0.15)_100%)]" />
        <div className="relative mx-auto flex min-h-[560px] w-full max-w-7xl items-center px-4 py-20 md:px-6 lg:px-10">
          <div className="max-w-xl">
            <p className="ag-eyebrow">About AthleteGum</p>
            <h1 className="mt-4 text-[clamp(2.5rem,5vw,4.4rem)] font-extrabold leading-[1.05] tracking-tight">
              Great opportunities deserve a better way to <Accent>happen.</Accent>
            </h1>
            <p className="mt-5 max-w-md text-lg text-[var(--ag-text-secondary)]">
              A simpler, more organized way for athletes and businesses to work together.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
          <div className="grid gap-10 md:grid-cols-3 md:divide-x md:divide-[var(--ag-border)]">
            {principles.map((item) => (
              <article key={item.title} className="flex gap-4 md:px-8 md:first:pl-0">
                <span className="text-[var(--ag-primary)]"><item.icon /></span>
                <div>
                  <h2 className="text-lg font-bold">{item.title}</h2>
                  <p className="mt-1 text-sm text-[var(--ag-text-secondary)]">{item.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-8">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 md:px-6 lg:grid-cols-2 lg:px-10">
          <img
            src="/media/about-ball.jpg"
            alt="Basketball under stadium lights"
            className="aspect-[4/3] w-full rounded-[28px] object-cover"
          />
          <div>
            <p className="ag-eyebrow">Our mission</p>
            <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.4rem)] font-extrabold leading-tight tracking-tight">
              Making athlete partnerships more <Accent>accessible.</Accent>
            </h2>
            <p className="mt-5 max-w-md text-lg text-[var(--ag-text-secondary)]">
              We remove the complexity from athlete partnerships by bringing the people, the work, and the payment into one organized experience.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
          <h2 className="text-center text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight">What makes us different.</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:divide-x md:divide-[var(--ag-border)]">
            {differences.map((item) => (
              <article key={item.title} className="md:px-8 md:first:pl-0">
                <span className="text-[var(--ag-primary)]"><item.icon /></span>
                <h3 className="mt-4 text-xl font-bold">{item.title}</h3>
                <p className="mt-2 text-[var(--ag-text-secondary)]">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
          <div className="relative min-h-[280px] overflow-hidden rounded-[28px] border border-[var(--ag-border)]">
            <img src="/media/biz-basketball.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-right" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,16,28,0.94)_0%,rgba(11,16,28,0.84)_44%,rgba(11,16,28,0.2)_100%)]" />
            <div className="relative flex min-h-[280px] max-w-xl flex-col justify-center p-8 lg:p-12">
              <p className="ag-eyebrow">Be part of what&apos;s next</p>
              <h2 className="mt-3 text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-tight tracking-tight">Where athlete partnerships get done.</h2>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/athlete/register" className="ag-btn">Join as an Athlete <Arrow /></Link>
                <Link href="/register" className="ag-btn-outline">Get Started as a Business</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Accent({ children }: { children: string }) {
  return (
    <span className="relative inline-block italic text-[var(--ag-primary)]">
      {children}
      <svg viewBox="0 0 220 14" className="absolute -bottom-1 left-0 h-3 w-full" aria-hidden="true">
        <path d="M4 9 C 36 3, 62 13, 98 7 S 160 2, 216 8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="m12 4 8 4-8 4-8-4 8-4Z" strokeLinejoin="round" />
      <path d="m4 12 8 4 8-4" strokeLinejoin="round" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M13 3.5 6.5 13H12l-1 7.5L17.5 11H12Z" strokeLinejoin="round" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M4 19h16M7 16V10M12 16V6M17 16v-4" strokeLinecap="round" />
    </svg>
  );
}

function HandshakeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M8 13.5 4.5 10.5 8 7l3 3 2-2 6.5 6.5" strokeLinejoin="round" />
      <path d="m10 14 2 2 6-6" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M12 3.5 19 6.2v5.4c0 4.2-2.8 6.8-7 8.4-4.2-1.6-7-4.2-7-8.4V6.2Z" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="9" cy="8" r="2.4" />
      <circle cx="16" cy="9" r="2" />
      <path d="M4.5 18.2c.6-2.4 2.4-3.7 4.5-3.7s3.9 1.3 4.5 3.7" strokeLinecap="round" />
    </svg>
  );
}
