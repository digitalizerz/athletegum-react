import type { Metadata } from "next";
import { PageIntro } from "../layout";

export const metadata: Metadata = { title: "Privacy — AthleteGum" };

export default function PrivacyPage() {
  return (
    <main>
      <PageIntro title="Privacy">
        Accounts store your name, email, and the deal details you enter. Passwords are hashed. Sessions stay in an httpOnly cookie.
      </PageIntro>
      <section className="mx-auto max-w-3xl space-y-4 px-6 py-16 text-white/80">
        <p>We use that information to run deals between the business that created them and the athlete who was invited.</p>
        <p>Payment card data will be handled by Stripe when payments are connected. It will not be stored in this app.</p>
        <p>Privacy questions: business@athletegum.com.</p>
      </section>
    </main>
  );
}
