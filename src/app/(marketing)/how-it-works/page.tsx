import type { Metadata } from "next";
import { PageIntro } from "../layout";

export const metadata: Metadata = { title: "How It Works — AthleteGum" };

const steps = [
  ["1. A business creates a deal", "They choose the work, the compensation, the deadline, and the athlete's email. The Free plan holds up to 3 active deals."],
  ["2. The athlete accepts", "Only the invited email can accept. The deal moves to in progress."],
  ["3. Work is submitted", "The athlete sends deliverables. The business can approve or request revisions."],
  ["4. Payment is released", "The business pays the compensation by card when the deal is created. That charge stays held until the work is approved. Sending the payout to the athlete is the next build."],
];

export default function HowItWorksPage() {
  return (
    <main>
      <PageIntro title="How AthleteGum works">
        A deal is a funded agreement. The athlete does the work. The business approves it. Money moves only after that approval.
      </PageIntro>
      <section className="mx-auto max-w-3xl space-y-10 px-6 py-16">
        {steps.map(([title, copy]) => (
          <article key={title} className="border-l-4 border-white pl-6">
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="mt-3 text-white/75">{copy}</p>
          </article>
        ))}
      </section>
      <section className="relative h-[400px] overflow-hidden">
        <img src="/media/handshake.jpg" alt="Business handshake" className="h-full w-full object-cover grayscale" />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 grid place-items-center text-center text-white">
          <div>
            <p className="text-5xl font-bold lg:text-6xl">TRANSPARENT</p>
            <p className="mt-4 text-xl uppercase tracking-[0.3em] text-white/90">Every Step. Every Time.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
