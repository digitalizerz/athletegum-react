import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../layout";

export const metadata: Metadata = { title: "Terms of Service — AthleteGum" };

const updated = "November 27, 2026";
const email = "business@athletegum.com";

export default function TermsPage() {
  return (
    <main>
      <PageIntro title="Terms of Service">
        Effective {updated}. Last updated {updated}. These terms govern use of AthleteGum at https://www.athletegum.com.
      </PageIntro>
      <article className="py-16">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
          <div className="max-w-3xl space-y-10 text-[var(--ag-text-secondary)]">
            <Section title="1. Acceptance of Terms">
              <p>These Terms of Service (&quot;Terms&quot;) govern access to and use of AthleteGum&apos;s websites, applications, dashboards, athlete directories, communications, payment-related functionality, and associated services (collectively, the &quot;Platform&quot;).</p>
              <p>The Platform is operated by AthleteGum (&quot;AthleteGum,&quot; &quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).</p>
              <p>By creating an account, accessing the Platform, accepting a deal, funding a deal, or otherwise using our services, you agree to these Terms and our <Link href="/privacy" className="text-[var(--ag-primary-light)] underline">Privacy Policy</Link>.</p>
              <p>If you use AthleteGum on behalf of a company or other organization, you represent that you are authorized to bind that organization to these Terms.</p>
              <p>If you do not agree, you must not use the Platform.</p>
            </Section>

            <Section title="2. Description of Services">
              <p>AthleteGum facilitates individual commercial partnerships between businesses and eligible athletes.</p>
              <p>Businesses may discover athletes, create personalized offers, fund deals, communicate with athletes, review deliverables, and approve completed work.</p>
              <p>Athletes may create profiles, receive invitations, review offers, accept deals, submit deliverables, communicate with businesses, and track earnings and payment status.</p>
              <p>Each funded deal involves one business and one athlete.</p>
              <p>AthleteGum is not an open bidding marketplace, athlete storefront, employer, sports agency, or general talent representation service.</p>
              <p>AthleteGum does not guarantee that any user will obtain a partnership, receive an invitation, secure employment, earn a particular amount, or achieve a particular commercial result.</p>
            </Section>

            <Section title="3. Eligibility">
              <p>Users must have the legal capacity to enter into binding agreements and satisfy applicable laws and Platform eligibility requirements.</p>
              <p>Business users must be authorized to act for the businesses they represent.</p>
              <p>Athletes must provide accurate information regarding their identity, athletic status, school affiliation, and eligibility.</p>
              <p>High school athletes are not eligible to participate in paid deals through AthleteGum at this time.</p>
              <p>College, professional, and retired athletes may participate subject to applicable eligibility requirements, laws, institutional policies, and other relevant restrictions.</p>
              <p>AthleteGum may request additional information to verify identity, authority, or eligibility and may suspend or reject accounts that fail applicable requirements.</p>
            </Section>

            <Section title="4. Account Registration and Security">
              <p>Users agree to provide accurate, current, and complete registration information.</p>
              <p>Users are responsible for maintaining the confidentiality of their credentials and for activity conducted through their accounts, except to the extent caused by AthleteGum&apos;s own failure to meet applicable obligations.</p>
              <p>Users must promptly notify AthleteGum of suspected unauthorized access.</p>
              <p>Accounts may not be sold, transferred, impersonated, or used to misrepresent an individual&apos;s or organization&apos;s identity.</p>
              <p>AthleteGum may suspend access when reasonably necessary to investigate suspected fraud, security threats, prohibited activity, or violations of these Terms.</p>
            </Section>

            <Section title="5. Athlete Profiles and Directory Listings">
              <p>AthleteGum provides athlete profiles and a searchable directory for business users. The directory may include registered athletes with active Platform accounts and roster-listed athletes who have not registered or claimed their profiles.</p>
              <p>A roster listing is not an AthleteGum account, an endorsement of the Platform, a representation that the athlete is available, or authorization to enter into a deal on the athlete&apos;s behalf.</p>
              <p>Businesses may submit expressions of interest regarding roster-listed athletes. Such expressions do not constitute offers accepted by the athlete, funded deals, or guaranteed introductions.</p>
              <p>Eligible athletes may be invited to claim associated roster listings through AthleteGum&apos;s account-claiming process.</p>
              <p>Athletes may request correction or removal of inaccurate or inappropriate directory information by contacting <Mail />.</p>
              <p>Registered athlete profiles may include sport, school, city, position, biographical details, photographs, social media links, and other information the athlete elects to provide.</p>
              <p>AthleteGum may display completed, approved partnerships on public profiles where supported by the Platform and permitted by applicable agreements.</p>
              <p>Private messages, confidential deal terms, and payment information are not intended to be public profile content.</p>
            </Section>

            <Section title="6. Creating and Funding Deals">
              <p>Businesses may create individual partnership offers specifying the athlete, work type, deliverables, compensation, deadlines, and other applicable terms.</p>
              <p>Supported work categories may include social media posts, short-form videos, appearances, month-long partnerships, product reviews, and custom arrangements.</p>
              <p>The business is responsible for ensuring that the offer accurately describes the requested services and that the arrangement is lawful.</p>
              <p>A deal must be successfully funded by card before AthleteGum sends the corresponding invitation.</p>
              <p>An athlete may accept an invitation only through the account associated with the designated invitation email, subject to Platform verification and eligibility requirements.</p>
              <p>A funded offer does not guarantee acceptance.</p>
              <p>If an invitation is declined, expires, or cannot be completed, the resulting cancellation or refund will be handled under the applicable deal terms, payment rules, and AthleteGum&apos;s cancellation and dispute practices.</p>
            </Section>

            <Section title="7. Athlete Acceptance and Performance">
              <p>Before accepting an offer, athletes should review the deliverables, deadlines, compensation, applicable fees, expected earnings, and any additional conditions.</p>
              <p>Acceptance creates an agreement between the business and the athlete concerning the specified work, subject to the applicable deal terms.</p>
              <p>Athletes are responsible for performing accepted work professionally, lawfully, and in accordance with the agreed requirements.</p>
              <p>Athletes must not submit fraudulent, plagiarized, unauthorized, or materially misleading deliverables.</p>
              <p>Athletes must comply with applicable advertising disclosure requirements and must not misrepresent sponsorship relationships.</p>
              <p>Unless expressly agreed otherwise, athletes retain responsibility for obtaining permissions needed to use third-party materials included in their deliverables.</p>
            </Section>

            <Section title="8. Deliverables, Revisions, and Approval">
              <p>Athletes submit work through the Platform&apos;s designated deliverable workflow.</p>
              <p>Businesses may review submitted work, approve it, or request revisions. Revision requests should identify the changes reasonably necessary to satisfy the agreed deliverables.</p>
              <p>Businesses must act in good faith and must not use revision requests to obtain materially additional services without appropriate agreement.</p>
              <p>Approval indicates that the business accepts the submitted work for purposes of the Platform&apos;s completion and payment workflow.</p>
              <p>Approval initiates the applicable athlete payment process, subject to payment-provider requirements, account readiness, legal restrictions, and other applicable conditions.</p>
              <p>A business may not intentionally withhold approval to avoid paying for work that materially satisfies the agreed requirements.</p>
              <p>AthleteGum may review reported abuse of the approval process.</p>
            </Section>

            <Section title="9. Payments and Platform Fees">
              <h3>9.1 Business funding</h3>
              <p>Businesses fund individual deals through the payment methods supported by AthleteGum. The business is charged the displayed deal amount, together with any separately disclosed applicable taxes or charges. Deal funding and business subscription charges are separate transactions.</p>
              <h3>9.2 Athlete compensation</h3>
              <p>The athlete&apos;s expected compensation is calculated by deducting the applicable Platform fee from the funded deal amount. For example, a $400 deal subject to a 10% Platform fee results in a $360 athlete share and a $40 Platform fee.</p>
              <p>The Platform fee is deducted from the athlete&apos;s compensation rather than added as a second charge to the business. The applicable fee and expected athlete share are shown before the athlete accepts the offer.</p>
              <h3>9.3 Business plans</h3>
              <p>AthleteGum currently offers:</p>
              <div className="overflow-x-auto">
                <table className="mt-4 w-full min-w-[28rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--ag-border)] text-white">
                      <th className="py-2 pr-4 font-semibold">Plan</th>
                      <th className="py-2 pr-4 font-semibold">Monthly subscription</th>
                      <th className="py-2 pr-4 font-semibold">Active deals</th>
                      <th className="py-2 font-semibold">Platform fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Free", "$0", "Up to 3", "10%"],
                      ["Pro", "$49", "Unlimited", "8%"],
                      ["Growth", "$99", "Unlimited", "6%"],
                    ].map(([plan, price, deals, fee]) => (
                      <tr key={plan} className="border-b border-[var(--ag-border)]">
                        <td className="py-2 pr-4">{plan}</td>
                        <td className="py-2 pr-4">{price}</td>
                        <td className="py-2 pr-4">{deals}</td>
                        <td className="py-2">{fee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>Paid-plan benefits apply only while the relevant subscription remains active. AthleteGum may change pricing or fee schedules prospectively with appropriate notice and any consent required by law. Fees applicable to an already funded deal are not changed retroactively without the affected parties&apos; agreement, except where required by law or to correct a documented error. The fee shown on an offer is the fee that applies to that deal.</p>
              <h3>9.4 Payment processing</h3>
              <p>AthleteGum uses third-party payment services, including Stripe, to process card payments, subscriptions, transfers, and athlete payouts. Users may be required to accept additional payment-provider terms and complete identity, tax, or account verification. AthleteGum does not guarantee a particular transfer or bank settlement time.</p>
              <h3>9.5 Funds pending approval</h3>
              <p>Deal funds are processed through AthleteGum&apos;s payment infrastructure and are not scheduled for release to the athlete until the applicable approval and payout conditions have been satisfied.</p>
              <p>The Platform&apos;s payment workflow is not a representation that AthleteGum operates a licensed escrow service, maintains an insured trust account for each deal, or provides a bank deposit product. Payment custody, settlement, and transfer rights are subject to the actual payment-processing arrangement and applicable law.</p>
              <h3>9.6 Incomplete payout setup</h3>
              <p>Athletes must complete the required payout setup to receive transfers. If work has been approved but the athlete&apos;s payout account is not ready, the approval remains recorded and the payout may remain pending until the applicable requirements are satisfied. AthleteGum may request additional information or take action required by payment-provider rules or law.</p>
              <h3>9.7 Chargebacks and payment reversals</h3>
              <p>Card payments may be subject to chargebacks, reversals, fraud investigations, or other payment-provider actions. AthleteGum may investigate disputed payments and take appropriate steps consistent with applicable law, payment-provider requirements, and the relevant deal terms. Users must not knowingly initiate fraudulent or abusive payment disputes.</p>
            </Section>

            <Section title="10. Subscriptions, Renewals, and Cancellation">
              <p>Paid business subscriptions are billed monthly unless another billing arrangement is expressly disclosed. Subscriptions renew automatically until canceled in accordance with the cancellation instructions provided through the Platform.</p>
              <p>Users receive disclosure of recurring charges and applicable cancellation terms before subscribing. Cancellation prevents future renewal charges, subject to the disclosed billing cutoff and applicable law. Cancellation does not automatically terminate already funded deals or eliminate obligations arising before cancellation.</p>
              <p>Unless otherwise required by law or expressly stated at checkout, subscription fees for a billing period already begun are not prorated. If a paid subscription expires, the account becomes subject to the features and limits of its then-current plan. Existing funded deals remain subject to their agreed terms.</p>
            </Section>

            <Section title="11. Cancellations, Refunds, and Disputes">
              <p>Businesses and athletes should first attempt to resolve deal-related disagreements through the Platform&apos;s messaging and revision workflow.</p>
              <p>Users may contact AthleteGum regarding nonperformance, missed deadlines, disputed deliverables, fraudulent activity, or other deal problems. AthleteGum may review deal records, messages, submissions, payment status, and other relevant information.</p>
              <p>Where authorized by the applicable agreement and law, AthleteGum may facilitate cancellation, refunds, payment holds, or other resolution measures. AthleteGum does not guarantee that every dispute will result in a refund or payment.</p>
              <p>Nothing in these Terms limits nonwaivable statutory rights or payment-card dispute rights.</p>
            </Section>

            <Section title="12. NIL Compliance and Athletic Eligibility">
              <p>Athletes and businesses are responsible for ensuring that proposed partnerships comply with applicable federal and state laws, collegiate athletic rules, institutional policies, conference requirements, and relevant governing-body requirements.</p>
              <p>Athletes may have obligations to disclose NIL agreements to their institutions or other designated compliance authorities. Businesses must not structure payments as prohibited compensation for athletic performance, recruiting inducements, or other impermissible activities.</p>
              <p>Users must obtain any necessary permissions before using school logos, team uniforms, institutional facilities, trademarks, or other protected materials.</p>
              <p>AthleteGum does not provide legal representation, athletic eligibility determinations, or institutional compliance approval. AthleteGum may decline, suspend, or cancel transactions reasonably believed to violate applicable NIL requirements.</p>
            </Section>

            <Section title="13. Advertising and Endorsement Compliance">
              <p>Users must comply with applicable advertising, endorsement, consumer-protection, and intellectual-property laws. Athletes must make required disclosures when publishing sponsored or compensated content. Businesses must not require deceptive endorsements, fabricated testimonials, undisclosed sponsorships, or misleading claims.</p>
              <p>Users are responsible for ensuring that advertising content is accurate and that required disclosures are clear and appropriately presented.</p>
            </Section>

            <Section title="14. Intellectual Property and Content Rights">
              <p>Athletes and businesses retain ownership of intellectual property they owned before entering into a deal. Ownership and permitted use of new deliverables must be determined by the applicable deal agreement.</p>
              <p>Unless the parties expressly agree otherwise, a funded deal does not automatically transfer all copyrights, grant perpetual commercial usage rights, or authorize unrestricted use of an athlete&apos;s name, image, likeness, or identity.</p>
              <p>Businesses must obtain the rights needed for their intended use, including any advertising, reposting, editing, sublicensing, or post-term use.</p>
              <p>Users grant AthleteGum a limited, nonexclusive license to host, store, reproduce, and display content as reasonably necessary to operate the Platform and provide its services, subject to applicable privacy settings and confidentiality obligations.</p>
              <p>AthleteGum&apos;s own trademarks, software, interface designs, and other proprietary materials remain the property of AthleteGum or its licensors.</p>
            </Section>

            <Section title="15. Communications and Notifications">
              <p>Users agree to receive service-related communications necessary for account operation, security, deal invitations, submissions, approvals, billing, and payment administration. Marketing communications are subject to applicable consent and unsubscribe requirements.</p>
              <p>Deal messages may be retained as part of the transaction record. Users must not use AthleteGum communications for harassment, spam, threats, fraud, or unlawful solicitation.</p>
            </Section>

            <Section title="16. Prohibited Conduct">
              <p>Users must not:</p>
              <ul>
                <li>Create fraudulent or misleading accounts.</li>
                <li>Impersonate athletes, businesses, or representatives.</li>
                <li>Submit fake work or fabricated evidence of performance.</li>
                <li>Manipulate payment, approval, or dispute systems.</li>
                <li>Use stolen payment credentials.</li>
                <li>Circumvent Platform restrictions or security controls.</li>
                <li>Scrape or harvest personal information without authorization.</li>
                <li>Infringe intellectual-property or publicity rights.</li>
                <li>Engage in unlawful discrimination, harassment, or exploitation.</li>
                <li>Facilitate prohibited NIL transactions or illegal endorsements.</li>
                <li>Use the Platform for money laundering or other unlawful financial activity.</li>
              </ul>
              <p>AthleteGum may investigate suspected violations and take proportionate enforcement action.</p>
            </Section>

            <Section title="17. Independent Relationships">
              <p>AthleteGum provides technology and administrative functionality for athlete partnerships. Unless separately agreed in writing, AthleteGum is not the employer, agent, manager, attorney, or legal representative of either party.</p>
              <p>A business and an athlete are responsible for their respective contractual, tax, employment-classification, and legal obligations. Nothing in these Terms creates an employment relationship, joint venture, or general agency relationship between AthleteGum and its users.</p>
              <p>The legal classification of a particular working relationship depends on applicable law and actual circumstances, not solely on these Terms.</p>
            </Section>

            <Section title="18. Taxes">
              <p>Users are responsible for determining and satisfying their applicable tax obligations. Athletes may be required to provide tax information to AthleteGum or its payment providers. AthleteGum and its payment providers may collect tax documentation, report transactions, or withhold amounts where required by law. AthleteGum does not provide individualized tax advice.</p>
            </Section>

            <Section title="19. Third-Party Services">
              <p>The Platform may integrate with third-party payment providers, authentication systems, hosting services, email delivery, and social media platforms. Use of third-party services may be governed by separate terms and privacy policies. AthleteGum is not responsible for independent third-party conduct beyond the responsibilities imposed on AthleteGum by applicable law.</p>
            </Section>

            <Section title="20. Platform Availability">
              <p>AthleteGum seeks to maintain a reliable service but does not guarantee uninterrupted availability. Maintenance, security incidents, technical failures, payment-provider outages, or circumstances outside our reasonable control may affect access. AthleteGum may modify features, provided that changes do not unlawfully impair existing contractual rights.</p>
            </Section>

            <Section title="21. Disclaimers">
              <p>To the maximum extent permitted by law, the Platform is provided on an &quot;as available&quot; and &quot;as is&quot; basis. AthleteGum does not guarantee the availability of athlete partnerships, the acceptance of any offer, the commercial performance of a partnership, a particular level of earnings or business results, continuous Platform availability, immediate payout settlement, or an athlete&apos;s continued eligibility under athletic rules.</p>
              <p>Nothing in this section excludes warranties or protections that cannot lawfully be disclaimed.</p>
            </Section>

            <Section title="22. Limitation of Liability">
              <p>To the maximum extent permitted by applicable law, AthleteGum will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages arising from use of the Platform.</p>
              <p>Subject to nonwaivable legal obligations and exceptions for liability that cannot lawfully be limited, AthleteGum&apos;s aggregate liability arising from a claim relating to the Platform will not exceed the greater of (a) the Platform fees actually received by AthleteGum in connection with the transactions giving rise to the claim during the preceding 12 months, or (b) $100.</p>
              <p>This limitation does not eliminate AthleteGum&apos;s obligation to account for or pay funds lawfully owed to users, or liability that applicable law prohibits limiting.</p>
            </Section>

            <Section title="23. Indemnification">
              <p>To the extent permitted by law, business users agree to defend and indemnify AthleteGum against third-party claims arising from unlawful advertising instructions, unauthorized use of intellectual property, misrepresentations, or material violations of these Terms.</p>
              <p>Athlete users agree to indemnify AthleteGum against third-party claims arising from fraudulent submissions, unauthorized content, material misrepresentations, or material violations of these Terms.</p>
              <p>Indemnification obligations do not apply to the extent claims arise from AthleteGum&apos;s own unlawful conduct or other responsibility that cannot legally be shifted.</p>
            </Section>

            <Section title="24. Suspension and Termination">
              <p>Users may request account closure through available account controls or by contacting AthleteGum. AthleteGum may suspend or terminate accounts for material violations, suspected fraud, legal requirements, or significant security risks.</p>
              <p>Account closure does not automatically cancel outstanding contractual obligations or eliminate legally required transaction records. Where feasible and legally appropriate, AthleteGum will provide notice and information concerning unresolved transactions.</p>
            </Section>

            <Section title="25. Changes to These Terms">
              <p>AthleteGum may update these Terms to reflect legal, operational, security, or product changes. Material changes will be communicated through appropriate channels before taking effect where required. Changes will not retroactively alter completed transactions or existing contractual rights except as permitted by law.</p>
            </Section>

            <Section title="26. Governing Law and Disputes">
              <p>These Terms are governed by applicable United States law, except where mandatory law provides otherwise. Subject to applicable consumer protections, disputes arising from these Terms will be brought in a court of competent jurisdiction.</p>
              <p>Nothing in these Terms prevents users from exercising rights or pursuing remedies that cannot lawfully be waived. These Terms do not require mandatory arbitration and do not waive the right to participate in a class action.</p>
            </Section>

            <Section title="27. Severability and Entire Agreement">
              <p>If any provision is found unenforceable, the remaining provisions will continue in effect to the extent permitted by law.</p>
              <p>These Terms, the Privacy Policy, applicable deal agreements, and any expressly incorporated policies constitute the relevant agreements governing use of AthleteGum.</p>
              <p>If a deal-specific provision conflicts with these Terms regarding the parties&apos; agreed work or usage rights, the deal-specific provision controls for that subject, except where prohibited by law or where mandatory Platform payment or safety rules apply.</p>
            </Section>

            <Section title="28. Contact Information">
              <p>For legal notices, account questions, or disputes:</p>
              <p className="text-white">
                AthleteGum
                <br />
                <Mail />
                <br />
                <a href="https://www.athletegum.com" className="text-[var(--ag-primary-light)] underline">https://www.athletegum.com</a>
              </p>
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
