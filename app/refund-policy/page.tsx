import Link from "next/link";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="text-[#6B5FCF] hover:text-[#5B8DEE] mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold mb-2">Refund Policy & Satisfaction Guarantee</h1>
          <p className="text-muted-foreground">Last updated: February 2026</p>
        </div>

        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">100% Satisfaction Guarantee</h2>
            <p className="mb-4">
              JustiGuide stands behind the quality of our platform and attorney-reviewed services. If your application is denied due to an error on our part—including document preparation, filing, or platform-related mistakes—we will refund the service fee you paid to JustiGuide.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">What Is Covered</h2>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Platform or preparation errors:</strong> If a denial is attributable to our document preparation, filing, or platform error, we refund the JustiGuide service fee.</li>
              <li><strong>Transparency:</strong> We will work with you to understand the reason for any denial and determine whether our guarantee applies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">What Is Not Covered</h2>
            <p className="mb-4">Refunds are not provided when a denial is due to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Government policy changes, eligibility criteria, or decisions by USCIS or other agencies</li>
              <li>Information you provided that was incomplete, inaccurate, or changed</li>
              <li>Circumstances outside our control (e.g., changes in law or your personal situation)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How to Request a Refund</h2>
            <p className="mb-4">
              If you believe your case qualifies under this guarantee, contact us at{" "}
              <a href="mailto:info@justiguide.com" className="text-[#6B5FCF] hover:underline">info@justiguide.com</a> with your case details and the denial notice. We will review your request and respond within 5 business days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Fee Breakdown</h2>
            <p className="mb-4">
              Our pricing is transparent. Service fees are clearly stated before you commit. Government filing fees (e.g., USCIS) are separate and are not refundable by JustiGuide, as they are paid to the government. For a full breakdown of your specific service and fees, see our <Link href="/pricing" className="text-[#6B5FCF] hover:underline">Pricing</Link> page or contact us.
            </p>
          </section>

          <p className="text-sm text-muted-foreground mt-8">
            JustiGuide is not a law firm and does not provide legal advice. This policy applies to JustiGuide platform and document services. Your attorney may have separate engagement terms.
          </p>
        </div>
      </div>
    </div>
  );
}
