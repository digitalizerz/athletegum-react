import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "How It Works — AthleteGum" };

const businessSteps = [
  ["Discover or invite an athlete", "Find registered athletes or invite someone you know."],
  ["Define the partnership", "Choose the work, deliverables, compensation, and dates."],
  ["Fund the offer", "Pay by card to fund the deal and send the invitation."],
  ["Manage the work", "Communicate, review submissions, and give feedback."],
  ["Approve the deliverables", "Approve the work or request revisions."],
  ["Complete the payment", "Approval initiates the athlete's payout, subject to payout setup."],
];

const athleteSteps = [
  ["Create your account", "Build your profile and connect your payout account."],
  ["Receive an invitation", "Get partnership offers sent to your registered email."],
  ["Review the details", "Understand the work, timeline, fee, and expected earnings."],
  ["Complete the work", "Submit your deliverables through your dashboard."],
  ["Respond to feedback", "Make any requested revisions and resubmit."],
  ["Track your payout", "Follow your payment status from your Earnings dashboard."],
];

const benefits = [
  { title: "Funded upfront", copy: "Businesses pay by card before the invitation is sent.", icon: LayersIcon },
  { title: "Clear expectations", copy: "One deal, agreed work, compensation, and dates.", icon: CheckCircleIcon },
  { title: "Organized from start to finish", copy: "Messages, work, approvals, and payment—all in one place.", icon: BoltIcon },
];

export default function HowItWorksPage() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <img
          src="/media/how-hero.jpg"
          alt="Athlete looking up under stadium lights"
          className="absolute inset-0 h-full w-full object-cover object-[78%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,16,28,0.94)_0%,rgba(11,16,28,0.82)_36%,rgba(11,16,28,0.35)_68%,rgba(11,16,28,0.2)_100%)]" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pt-16 pb-10 md:px-6 lg:px-10 lg:pt-20">
          <div className="max-w-xl">
            <p className="ag-eyebrow">How it works</p>
            <h1 className="mt-4 text-[clamp(2.5rem,5vw,4.4rem)] font-extrabold leading-[1.05] tracking-tight">
              Every partnership has a process.
              <br />
              We make it <Accent>simpler.</Accent>
            </h1>
            <p className="mt-5 max-w-md text-lg text-[var(--ag-text-secondary)]">
              From a funded offer to completed work and payout, AthleteGum keeps every step organized in one place.
            </p>
          </div>
          <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-2">
            <TimelineCard
              icon={StoreIcon}
              title="For Businesses"
              copy="Create, fund, and manage athlete partnerships."
              steps={businessSteps}
            />
            <TimelineCard
              icon={UserIcon}
              title="For Athletes"
              copy="Receive, complete, and get paid for real work."
              steps={athleteSteps}
            />
          </div>
          <p className="mt-5 max-w-3xl text-sm text-[var(--ag-text-secondary)]">
            Roster-listed athletes without accounts can receive an expression of interest. That does not create or fund a deal.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
          <div className="grid gap-10 md:grid-cols-3 md:divide-x md:divide-[var(--ag-border)]">
            {benefits.map((item) => (
              <article key={item.title} className="md:px-8 md:first:pl-0">
                <span className="text-[var(--ag-primary)]"><item.icon /></span>
                <h2 className="mt-4 text-xl font-bold">{item.title}</h2>
                <p className="mt-2 text-[var(--ag-text-secondary)]">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
          <div className="relative min-h-[300px] overflow-hidden rounded-[28px] border border-[var(--ag-border)]">
            <img src="/media/biz-basketball.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-right" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,16,28,0.94)_0%,rgba(11,16,28,0.84)_44%,rgba(11,16,28,0.2)_100%)]" />
            <div className="relative flex min-h-[300px] max-w-xl flex-col justify-center p-8 lg:p-12">
              <p className="ag-eyebrow">Ready to get started?</p>
              <h2 className="mt-3 text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-tight tracking-tight">Built around clear expectations.</h2>
              <p className="mt-4 text-[var(--ag-text-secondary)]">Create real partnerships, get the work done, and get paid—with a process that works for everyone.</p>
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

function TimelineCard({
  icon: Icon,
  title,
  copy,
  steps,
}: {
  icon: () => React.JSX.Element;
  title: string;
  copy: string;
  steps: string[][];
}) {
  return (
    <article className="rounded-[28px] border border-[var(--ag-border)] bg-[var(--ag-surface)]/95 p-6 transition-colors duration-150 hover:border-[var(--ag-primary)]/50 lg:p-8">
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[var(--ag-border)] bg-[var(--ag-background)] text-[var(--ag-primary)]">
          <Icon />
        </span>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-[var(--ag-text-secondary)]">{copy}</p>
        </div>
      </div>
      <ol className="mt-8">
        {steps.map(([stepTitle, stepCopy], index) => (
          <li key={stepTitle} className="relative flex gap-4 pb-5 last:pb-0">
            {index < steps.length - 1 ? <span className="absolute top-7 bottom-0 left-[13px] w-px bg-[var(--ag-primary)]/45" aria-hidden="true" /> : null}
            <span className="relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--ag-primary)] text-xs font-bold text-white">{index + 1}</span>
            <div>
              <h3 className="font-semibold leading-snug">{stepTitle}</h3>
              <p className="mt-1 text-sm text-[var(--ag-text-secondary)]">{stepCopy}</p>
            </div>
          </li>
        ))}
      </ol>
    </article>
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

function StoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M4 10.5 6 5h12l2 5.5" strokeLinejoin="round" />
      <path d="M4 10.5h16V19H4z" />
      <path d="M9 19v-4h6v4" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="8" r="3" />
      <path d="M6 18.5c.8-2.6 2.8-4 6-4s5.2 1.4 6 4" strokeLinecap="round" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="m12 4 8 4-8 4-8-4 8-4Z" strokeLinejoin="round" />
      <path d="m4 12 8 4 8-4M4 16l8 4 8-4" strokeLinejoin="round" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="m8.5 12.2 2.4 2.4 4.7-5" strokeLinecap="round" strokeLinejoin="round" />
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
