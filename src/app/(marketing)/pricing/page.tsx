import type { Metadata } from "next";
import Link from "next/link";
import { formatFeePercent } from "@/lib/deals";
import { getFeeSchedule } from "@/lib/fees";
export const metadata: Metadata = { title: "Pricing — AthleteGum" };

export default async function PricingPage() {
  const rates = await getFeeSchedule();
  const businessPlans = [
    { name: "Free", price: "$0", fee: `${formatFeePercent(rates.free)}% platform fee`, points: ["Up to 3 active deals", "Escrow records", "Deliverable approval", "Messages"], href: "/register", label: "Get Started Free", featured: false },
    { name: "Pro", price: "$49", fee: `${formatFeePercent(rates.pro)}% platform fee`, points: ["Unlimited deals", "Lower platform fee", "Advanced tracking", "Receipts"], href: "/register", label: "Choose Pro", featured: true },
    { name: "Growth", price: "$99", fee: `${formatFeePercent(rates.growth)}% platform fee`, points: ["Lowest fee tier", "Built for teams", "Deal history", "Priority workflow"], href: "/register", label: "Choose Growth", featured: false },
  ];
  return (
    <main>
      <section className="relative min-h-[70vh] overflow-hidden border-b border-white/10 px-6 pb-24 pt-20 lg:px-12 lg:pt-28">
        <video
          className="absolute inset-0 h-full w-full scale-105 object-cover object-center grayscale brightness-75"
          autoPlay
          muted
          loop
          playsInline
          poster="/media/pricing-poster.jpg"
        >
          <source src="/media/pricing.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(0,0,0,0.78)_0%,rgba(15,15,15,0.5)_45%,rgba(0,0,0,0.35)_100%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold leading-tight tracking-tight lg:text-7xl">
            Simple, Fair <span className="underline decoration-white decoration-4 underline-offset-8">Pricing</span> for NIL Deals
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-white/80">
            Athletes use AthleteGum for free. Businesses pick the plan that matches deal volume. Subscription checkout returns when Stripe is connected.
          </p>
        </div>
      </section>
      <section className="px-6 py-16 lg:px-12">
        <h2 className="text-3xl font-bold">For athletes — always free</h2>
        <div className="mt-6 max-w-3xl border-2 border-white p-8">
          <p className="text-white/75">Create a profile, accept deals, submit work, and track payouts. Athletes do not pay a subscription.</p>
          <Link href="/athlete/register" className="mt-8 inline-flex bg-white px-6 py-3 text-sm font-semibold text-black">Create Athlete Profile</Link>
        </div>
      </section>
      <section className="bg-white px-6 py-16 text-black lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          {businessPlans.map((plan) => (
            <article key={plan.name} className={`border-2 border-black p-6 ${plan.featured ? "bg-black text-white" : ""}`}>
              <p className="text-sm font-semibold">{plan.name}</p>
              <h3 className="mt-2 text-4xl font-bold">{plan.price}<span className="text-base font-medium">/mo</span></h3>
              <ul className="mt-6 space-y-2 text-sm">
                {plan.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <p className="mt-6 border-t border-current/20 pt-4 text-sm font-semibold">{plan.fee} per completed deal</p>
              <Link href={plan.href} className={`mt-6 inline-flex w-full justify-center border-2 px-4 py-2 text-sm font-semibold ${plan.featured ? "border-white bg-white text-black" : "border-black"}`}>
                {plan.label}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
