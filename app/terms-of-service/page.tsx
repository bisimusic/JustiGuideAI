import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold mb-2">Terms and Conditions</h1>
          <p className="text-muted-foreground">Last updated: September 26, 2025</p>
        </div>

        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By using the JustiGuide Immigration Consultation app ("the App") on Reddit's platform, 
              you agree to be bound by these Terms and Conditions. If you do not agree to these terms, 
              please do not use the App.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="mb-4">
              JustiGuide is a Reddit-based application that connects users with immigration consultation 
              services. The App allows users to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Submit immigration case information through structured forms</li>
              <li>Receive initial consultations and case assessments</li>
              <li>Access immigration-related resources and guidance</li>
              <li>Connect with qualified immigration professionals</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
            <p className="mb-4">Users agree to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Provide accurate and truthful information in all submissions</li>
              <li>Use the service only for legitimate immigration consultation purposes</li>
              <li>Comply with all applicable laws and Reddit's Terms of Service</li>
              <li>Not use the service for spam, fraud, or any illegal activities</li>
              <li>Respect the privacy and confidentiality of other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Service Limitations</h2>
            <p className="mb-4">
              <strong>Important:</strong> JustiGuide provides initial consultation and information services only. 
              Our service does not constitute legal advice, and we are not your attorney unless a formal 
              attorney-client relationship is established through separate agreement.
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Consultations are for informational purposes only</li>
              <li>Case assessments are preliminary and non-binding</li>
              <li>Users should consult with qualified attorneys for legal representation</li>
              <li>JustiGuide does not guarantee specific immigration outcomes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Privacy and Data Protection</h2>
            <p className="mb-4">
              User privacy is important to us. Please review our Privacy Policy for detailed 
              information about how we collect, use, and protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="mb-4">
              The JustiGuide app, including its content, features, and functionality, is owned 
              by JustiGuide and protected by international copyright, trademark, and other 
              intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Disclaimer of Warranties</h2>
            <p className="mb-4">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. JUSTIGUIDE 
              DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF 
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="mb-4">
              IN NO EVENT SHALL JUSTIGUIDE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
              CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO YOUR USE OF 
              THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
            <p className="mb-4">
              We may terminate or suspend your access to the service at any time, with or 
              without cause, with or without notice. Upon termination, your right to use 
              the service ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these terms at any time. Changes will be 
              effective immediately upon posting. Your continued use of the service 
              constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
            <p className="mb-4">
              These terms shall be governed by and construed in accordance with the laws 
              of the United States, without regard to conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
            <p className="mb-4">
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <p className="mb-4">
              <strong>Email:</strong> legal@justiguide.com<br />
              <strong>Website:</strong> https://www.justi.guide
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}