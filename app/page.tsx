"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Award, CheckCircle, Shield, Star, ArrowRight, Send, Menu, X } from "lucide-react";
import { SocialProofAvatars, PressLogos } from "@/components/SocialProofSection";

// Image paths - Next.js serves files from public/ at the root
const logoImage = "/assets/file-VqtLhVngyJTcoRdkTestqJ-Guarder Icon - Transparent_1759804664573.png";
const waitlistSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  immigrationStatus: z.string().optional(),
});

type WaitlistForm = z.infer<typeof waitlistSchema>;

export default function LandingPage() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const form = useForm<WaitlistForm>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      immigrationStatus: "",
    },
  });

  const waitlistMutation = useMutation({
    mutationFn: async (data: WaitlistForm) => {
      const response = await apiRequest("/api/waitlist", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (_data: WaitlistForm) => {
      setSubmittedName(_data.name || "");
      setIsSubmitted(true);
      toast({
        title: "Welcome to the waitlist! 🎉",
        description: "We'll notify you when JustiGuide is ready.",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Email already registered or invalid data",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WaitlistForm) => {
    waitlistMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-chalk font-body">
      {/* O1A Launch Announcement Banner — purple CTA */}
      <div className="py-3 px-4 relative overflow-hidden" style={{ backgroundColor: '#0B1215', color: '#ffffff' }} data-testid="banner-o1a-launch">
        <div className="absolute inset-0 bg-linear-to-r from-accent/10 to-transparent pointer-events-none" aria-hidden />
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-sm md:text-base relative z-10">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-chalk text-ink">NEW</span>
          <span className="font-medium">O-1 JIT-Filing for Founders — Just-In-Time, attorney review, transparent pricing</span>
          <Button
            asChild
            className="px-5 py-2.5 rounded-full font-bold text-sm bg-chalk text-accent border-2 border-chalk whitespace-nowrap hover:bg-accent hover:text-white hover:border-accent shadow-[0_2px_12px_rgba(0,0,0,0.2)] transition-all duration-200"
          >
            <a
              href="https://immigrant.justi.guide/jit"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-o1a-early-access"
            >
              Learn More →
            </a>
          </Button>
        </div>
      </div>

      {/* Navigation — purple accent, scroll shadow */}
      <nav className="sticky top-0 z-50 bg-chalk/95 backdrop-blur-md border-b border-border shadow-[0_1px_0_0_rgba(0,0,0,0.05)]" id="main-nav">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between" style={{ height: '68px' }}>
          <a href="/" className="flex items-center gap-3 font-display text-[1.35rem] text-ink group">
            <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-white ring-2 ring-border shadow-sm transition-all group-hover:ring-accent/40">
              <img src={logoImage} alt="JustiGuide" className="w-7 h-7 object-contain" data-testid="logo-image" />
            </span>
            JustiGuide
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-semibold text-warm-gray hover:text-accent transition-colors">How We Work</a>
            <a href="#pricing" className="text-sm font-semibold text-warm-gray hover:text-accent transition-colors">Pricing</a>
            <a href="/features" className="text-sm font-semibold text-warm-gray hover:text-accent transition-colors">Search Attorneys</a>
            <a href="#features" className="text-sm font-semibold text-warm-gray hover:text-accent transition-colors">For Lawyers</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <a href="https://immigrant.justi.guide/login" target="_blank" rel="noopener noreferrer" className="rounded-full font-semibold transition-all duration-200 px-5 py-3 text-sm text-ink border-2 border-border hover:border-accent hover:text-accent hover:bg-accent-light/30" data-testid="nav-sign-in">Login</a>
            <a href="https://immigrant.justi.guide/assessment" target="_blank" rel="noopener noreferrer" className="rounded-full font-bold transition-all duration-200 px-7 py-3 text-base bg-accent hover:bg-accent-deep shadow-[0_4px_14px_rgba(107,95,207,0.45)] hover:shadow-[0_8px_24px_rgba(107,95,207,0.5)] hover:-translate-y-0.5 ring-2 ring-accent/30 hover:ring-accent/50" style={{ color: '#0B1215' }} data-testid="nav-cta">Start Your Journey →</a>
          </div>
          <button type="button" className="md:hidden p-2 text-ink hover:text-accent" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-chalk py-4 px-6 flex flex-col gap-4">
            <a href="#how-it-works" className="text-sm font-semibold text-ink hover:text-accent py-2" onClick={() => setMobileMenuOpen(false)}>How We Work</a>
            <a href="#pricing" className="text-sm font-semibold text-ink hover:text-accent py-2" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="/features" className="text-sm font-semibold text-ink hover:text-accent py-2" onClick={() => setMobileMenuOpen(false)}>Search Attorneys</a>
            <a href="#features" className="text-sm font-semibold text-ink hover:text-accent py-2" onClick={() => setMobileMenuOpen(false)}>For Lawyers</a>
            <a href="https://immigrant.justi.guide/login" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-ink hover:text-accent py-2" onClick={() => setMobileMenuOpen(false)}>Login</a>
            <a href="https://immigrant.justi.guide/assessment" target="_blank" rel="noopener noreferrer" className="rounded-full font-bold bg-accent px-6 py-3 text-center" style={{ color: '#0B1215' }} onClick={() => setMobileMenuOpen(false)}>Start Your Journey →</a>
          </div>
        )}
      </nav>

      {/* Hero — two-column, stronger purple presence, floating card */}
      <section className="relative pt-[120px] md:pt-[140px] pb-24 bg-linear-to-b from-chalk to-sage overflow-hidden">
        <div className="absolute top-[-200px] right-[-150px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(107,95,207,0.12)_0%,transparent_65%)] pointer-events-none" />
        <div className="absolute bottom-[-150px] left-[-80px] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(200,162,78,0.08)_0%,transparent_65%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: copy */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <a href="https://time.com/collections/best-inventions-2025/7318500/justiguide-relo/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-gold bg-gold-light/80 border border-gold/20 hover:bg-gold-light transition-colors" data-testid="badge-time-inventions">
                  <Award className="w-4 h-4" /> TIME Best Inventions 2025 · Tech Disrupt Pitch Showcase Winner &apos;25
                </a>
                <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-[#76B900]/10 text-[#4a7200] border border-[#76B900]/20">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="shrink-0">
                    <path d="M12.444 6.27c-.592 0-1.072.48-1.072 1.073v9.314c0 .592.48 1.073 1.072 1.073h5.226c.593 0 1.073-.48 1.073-1.073V7.343c0-.593-.48-1.073-1.073-1.073h-5.226z" fill="#76B900"/>
                    <path d="M6.33 9.843c-.592 0-1.073.48-1.073 1.073v5.741c0 .593.481 1.073 1.073 1.073h3.461c.593 0 1.073-.48 1.073-1.073v-5.74c0-.594-.48-1.074-1.073-1.074H6.33z" fill="#76B900"/>
                  </svg>
                  NVIDIA Inception 2026
                </span>
              </div>
              <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-[1.1] text-ink mb-5">
                Your <em className="italic text-accent font-display">new life</em> in America starts here.
              </h1>
              <p className="text-[1.125rem] text-warm-gray leading-[1.75] max-w-[480px] mb-8">
                Stop wondering. Start moving. JustiGuide&apos;s AI analyzes your profile against thousands of successful cases and pairs you with the right attorney.
              </p>
              <div className="flex gap-4 flex-wrap mb-10">
                <a href="#waitlist" className="inline-flex items-center gap-2 bg-accent text-ink px-8 py-4 rounded-[60px] font-bold text-[0.95rem] min-h-[52px] border-0 hover:bg-accent-deep shadow-[0_4px_20px_rgba(107,95,207,0.4)] hover:shadow-[0_8px_28px_rgba(107,95,207,0.5)] hover:-translate-y-0.5 transition-all duration-200" data-testid="button-hero-cta" style={{ color: '#0B1215' }}>
                  Start Your Journey <ArrowRight className="w-4 h-4 shrink-0" />
                </a>
                <a href="#how-it-works" className="inline-flex items-center gap-2 bg-transparent text-ink px-6 py-3 rounded-[60px] font-semibold text-sm border border-border hover:border-accent hover:text-accent hover:bg-accent-light/30 transition-all duration-200">How it works</a>
              </div>
              <div className="flex flex-col items-start gap-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 shadow-md border border-border/50">
                  <Shield className="w-5 h-5 text-accent shrink-0" />
                  <span className="text-sm font-bold text-ink">100% Money-Back Guarantee</span>
                </div>
                <SocialProofAvatars />
              </div>
            </div>
            {/* Right: visa card — float animation, purple shadow */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_24px_64px_rgba(107,95,207,0.12)] border border-accent/10 animate-float">
              <p className="text-[0.65rem] font-bold tracking-widest uppercase text-accent mb-4 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent" /> Which visa is right for you?
              </p>
              <h3 className="font-display text-2xl md:text-[1.75rem] text-ink mb-2">Find your path in 60 seconds</h3>
              <p className="text-[0.9rem] text-warm-gray mb-6">Select the visa you&apos;re exploring — or let our AI figure it out.</p>
              <div className="flex flex-wrap gap-2 mb-7">
                {['O-1', 'EB-1', 'EB-2 NIW', 'H-1B', 'Green Card', 'N-400', 'I\'m not sure'].map((label, i) => (
                  <a key={label} href="#waitlist" className={`px-4 py-2.5 rounded-full text-sm font-semibold border-[1.5px] cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${i === 0 ? 'border-accent text-accent bg-accent-light hover:bg-accent-light' : 'border-border text-warm-gray hover:border-accent hover:text-accent hover:bg-accent-light'}`}>{label}</a>
                ))}
              </div>
              <a href="#waitlist" className="flex items-center justify-center gap-2 w-full bg-accent py-4 rounded-[60px] font-bold text-[0.95rem] min-h-[52px] border-0 hover:bg-accent-deep shadow-[0_4px_16px_rgba(107,95,207,0.35)] hover:-translate-y-0.5 transition-all duration-200" style={{ color: '#0B1215' }}>Start Your Journey <ArrowRight className="w-4 h-4 shrink-0" /></a>
              <p className="text-center text-[0.78rem] text-warm-gray mt-4 flex items-center justify-center gap-1.5">🔒 Free · No commitment · Results in minutes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Press logos — TechCrunch, TIME, CBS News, The Guardian */}
      <section className="bg-white border-b border-border">
        <PressLogos />
      </section>

      {/* Trust bar — dark strip with stats (inline styles for visibility) */}
      <section className="py-7" style={{ backgroundColor: '#0B1215' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-12">
          <div className="flex items-center gap-2.5 text-[0.82rem] font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}><span style={{ color: '#ffffff', fontSize: '1.1rem' }}>47,000+</span> Immigrants Helped</div>
          <div className="hidden sm:block w-px h-8" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <div className="flex items-center gap-2.5 text-[0.82rem] font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}><span style={{ color: '#ffffff', fontSize: '1.1rem' }}>95%</span> Success Rate</div>
          <div className="hidden sm:block w-px h-8" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <div className="flex items-center gap-2.5 text-[0.82rem] font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}><span style={{ color: '#ffffff', fontSize: '1.1rem' }}>150+</span> Countries Served</div>
          <div className="hidden sm:block w-px h-8" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <div className="flex items-center gap-2.5 text-[0.82rem] font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}><span style={{ color: '#ffffff', fontSize: '1.1rem' }}>99.7%</span> AI Accuracy</div>
        </div>
      </section>

      {/* How it works — keep 3 steps, use tokens */}
      <section id="how-it-works" className="py-[80px] md:py-[100px] bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[0.7rem] font-bold tracking-widest uppercase text-accent mb-4 flex items-center gap-2"><span className="w-5 h-0.5 bg-accent" /> Simple, fast, certain</p>
          <h2 className="font-display text-[clamp(2.25rem,4vw,2.5rem)] leading-tight text-ink mb-3">Four steps to your new life</h2>
          <p className="text-[1.05rem] text-warm-gray max-w-[560px] mt-3 leading-[1.7]">No guesswork. No endless waiting. Just a clear path from assessment to approval.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            {[
              { num: '1', title: 'Tell us your story', desc: 'Answer a few questions. Our AI analyzes your background against thousands of successful cases.', time: '~2 min' },
              { num: '2', title: 'Get your eligibility score', desc: 'See your success probability, best visa path, and personalized roadmap — instantly.', time: '~3 sec' },
              { num: '3', title: 'Meet your attorney', desc: 'We match you with a vetted, U.S.-licensed immigration attorney who specializes in your case type.', time: '15-min call' },
              { num: '4', title: 'We file. You live.', desc: 'AI prepares your application, your attorney reviews it, and we file — often in under 3 hours.', time: '~3 hours' },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-14 h-14 rounded-full bg-white border-2 border-accent flex items-center justify-center font-display text-2xl text-accent mx-auto mb-6 shadow-[0_4px_16px_rgba(107,95,207,0.1)]">{step.num}</div>
                <h4 className="font-bold text-lg mb-2 text-ink">{step.title}</h4>
                <p className="text-[15px] text-warm-gray leading-relaxed max-w-[240px] mx-auto">{step.desc}</p>
                <span className="inline-block mt-3 px-3 py-1 bg-accent-light rounded-full text-xs font-bold text-accent">{step.time}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a href="#waitlist" className="inline-flex items-center gap-2 bg-accent px-8 py-4 rounded-[60px] font-bold text-base min-h-[52px] hover:bg-accent-deep shadow-[0_4px_20px_rgba(107,95,207,0.4)] hover:-translate-y-0.5 transition-all" style={{ color: '#0B1215' }}>Start Your Journey <ArrowRight className="w-4 h-4 shrink-0" /></a>
          </div>
        </div>
      </section>

      {/* Dolores AI Section — two-column: intro + metric cards left, chat mockup right */}
      <section className="py-[100px] relative" style={{ backgroundColor: "#0B1215" }}>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: intro + metric cards */}
            <div>
              <p className="text-[0.7rem] font-bold tracking-widest uppercase mb-4 flex items-center gap-2" style={{ color: "#D4AF37" }}>
                <span className="w-5 h-0.5 shrink-0" style={{ backgroundColor: "#D4AF37" }} aria-hidden /> Your AI immigration expert
              </p>
              <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-bold mb-6 leading-tight" style={{ color: "#ffffff" }}>
                Meet <em className="font-display italic" style={{ color: "#D4AF37" }}>Dolores AI</em> — trained on <span style={{ color: "#D4AF37" }}>1M+ cases</span>
              </h2>
              <p className="text-lg mb-10 leading-relaxed" style={{ color: "#E0E0E0" }}>
                Ask anything about immigration in 12 languages and get legally-grounded answers in seconds. Dolores doesn&apos;t guess — she reasons across case law, regulations, and real outcomes.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="rounded-xl px-6 py-5 min-w-[140px]" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                  <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: "#ffffff" }}>99.7%</div>
                  <div className="text-sm" style={{ color: "#E0E0E0" }}>Accuracy Rate</div>
                </div>
                <div className="rounded-xl px-6 py-5 min-w-[140px]" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                  <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: "#ffffff" }}>3 sec</div>
                  <div className="text-sm" style={{ color: "#E0E0E0" }}>Avg. Response</div>
                </div>
                <div className="rounded-xl px-6 py-5 min-w-[140px]" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                  <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: "#ffffff" }}>24/7</div>
                  <div className="text-sm" style={{ color: "#E0E0E0" }}>Always On</div>
                </div>
              </div>
            </div>

            {/* Right: chat mockup */}
            <div className="rounded-2xl overflow-hidden border shrink-0" style={{ backgroundColor: "#1E1E1E", borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="p-5 space-y-4 min-h-[320px]">
                <div className="flex justify-end">
                  <div className="rounded-2xl px-4 py-3 max-w-[85%]" style={{ backgroundColor: "#2D5A5A", color: "#ffffff" }}>
                    <p className="text-sm">I&apos;m a startup founder from Nigeria. What are my best visa options?</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="rounded-2xl px-4 py-3 max-w-[90%]" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#E0E0E0" }}>
                    <p className="text-sm">You have <span style={{ color: "#D4AF37" }}>strong eligibility for the O-1A visa (Extraordinary Ability)</span> and <span style={{ color: "#D4AF37" }}>EB-1A for a longer-term path</span>. Want a detailed score?</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="rounded-2xl px-4 py-3 max-w-[85%]" style={{ backgroundColor: "#2D5A5A", color: "#ffffff" }}>
                    <p className="text-sm">Yes, and how long would the O-1A take?</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="rounded-2xl px-4 py-3 max-w-[90%]" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#E0E0E0" }}>
                    <p className="text-sm">Petition prep is <span style={{ color: "#D4AF37" }}>under 3 hours</span> with JustiGuide. Premium processing gets a decision in 15 days. I can generate a personalized roadmap next.</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(0,0,0,0.2)" }}>
                <input
                  type="text"
                  placeholder="Ask Dolores anything about immigration..."
                  readOnly
                  className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-60"
                  style={{ color: "#E0E0E0" }}
                />
                <button type="button" aria-label="Send" className="p-2 rounded-full opacity-70 hover:opacity-100 transition-opacity" style={{ color: "#D4AF37" }}>
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-[100px] bg-chalk">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[0.7rem] font-bold tracking-widest uppercase text-accent mb-4 flex items-center justify-center gap-2"><span className="w-5 h-0.5 bg-accent" /> Testimonials</p>
            <h2 className="font-display text-[48px] font-bold text-ink mb-5">
              Why people <strong>love</strong> JustiGuide
            </h2>
            <p className="text-lg text-warm-gray max-w-2xl mx-auto leading-relaxed">
              Read what our satisfied customers say. Join the community who trust us for quality, reliability, and service.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                <span className="text-sm font-semibold text-green-600">Verified</span>
              </div>
              <div className="flex text-gold mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-base text-warm-gray mb-6 leading-relaxed">
                &quot;JustiGuide made my H1B process incredibly smooth. What used to take months took just 3 hours!&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: '#2F6A5B' }}>PR</div>
                <div>
                  <h4 className="font-semibold text-ink">Priya Reddy</h4>
                  <p className="text-sm text-warm-gray">Software Engineer</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                <span className="text-sm font-semibold text-green-600">Verified</span>
              </div>
              <div className="flex text-gold mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-base text-warm-gray mb-6 leading-relaxed">
                &quot;Finally got my Green Card! The lawyer matching was perfect. Highly recommend JustiGuide.&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: '#C8A24E' }}>MC</div>
                <div>
                  <h4 className="font-semibold text-ink">Miguel Chen</h4>
                  <p className="text-sm text-warm-gray">Business Owner</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                <span className="text-sm font-semibold text-green-600">Verified</span>
              </div>
              <div className="flex text-gold mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-base text-warm-gray mb-6 leading-relaxed">
                &quot;JustiGuide made the immigration process easy and human.&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: '#6F6966' }}>EM</div>
                <div>
                  <h4 className="font-semibold text-ink">Elizabeth Murayama</h4>
                  <p className="text-sm text-warm-gray">Verified Client</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-10">
            <a href="#testimonials" className="text-accent font-semibold hover:underline inline-flex items-center gap-1">See more reviews →</a>
          </div>
        </div>
      </section>

      {/* How We Compare */}
      <section className="py-20 bg-chalk">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-display text-[clamp(2rem,4vw,2.5rem)] font-bold text-ink text-center mb-12">How We Compare</h2>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 font-semibold text-ink">Feature</th>
                  <th className="p-4 font-semibold text-ink bg-accent">JustiGuide</th>
                  <th className="p-4 font-semibold text-ink bg-light-gray">Others</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Processing Time', jg: 'A few days', other: 'Months' },
                  { feature: 'Form Accuracy', jg: '100%', other: 'Not guaranteed' },
                  { feature: 'Cost', jg: 'From $9,499', other: '$10,000–15,000' },
                  { feature: 'Licensed Attorney Review', jg: 'Always included', other: 'Sometimes' },
                  { feature: 'AI Trained On', jg: '80,000+ cases', other: 'Hundreds of cases' },
                  { feature: 'Money-Back Guarantee', jg: '100%', other: 'No' },
                ].map((row) => (
                  <tr key={row.feature} className="border-b border-border last:border-0">
                    <td className="p-4 text-warm-gray">{row.feature}</td>
                    <td className="p-4 text-ink bg-accent/90"><CheckCircle className="w-5 h-5 inline mr-2" />{row.jg}</td>
                    <td className="p-4 text-warm-gray bg-light-gray">{row.other}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Transparent pricing (Stage 6: eliminate budget uncertainty, e-sign, pay-per-phase) */}
      <section id="pricing" className="py-16 bg-sage border-t border-border">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display text-[32px] font-bold text-ink mb-4">Transparent pricing</h2>
          <p className="text-warm-gray mb-8 max-w-2xl mx-auto">
            No hidden fees. Know your investment before you start.
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm relative">
              <div className="flex justify-center items-center gap-1 text-green-600 text-xs font-bold mb-4">
                <Shield className="w-4 h-4" /> 100% Money-Back Guarantee
              </div>
              <p className="text-accent font-semibold mb-1">O-1 Just-In-Time Filing</p>
              <p className="text-lg text-warm-gray line-through">$14,000</p>
              <p className="font-display text-3xl font-bold text-ink">$9,499</p>
              <p className="text-xs text-accent font-semibold mt-1">Early access pricing — limited time</p>
              <p className="text-sm text-warm-gray mt-2">Attorney-reviewed · Full petition · Transparent pricing</p>
              <p className="text-xs text-warm-gray mt-2">E-signature ready · Review &amp; sign online</p>
              <a href="https://immigrant.justi.guide/assessment" target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-accent font-semibold text-sm hover:underline">Get started →</a>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <p className="text-accent font-semibold mb-1">Other visas &amp; green card</p>
              <p className="font-display text-2xl font-bold text-ink">Starting from</p>
              <p className="text-sm text-warm-gray mt-2">Free assessment · Tiered packages · Clear fee breakdown</p>
              <p className="text-xs text-warm-gray mt-2">Pay per phase available · No large upfront retainer</p>
              <a href="https://immigrant.justi.guide/assessment" target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-accent font-semibold text-sm hover:underline">See options →</a>
            </div>
          </div>
          <p className="text-warm-gray text-sm mt-6">Financing and pay-over-time options available. <a href="/pricing" className="text-accent font-semibold hover:underline">View Details</a></p>
          <p className="text-sm text-warm-gray mt-4">Secure payments powered by Stripe</p>
          <div className="mt-8">
            <a href="#waitlist" className="inline-flex items-center gap-2 bg-accent px-8 py-4 rounded-full font-bold hover:bg-accent-deep shadow-[0_4px_20px_rgba(107,95,207,0.4)] hover:-translate-y-0.5 transition-all" style={{ color: '#0B1215' }}>Start Your Journey <ArrowRight className="w-4 h-4 shrink-0" /></a>
          </div>
        </div>
      </section>

      {/* Waitlist — light section, dark text, design system */}
      <section id="waitlist" className="py-[100px] relative overflow-hidden bg-sage">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" aria-hidden />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <p className="text-[0.7rem] font-bold tracking-widest uppercase text-accent mb-4 flex items-center justify-center gap-2">
            <span className="w-5 h-0.5 bg-accent" aria-hidden /> Get started
          </p>
          <div className="text-center mb-12">
            <h2 className="font-display text-[48px] md:text-[56px] font-bold text-ink mb-6 leading-tight">
              Get your personalized roadmap
            </h2>
            <p className="text-lg text-warm-gray">
              Free assessment · No commitment · Takes 2 minutes
            </p>
          </div>

          {isSubmitted ? (
            <div className="rounded-2xl p-12 text-center bg-white border border-border">
              <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
              <h3 className="font-display text-2xl font-bold text-ink mb-2">Thank you, {submittedName || "there"}!</h3>
              <p className="text-warm-gray">We&apos;re preparing your personalized roadmap. Check your email for next steps.</p>
              <a href="https://immigrant.justi.guide/assessment" target="_blank" rel="noopener noreferrer" className="inline-block mt-6 px-8 py-4 bg-accent text-white font-bold rounded-full hover:bg-accent-deep transition-colors">Continue to Assessment →</a>
            </div>
          ) : (
            <div className="rounded-2xl p-8 bg-chalk border border-border shadow-xl">
              <div className="flex items-center justify-center gap-2 mb-6 text-sm text-warm-gray">
                <Shield className="h-4 w-4 text-accent" />
                <span>Secure &amp; private · Your data is never shared</span>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-ink">Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="John Doe"
                            autoComplete="name"
                            className="min-h-[48px] border-border bg-white text-ink placeholder:text-warm-gray focus:border-accent focus:ring-accent/20"
                            data-testid="input-name"
                          />
                        </FormControl>
                        <FormMessage className="text-warm-gray text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-ink">Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email"
                            placeholder="john@example.com"
                            autoComplete="email"
                            className="min-h-[48px] border-border bg-white text-ink placeholder:text-warm-gray focus:border-accent focus:ring-accent/20"
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage className="text-warm-gray text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-ink">Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="+1 (555) 123-4567"
                            autoComplete="tel"
                            className="min-h-[48px] border-border bg-white text-ink placeholder:text-warm-gray focus:border-accent focus:ring-accent/20"
                            data-testid="input-phone"
                          />
                        </FormControl>
                        <FormMessage className="text-warm-gray text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="immigrationStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-ink">Immigration Status (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger 
                              className="min-h-[48px] border-border bg-white text-ink focus:border-accent focus:ring-accent/20"
                              data-testid="select-status"
                            >
                              <SelectValue placeholder="Select your status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-chalk border-border text-ink">
                            <SelectItem value="h1b">H-1B</SelectItem>
                            <SelectItem value="o1a">O-1A (Extraordinary Ability)</SelectItem>
                            <SelectItem value="eb1">EB-1 (Employment-Based First Preference)</SelectItem>
                            <SelectItem value="eb1-niw">EB-1 NIW (National Interest Waiver)</SelectItem>
                            <SelectItem value="greencard">Green Card</SelectItem>
                            <SelectItem value="citizenship">Citizenship</SelectItem>
                            <SelectItem value="asylum">Asylum</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-white/90" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={waitlistMutation.isPending}
                    className="w-full min-h-[52px] bg-accent hover:bg-accent-deep font-bold py-6 text-lg rounded-full border-0 shadow-[0_4px_20px_rgba(107,95,207,0.4)]"
                    data-testid="button-submit-waitlist"
                    style={{ color: '#0B1215' }}
                  >
                    {waitlistMutation.isPending ? "Sending..." : "Get My Roadmap"}
                  </Button>
                  <p className="text-center text-sm text-warm-gray mt-4">Free assessment · No commitment · Takes 2 minutes</p>
                </form>
              </Form>
            </div>
          )}
        </div>
      </section>

      {/* Footer — HTML design: ink bg + inline styles so text is visible */}
      <footer className="border-t py-12 md:py-14" style={{ backgroundColor: '#0B1215', borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="font-display text-xl md:text-2xl mb-6" style={{ color: '#ffffff' }}>
            JustiGuide
          </div>
          <nav className="mb-6" aria-label="Footer navigation">
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-[11px] font-semibold uppercase tracking-wider">
              <a href="#how-it-works" className="transition-colors hover:opacity-100" style={{ color: 'rgba(255,255,255,0.85)' }}>How We Work</a>
              <a href="#pricing" className="transition-colors hover:opacity-100" style={{ color: 'rgba(255,255,255,0.85)' }}>Pricing</a>
              <a href="#features" className="transition-colors hover:opacity-100" style={{ color: 'rgba(255,255,255,0.85)' }}>For Lawyers</a>
              <a href="/privacy-policy" className="transition-colors hover:opacity-100" style={{ color: 'rgba(255,255,255,0.85)' }}>Privacy</a>
              <a href="/terms-of-service" className="transition-colors hover:opacity-100" style={{ color: 'rgba(255,255,255,0.85)' }}>Terms</a>
              <a href="#contact" className="transition-colors hover:opacity-100" style={{ color: 'rgba(255,255,255,0.85)' }}>Contact</a>
            </div>
          </nav>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-[11px] font-semibold uppercase tracking-wider mb-8">
            <a href="/privacy-policy" className="transition-colors hover:opacity-100" style={{ color: 'rgba(255,255,255,0.7)' }}>Privacy Policy</a>
            <a href="/terms-of-service" className="transition-colors hover:opacity-100" style={{ color: 'rgba(255,255,255,0.7)' }}>Terms of Service</a>
            <a href="/refund-policy" className="transition-colors hover:opacity-100" style={{ color: 'rgba(255,255,255,0.7)' }}>Refund Policy</a>
            <a href="/pricing" className="transition-colors hover:opacity-100" style={{ color: 'rgba(255,255,255,0.7)' }}>Pricing</a>
          </div>
          <p className="text-[12px] max-w-[800px] mx-auto mb-6" style={{ color: '#9CA3AF' }}>
            JustiGuide is a technology services entity. The information on this website is for general informational purposes only and does not constitute legal advice. Every immigration situation is unique. Please consult with a licensed attorney before making any legal decisions. Use of this website does not create an attorney-client relationship.
          </p>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
            © 2026 JustiGuide. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
