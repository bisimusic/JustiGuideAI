import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-chalk text-ink font-body">
      <div className="max-w-3xl mx-auto px-6 py-10 md:py-14">
        <div className="mb-10">
          <Link
            href="/"
            className="text-accent font-semibold hover:text-accent-deep mb-5 inline-block transition-colors"
          >
            ← Back to Home
          </Link>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mb-3">Terms of Use</h1>
          <p className="text-sm text-warm-gray">
            Effective Date: March 26, 2026 · Last Updated: March 26, 2026
          </p>
        </div>

        <div className="prose prose-lg max-w-none space-y-10 text-ink/90 [&_strong]:text-ink">
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using the JustiGuide platform, website, or any related services (collectively, the
              &ldquo;Platform&rdquo;), you agree to be bound by these Terms of Use (&ldquo;Terms&rdquo;). If you do not
              agree, please do not access or use the Platform.
            </p>
            <p>
              These Terms apply to all users, including individuals seeking immigration guidance (&ldquo;Users&rdquo;) and
              licensed immigration attorneys subscribing to professional tools (&ldquo;Lawyer Subscribers&rdquo;). Different
              provisions may apply to each user type as specified below.
            </p>
            <p>
              We reserve the right to update these Terms at any time. We will notify you of material changes via email or
              a notice on the Platform. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              2. Description of Service
            </h2>
            <p>
              JustiGuide is an AI-powered immigration legal technology platform that helps individuals navigate the
              immigration system and connects them with qualified, vetted immigration attorneys. The Platform enables Users
              to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Submit immigration case information for initial assessment</li>
              <li>Receive AI-assisted preliminary case evaluations</li>
              <li>Connect with and retain licensed immigration attorneys</li>
              <li>Access immigration resources, guidance, and status tracking</li>
              <li>Communicate securely with their assigned attorney through the Platform</li>
            </ul>
            <p>
              Lawyer Subscribers gain access to professional tools including case management features, client intake
              workflows, AI-assisted document analysis, and administrative support tools.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              3. Important: No Attorney-Client Relationship with JustiGuide
            </h2>
            <p>
              JustiGuide is a technology platform, not a law firm. Use of the Platform does not create an attorney-client
              relationship between you and JustiGuide, Inc. Any AI-generated assessments, case evaluations, or informational
              content provided through the Platform are for general informational purposes only and do not constitute legal
              advice.
            </p>
            <p>
              An attorney-client relationship is established solely between you and the individual licensed immigration
              attorney you choose to retain through the Platform, subject to a separate engagement agreement with that
              attorney.
            </p>
            <p>
              JustiGuide does not guarantee specific immigration outcomes. Immigration law is complex and fact-specific, and
              results vary based on individual circumstances, applicable law, and agency decisions outside JustiGuide&apos;s
              control.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              4. Artificial Intelligence Features
            </h2>
            <p>
              The Platform uses artificial intelligence to assist with preliminary case assessment, document review, and
              attorney matching. By using the Platform, you acknowledge and agree to the following:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                AI-generated outputs are tools to assist attorneys and inform users — they are not legal determinations or
                advice
              </li>
              <li>
                All AI assessments are reviewed by licensed immigration attorneys before substantive guidance is provided to
                you
              </li>
              <li>
                Your data is anonymized before being processed by AI systems. Your name, contact information, and direct
                identifiers are removed prior to AI analysis
              </li>
              <li>
                AI features may evolve over time. We will notify you of material changes to how AI is used in the Platform
              </li>
              <li>
                You should not rely solely on AI-generated content for immigration decisions. Always consult with your
                assigned attorney
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              5. User Accounts and Registration
            </h2>
            <p>To access certain features, you must create an account. You agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate, complete, and current information during registration</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access to your account</li>
              <li>Be responsible for all activity that occurs under your account</li>
            </ul>
            <p>
              JustiGuide reserves the right to suspend or terminate accounts that violate these Terms or that we reasonably
              believe pose a security risk.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              6. Subscriptions and Payment
            </h2>
            <h3 className="text-lg font-semibold text-ink">6.1 Individual Users</h3>
            <p>
              Individual Users may access the Platform under a subscription plan at the current published rate.
              Subscription fees are billed in advance on a recurring basis. You may cancel at any time; cancellation takes
              effect at the end of the current billing period.
            </p>
            <h3 className="text-lg font-semibold text-ink">6.2 Lawyer Subscribers</h3>
            <p>
              Immigration attorneys may subscribe to professional tools on a monthly basis at the current published rate. By
              subscribing, Lawyer Subscribers agree to additional obligations set forth in the Lawyer Subscriber Addendum,
              including compliance with applicable professional conduct rules, maintenance of active licensure, and
              confidentiality obligations with respect to client data.
            </p>
            <h3 className="text-lg font-semibold text-ink">6.3 Refunds</h3>
            <p>
              Subscription fees are generally non-refundable except as required by applicable law or as expressly stated in
              our Refund Policy. If you believe you have been charged in error, contact us at{" "}
              <a href="mailto:billing@justiguide.com" className="text-accent font-semibold hover:underline">
                billing@justiguide.com
              </a>{" "}
              within 30 days.
            </p>
            <h3 className="text-lg font-semibold text-ink">6.4 Payment Processing</h3>
            <p>
              Payments are processed by a third-party payment processor. JustiGuide does not store your full payment card
              details. By providing payment information, you authorize us to charge your selected payment method for
              applicable fees.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              7. User Responsibilities and Prohibited Conduct
            </h2>
            <p>By using the Platform, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and truthful information in all submissions</li>
              <li>Use the Platform only for lawful immigration consultation purposes</li>
              <li>Maintain the confidentiality of information shared by other users or attorneys</li>
              <li>Comply with all applicable federal, state, and local laws</li>
            </ul>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Submit false, misleading, or fraudulent information</li>
              <li>Attempt to reverse engineer, scrape, or extract data from the Platform</li>
              <li>Use the Platform to harass, threaten, or harm others</li>
              <li>Circumvent security measures or access features you are not authorized to use</li>
              <li>Use the Platform for any commercial purpose other than as expressly permitted</li>
              <li>Impersonate any person, attorney, or entity</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              8. Data, Privacy, and Security
            </h2>
            <p>
              Your privacy is critically important to us, especially given the sensitive nature of immigration data. Our
              practices are governed by our{" "}
              <Link href="/privacy-policy" className="text-accent font-semibold hover:underline">
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference. It is also available at{" "}
              <a href="https://www.justiguide.com/privacy-policy" className="text-accent font-semibold hover:underline" target="_blank" rel="noopener noreferrer">
                justiguide.com/privacy-policy
              </a>
              .
            </p>
            <p className="font-semibold text-ink">Key commitments:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Sensitive case data is stored on JustiGuide&apos;s own on-premises infrastructure, encrypted at rest and in
                transit
              </li>
              <li>Your identifiable case information is shared only with the specific attorney assigned to your case</li>
              <li>Data is anonymized before any AI processing occurs</li>
              <li>We do not sell your personal information</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              9. Lawyer Subscriber Obligations
            </h2>
            <p>Lawyers who subscribe to JustiGuide&apos;s professional platform agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintain an active license to practice immigration law in the relevant jurisdiction(s)</li>
              <li>
                Comply with all applicable rules of professional conduct, including confidentiality and conflicts of interest
                rules
              </li>
              <li>
                Promptly disclose to JustiGuide any change in licensure status, disciplinary action, or sanction
              </li>
              <li>Not share Platform access credentials with unlicensed individuals</li>
              <li>Use the Platform only in connection with legitimate legal representation</li>
            </ul>
            <p>
              JustiGuide reserves the right to immediately suspend a Lawyer Subscriber&apos;s access upon notice of license
              suspension, revocation, or material ethical violation.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              10. Intellectual Property
            </h2>
            <p>
              The Platform, including all software, content, features, trademarks, and functionality, is owned by JustiGuide,
              Inc. and is protected by applicable intellectual property laws. You are granted a limited, non-exclusive,
              non-transferable license to use the Platform for its intended purposes.
            </p>
            <p>
              You retain ownership of any case information or documents you upload to the Platform. By uploading content,
              you grant JustiGuide a limited license to process and use that content solely to provide the services described
              in these Terms.
            </p>
            <p>
              You may not copy, modify, distribute, or create derivative works based on the Platform without our prior
              written consent.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              11. Disclaimer of Warranties
            </h2>
            <p>
              The platform is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind,
              express or implied. JustiGuide disclaims all warranties, including but not limited to warranties of
              merchantability, fitness for a particular purpose, accuracy, and non-infringement.
            </p>
            <p>
              We do not warrant that the Platform will be error-free, uninterrupted, or free of harmful components.
              Immigration laws and regulations change frequently; we make reasonable efforts to keep information current but
              cannot guarantee accuracy at all times.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              12. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by applicable law, JustiGuide, Inc. and its officers, directors, employees,
              and agents shall not be liable for any indirect, incidental, special, consequential, exemplary, or punitive
              damages arising out of or relating to your use of the platform, including but not limited to loss of data,
              loss of immigration status, or adverse immigration outcomes.
            </p>
            <p>
              Our total liability for any claim arising under these Terms shall not exceed the amount you paid to JustiGuide
              in the three months preceding the claim. This limitation applies regardless of the form of action and whether
              JustiGuide has been advised of the possibility of such damages.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              13. Indemnification
            </h2>
            <p>
              You agree to indemnify and hold harmless JustiGuide, Inc., its affiliates, officers, directors, employees,
              and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable
              legal fees) arising out of or related to: (a) your use of the Platform; (b) your violation of these Terms; (c)
              your submission of false or misleading information; or (d) your violation of any third-party rights.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              14. Termination
            </h2>
            <p>
              You may terminate your account at any time by contacting us at{" "}
              <a href="mailto:support@justiguide.com" className="text-accent font-semibold hover:underline">
                support@justiguide.com
              </a>{" "}
              or through your account settings.
            </p>
            <p>
              JustiGuide may suspend or terminate your access to the Platform at any time, with or without cause, including
              for violation of these Terms, nonpayment, or conduct that we determine is harmful to the Platform or other
              users. We will endeavor to provide advance notice where practicable, except in cases of serious misconduct or
              security concerns.
            </p>
            <p>
              Upon termination, your right to access the Platform ceases immediately. Provisions of these Terms that by their
              nature should survive termination (including Sections 10–13) shall survive.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              15. Governing Law and Dispute Resolution
            </h2>
            <p>
              These Terms shall be governed by the laws of the State of California, without regard to conflict of law
              principles. Any dispute arising out of or related to these Terms or the Platform shall be resolved exclusively
              in the state or federal courts located in San Francisco County, California, and you consent to personal
              jurisdiction in those courts.
            </p>
            <p>
              Before initiating any legal proceeding, you agree to first contact us at{" "}
              <a href="mailto:legal@justiguide.com" className="text-accent font-semibold hover:underline">
                legal@justiguide.com
              </a>{" "}
              to attempt informal resolution. We will make good-faith efforts to resolve disputes within 30 days of receiving
              written notice.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              16. Miscellaneous
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Entire Agreement:</strong> These Terms, together with the Privacy Policy and any applicable
                Subscriber Addendum, constitute the entire agreement between you and JustiGuide with respect to the Platform.
              </li>
              <li>
                <strong>Severability:</strong> If any provision of these Terms is found to be unenforceable, the remaining
                provisions will remain in full force and effect.
              </li>
              <li>
                <strong>Waiver:</strong> JustiGuide&apos;s failure to enforce any right or provision of these Terms shall not
                constitute a waiver of that right or provision.
              </li>
              <li>
                <strong>Assignment:</strong> You may not assign your rights or obligations under these Terms without our prior
                written consent.
              </li>
              <li>
                <strong>Notices:</strong> All notices to JustiGuide should be sent to{" "}
                <a href="mailto:legal@justiguide.com" className="text-accent font-semibold hover:underline">
                  legal@justiguide.com
                </a>
                .
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              17. Contact Us
            </h2>
            <p>For questions about these Terms, please contact:</p>
            <ul className="list-none space-y-2">
              <li>
                <strong>Email:</strong>{" "}
                <a href="mailto:legal@justiguide.com" className="text-accent font-semibold hover:underline">
                  legal@justiguide.com
                </a>
              </li>
              <li>
                <strong>Website:</strong>{" "}
                <a href="https://www.justiguide.com" className="text-accent font-semibold hover:underline" target="_blank" rel="noopener noreferrer">
                  https://www.justiguide.com
                </a>
              </li>
              <li>
                <strong>Mailing Address:</strong> JustiGuide, Inc., Legal Department, San Francisco, CA
              </li>
            </ul>
            <p className="text-sm text-warm-gray pt-4 border-t border-border">
              These Terms of Use do not constitute legal advice. For advice specific to your situation, please consult a
              qualified attorney.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
