import Link from "next/link";

const steps = [
  ["Create a Deal", "Set deliverables, timelines, and payment terms in minutes."],
  ["Track Progress", "Monitor every milestone with messages, submissions, and revisions."],
  ["Receive Pay", "Athletes get paid when the work is approved. Stripe payouts are the next piece of this rebuild."],
];

const features = [
  ["Escrow Protection", "Funds stay held until the work is completed and approved."],
  ["Clear Deliverables", "Every deal includes the work, the deadline, and the payout."],
  ["Verified Payouts", "Payment moves only after the business approves the work."],
];

const needs = [
  "Secure Escrow",
  "Deal Records",
  "Progress Tracking",
  "Plan Limits",
  "Athlete Profiles",
  "Messages",
  "Approvals",
  "Payout History",
];

export default function HomePage() {
  return (
    <main>
      <section className="relative min-h-[78vh] overflow-hidden bg-black px-6 pb-24 pt-20 lg:px-12 lg:pt-28">
        <video
          className="absolute inset-0 h-full w-full scale-105 object-cover object-center grayscale brightness-75"
          autoPlay
          muted
          loop
          playsInline
          poster="/media/hero-poster.jpg"
        >
          <source src="/media/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,20,60,0.48)_42%,rgba(0,20,60,0.25)_100%)]" />
        <div className="relative mx-auto max-w-7xl">
          <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight lg:text-7xl">
            Pay Athletes for Real Work —{" "}
            <span className="underline decoration-white decoration-8 underline-offset-8">Safely and</span> Transparently
          </h1>
          <p className="mt-8 max-w-xl text-lg text-white/80">
            Create NIL deals, secure funds upfront, and only release payment after work is delivered and approved.
          </p>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Link href="/register" className="inline-flex items-center justify-center bg-white px-8 py-3 text-sm font-semibold text-black">
              Create Your First Deal
            </Link>
            <Link href="/how-it-works" className="inline-flex items-center justify-center border-2 border-white px-8 py-3 text-sm font-semibold">
              How it works
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 px-6 py-16 lg:px-12">
        <p className="mx-auto max-w-5xl text-center text-2xl font-bold lg:text-4xl">
          Built for modern NIL deals — for businesses, athletes, and collectives.
        </p>
      </section>

      <section className="px-6 py-24 lg:px-12">
        <h2 className="text-center text-4xl font-bold lg:text-6xl">How It Works</h2>
        <div className="mx-auto mt-16 grid max-w-6xl gap-12 md:grid-cols-3">
          {steps.map(([title, copy]) => (
            <article key={title}>
              <div className="grid h-24 w-24 place-items-center border-2 border-white text-sm font-bold">{title.split(" ")[0]}</div>
              <h3 className="mt-6 text-2xl font-bold">{title}</h3>
              <p className="mt-3 text-white/70">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative h-[400px] overflow-hidden bg-black">
        <img src="/media/court.jpg" alt="Basketball court" className="h-full w-full object-cover grayscale" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
          <div className="text-5xl font-bold lg:text-7xl">2,847</div>
          <div className="mt-3 text-xl font-medium uppercase tracking-[0.25em]">Active Deals</div>
        </div>
      </section>

      <section className="bg-white px-6 py-24 text-black lg:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold lg:text-4xl">Built for real NIL work</h2>
          <div className="mt-14 grid gap-12 md:grid-cols-3">
            {features.map(([title, copy]) => (
              <article key={title} className="border-l-4 border-black pl-6">
                <h3 className="text-2xl font-bold">{title}</h3>
                <p className="mt-3 text-black/70">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 lg:px-12">
        <h2 className="text-center text-4xl font-bold lg:text-6xl">Choose Your Path</h2>
        <div className="mx-auto mt-14 grid max-w-6xl gap-8 lg:grid-cols-2">
          <article className="border-2 border-white p-10">
            <h3 className="text-3xl font-bold">For Businesses</h3>
            <p className="mt-4 text-white/70">Plan campaigns, define deliverables, and manage every NIL agreement from one place.</p>
            <Link href="/register" className="mt-8 inline-flex border-2 border-white px-6 py-3 text-sm font-semibold hover:bg-white hover:text-black">
              Create Business Account
            </Link>
          </article>
          <article className="border-2 border-white p-10">
            <h3 className="text-3xl font-bold">For Athletes</h3>
            <p className="mt-4 text-white/70">Accept offers that spell out the work and the payout. Submit work and track every deal.</p>
            <Link href="/athlete/register" className="mt-8 inline-flex border-2 border-white px-6 py-3 text-sm font-semibold hover:bg-white hover:text-black">
              Create Athlete Profile
            </Link>
          </article>
        </div>
      </section>

      <section className="px-6 pb-24 lg:px-12">
        <h2 className="mb-12 text-center text-3xl font-bold">Everything you need to run NIL deals</h2>
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-4">
          {needs.map((item) => (
            <div key={item} className="grid aspect-square place-items-center border border-white/20 px-3 text-center text-sm font-semibold">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="relative h-[600px] overflow-hidden bg-black">
        <img src="/media/track.jpg" alt="Athlete on track" className="absolute inset-0 h-full w-full object-cover object-center grayscale" />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative flex h-full items-center justify-center px-6 text-center lg:px-12">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-4xl font-bold text-white lg:text-6xl">Start your first deal in minutes</h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/80">Create a deal, invite an athlete, and pay only when the work is done.</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register" className="bg-white px-8 py-3 text-sm font-semibold text-black">Create Business Account</Link>
              <Link href="/athlete/register" className="border-2 border-white px-8 py-3 text-sm font-semibold text-white">Create Athlete Profile</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
