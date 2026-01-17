import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: September 26, 2025</p>
        </div>

        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-4">
              JustiGuide ("we," "our," or "us") respects your privacy and is committed to protecting 
              your personal information. This Privacy Policy explains how we collect, use, disclose, 
              and safeguard your information when you use our Reddit application ("the App").
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-3">2.1 Information You Provide</h3>
            <p className="mb-4">When you use our App, we may collect:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Case Information:</strong> Immigration case details, case type, urgency level, and case description</li>
              <li><strong>Contact Information:</strong> Email address and phone number (optional)</li>
              <li><strong>Reddit Information:</strong> Your Reddit username and subreddit context</li>
              <li><strong>Consultation Preferences:</strong> Preferred consultation methods and timing</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">2.2 Automatically Collected Information</h3>
            <p className="mb-4">We may automatically collect:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Usage Data:</strong> How you interact with the App and Reddit</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
              <li><strong>Timestamps:</strong> When you submit forms or request consultations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Provide Services:</strong> Process consultation requests and connect you with immigration professionals</li>
              <li><strong>Case Assessment:</strong> Analyze your case details to provide initial evaluations</li>
              <li><strong>Communication:</strong> Contact you regarding your consultation requests</li>
              <li><strong>Service Improvement:</strong> Enhance our App functionality and user experience</li>
              <li><strong>Legal Compliance:</strong> Comply with applicable laws and regulations</li>
              <li><strong>Security:</strong> Protect against fraud, abuse, and security threats</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
            
            <h3 className="text-xl font-semibold mb-3">4.1 Service Providers</h3>
            <p className="mb-4">
              We may share your information with qualified immigration attorneys and professionals 
              who can assist with your case. These professionals are bound by confidentiality 
              agreements and professional ethical obligations.
            </p>

            <h3 className="text-xl font-semibold mb-3">4.2 Legal Requirements</h3>
            <p className="mb-4">We may disclose your information if required by law or to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Comply with legal processes or government requests</li>
              <li>Protect our rights, property, or safety</li>
              <li>Protect the rights, property, or safety of others</li>
              <li>Investigate potential violations of our terms</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">4.3 No Sale of Personal Information</h3>
            <p className="mb-4">
              We do not sell, rent, or trade your personal information to third parties for 
              marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="mb-4">
              We implement appropriate technical and organizational security measures to protect 
              your personal information against unauthorized access, alteration, disclosure, or 
              destruction. However, no internet transmission is completely secure, and we cannot 
              guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
            <p className="mb-4">
              We retain your information only as long as necessary to provide our services and 
              comply with legal obligations. Case information may be retained for up to 7 years 
              to ensure continuity of service and legal compliance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights and Choices</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Opt-out:</strong> Opt out of certain communications</li>
            </ul>
            <p className="mb-4">
              To exercise these rights, please contact us at privacy@justiguide.com.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Reddit Integration</h2>
            <p className="mb-4">
              Our App operates within Reddit's platform and is subject to Reddit's Privacy Policy 
              and Terms of Service. We recommend reviewing Reddit's privacy practices at 
              https://www.reddit.com/policies/privacy-policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. International Users</h2>
            <p className="mb-4">
              If you are accessing our service from outside the United States, please note that 
              your information may be transferred to, stored, and processed in the United States 
              where our servers are located.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
            <p className="mb-4">
              Our service is not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children under 13. If we become aware that we have 
              collected such information, we will take steps to delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any 
              material changes by posting the new Privacy Policy on this page with an updated 
              "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mb-4">
              <strong>Email:</strong> privacy@justiguide.com<br />
              <strong>Mailing Address:</strong> JustiGuide Privacy Office<br />
              <strong>Website:</strong> https://www.justi.guide
            </p>
          </section>

          <section className="border-t pt-6 mt-8">
            <h2 className="text-2xl font-semibold mb-4">California Privacy Rights (CCPA)</h2>
            <p className="mb-4">
              If you are a California resident, you have additional rights under the California 
              Consumer Privacy Act (CCPA), including the right to know, delete, and opt-out of 
              the sale of personal information. Since we do not sell personal information, 
              the opt-out right does not apply to our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">European Users (GDPR)</h2>
            <p className="mb-4">
              If you are located in the European Economic Area (EEA), you have additional rights 
              under the General Data Protection Regulation (GDPR), including the right to 
              portability and the right to lodge a complaint with a supervisory authority.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}