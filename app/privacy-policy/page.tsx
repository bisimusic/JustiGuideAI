import Link from "next/link";

export default function PrivacyPolicy() {
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
          <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mb-3">Privacy Policy</h1>
          <p className="text-sm text-warm-gray">
            Effective Date: March 26, 2026 · Last Updated: March 26, 2026
          </p>
        </div>

        <div className="prose prose-lg max-w-none space-y-10 text-ink/90 [&_strong]:text-ink">
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              1. Introduction
            </h2>
            <p>
              JustiGuide, Inc. (&ldquo;JustiGuide,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is an
              AI-powered immigration legal technology platform that connects individuals navigating the immigration system
              with qualified immigration attorneys. We respect your privacy and are deeply committed to protecting your
              personal information, particularly given the sensitive nature of immigration status data.
            </p>
            <p>
              This Privacy Policy applies to all users of the JustiGuide platform, including individuals
              (&ldquo;Users&rdquo;) and immigration attorneys (&ldquo;Lawyer Subscribers&rdquo;), and governs data
              collected through our website, web application, and any related services (collectively, the
              &ldquo;Platform&rdquo;).
            </p>
            <p>
              Please read this policy carefully. If you have questions, contact us at{" "}
              <a href="mailto:privacy@justiguide.com" className="text-accent font-semibold hover:underline">
                privacy@justiguide.com
              </a>
              .
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              2. Information We Collect
            </h2>
            <h3 className="text-lg font-semibold text-ink">2.1 Information You Provide</h3>
            <p>When you use JustiGuide, we may collect the following categories of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Case Information:</strong> Immigration case details, case type, urgency level, and case
                description
              </li>
              <li>
                <strong>Contact Information:</strong> Email address and phone number (optional)
              </li>
              <li>
                <strong>Consultation Preferences:</strong> Your preferred consultation methods and timing
              </li>
              <li>
                <strong>Supporting Documents:</strong> Identification documents and immigration history shared for case
                assessment purposes
              </li>
              <li>
                <strong>Payment Information:</strong> Payment information processed securely through our third-party
                payment processor. We do not store full payment card numbers.
              </li>
            </ul>
            <h3 className="text-lg font-semibold text-ink pt-2">2.2 Information Collected Automatically</h3>
            <p>We may automatically collect limited technical data to operate and improve the Platform:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Usage Data:</strong> How you interact with the Platform
              </li>
              <li>
                <strong>Technical Data:</strong> IP address, browser type, and device information
              </li>
              <li>
                <strong>Timestamps:</strong> When you submit forms or request consultations
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              3. How We Store and Protect Your Data
            </h2>
            <p>
              The security of your immigration information is our highest priority. JustiGuide stores all sensitive user
              data on-premises on our own secure infrastructure — we do not rely on third-party cloud storage for personal
              case data.
            </p>
            <p>Our data protection measures include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Encryption:</strong> All personal and case data is encrypted at rest and in transit using
                industry-standard encryption protocols.
              </li>
              <li>
                <strong>Access Controls:</strong> Access to user data is strictly limited to the specific immigration
                attorney assigned to your case. No other attorneys or third parties have access to your case information.
              </li>
              <li>
                <strong>Security Audits:</strong> Our infrastructure undergoes regular security audits and vulnerability
                assessments.
              </li>
              <li>
                <strong>Confidentiality Obligations:</strong> All staff and attorney subscribers are bound by
                confidentiality obligations.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              4. How We Use Your Information
            </h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Providing Services:</strong> Processing consultation requests and matching you with a qualified
                immigration attorney
              </li>
              <li>
                <strong>Case Assessment:</strong> Conducting an initial assessment of your immigration situation to
                support attorney review
              </li>
              <li>
                <strong>Communication:</strong> Contacting you regarding your consultation request and case status
              </li>
              <li>
                <strong>Service Improvement:</strong> Improving Platform functionality, user experience, and service
                quality
              </li>
              <li>
                <strong>Legal Compliance:</strong> Complying with applicable laws and regulations
              </li>
              <li>
                <strong>Security:</strong> Detecting and protecting against fraud, abuse, and security threats
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              5. Artificial Intelligence and Automated Processing
            </h2>
            <p>
              JustiGuide uses artificial intelligence to assist with initial case assessments and to help match users
              with appropriate legal resources. We are committed to transparent and responsible AI use.
            </p>
            <p className="font-semibold text-ink">How AI interacts with your data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Before your information is processed by our AI systems, it is anonymized. Personally identifiable
                information (such as your name, contact details, and direct identifiers) is removed or replaced before any AI
                model analyzes your case details.
              </li>
              <li>
                AI-generated assessments are tools to assist attorneys — they are not legal advice, and all substantive
                legal guidance is provided by licensed immigration professionals.
              </li>
              <li>
                We do not use your personal data to train external AI models or share it with third-party AI providers in
                identifiable form.
              </li>
              <li>Attorneys review AI-generated assessments before providing recommendations to clients.</li>
            </ul>
            <p>
              If you have questions about how AI processes your information, contact us at{" "}
              <a href="mailto:privacy@justiguide.com" className="text-accent font-semibold hover:underline">
                privacy@justiguide.com
              </a>
              .
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              6. Information Sharing and Disclosure
            </h2>
            <h3 className="text-lg font-semibold text-ink">6.1 Your Assigned Attorney</h3>
            <p>
              Your case information is shared exclusively with the immigration attorney assigned to your case through the
              JustiGuide Platform. That attorney is bound by applicable professional ethical obligations, confidentiality
              rules, and our data processing agreement. No other attorneys or third parties receive access to your
              identifiable case data.
            </p>
            <h3 className="text-lg font-semibold text-ink">6.2 Service Providers</h3>
            <p>
              We work with a limited number of trusted service providers who assist us in operating the Platform (such as
              payment processing). These providers are contractually prohibited from using your data for any purpose other
              than providing services to JustiGuide, and they do not have access to your immigration case details.
            </p>
            <h3 className="text-lg font-semibold text-ink">6.3 Legal Requirements</h3>
            <p>
              We may disclose your information if required by law or in response to valid legal process. Given the
              sensitive nature of immigration data, we will:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Carefully review any government request before responding</li>
              <li>Notify affected users to the extent permitted by law</li>
              <li>Challenge requests we believe to be overbroad or unlawful</li>
            </ul>
            <h3 className="text-lg font-semibold text-ink">6.4 No Sale of Personal Information</h3>
            <p>
              We do not sell, rent, or trade your personal information to any third party for marketing or commercial
              purposes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              7. Data Retention
            </h2>
            <p>
              We retain your personal information only as long as necessary to provide our services and comply with legal
              obligations. Immigration case information may be retained for up to 7 years to ensure continuity of service
              and satisfy applicable legal and professional record-keeping requirements. You may request deletion of your
              data at any time (see Section 9).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              8. Special Protections for Immigration Status Information
            </h2>
            <p>
              We recognize that immigration status information is among the most sensitive categories of personal data.
              Exposure of this information could cause serious harm, including legal jeopardy. In addition to our standard
              security practices, we apply heightened protections:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Immigration status data is never used for advertising, profiling, or any purpose unrelated to your legal
                services
              </li>
              <li>
                We do not voluntarily share immigration status information with law enforcement or immigration authorities
              </li>
              <li>
                In the event of a data breach involving immigration status information, we will notify affected users
                promptly in accordance with applicable law
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              9. Your Rights and Choices
            </h2>
            <p>You have the following rights with respect to your personal information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Access:</strong> Request access to the personal information we hold about you
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate or incomplete information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal information, subject to legal retention
                requirements
              </li>
              <li>
                <strong>Portability:</strong> Request a copy of your data in a portable format
              </li>
              <li>
                <strong>Opt-Out:</strong> Opt out of non-essential communications at any time
              </li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at{" "}
              <a href="mailto:privacy@justiguide.com" className="text-accent font-semibold hover:underline">
                privacy@justiguide.com
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              10. Children&apos;s Privacy
            </h2>
            <p>
              The JustiGuide Platform is not intended for individuals under 18 years of age. We do not knowingly collect
              personal information from minors. If we become aware that we have collected information from a person under
              18, we will take prompt steps to delete it.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              11. International Users
            </h2>
            <p>
              JustiGuide is operated from the United States. If you access our Platform from outside the United States,
              please be aware that your information may be transferred to and processed in the United States, where data
              protection laws may differ from those in your jurisdiction. By using the Platform, you consent to this
              transfer.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              12. California Privacy Rights (CCPA / CPRA)
            </h2>
            <p>
              If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA) and the
              California Privacy Rights Act (CPRA), including the right to know, delete, correct, and opt out of the sale or
              sharing of your personal information. As noted above, JustiGuide does not sell personal information.
            </p>
            <p>
              To exercise your California privacy rights, contact us at{" "}
              <a href="mailto:privacy@justiguide.com" className="text-accent font-semibold hover:underline">
                privacy@justiguide.com
              </a>{" "}
              or write to the address below.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              13. European Users (GDPR)
            </h2>
            <p>
              If you are located in the European Economic Area (EEA) or the United Kingdom, you have rights under the
              General Data Protection Regulation (GDPR) or UK GDPR, including the right to access, rectify, erase,
              restrict processing, object to processing, and data portability. You also have the right to lodge a complaint
              with a supervisory authority in your country of residence.
            </p>
            <p>
              Our lawful basis for processing your personal data is: (a) contractual necessity, to provide the services you
              request; (b) legal obligation, where required by law; and (c) legitimate interests, for fraud prevention and
              security.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              14. Changes to This Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal
              requirements. We will notify you of material changes by posting the updated policy on this page and updating
              the &ldquo;Last Updated&rdquo; date. For significant changes, we will provide additional notice (such as
              email notification).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-ink font-display border-b border-border pb-2">
              15. Contact Us
            </h2>
            <p>If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
            <ul className="list-none space-y-2">
              <li>
                <strong>Email:</strong>{" "}
                <a href="mailto:privacy@justiguide.com" className="text-accent font-semibold hover:underline">
                  privacy@justiguide.com
                </a>
              </li>
              <li>
                <strong>Website:</strong>{" "}
                <a href="https://www.justiguide.com" className="text-accent font-semibold hover:underline" target="_blank" rel="noopener noreferrer">
                  https://www.justiguide.com
                </a>
              </li>
              <li>
                <strong>Mailing Address:</strong> JustiGuide, Inc., Privacy Office, San Francisco, CA
              </li>
            </ul>
            <p className="text-sm text-warm-gray pt-4 border-t border-border">
              This Privacy Policy is provided for informational purposes. For legal advice regarding your specific situation,
              please consult a qualified attorney.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
