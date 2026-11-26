import type { Metadata } from "next";
import { PageIntro } from "../layout";

export const metadata: Metadata = { title: "Contact — AthleteGum" };

export default function ContactPage() {
  return (
    <main>
      <PageIntro title="Contact">
        For business accounts, deals, and billing questions, email business@athletegum.com.
      </PageIntro>
    </main>
  );
}
