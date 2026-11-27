import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "For Athletes — AthleteGum" };

const indicators = [
  { label: "Paid opportunities", icon: BoltIcon },
  { label: "Simple process", icon: CheckIcon },
  { label: "Get paid", icon: CardIcon },
];

const steps = [
  { number: "01", title: "Build your profile", copy: "Showcase your sport, school, social presence, and interests.", icon: UserIcon },
  { number: "02", title: "Receive opportunities", copy: "Get invited to paid deals from businesses.", icon: MailIcon },
  { number: "03", title: "Get the work done", copy: "Complete and submit your deliverables.", icon: CheckIcon },
  { number: "04", title: "Get paid", copy: "After approval, your payout is initiated.", icon: CardIcon },
];

const benefits = [
  { title: "Grow your brand", copy: "Build a profile that shows businesses who you are.", icon: TargetIcon },
  { title: "Explore opportunities", copy: "Receive invitations and choose which offers are right for you.", icon: HeartIcon },
  { title: "Earn for your work", copy: "Complete partnerships and track your earnings.", icon: ChartIcon },
];

const questions = [
  ["Do I need to know a business before signing up?", "No. You can create your profile without having an existing business partnership."],
  ["How do I receive opportunities?", "Businesses send individual partnership invitations directly to your registered email address. AthleteGum does not currently offer an open job board."],
  ["When do I get paid?", "After the business approves your work, the payout process begins. You must complete your Stripe payout setup to receive funds."],
  ["Can I request changes to a deal?", "You can review an offer before accepting and communicate with the business through deal messaging. The platform does not currently guarantee a formal counteroffer or deal renegotiation workflow."],
  ["Can high school athletes use AthleteGum?", "High school athletes cannot participate in paid deals at this time."],
  ["Is AthleteGum really free?", "There is no monthly subscription for athletes. A platform fee is deducted from deal compensation, and your expected earnings are shown before you accept."],
];

export default function ForAthletesPage() {
  return (
    <main>
      <section className="relative min-h-[680px] overflow-hidden border-b border-white/10">
        <img
          src="/media/athlete-hero.jpg"
          alt="Basketball player with a ball in a dark arena"
          className="absolute inset-0 h-full w-full object-cover object-[72%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,16,28,0.94)_0%,rgba(11,16,28,0.78)_40%,rgba(11,16,28,0.28)_70%,rgba(11,16,28,0.12)_100%)]" />
        <div className="relative mx-auto flex min-h-[680px] w-full max-w-7xl items-center px-4 py-20 md:px-6 lg:px-10">
          <div className="max-w-xl">
            <p className="ag-eyebrow">For athletes</p>
            <h1 className="mt-4 text-[clamp(2.6rem,5vw,4.4rem)] font-extrabold leading-[1.05] tracking-tight">
              Your game. Your brand.
              <br />
              Your <Accent>next move.</Accent>
            </h1>
            <p className="mt-5 max-w-md text-lg text-[var(--ag-text-secondary)]">
              Build your profile, receive paid opportunities, complete the work, and get paid—all in one place.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/athlete/register" className="ag-btn">Create Your Free Profile <Arrow /></Link>
              <Link href="/how-it-works" className="ag-btn-outline">See How It Works</Link>
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
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight">
            A simpler way to work <Accent>together.</Accent>
          </h2>
          <ol className="relative mt-12 grid gap-8 md:grid-cols-4">
            <div className="absolute top-6 right-[10%] left-[10%] hidden h-px bg-[var(--ag-border)] md:block" aria-hidden="true" />
            {steps.map((step, index) => (
              <li key={step.number} className="relative border-l border-[var(--ag-border)] pl-6 md:border-0 md:pl-0">
                <div className="relative z-10 grid h-12 w-12 place-items-center rounded-full border border-[var(--ag-border)] bg-[var(--ag-background)] text-[var(--ag-primary)]">
                  <step.icon />
                </div>
                {index < steps.length - 1 ? (
                  <span className="absolute top-4 left-14 hidden text-[var(--ag-border)] md:block" aria-hidden="true"><Arrow /></span>
                ) : null}
                <p className="mt-4 text-xs font-semibold text-[var(--ag-primary)]">{step.number}</p>
                <h3 className="mt-1 font-bold">{step.title}</h3>
                <p className="mt-1 text-sm text-[var(--ag-text-secondary)]">{step.copy}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-sm text-[var(--ag-text-secondary)]">Partnership opportunities are invitation-based and are not guaranteed.</p>
        </div>
      </section>

      <section className="pb-8">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 md:px-6 lg:grid-cols-2 lg:px-10">
          <div>
            <p className="ag-eyebrow">More than an athlete.</p>
            <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.4rem)] font-extrabold tracking-tight">
              You&apos;re a <Accent>brand.</Accent>
            </h2>
            <p className="mt-5 max-w-md text-lg text-[var(--ag-text-secondary)]">
              Your influence, experience, and passion can open doors beyond the game. Build your profile and be ready for the right partnership.
            </p>
            <Link href="/athlete/register" className="ag-btn mt-8">Create Your Free Profile <Arrow /></Link>
          </div>
          <img
            src="/media/athlete-portrait.jpg"
            alt="Athlete in a dark gym"
            className="aspect-[4/3] w-full rounded-[28px] object-cover object-[center_20%]"
          />
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
          <div className="grid gap-10 md:grid-cols-3 md:divide-x md:divide-[var(--ag-border)]">
            {benefits.map((item) => (
              <article key={item.title} className="md:px-8 md:first:pl-0">
                <span className="text-[var(--ag-primary)]"><item.icon /></span>
                <h3 className="mt-4 text-xl font-bold">{item.title}</h3>
                <p className="mt-2 text-[var(--ag-text-secondary)]">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-8">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
          <div className="relative min-h-[280px] overflow-hidden rounded-[28px] border border-[var(--ag-border)]">
            <img src="/media/biz-basketball.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-right" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,16,28,0.94)_0%,rgba(11,16,28,0.82)_46%,rgba(11,16,28,0.2)_100%)]" />
            <div className="relative flex min-h-[280px] max-w-xl flex-col justify-center p-8 lg:p-12">
              <p className="ag-eyebrow">No monthly subscription.</p>
              <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-extrabold leading-tight tracking-tight">Create. Collaborate. Get paid.</h2>
              <p className="mt-4 max-w-md text-[var(--ag-text-secondary)]">Join AthleteGum for free. Review paid offers, manage your work, and track your earnings in one place.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 md:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight">
            Frequently asked <span className="relative inline-block">questions.<Underline /></span>
          </h2>
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

      <section className="relative min-h-[360px] overflow-hidden">
        <img src="/media/athlete-track.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-[80%_center]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,16,28,0.94)_0%,rgba(11,16,28,0.78)_42%,rgba(11,16,28,0.25)_100%)]" />
        <div className="relative mx-auto flex min-h-[360px] w-full max-w-7xl items-center px-4 py-16 md:px-6 lg:px-10">
          <div className="max-w-xl">
            <h2 className="text-[clamp(2.2rem,4vw,3.4rem)] font-extrabold leading-tight tracking-tight">Your next move starts here.</h2>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/athlete/register" className="ag-btn">Create Your Free Profile <Arrow /></Link>
              <Link href="/how-it-works" className="ag-btn-outline">See How It Works</Link>
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
      <Underline />
    </span>
  );
}

function Underline() {
  return (
    <svg viewBox="0 0 220 14" className="absolute -bottom-1 left-0 h-3 w-full text-[var(--ag-primary)]" aria-hidden="true">
      <path d="M4 9 C 36 3, 62 13, 98 7 S 160 2, 216 8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M13 3.5 6.5 13H12l-1 7.5L17.5 11H12Z" strokeLinejoin="round" />
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

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="M3.5 10h17" strokeLinecap="round" />
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

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="m4 7 8 6 8-6" strokeLinejoin="round" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M12 19s-6.2-3.8-6.2-8.1A3.4 3.4 0 0 1 12 8.2a3.4 3.4 0 0 1 6.2 2.7C18.2 15.2 12 19 12 19Z" strokeLinejoin="round" />
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
