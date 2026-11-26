import type { Metadata } from "next";
import { PageIntro } from "../layout";

export const metadata: Metadata = { title: "Terms — AthleteGum" };

export default function TermsPage() {
  return (
    <main>
      <PageIntro title="Terms">
        AthleteGum provides tools for businesses and athletes to agree on NIL work, track delivery, and record payment. Using the product means you are responsible for the deals you create and the work you submit.
      </PageIntro>
      <section className="mx-auto max-w-3xl space-y-4 px-6 py-16 text-white/80">
        <p>Businesses must invite the athlete who will do the work. Athletes should accept only deals sent to their own email.</p>
        <p>Platform fees are calculated from the deal amount at the business plan rate. A deal is not a charge until card payments are enabled.</p>
        <p>These terms are a product summary while the platform is being rebuilt. They are not a substitute for counsel.</p>
      </section>
    </main>
  );
}
