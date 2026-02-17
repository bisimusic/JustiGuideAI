import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <Link href="/" className="text-[#6B5FCF] hover:text-[#5B8DEE] mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-2">Transparent Pricing</h1>
          <p className="text-muted-foreground text-lg">
            No hidden fees. Know your investment before you start.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-[#F8FAFC] rounded-2xl p-8 border border-[#E2E8F0]">
            <h2 className="text-xl font-bold text-[#0F172A] mb-2">O-1A Just-In-Time Filing</h2>
            <p className="text-3xl font-bold text-[#6B5FCF] mb-4">From $8,000</p>
            <ul className="space-y-2 text-[#475569] text-sm mb-6">
              <li>✓ Attorney-reviewed full petition</li>
              <li>✓ E-signature ready · Review & sign online</li>
              <li>✓ Transparent flat-fee pricing</li>
              <li>✓ Just-In-Time delivery for founders & extraordinary talent</li>
            </ul>
            <a
              href="https://immigrant.justi.guide/assessment"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full text-center bg-gradient-to-r from-[#6B5FCF] to-[#5B8DEE] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Get started →
            </a>
          </div>

          <div className="bg-[#F8FAFC] rounded-2xl p-8 border border-[#E2E8F0]">
            <h2 className="text-xl font-bold text-[#0F172A] mb-2">Other Visas & Green Card</h2>
            <p className="text-3xl font-bold text-[#6B5FCF] mb-4">Starting from</p>
            <ul className="space-y-2 text-[#475569] text-sm mb-6">
              <li>✓ Free assessment · See your best path</li>
              <li>✓ Tiered packages · Clear fee breakdown</li>
              <li>✓ Pay per phase available · No large upfront retainer</li>
              <li>✓ EB-1, EB-2 NIW, N-400, H-1B, and more</li>
            </ul>
            <a
              href="https://immigrant.justi.guide/assessment"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full text-center bg-white text-[#6B5FCF] border-2 border-[#6B5FCF] px-6 py-3 rounded-full font-semibold hover:bg-[#E8E5FF] transition-colors"
            >
              See options →
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] mb-8">
          <h2 className="text-xl font-bold text-[#0F172A] mb-4">Financing & Payment</h2>
          <p className="text-[#475569] mb-4">
            Financing and pay-over-time options are available so you can focus on your application without sticker shock. Ask us about installment plans and approved financing at the time of your assessment or discovery call.
          </p>
          <p className="text-sm text-[#64748B]">
            Government filing fees (e.g., USCIS) are separate from JustiGuide service fees and are not included in the prices above.
          </p>
        </div>

        <div className="text-center">
          <p className="text-[#475569] mb-4">
            Have questions? See our <Link href="/refund-policy" className="text-[#6B5FCF] font-semibold hover:underline">Refund Policy & Satisfaction Guarantee</Link> or <a href="mailto:info@justiguide.com" className="text-[#6B5FCF] font-semibold hover:underline">contact us</a>.
          </p>
          <Link href="/#pricing" className="text-[#6B5FCF] font-semibold hover:underline">
            Back to homepage pricing →
          </Link>
        </div>
      </div>
    </div>
  );
}
