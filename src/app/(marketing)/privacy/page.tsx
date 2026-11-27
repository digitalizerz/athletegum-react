import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../layout";

export const metadata: Metadata = { title: "Privacy Policy — AthleteGum" };

const updated = "November 27, 2026";
const email = "business@athletegum.com";

export default function PrivacyPage() {
  return (
    <main>
      <PageIntro title="Privacy Policy">
        Effective {updated}. Last updated {updated}. This policy explains how AthleteGum handles personal information at https://www.athletegum.com.
      </PageIntro>
      <article className="py-16">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
          <div className="max-w-3xl space-y-10 text-[var(--ag-text-secondary)]">
            <Section title="1. Introduction">
              <p>AthleteGum (&quot;AthleteGum,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects the privacy of athletes, businesses, and visitors who use our websites and services.</p>
              <p>This Privacy Policy explains what personal information we collect, how we use it, when we disclose it, how long we retain it, and the choices and rights available to individuals.</p>
              <p>This Policy applies to AthleteGum&apos;s public website, athlete and business accounts, athlete directory, deal-management services, communications, and related Platform functionality.</p>
              <p>By using the Platform, you acknowledge the information practices described in this Policy. Where consent is required by law, we will seek it separately. These practices work together with our <Link href="/terms" className="text-[var(--ag-primary-light)] underline">Terms of Service</Link>.</p>
            </Section>

            <Section title="2. Information We Collect">
              <h3>2.1 Information you provide</h3>
              <p>Depending on how you use AthleteGum, we may collect:</p>
              <p><strong className="text-white">Account information.</strong> Name, email address, account credentials, account role, contact information, and account preferences.</p>
              <p><strong className="text-white">Athlete profile information.</strong> Athlete name, profile photograph, sport, school or team affiliation, position, city or general location, athletic background, social media links, biography, and other profile details.</p>
              <p><strong className="text-white">Business information.</strong> Business name, business contact details, business representative information, business profile details, and billing-related information.</p>
              <p><strong className="text-white">Deal information.</strong> Partnership descriptions, work requirements, compensation, deadlines, invitations and acceptance records, submitted deliverables, revision requests, approval records, and transaction and payout status.</p>
              <p><strong className="text-white">Communications.</strong> Deal messages, support requests, account-related correspondence, and feedback and reports submitted to AthleteGum.</p>
              <h3>2.2 Information collected automatically</h3>
              <p>When you access AthleteGum, we may collect technical information such as IP address, device and browser characteristics, operating system, access timestamps, pages and features accessed, referring URLs, and security and diagnostic logs.</p>
              <h3>2.3 Payment information</h3>
              <p>AthleteGum uses third-party payment-processing services, including Stripe. Payment providers may collect payment-card information, bank-account information, identity verification details, tax information, and other information required to process payments and payouts.</p>
              <p>AthleteGum may receive transaction identifiers, payment status, limited payment-method details, connected-account status, and related information necessary to operate the Platform. AthleteGum does not need to receive or store complete payment-card numbers to display transaction status. Payment information is also governed by the payment provider&apos;s privacy notices and terms.</p>
              <h3>2.4 Roster and publicly available athlete information</h3>
              <p>AthleteGum may maintain directory listings for athletes who have not registered for an account. These listings may be compiled from publicly available athletic rosters, school websites, and other lawful sources, and may include athlete names, sports, schools, positions, cities, and other publicly available athletic information.</p>
              <p>A directory listing does not mean that the athlete has registered, consented to a partnership, or endorsed AthleteGum. Athletes may contact us to request access, correction, or removal of directory information, subject to applicable law.</p>
              <h3>2.5 Information from other users</h3>
              <p>Businesses may provide an athlete&apos;s email address to send an individual deal invitation. Athletes and businesses may provide information about one another in deal communications, support requests, or dispute reports. We process this information as necessary to deliver the requested Platform services and administer relevant transactions.</p>
            </Section>

            <Section title="3. How We Use Personal Information">
              <p>We use personal information to operate accounts, authenticate users, maintain profiles, and support account recovery. We use it to display athlete profiles and directory information, deliver invitations, manage deal acceptance, record deliverables and revisions, and support approval workflows.</p>
              <p>We use it to facilitate deal funding, administer subscriptions, calculate applicable fees, track earnings and payouts, and investigate payment problems. We use it to send transactional emails, deliver account notifications, respond to support requests, and provide service announcements.</p>
              <p>We use it to detect suspected fraud, investigate unauthorized activity, prevent misuse, and maintain security logs. We use it to diagnose technical problems and improve usability and reliability. We use it to respond to lawful requests, maintain required records, support applicable tax and payment obligations, and enforce Platform agreements.</p>
              <p>We may use personal information for marketing where permitted by law and subject to applicable consent and opt-out requirements.</p>
            </Section>

            <Section title="4. How We Disclose Information">
              <h3>4.1 Businesses and athletes</h3>
              <p>Businesses may access information that athletes choose to make available through their profiles and information necessary to administer accepted deals. Athletes may access relevant business identity, deal requirements, communications, and payment-related information. Both parties may access messages, submissions, revisions, and approval records associated with their shared deals.</p>
              <h3>4.2 Payment providers</h3>
              <p>We disclose information to payment providers as needed to process charges, subscriptions, transfers, identity verification, refunds, and payment disputes.</p>
              <h3>4.3 Technology and service providers</h3>
              <p>We may use providers supporting hosting, infrastructure, email delivery, monitoring, security, and customer support. These providers may process personal information on our behalf under appropriate contractual and security arrangements.</p>
              <h3>4.4 Legal and safety purposes</h3>
              <p>We may disclose information when reasonably necessary to comply with legal obligations, respond to valid legal process, investigate fraud, protect rights and safety, or enforce our agreements.</p>
              <h3>4.5 Business transactions</h3>
              <p>Information may be disclosed as part of a proposed or completed merger, acquisition, financing, reorganization, or sale of business assets, subject to applicable confidentiality and legal requirements.</p>
              <h3>4.6 Advertising and data sales</h3>
              <p>AthleteGum does not sell personal information. The Platform does not use advertising pixels or cross-context behavioral advertising.</p>
            </Section>

            <Section title="5. Public Profiles and Visibility">
              <p>Registered athlete profiles may be accessible through public profile pages. Public profile information may include an athlete&apos;s name, sport, school, city, social media links, and approved partnership information. Public information may be viewed, indexed, or copied by third parties outside AthleteGum&apos;s control.</p>
              <p>Users should avoid including sensitive personal information in public profile fields. Private account details, unpublished deal records, and payment credentials are not intended to be publicly displayed.</p>
            </Section>

            <Section title="6. Cookies and Similar Technologies">
              <p>AthleteGum uses an essential session cookie to keep signed-in users authenticated and to support security. Disabling essential cookies may prevent sign-in and other Platform functions.</p>
              <p>We do not currently use third-party advertising or analytics cookies. If we add nonessential tracking, we will update this Policy and obtain consent where required by law. Users can control cookies through browser settings.</p>
            </Section>

            <Section title="7. Data Security">
              <p>AthleteGum uses administrative, technical, and organizational safeguards designed to protect personal information against unauthorized access, alteration, disclosure, and loss. These measures include access restrictions, encrypted connections, authentication controls, and monitoring appropriate to the information involved.</p>
              <p>No system can guarantee absolute security. Passwords are stored as hashes. Users should protect their account credentials and promptly report suspected unauthorized access. Where required by law, AthleteGum will provide notifications concerning qualifying personal-data breaches.</p>
            </Section>

            <Section title="8. Data Retention">
              <p>We retain personal information for as long as reasonably necessary to provide services, administer transactions, maintain security, resolve disputes, and satisfy legal obligations. Retention periods differ depending on the information involved.</p>
              <ul>
                <li>Account data may be retained while an account remains active.</li>
                <li>Deal records may be retained to document contractual and payment obligations.</li>
                <li>Financial records may be retained to meet tax, accounting, and regulatory requirements.</li>
                <li>Security logs may be retained for a limited operational period.</li>
                <li>Support communications may be retained as necessary to resolve requests and document relevant actions.</li>
              </ul>
              <p>When information is no longer reasonably necessary, we delete, deidentify, or securely dispose of it, subject to applicable legal requirements and technical limitations.</p>
            </Section>

            <Section title="9. Your Privacy Choices and Rights">
              <p>Depending on your location and applicable law, you may have rights to request access to personal information, request correction of inaccurate information, request deletion of eligible information, obtain a portable copy of certain information, opt out of certain processing, withdraw consent where processing depends on consent, appeal certain privacy-request decisions, and exercise other rights provided by applicable law.</p>
              <p>To submit a privacy request, contact <Mail />. We may need to verify your identity before fulfilling certain requests. We will respond within applicable legal deadlines. We will not unlawfully discriminate against individuals for exercising privacy rights.</p>
              <p>Some information may be retained where permitted or required by law, including records needed for legal compliance, fraud prevention, or unresolved transactions.</p>
            </Section>

            <Section title="10. Athlete Directory Correction and Removal">
              <p>Athletes who discover an unclaimed listing associated with their identity may request review, correction, or removal. Requests should include sufficient information for AthleteGum to identify the relevant listing and verify the requester&apos;s authority.</p>
              <p>AthleteGum will review requests in accordance with applicable privacy, publicity, and other laws. AthleteGum may retain limited records necessary to document the request, prevent unauthorized re-creation of removed information, or satisfy legal obligations. Claiming a profile does not automatically constitute acceptance of a business deal.</p>
            </Section>

            <Section title="11. Children's Privacy and Age Restrictions">
              <p>AthleteGum is not intended for children under 13. We do not knowingly collect personal information directly from children under 13 through account registration. High school athletes are not eligible for paid deals through AthleteGum at this time.</p>
              <p>If we learn that we have collected personal information from a child in violation of applicable law, we will take appropriate action. Parents or legal guardians may contact <Mail /> regarding information associated with a minor.</p>
            </Section>

            <Section title="12. International Users">
              <p>AthleteGum is designed primarily for users in the United States. If personal information is processed outside an individual&apos;s country or state, applicable data-transfer and privacy requirements may apply. AthleteGum does not represent that its services are available in every jurisdiction.</p>
            </Section>

            <Section title="13. Third-Party Websites and Social Media">
              <p>Athlete profiles may contain links to third-party social media services. AthleteGum does not control the independent privacy practices of those services. Users should review the privacy notices of third-party websites before sharing information with them.</p>
            </Section>

            <Section title="14. Automated Processing">
              <p>AthleteGum may use automated systems for routine Platform functions, such as delivering notifications, recording deal status, and supporting security monitoring. AthleteGum does not currently offer AI-powered athlete matching, recommendations, or automated profiling. If we introduce that kind of processing, we will update this Policy.</p>
            </Section>

            <Section title="15. Changes to This Policy">
              <p>We may update this Privacy Policy as our services, technologies, or legal obligations change. We will update the effective date and provide additional notice when required by law. Material changes to data practices will be handled in accordance with applicable notice and consent requirements.</p>
            </Section>

            <Section title="16. Contact Us">
              <p>For privacy questions, data requests, directory corrections, or concerns:</p>
              <p className="text-white">
                AthleteGum
                <br />
                <Mail />
                <br />
                <a href="https://www.athletegum.com" className="text-[var(--ag-primary-light)] underline">https://www.athletegum.com</a>
              </p>
            </Section>

            <Section title="17. Additional State Privacy Notices">
              <p>Residents of certain U.S. states may have additional rights under applicable state privacy laws. To exercise a request, including through an authorized agent where the law allows it, contact <Mail />. We will provide any jurisdiction-specific process that applies to the request.</p>
            </Section>
          </div>
        </div>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_li]:mt-1 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
      <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
      {children}
    </section>
  );
}

function Mail() {
  return <a href={`mailto:${email}`} className="text-[var(--ag-primary-light)] underline">{email}</a>;
}
