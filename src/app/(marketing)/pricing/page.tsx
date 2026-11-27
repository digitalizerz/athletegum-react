import type { Metadata } from "next";
import Link from "next/link";
import { formatFeePercent, money } from "@/lib/deals";
import { getFeeSchedule } from "@/lib/fees";

export const metadata: Metadata = { title: "Pricing — AthleteGum" };

const questions = [
  ["Can I start without paying a subscription?", "Yes. Businesses can use the Free plan for up to three active deals."],
  ["Are deals included in my subscription price?", "No. Each deal is funded separately. Paid subscriptions provide unlimited active deals and lower deal fee percentages."],
  ["Does the business pay the deal fee on top of the offer?", "No. The applicable fee is deducted from the athlete's compensation."],
  ["When does a paid plan take effect?", "Paid-plan benefits apply while the subscription is active."],
  ["Can I change plans?", "Plan changes are managed through your business billing settings, subject to the applicable subscription terms."],
];

export default async function PricingPage() {
  const rates = await getFeeSchedule();
  const exampleAmount = 400;
  const exampleFee = Math.round(exampleAmount * (rates.free / 100) * 100) / 100;
  const exampleEarnings = Math.round((exampleAmount - exampleFee) * 100) / 100;
  const plans = [
    {
      name: "Free",
      price: "$0",
      limit: "3 active deals",
      fee: `${formatFeePercent(rates.free)}% platform fee per deal`,
      copy: "Create funded athlete partnerships, manage deliverables, and complete payments.",
      label: "Get Started Free",
      featured: false,
    },
    {
      name: "Pro",
      price: "$49",
      limit: "Unlimited active deals",
      fee: `${formatFeePercent(rates.pro)}% platform fee per deal`,
      copy: "For businesses building ongoing athlete partnerships.",
      label: "Choose Pro",
      featured: true,
    },
    {
      name: "Growth",
      price: "$99",
      limit: "Unlimited active deals",
      fee: `${formatFeePercent(rates.growth)}% platform fee per deal`,
      copy: "For businesses managing a higher volume of athlete collaborations.",
      label: "Choose Growth",
      featured: false,
    },
  ];

  return (
    <main>
      <section className="relative overflow-hidden border-b border-white/10 py-20 lg:py-28">
        <video
          className="absolute inset-0 h-full w-full scale-105 object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
          poster="/media/pricing-poster.jpg"
        >
          <source src="/media/pricing.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[rgba(11,16,28,0.72)]" />
        <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
          <div className="max-w-4xl">
          <p className="ag-eyebrow">Simple, flexible pricing</p>
          <h1 className="mt-4 text-5xl font-bold leading-[1.05] tracking-tight lg:text-7xl">More partnerships. Less complexity.</h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80">Start free and choose the plan that fits your business.</p>
          </div>
        </div>
      </section>

      <section className="bg-[var(--ag-background)] py-16">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 md:px-6 lg:grid-cols-3 lg:px-10">
          {plans.map((plan) => (
            <article key={plan.name} className={`flex flex-col border p-6 ${plan.featured ? "border-[var(--ag-primary)]" : "border-white/15"}`}>
              <p className="text-sm font-semibold text-[var(--ag-primary-light)]">{plan.name}</p>
              <h2 className="mt-2 text-4xl font-extrabold">{plan.price}<span className="text-base font-medium text-[var(--ag-text-secondary)]">/month</span></h2>
              <p className="mt-6 text-lg font-semibold">{plan.limit}</p>
              <p className="mt-2 text-sm font-semibold">{plan.fee}</p>
              <p className="mt-4 flex-1 text-sm text-[var(--ag-text-secondary)]">{plan.copy}</p>
              <Link href="/register" className={`mt-8 ${plan.featured ? "ag-btn" : "ag-btn-outline"}`}>
                {plan.label}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-bold tracking-tight">How deal fees work</h2>
          <p className="mt-6 text-white/75">Businesses pay the agreed deal amount upfront. AthleteGum deducts the applicable platform fee from the athlete&apos;s compensation.</p>
          <p className="mt-4 text-white/75">For example, on the Free plan:</p>
          <dl className="mt-6 border border-white/20">
            <FeeRow label="Deal amount" value={money(exampleAmount)} />
            <FeeRow label={`Platform fee (${formatFeePercent(rates.free)}%)`} value={money(exampleFee)} />
            <FeeRow label="Athlete earnings" value={money(exampleEarnings)} />
            <FeeRow label="Total deal funding charged to the business" value={money(exampleAmount)} />
          </dl>
          <p className="mt-6 text-white/75">A business subscription, if selected, is charged separately.</p>
          <p className="mt-4 text-white/75">Applicable deal fees and expected athlete earnings are displayed before an athlete accepts. Fee percentages may be updated by AthleteGum.</p>
        </div>
        </div>
      </section>

      <section className="border-t border-white/10 py-20">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
          <h2 className="text-3xl font-bold">For athletes: No monthly subscription.</h2>
          <p className="mt-4 text-[var(--ag-text-secondary)]">Create your profile, receive invitations, manage work, and track earnings without paying a monthly fee.</p>
          <p className="mt-4 text-[var(--ag-text-secondary)]">Platform fees apply to deal compensation as shown in each offer.</p>
          <Link href="/athlete/register" className="ag-btn mt-8">Create Your Free Athlete Profile</Link>
        </div>
      </section>

      <section className="border-t border-white/10 py-20">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-bold tracking-tight">Pricing questions</h2>
          <div className="mt-10 space-y-8">
            {questions.map(([question, answer]) => (
              <article key={question}>
                <h3 className="text-xl font-bold">{question}</h3>
                <p className="mt-2 text-white/70">{answer}</p>
              </article>
            ))}
          </div>
        </div>
        </div>
      </section>
    </main>
  );
}

function FeeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-white/15 px-5 py-4 last:border-b-0">
      <dt className="text-white/70">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
