import type { Metadata } from "next";
import Link from "next/link";
import { formatFeePercent, money, splitCompensation } from "@/lib/deals";
import { getFeeSchedule } from "@/lib/fees";

export const metadata: Metadata = { title: "For Businesses — AthleteGum" };

const indicators = [
  { label: "Discover athletes", icon: SearchIcon },
  { label: "Funded deals", icon: CardIcon },
  { label: "Simple workflow", icon: FlowIcon },
];

const steps = [
  { title: "Discover", copy: "Find the right athletes.", icon: SearchIcon },
  { title: "Make an offer", copy: "Define the work and set the terms.", icon: DocumentIcon },
  { title: "Fund the deal", copy: "Pay upfront by card.", icon: CardIcon },
  { title: "Manage the work", copy: "Review deliverables and give feedback.", icon: ChatIcon },
  { title: "Approve & pay", copy: "Approve the work to initiate payout.", icon: CheckIcon },
];

const benefits = [
  "Find and invite athletes",
  "Manage deals and deliverables",
  "Track payments and progress",
];

const partnerTypes = [
  { title: "Social Content", icon: PhoneIcon },
  { title: "Videos", icon: VideoIcon },
  { title: "Appearances & Events", icon: PeopleIcon },
  { title: "Brand Partnerships", icon: StarIcon },
  { title: "Product Reviews", icon: BoxIcon },
  { title: "Custom Deals", icon: SparkIcon },
];

const reasons = [
  { title: "Clear expectations", copy: "Funded offers with defined work, deadlines, and compensation.", icon: ShieldIcon },
  { title: "Efficient workflow", copy: "Keep messages, submissions, revisions, and approvals together.", icon: BoltIcon },
  { title: "Flexible partnerships", copy: "From one social post to a month-long collaboration.", icon: GridIcon },
];

const questions = [
  ["Do I need to know an athlete before signing up?", "No. Explore registered athletes or invite someone you already know."],
  ["Can I work with multiple athletes?", "Yes. Create a separate funded deal for each athlete."],
  ["What if an athlete hasn't joined AthleteGum?", "You can express interest in a roster-listed athlete, and our team can follow up. Expressing interest does not create or fund a deal."],
  ["When am I charged?", "When you fund a deal by card, before the invitation is sent."],
  ["When does the athlete get paid?", "Approval initiates the payout process, subject to the athlete's payout account being ready."],
  ["Can I request revisions?", "Yes. You can request changes before approving submitted work."],
  ["Can I work with high school athletes?", "Not through paid deals at this time. You may submit interest for follow-up."],
];

export default async function ForBusinessesPage() {
  const rates = await getFeeSchedule();
  const example = splitCompensation(400, rates.free);
  const plans = [
    { name: "Free", price: "$0", deals: "Up to 3 active deals", fee: `${formatFeePercent(rates.free)}% platform fee`, featured: false },
    { name: "Pro", price: "$49", deals: "Unlimited active deals", fee: `${formatFeePercent(rates.pro)}% platform fee`, featured: true },
    { name: "Growth", price: "$99", deals: "Unlimited active deals", fee: `${formatFeePercent(rates.growth)}% platform fee`, featured: false },
  ];

  return (
    <main>
      <section className="relative min-h-[680px] overflow-hidden border-b border-white/10">
        <img
          src="/media/biz-hero-athlete.jpg"
          alt="Basketball player looking up under stadium lights"
          className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,16,28,0.94)_0%,rgba(11,16,28,0.78)_38%,rgba(11,16,28,0.28)_68%,rgba(11,16,28,0.12)_100%)]" />
        <div className="relative mx-auto flex min-h-[680px] w-full max-w-7xl items-center px-4 py-20 md:px-6 lg:px-10">
          <div className="max-w-xl">
            <p className="ag-eyebrow">For businesses</p>
            <h1 className="mt-4 text-[clamp(2.6rem,5vw,4.4rem)] font-extrabold leading-[1.05] tracking-tight">
              Make athletes part of your next <BigMove />
            </h1>
            <p className="mt-5 max-w-md text-lg text-[var(--ag-text-secondary)]">
              Discover athletes, create deals, manage the work, and pay with confidence—all in one place.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="ag-btn">Find Athletes <Arrow /></Link>
              <Link href="/register" className="ag-btn-outline">Create a Business Account</Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[var(--ag-text-secondary)]">
              {indicators.map((item) => (
                <li key={item.label} className="flex items-center gap-2">
                  <span className="text-[var(--ag-primary)]"><item.icon /></span>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight">Athlete partnerships made simple.</h2>
          <ol className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            <div className="absolute top-6 right-[8%] left-[8%] hidden h-px bg-[var(--ag-border)] lg:block" aria-hidden="true" />
            {steps.map((step, index) => (
              <li key={step.title} className="relative">
                <div className="relative z-10 grid h-12 w-12 place-items-center rounded-full border border-[var(--ag-border)] bg-[var(--ag-background)] text-[var(--ag-primary)]">
                  <step.icon />
                </div>
                {index < steps.length - 1 ? (
                  <span className="absolute top-4 left-14 hidden text-[var(--ag-border)] lg:block" aria-hidden="true">
                    <Arrow />
                  </span>
                ) : null}
                <h3 className="mt-4 font-bold">{step.title}</h3>
                <p className="mt-1 text-sm text-[var(--ag-text-secondary)]">{step.copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
          <div className="grid items-center gap-12 rounded-[28px] border border-[var(--ag-border)] bg-[var(--ag-surface)] px-6 py-10 lg:grid-cols-[0.85fr_1.15fr] lg:px-12 lg:py-14">
            <div>
              <p className="ag-eyebrow">One platform. Full control.</p>
              <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] font-extrabold leading-tight tracking-tight">Run your athlete partnerships in one place.</h2>
              <ul className="mt-8 space-y-3">
                {benefits.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[var(--ag-text-secondary)]">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--ag-primary)] text-white"><CheckMark /></span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/how-it-works" className="ag-btn mt-8">See the Platform <Arrow /></Link>
            </div>
            <DealPreview charge={money(400)} fee={money(example.platformFeeAmount)} athlete={money(example.athleteNetPayout)} />
          </div>
        </div>
      </section>

      <section className="py-8 pb-20">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
          <h2 className="max-w-3xl text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight">Turn your ideas into real athlete collaborations.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {partnerTypes.map((card) => (
              <article key={card.title} className="rounded-2xl border border-white/15 p-6">
                <div className="grid h-12 w-12 place-items-center rounded-full border border-[var(--ag-border)] text-[var(--ag-primary)]">
                  <card.icon />
                </div>
                <h3 className="mt-5 text-xl font-bold">{card.title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--ag-border)] py-20">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight">Why businesses choose AthleteGum.</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:divide-x md:divide-[var(--ag-border)]">
            {reasons.map((reason) => (
              <article key={reason.title} className="md:px-8 md:first:pl-0">
                <span className="text-[var(--ag-primary)]"><reason.icon /></span>
                <h3 className="mt-4 text-xl font-bold">{reason.title}</h3>
                <p className="mt-2 text-[var(--ag-text-secondary)]">{reason.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 pb-20">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight">Simple pricing that grows with you.</h2>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => (
              <article key={plan.name} className={plan.featured ? "rounded-3xl bg-[var(--ag-primary)] p-7 text-white" : "rounded-3xl border border-white/15 p-7"}>
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-4 text-5xl font-extrabold tracking-tight">
                  {plan.price}
                  <span className={`ml-1 text-base font-medium ${plan.featured ? "text-white/80" : "text-[var(--ag-text-secondary)]"}`}>/month</span>
                </p>
                <ul className="mt-6 space-y-3 text-sm">
                  <li className="flex items-center gap-2"><CheckMark /> {plan.deals}</li>
                  <li className="flex items-center gap-2"><CheckMark /> {plan.fee}</li>
                </ul>
              </article>
            ))}
          </div>
          <p className="mt-6 flex items-start gap-2 text-sm text-[var(--ag-text-secondary)]">
            <span className="mt-0.5 text-[var(--ag-primary)]" aria-hidden="true"><InfoIcon /></span>
            Each deal is funded separately. The platform fee is deducted from the athlete&apos;s compensation.
          </p>
          <Link href="/pricing" className="mt-5 inline-flex text-sm font-semibold text-[var(--ag-primary-light)] underline underline-offset-4">View all plans</Link>
        </div>
      </section>

      <section className="border-t border-[var(--ag-border)] py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 md:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight">Frequently asked questions.</h2>
          <div>
            {questions.map(([question, answer]) => (
              <details key={question} className="group border-b border-[var(--ag-border)] py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {question}
                  <span className="text-xl leading-none text-[var(--ag-primary)] transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 max-w-xl text-[var(--ag-text-secondary)]">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
          <div className="relative min-h-[320px] overflow-hidden rounded-[28px] border border-[var(--ag-border)]">
            <img src="/media/biz-basketball.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-right" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,16,28,0.94)_0%,rgba(11,16,28,0.82)_42%,rgba(11,16,28,0.25)_100%)]" />
            <div className="relative flex min-h-[320px] max-w-xl flex-col justify-center p-8 lg:p-12">
              <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-tight tracking-tight">Your next great partnership starts with an offer.</h2>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="ag-btn">Find Athletes <Arrow /></Link>
                <Link href="/register" className="ag-btn-outline">Create a Business Account</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function DealPreview({ charge, fee, athlete }: { charge: string; fee: string; athlete: string }) {
  return (
    <div className="relative py-4 lg:py-8" style={{ perspective: "1400px" }}>
      <div className="pointer-events-none absolute inset-8 rounded-full bg-[var(--ag-primary)]/30 blur-3xl" aria-hidden="true" />
      <div className="relative rounded-[28px] border border-white/10 bg-[#101826] p-3 shadow-[0_30px_80px_rgba(75,92,255,0.18)] max-lg:!transform-none" style={{ transform: "perspective(1400px) rotateY(-14deg) rotateX(6deg)" }}>
        <div className="overflow-hidden rounded-2xl bg-zinc-50 text-zinc-950">
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
            <p className="text-sm font-semibold">Deals</p>
            <p className="text-xs text-black/45">Business dashboard</p>
          </div>
          <div className="flex gap-2 overflow-x-auto px-4 py-3 text-xs">
            {["Deals", "Athletes", "Messages"].map((item, index) => (
              <span key={item} className={index === 0 ? "rounded-full bg-zinc-950 px-3 py-1 font-semibold text-white" : "px-3 py-1 text-black/50"}>{item}</span>
            ))}
          </div>
          <div className="px-4 pb-4">
            <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-zinc-200 text-sm font-semibold">A</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">Social Post</span>
                <span className="mt-1 block text-xs text-black/50">Post on social media</span>
                <span className="mt-2 inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium">Instagram</span>
              </span>
              <span className="hidden text-right sm:block">
                <span className="block text-xs font-medium text-black/60">Waiting for athlete</span>
                <span className="mt-1 block text-lg font-semibold">{charge}</span>
                <span className="block text-[11px] text-black/45">Fee {fee} · Athlete {athlete}</span>
              </span>
            </div>
            <p className="mt-3 text-[11px] text-black/40">Example using a $400 offer on the Free plan. Not a customer record.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BigMove() {
  return (
    <span className="relative inline-block italic text-[var(--ag-primary)]">
      big move.
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

function CheckMark() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M3.5 8.2 6.4 11l6.1-6.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16.2 20 20.2" strokeLinecap="round" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="M3.5 10h17" strokeLinecap="round" />
    </svg>
  );
}

function FlowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M5 7h9M5 12h14M5 17h7" strokeLinecap="round" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M7 3.8h7.2L19 8.6V20.2H7z" strokeLinejoin="round" />
      <path d="M14 3.8v5h5" strokeLinecap="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M6 16.5 4 20l4.2-1.6A8 8 0 1 0 6 16.5Z" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="m8.5 12.2 2.4 2.4 4.7-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="7" y="3.5" width="10" height="17" rx="2" />
      <path d="M11 17.5h2" strokeLinecap="round" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3.5" y="6" width="12" height="12" rx="2" />
      <path d="M15.5 10.5 20.5 8v8l-5-2.5z" strokeLinejoin="round" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="9" cy="8" r="2.4" />
      <circle cx="16" cy="9" r="2" />
      <path d="M4.5 18.2c.6-2.4 2.4-3.7 4.5-3.7s3.9 1.3 4.5 3.7M14 14.6c1.3-.5 2.6-.4 3.8.4 1 .7 1.6 1.7 1.9 3.2" strokeLinecap="round" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="m12 4 2.1 4.4 4.9.7-3.5 3.4.8 4.8L12 15.8 7.7 17.3l.8-4.8L5 9.1l4.9-.7Z" strokeLinejoin="round" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M4 8.5 12 4l8 4.5v8L12 21l-8-4.5z" strokeLinejoin="round" />
      <path d="M12 12.2 20 8.2M12 12.2V21M12 12.2 4 8.2" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M12 3.5 13.4 9 19 10.5 13.4 12 12 17.5 10.6 12 5 10.5 10.6 9Z" strokeLinejoin="round" />
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

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M13 3.5 6.5 13H12l-1 7.5L17.5 11H12Z" strokeLinejoin="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 7.2V11M8 5.2h.01" strokeLinecap="round" />
    </svg>
  );
}
