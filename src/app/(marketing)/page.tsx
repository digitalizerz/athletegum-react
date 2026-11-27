import Link from "next/link";
import { formatFeePercent } from "@/lib/deals";
import { getFeeSchedule } from "@/lib/fees";

const partnerCards = [
  { title: "Social Content", icon: SocialIcon },
  { title: "Videos", icon: VideoIcon },
  { title: "Appearances", icon: AppearanceIcon },
];

const steps = [
  { number: "01", title: "Connect", copy: "Discover athletes or receive invitations.", icon: SearchIcon },
  { number: "02", title: "Make a deal", copy: "Agree on the work, pay, and timeline.", icon: DocumentIcon },
  { number: "03", title: "Get it done", copy: "Complete, submit, and review the work.", icon: CheckIcon },
  { number: "04", title: "Approve & pay", copy: "Approval initiates the athlete's payout.", icon: CardIcon },
];

export default async function HomePage() {
  const rates = await getFeeSchedule();
  const plans = [
    { name: "Free", price: "$0", detail: "Up to 3 active deals", fee: `${formatFeePercent(rates.free)}% deal fee` },
    { name: "Pro", price: "$49", detail: "Unlimited deals", fee: `${formatFeePercent(rates.pro)}% deal fee`, featured: true },
    { name: "Growth", price: "$99", detail: "Unlimited deals", fee: `${formatFeePercent(rates.growth)}% deal fee` },
  ];

  return (
    <main>
      <section className="relative min-h-[86vh] overflow-hidden bg-[var(--ag-background)]">
        <video
          className="absolute inset-0 h-full w-full scale-105 object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
          poster="/media/hero-poster.jpg"
        >
          <source src="/media/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,16,28,0.9)_0%,rgba(11,16,28,0.62)_40%,rgba(11,16,28,0.22)_100%)]" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-24 pt-16 md:px-6 lg:px-10 lg:pt-24">
          <p className="ag-eyebrow">Athletes × brands. Better together.</p>
          <h1 className="mt-6 max-w-4xl text-[clamp(2.75rem,6vw,4.75rem)] font-extrabold leading-[1.02] tracking-tight">
            Where athletes and brands <ConnectWord />
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[var(--ag-text-secondary)]">
            Discover opportunities. Build partnerships. Get the work done—all in one place.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/athlete/register" className="ag-btn px-7">
              I&apos;m an Athlete
            </Link>
            <Link href="/register" className="ag-btn-outline px-7">
              I&apos;m a Business
            </Link>
          </div>
          <p className="mt-8 text-sm text-[var(--ag-text-secondary)]">Real opportunities. Clear expectations. One place to make it happen.</p>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
          <p className="ag-eyebrow">Two sides. One platform.</p>
          <h2 className="mt-4 max-w-3xl text-[clamp(2.4rem,4.4vw,3.25rem)] font-extrabold leading-[1.08] tracking-tight">
            Your next opportunity starts here.
          </h2>
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <AudienceCard
              id="for-athletes"
              image="/media/athlete-basketball.jpg"
              imageAlt="Basketball athlete holding a ball and looking ahead"
              eyebrow="For Athletes"
              title="Your game. Your brand. Your next move."
              copy="Build your profile. Receive offers. Get paid for approved work."
              href="/athlete/register"
              cta="Create Your Free Profile"
            />
            <AudienceCard
              id="for-businesses"
              image="/media/business-owner.jpg"
              imageAlt="Small-business owner standing with arms crossed in her shop"
              eyebrow="For Businesses"
              title="Your brand. Your vision. The right athlete."
              copy="Find athletes. Fund offers. Manage partnerships."
              href="/register"
              cta="Discover Athletes"
            />
          </div>
        </div>
      </section>

      <section className="pb-8">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
          <h2 className="max-w-3xl text-[clamp(2.4rem,4.4vw,3.25rem)] font-extrabold leading-[1.08] tracking-tight">
            A simpler way to work together.
          </h2>
          <div className="relative mt-14">
            <div className="absolute top-7 right-[12%] left-[12%] hidden h-px bg-[var(--ag-border)] lg:block" aria-hidden="true" />
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <article key={step.number} className="relative">
                  <div className="grid h-14 w-14 place-items-center rounded-full border border-[var(--ag-border)] bg-[var(--ag-background)] text-[var(--ag-primary)]">
                    <step.icon />
                  </div>
                  <p className="mt-5 text-sm font-semibold tracking-[0.14em] text-[var(--ag-primary)]">{step.number}</p>
                  <h3 className="mt-2 text-xl font-bold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--ag-text-secondary)]">{step.copy}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="mt-14 flex justify-center">
            <Link href="/how-it-works" className="ag-btn">
              See How AthleteGum Works <Arrow />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-[28px] border border-[var(--ag-border)]">
          <img src="/media/basketball-texture.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-right" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,16,28,0.94)_0%,rgba(11,16,28,0.82)_48%,rgba(11,16,28,0.28)_100%)]" />
          <div className="relative grid items-center gap-8 px-8 py-12 lg:grid-cols-[1fr_auto] lg:px-12 lg:py-16">
            <div>
              <p className="ag-eyebrow">Real partnerships. Real possibilities.</p>
              <h2 className="mt-4 max-w-xl text-[clamp(2.2rem,4vw,3.15rem)] font-extrabold leading-[1.08] tracking-tight">
                Big brand energy. Without the big brand complexity.
              </h2>
            </div>
            <Link href="/register" className="ag-btn">
              Find Your Next Opportunity <Arrow />
            </Link>
          </div>
        </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
          <p className="ag-eyebrow">Create something together</p>
          <h2 className="mt-4 max-w-3xl text-[clamp(2.2rem,4vw,3rem)] font-extrabold tracking-tight">Every partnership starts with an idea.</h2>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {partnerCards.map((card) => (
              <article key={card.title} className="border border-white/15 p-6">
                <div className="grid h-12 w-12 place-items-center rounded-full border border-[var(--ag-border)] text-[var(--ag-primary)]">
                  <card.icon />
                </div>
                <h3 className="mt-5 text-xl font-bold">{card.title}</h3>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm text-[var(--ag-text-secondary)]">Also supporting product reviews, month-long partnerships, and custom deals.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
          <p className="ag-eyebrow">Simple pricing</p>
          <h2 className="mt-4 max-w-3xl text-[clamp(2.2rem,4vw,3rem)] font-extrabold tracking-tight">Free for athletes. Flexible for businesses.</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`border p-6 ${plan.featured ? "border-[var(--ag-primary)]" : "border-white/15"}`}
              >
                <p className="text-sm font-semibold text-[var(--ag-primary-light)]">{plan.name}</p>
                <p className="mt-2 text-4xl font-extrabold">
                  {plan.price}
                  <span className="text-base font-medium text-[var(--ag-text-secondary)]">/month</span>
                </p>
                <p className="mt-4 text-sm text-[var(--ag-text-secondary)]">{plan.detail}</p>
                <p className="mt-1 text-sm font-semibold">{plan.fee}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-sm text-[var(--ag-text-secondary)]">The deal fee is deducted from the athlete&apos;s compensation.</p>
          <Link href="/pricing" className="ag-btn mt-8">
            View All Plans <Arrow />
          </Link>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <img src="/media/track.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-[rgba(11,16,28,0.78)]" />
        <div className="relative flex min-h-[420px] items-center justify-center px-6 py-24 text-center lg:px-12">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-[clamp(2.4rem,5vw,3.6rem)] font-extrabold tracking-tight">Your next move starts here.</h2>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/athlete/register" className="ag-btn">Join as an Athlete — Free</Link>
              <Link href="/register" className="ag-btn-outline">Get Started as a Business</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function AudienceCard({
  id,
  image,
  imageAlt,
  eyebrow,
  title,
  copy,
  href,
  cta,
}: {
  id: string;
  image: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  copy: string;
  href: string;
  cta: string;
}) {
  return (
    <article id={id} className="relative min-h-[420px] scroll-mt-28 overflow-hidden rounded-[28px] border border-[var(--ag-border)]">
      <img src={image} alt={imageAlt} className="absolute inset-0 h-full w-full object-cover object-[72%_center]" />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(11,16,28,0.96)_0%,rgba(11,16,28,0.9)_32%,rgba(11,16,28,0.28)_58%,rgba(11,16,28,0.08)_100%)]" />
      <div className="relative flex h-full min-h-[420px] max-w-md flex-col justify-end p-8 lg:justify-center lg:p-10">
        <p className="ag-eyebrow flex items-center gap-2">
          <span aria-hidden="true">///</span>
          {eyebrow}
        </p>
        <h3 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight">{title}</h3>
        <p className="mt-4 text-sm leading-relaxed text-[var(--ag-text-secondary)]">{copy}</p>
        <Link href={href} className="ag-btn mt-7 self-start">
          {cta} <Arrow />
        </Link>
      </div>
    </article>
  );
}

function ConnectWord() {
  return (
    <span className="relative inline-block italic text-[var(--ag-primary)]">
      connect.
      <svg viewBox="0 0 220 14" className="absolute -bottom-1 left-0 h-3 w-full text-[var(--ag-primary)]" aria-hidden="true">
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

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="11" cy="11" r="6.25" />
      <path d="M16 16.2 20 20.2" strokeLinecap="round" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M7 3.8h7.2L19 8.6V20.2H7z" strokeLinejoin="round" />
      <path d="M14 3.8v5h5M9.5 13h6M9.5 16.2h4.2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M8.2 12.2 10.8 14.8 15.8 9.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="M3.5 10h17" strokeLinecap="round" />
    </svg>
  );
}

function SocialIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="7" y="3.5" width="10" height="17" rx="2" />
      <path d="M11 17.5h2" strokeLinecap="round" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3.5" y="6" width="12" height="12" rx="2" />
      <path d="M15.5 10.5 20.5 8v8l-5-2.5z" strokeLinejoin="round" />
    </svg>
  );
}

function AppearanceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="9" cy="8" r="2.4" />
      <circle cx="16" cy="9" r="2" />
      <path d="M4.5 18.2c.6-2.4 2.4-3.7 4.5-3.7s3.9 1.3 4.5 3.7M14 14.6c1.3-.5 2.6-.4 3.8.4 1 .7 1.6 1.7 1.9 3.2" strokeLinecap="round" />
    </svg>
  );
}
