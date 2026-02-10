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
import { Award, CheckCircle, Clock, Users, MessageCircle, Shield, Zap, Globe, Heart, Star, Mail, MapPin, Phone, ArrowRight, Send } from "lucide-react";

// Image paths - Next.js serves files from public/ at the root
const logoImage = "/assets/file-VqtLhVngyJTcoRdkTestqJ-Guarder Icon - Transparent_1759804664573.png";
const aiFormImage = "/assets/Frame 427320568 (2)_1759856888209.png";
const multilingualImage = "/assets/Frame 427320569 (1)_1759856912314.png";
const caseManagementImage = "/assets/Frame 427320570 (2)_1759856937135.png";
const realTimeUpdatesImage = "/assets/Frame 427320571 (1)_1759856974396.png";
const legalResearchImage = "/assets/Frame 427320570 (1)_1759856321668.png";
const documentVerificationImage = "/assets/Frame 427320572 (1)_1759857033022.png";

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
    onSuccess: () => {
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
          <span className="font-medium">O1A Jet-Filing for Founders — Just-In-Time, attorney review, 80% cost reduction</span>
          <Button
            asChild
            className="px-4 py-2 rounded-full font-semibold text-sm bg-accent text-white whitespace-nowrap hover:bg-accent-deep hover:brightness-110 transition-all duration-200"
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
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 ring-1 ring-accent/20 group-hover:ring-accent/40 transition-all">
              <img src={logoImage} alt="JustiGuide" className="w-6 h-6 object-contain" data-testid="logo-image" />
            </span>
            JustiGuide
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-warm-gray hover:text-accent transition-colors">Benefits</a>
            <a href="#pricing" className="text-sm font-semibold text-warm-gray hover:text-accent transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm font-semibold text-warm-gray hover:text-accent transition-colors">Testimonials</a>
            <a href="#contact" className="text-sm font-semibold text-warm-gray hover:text-accent transition-colors">Contact</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <a href="https://immigrant.justi.guide/assessment" target="_blank" rel="noopener noreferrer" className="rounded-full font-bold transition-all duration-200 px-7 py-3 text-base bg-accent hover:bg-accent-deep shadow-[0_4px_14px_rgba(107,95,207,0.45)] hover:shadow-[0_8px_24px_rgba(107,95,207,0.5)] hover:-translate-y-0.5 ring-2 ring-accent/30 hover:ring-accent/50" style={{ color: '#0B1215' }} data-testid="nav-cta">Free Assessment →</a>
          </div>
        </div>
      </nav>

      {/* Hero — two-column, stronger purple presence, floating card */}
      <section className="relative pt-[120px] md:pt-[140px] pb-24 bg-linear-to-b from-chalk to-sage overflow-hidden">
        <div className="absolute top-[-200px] right-[-150px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(107,95,207,0.12)_0%,transparent_65%)] pointer-events-none" />
        <div className="absolute bottom-[-150px] left-[-80px] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(200,162,78,0.08)_0%,transparent_65%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: copy */}
            <div>
              <a href="https://time.com/collections/best-inventions-2025/7318500/justiguide-relo/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-gold bg-gold-light/80 border border-gold/20 mb-6 hover:bg-gold-light transition-colors" data-testid="badge-time-inventions">
                <Award className="w-4 h-4" /> Tech Disrupt Pitch Showcase Winner &apos;25
              </a>
              <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-[1.1] text-ink mb-5">
                Your <em className="italic text-accent font-display">new life</em> in America starts here.
              </h1>
              <p className="text-[1.125rem] text-warm-gray leading-[1.75] max-w-[480px] mb-8">
                Stop wondering. Start moving. JustiGuide&apos;s AI analyzes your profile against thousands of successful cases and pairs you with the right attorney.
              </p>
              <div className="flex gap-4 flex-wrap mb-10">
                <a href="https://immigrant.justi.guide/assessment" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-chalk text-accent px-8 py-4 rounded-[60px] font-bold text-[0.95rem] min-h-[52px] border-2 border-accent hover:bg-accent hover:text-white hover:border-accent hover:shadow-[0_12px_32px_rgba(107,95,207,0.35)] hover:-translate-y-1 transition-all duration-200" data-testid="button-hero-cta">
                  See my eligibility score <ArrowRight className="w-4 h-4 shrink-0" />
                </a>
                <a href="#how-it-works" className="inline-flex items-center gap-2 bg-transparent text-ink px-8 py-4 rounded-[60px] font-bold text-[0.95rem] border-2 border-border hover:border-accent hover:text-accent hover:bg-accent-light/50 transition-all min-h-[52px] duration-200">How it works</a>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex">
                  <span className="w-10 h-10 rounded-full border-[2.5px] border-chalk flex items-center justify-center text-[0.75rem] font-bold text-white ml-[-10px] first:ml-0 shadow-[0_2px_8px_rgba(47,106,91,0.4)] hover:scale-110 hover:shadow-[0_4px_12px_rgba(47,106,91,0.5)] transition-transform duration-300 cursor-default animate-avatar-float animate-avatar-float-1" style={{ backgroundColor: '#2F6A5B' }}>PR</span>
                  <span className="w-10 h-10 rounded-full border-[2.5px] border-chalk flex items-center justify-center text-[0.75rem] font-bold text-white ml-[-10px] first:ml-0 shadow-[0_2px_8px_rgba(200,162,78,0.4)] hover:scale-110 hover:shadow-[0_4px_12px_rgba(200,162,78,0.5)] transition-transform duration-300 cursor-default animate-avatar-float animate-avatar-float-2" style={{ backgroundColor: '#C8A24E' }}>MC</span>
                  <span className="w-10 h-10 rounded-full border-[2.5px] border-chalk flex items-center justify-center text-[0.75rem] font-bold text-white ml-[-10px] first:ml-0 shadow-[0_2px_8px_rgba(111,105,102,0.35)] hover:scale-110 hover:shadow-[0_4px_12px_rgba(111,105,102,0.45)] transition-transform duration-300 cursor-default animate-avatar-float animate-avatar-float-3" style={{ backgroundColor: '#6F6966' }}>SK</span>
                </div>
                <p className="text-[0.8rem] text-warm-gray leading-normal">Join thousands who got their path in minutes</p>
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
                {['O-1A / O-1B', 'EB-1A', 'EB-2 NIW', 'H-1B', 'Green Card', 'N-400', 'I\'m not sure'].map((label, i) => (
                  <span key={label} className={`px-4 py-2.5 rounded-full text-sm font-semibold border-[1.5px] cursor-pointer transition-all duration-200 ${i === 0 ? 'border-accent text-accent bg-accent-light' : 'border-border text-warm-gray hover:border-accent hover:text-accent hover:bg-accent-light'}`}>{label}</span>
                ))}
              </div>
              <a href="https://immigrant.justi.guide/assessment" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full bg-accent text-white py-4 rounded-[60px] font-bold text-[0.95rem] min-h-[52px] hover:bg-accent-deep hover:shadow-[0_8px_24px_rgba(107,95,207,0.3)] transition-all duration-200">Get my personalized roadmap →</a>
              <p className="text-center text-[0.78rem] text-warm-gray mt-4 flex items-center justify-center gap-1.5">🔒 Free · No commitment · Results in minutes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar — dark strip with stats (inline styles for visibility) */}
      <section className="py-7" style={{ backgroundColor: '#0B1215' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-12">
          <div className="flex items-center gap-2.5 text-[0.82rem] font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}><span style={{ color: '#ffffff', fontSize: '1.1rem' }}>47,000+</span> Immigrants Helped</div>
          <div className="hidden sm:block w-px h-8" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <div className="flex items-center gap-2.5 text-[0.82rem] font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}><span style={{ color: '#ffffff', fontSize: '1.1rem' }}>95%</span> Success Rate</div>
          <div className="hidden sm:block w-px h-8" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <div className="flex items-center gap-2.5 text-[0.82rem] font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}><span style={{ color: '#ffffff', fontSize: '1.1rem' }}>180+</span> Countries Served</div>
          <div className="hidden sm:block w-px h-8" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <div className="flex items-center gap-2.5 text-[0.82rem] font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}><span style={{ color: '#ffffff', fontSize: '1.1rem' }}>99.7%</span> AI Accuracy</div>
        </div>
      </section>

      {/* How it works — keep 3 steps, use tokens */}
      <section id="how-it-works" className="py-24 bg-chalk">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[0.7rem] font-bold tracking-widest uppercase text-accent mb-4 flex items-center gap-2"><span className="w-5 h-0.5 bg-accent" /> Simple, fast, certain</p>
          <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] leading-tight text-ink mb-3">Four steps to your new life</h2>
          <p className="text-[1.05rem] text-warm-gray max-w-[560px] mt-3 leading-[1.7]">No guesswork. No endless waiting. Just a clear path from assessment to approval.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            {[
              { num: '1', title: 'Tell us your story', desc: 'Answer a few questions. Our AI analyzes your background against thousands of successful cases.', time: '~2 min' },
              { num: '2', title: 'Get your eligibility score', desc: 'See your success probability, best visa path, and personalized roadmap — instantly.', time: '~3 sec' },
              { num: '3', title: 'Meet your attorney', desc: 'We match you with a vetted, U.S.-licensed immigration attorney who specializes in your case type.', time: '15-min call' },
              { num: '4', title: 'We file. You live.', desc: 'AI prepares your application, your attorney reviews it, and we file — often in under 3 hours.', time: '~3 hours' },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-20 h-20 rounded-full bg-white border-2 border-accent flex items-center justify-center font-display text-2xl text-accent mx-auto mb-6 shadow-[0_4px_16px_rgba(107,95,207,0.1)]">{step.num}</div>
                <h4 className="font-bold text-base mb-2 text-ink">{step.title}</h4>
                <p className="text-sm text-warm-gray leading-relaxed max-w-[240px] mx-auto">{step.desc}</p>
                <span className="inline-block mt-3 px-3 py-1 bg-accent-light rounded-full text-xs font-bold text-accent">{step.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose — two pillars, no duplicate guarantee */}
      <section className="py-14 bg-chalk border-t border-border">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-accent text-sm font-bold uppercase tracking-wider mb-8 flex items-center justify-center gap-2"><span className="w-5 h-0.5 bg-accent" /> Built on trust</p>
          <h2 className="font-display text-center text-[clamp(2rem,4vw,3.2rem)] text-ink mb-3">Why immigrants trust us</h2>
          <p className="text-center text-warm-gray text-[1.05rem] max-w-[560px] mx-auto mt-2">Immigration is high-stakes. We built every feature to eliminate your risk.</p>
          <div className="grid md:grid-cols-2 gap-10 text-center mt-14 max-w-2xl mx-auto">
            <div>
              <p className="text-lg font-bold text-ink mb-2">95% success rate</p>
              <p className="text-warm-gray text-sm leading-relaxed">Transparency and quality at every step. Proven results so you can move with confidence.</p>
            </div>
            <div>
              <p className="text-lg font-bold text-ink mb-2">U.S. licensed attorneys</p>
              <p className="text-warm-gray text-sm leading-relaxed">Every case is reviewed by vetted, U.S.-licensed immigration attorneys from assessment to submission.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements — design system: accent bg, label + bar, font-display */}
      <section className="py-12 bg-accent" data-testid="section-achievements">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[0.7rem] font-bold tracking-widest uppercase text-white/90 mb-4 flex items-center justify-center gap-2">
            <span className="w-5 h-0.5 bg-white/80" aria-hidden /> Recognition
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <Award className="w-8 h-8 shrink-0 text-white" />
            <span className="font-display text-lg md:text-xl text-white text-center">TIME Best Inventions 2025 · Tech Disrupt Pitch Showcase Winner &apos;25</span>
          </div>
        </div>
      </section>

      {/* Extraordinary Talent Section - O1A (dark bg + white text via inline styles) */}
      <section id="extraordinary-talent" className="py-[100px] relative overflow-hidden" style={{ backgroundColor: '#0B1215' }} data-testid="section-extraordinary-talent">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff' }}>
                <Zap className="w-4 h-4" style={{ color: '#F5EDD4' }} />
                <span>For Founders & Extraordinary Talent</span>
              </div>
              
              <h2 className="text-[42px] md:text-[52px] font-bold mb-6 leading-[1.1]" style={{ color: '#ffffff' }}>
                Immigration<br />
                <span className="italic" style={{ color: '#F5EDD4' }}>Done For You</span>
              </h2>
              
              <p className="text-xl mb-8 leading-relaxed" style={{ color: '#E5E5E5' }}>
                We handle your immigration while you build your legacy.
              </p>
              
              <p className="text-base mb-10 leading-relaxed" style={{ color: '#B0B0B0' }}>
                O1A Jet-Filing is about to change everything. We're launching a done-for-you service for founders who qualify — Just-In-Time delivery with attorney review included.
              </p>

              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent/30 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#E8E5FF]" />
                  </div>
                  <div>
                    <span className="font-semibold" style={{ color: '#ffffff' }}>Just-In-Time Delivery</span>
                    <span className="ml-2" style={{ color: '#B0B0B0' }}>— Full application when you need it</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent/30 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#E8E5FF]" />
                  </div>
                  <div>
                    <span className="font-semibold" style={{ color: '#ffffff' }}>Attorney Review Included</span>
                    <span className="ml-2" style={{ color: '#B0B0B0' }}>— Expert eyes on every detail</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent/30 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-[#E8E5FF]" />
                  </div>
                  <div>
                    <span className="font-semibold" style={{ color: '#ffffff' }}>80% Cost Reduction</span>
                    <span className="ml-2" style={{ color: '#B0B0B0' }}>— Premium service, fraction of the price</span>
                  </div>
                </div>
              </div>

              <a
                href="mailto:o1a@justiguide.com?subject=O1A Beta Access Request"
                className="inline-flex items-center gap-3 bg-accent text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-accent-deep shadow-[0_4px_20px_rgba(107,95,207,0.4)] hover:-translate-y-0.5 transition-all"
                data-testid="button-o1a-beta-access"
              >
                Request Beta Access
              </a>
            </div>

            <div className="relative">
              <div className="rounded-3xl p-10 backdrop-blur-sm" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="text-center mb-10">
                  <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#F5EDD4' }}>OUR BIGGEST LAUNCH YET</p>
                  <h3 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>O1A Jet-Filing</h3>
                  <p style={{ color: '#B0B0B0' }}>Just-In-Time · 80% cost reduction</p>
                </div>
                <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="text-3xl font-bold mb-1" style={{ color: '#ffffff' }}>JIT</div>
                    <div className="text-sm" style={{ color: '#B0B0B0' }}>Just-In-Time</div>
                  </div>
                  <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="text-3xl font-bold mb-1" style={{ color: '#ffffff' }}>80%</div>
                    <div className="text-sm" style={{ color: '#B0B0B0' }}>Cost Savings</div>
                  </div>
                  <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="text-3xl font-bold mb-1" style={{ color: '#ffffff' }}>100%</div>
                    <div className="text-sm" style={{ color: '#B0B0B0' }}>Attorney Reviewed</div>
                  </div>
                  <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="text-3xl font-bold mb-1" style={{ color: '#ffffff' }}>10</div>
                    <div className="text-sm" style={{ color: '#B0B0B0' }}>Beta Spots</div>
                  </div>
                </div>
                <div className="pt-8 border-t border-white/10">
                  <p className="text-center text-sm mb-4" style={{ color: '#B0B0B0' }}>Perfect for</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {['Startup Founders', 'Tech Leaders', 'Researchers', 'Artists', 'Athletes'].map((label) => (
                      <span key={label} className="px-4 py-2 rounded-full text-sm" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff' }}>{label}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EU Residency Section */}
      <section className="py-[80px] bg-linear-to-br from-sage to-chalk relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[80px]"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="bg-white rounded-3xl p-10 shadow-xl border border-border">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-accent-light border border-accent/20 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Globe className="w-4 h-4" />
                  <span>European Residency</span>
                </div>
                
                <h2 className="font-display text-[36px] md:text-[42px] font-bold text-ink mb-4 leading-[1.1]">
                  Earn a Highly Qualified Talent Residency in Europe
                </h2>
                
                <p className="text-lg text-ink mb-6 leading-relaxed">
                  Fast-track your path to European residency with university-backed support. Residency granted in 4-6 months — faster than most EU residency paths.
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent shrink-0" />
                    <span className="text-ink">Faster than most EU residency/citizenship paths</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent shrink-0" />
                    <span className="text-ink">Supporting University backs your application</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent shrink-0" />
                    <span className="text-ink">Residency granted in 4-6 months</span>
                  </div>
                </div>

                <a
                  href="/eu"
                  className="inline-flex items-center gap-3 bg-chalk text-accent border-2 border-accent px-8 py-4 rounded-full font-semibold text-lg shadow-[0_4px_20px_rgba(107,95,207,0.15)] hover:bg-accent hover:text-white hover:border-accent hover:shadow-[0_8px_30px_rgba(107,95,207,0.35)] hover:-translate-y-0.5 transition-all"
                >
                  Learn More About EU Residency
                  <ArrowRight className="w-5 h-5 shrink-0" />
                </a>
              </div>

              <div className="relative">
                <div className="bg-accent-light rounded-2xl p-8 border border-accent/20">
                  <div className="text-center">
                    <Globe className="w-20 h-20 text-accent mx-auto mb-6" />
                    <h3 className="font-display text-2xl font-bold text-ink mb-4">European Access</h3>
                    <p className="text-ink leading-relaxed">
                      Gain residency rights in Europe, opening doors to work, study, and live across EU member states.
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
                    <p className="text-sm">I&apos;m a startup founder from Nigeria on an F-1. What are my best visa options?</p>
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

      {/* Benefits Section */}
      <section id="features" className="py-[100px] bg-sage">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[0.7rem] font-bold tracking-widest uppercase text-accent mb-4 flex items-center justify-center gap-2"><span className="w-5 h-0.5 bg-accent" /> Why JustiGuide</p>
            <h2 className="font-display text-[48px] font-bold text-ink mb-5">
              From Months to Hours
            </h2>
            <p className="text-xl text-warm-gray max-w-3xl mx-auto leading-relaxed">
              JustiGuide delivers completed applications in just 3 hours.<br className="hidden md:block"/>
              Here's how we make immigration simple:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="font-display text-[40px] font-bold text-ink mb-8">For Lawyers: 10x Your Practice</h3>

              <div className="space-y-8">
                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-ink mb-1">50% More Cases</h4>
                    <p className="text-base text-warm-gray leading-relaxed">
                      Handle 40 cases/month instead of 20 - with the same team
                    </p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-ink mb-1">93% Time Reduction</h4>
                    <p className="text-base text-warm-gray leading-relaxed">
                      From 40+ hours to 3 hours per case - verified by 500+ lawyers
                    </p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-ink mb-1">Zero Errors Guaranteed</h4>
                    <p className="text-base text-warm-gray leading-relaxed">
                      AI triple-checks every form - 100% RFE prevention rate
                    </p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center shrink-0">
                    <Zap className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-ink mb-1">$300K+ Additional Revenue</h4>
                    <p className="text-base text-warm-gray leading-relaxed">
                      Average lawyer adds $25K/month with our efficiency gains
                    </p>
                  </div>
                </div>
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
              <div className="flex text-gold mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-base text-warm-gray mb-6 leading-relaxed">
                "JustiGuide made my H1B process incredibly smooth. What used to take months took just 3 hours!"
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
              <div className="flex text-gold mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-base text-warm-gray mb-6 leading-relaxed">
                "Finally got my Green Card! The lawyer matching was perfect. Highly recommend JustiGuide."
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
              <div className="flex text-gold mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-base text-warm-gray mb-6 leading-relaxed">
                "Dolores AI answered all my questions instantly. Best immigration platform I've used!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: '#6F6966' }}>SK</div>
                <div>
                  <h4 className="font-semibold text-ink">Sarah Kim</h4>
                  <p className="text-sm text-warm-gray">Medical Resident</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-[100px] bg-chalk">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[0.7rem] font-bold tracking-widest uppercase text-accent mb-4 flex items-center justify-center gap-2"><span className="w-5 h-0.5 bg-accent" /> Platform features</p>
            <h2 className="font-display text-[48px] font-bold text-ink mb-5">
              Everything You Need in One Platform
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-2xl border border-border hover:shadow-xl hover:-translate-y-2 transition-all">
              <div className="w-full h-[200px] rounded-xl mb-6 overflow-hidden flex items-center justify-center bg-white">
                <img src={aiFormImage} alt="AI-Assisted Form Filling Interface" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold text-ink mb-3">AI-Assisted Form Filling</h3>
              <p className="text-warm-gray leading-relaxed">Reduce errors and save time across multiple immigration applications</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-border hover:shadow-xl hover:-translate-y-2 transition-all">
              <div className="w-full h-[200px] rounded-xl mb-6 overflow-hidden flex items-center justify-center bg-light-gray">
                <img src={multilingualImage} alt="Multilingual Support Interface" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold text-ink mb-3">Multilingual Support</h3>
              <p className="text-warm-gray leading-relaxed">Break language barriers effortlessly for diverse client bases</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-border hover:shadow-xl hover:-translate-y-2 transition-all">
              <div className="w-full h-[200px] rounded-xl mb-6 overflow-hidden flex items-center justify-center bg-light-gray">
                <img src={caseManagementImage} alt="Case Management Dashboard Interface" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold text-ink mb-3">Case Management Dashboard</h3>
              <p className="text-warm-gray leading-relaxed">Stay organized and on top of every immigration case</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-border hover:shadow-xl hover:-translate-y-2 transition-all">
              <div className="w-full h-[200px] rounded-xl mb-6 overflow-hidden flex items-center justify-center bg-light-gray">
                <img src={realTimeUpdatesImage} alt="Real-Time Updates Interface" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold text-ink mb-3">Real-Time Updates</h3>
              <p className="text-warm-gray leading-relaxed">Keep clients informed at every step of their immigration journey</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-border hover:shadow-xl hover:-translate-y-2 transition-all">
              <div className="w-full h-[200px] rounded-xl mb-6 overflow-hidden flex items-center justify-center bg-light-gray">
                <img src={legalResearchImage} alt="Legal Research Assistant Interface" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold text-ink mb-3">Legal Research Assistant</h3>
              <p className="text-warm-gray leading-relaxed">Access comprehensive immigration law resources instantly</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-border hover:shadow-xl hover:-translate-y-2 transition-all">
              <div className="w-full h-[200px] rounded-xl mb-6 overflow-hidden flex items-center justify-center bg-light-gray">
                <img src={documentVerificationImage} alt="Document Verification Interface" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold text-ink mb-3">Document Verification</h3>
              <p className="text-warm-gray leading-relaxed">Automated checks ensure accuracy and compliance</p>
            </div>
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
            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <p className="text-accent font-semibold mb-1">O-1A Just-In-Time Filing</p>
              <p className="font-display text-2xl font-bold text-ink">$9,499</p>
              <p className="text-sm text-warm-gray mt-2">Attorney-reviewed · Full petition · 80% vs traditional counsel</p>
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
          <p className="text-warm-gray text-sm mt-6">Financing and pay-over-time options available. <a href="/pricing" className="text-accent font-semibold hover:underline">Full pricing →</a></p>
        </div>
      </section>

      {/* Guarantee strip — HTML layout */}
      <section className="py-14 bg-accent-light">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 text-center">
          <div className="w-[72px] h-[72px] rounded-full bg-accent text-white flex items-center justify-center shrink-0">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-display text-2xl text-ink">100% Satisfaction Guarantee</h3>
            <p className="text-warm-gray text-[0.9rem] mt-1 max-w-[480px]">If your application is denied due to a JustiGuide error, we refund your full service fee. Your trust is non-negotiable.</p>
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
              Free assessment · See your best path in minutes · No commitment
            </p>
          </div>

          <div className="mb-10 p-6 rounded-2xl text-center bg-white border border-border">
            <h3 className="text-lg font-bold text-ink mb-2">What happens next</h3>
            <p className="text-sm text-warm-gray mb-2">15-minute discovery call to understand your background and goals.</p>
            <p className="text-sm text-warm-gray">Get your <strong className="text-ink">Success Probability score</strong>—AI analyzes thousands of cases to show your likelihood of approval.</p>
          </div>

          {isSubmitted ? (
            <div className="rounded-2xl p-12 text-center bg-white border border-border">
              <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
              <h3 className="font-display text-2xl font-bold text-ink mb-2">You're on the list! 🎉</h3>
              <p className="text-warm-gray">We'll be in touch within 1 hour to schedule your discovery call.</p>
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
                    className="w-full min-h-[48px] bg-chalk text-accent hover:bg-white font-bold py-6 text-lg rounded-full border-0 shadow-lg"
                    data-testid="button-submit-waitlist"
                  >
                    {waitlistMutation.isPending ? "Sending..." : "Get my roadmap →"}
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-[100px] bg-chalk">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[0.7rem] font-bold tracking-widest uppercase text-accent mb-4 flex items-center justify-center gap-2"><span className="w-5 h-0.5 bg-accent" /> Get in touch</p>
            <h2 className="font-display text-[48px] font-bold text-ink mb-5">Contact Us</h2>
            <p className="text-lg text-warm-gray max-w-2xl mx-auto leading-relaxed">
              Have questions? We're here to help you navigate your immigration journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-8 bg-white rounded-2xl border border-border">
              <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-ink mb-2">Email Us</h3>
              <a href="mailto:info@justiguide.com" className="text-accent hover:underline" data-testid="link-email">
                info@justiguide.com
              </a>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl border border-border">
              <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-ink mb-2">Call Us</h3>
              <a href="tel:+18667795127" className="text-accent hover:underline" data-testid="link-phone">
                +1 (866) 779-5127
              </a>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl border border-border">
              <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-ink mb-2">Visit Us</h3>
              <p className="text-warm-gray">
                San Francisco, CA<br />United States
              </p>
            </div>
          </div>
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
              <a href="https://immigrant.justi.guide/assessment" target="_blank" rel="noopener noreferrer" className="transition-colors hover:opacity-100" style={{ color: 'rgba(255,255,255,0.85)' }} data-testid="link-o1a-footer">Free Assessment</a>
              <a href="#features" className="transition-colors hover:opacity-100" style={{ color: 'rgba(255,255,255,0.85)' }}>Benefits</a>
              <a href="#pricing" className="transition-colors hover:opacity-100" style={{ color: 'rgba(255,255,255,0.85)' }}>Pricing</a>
              <a href="/features" className="transition-colors hover:opacity-100" style={{ color: 'rgba(255,255,255,0.85)' }} data-testid="link-features-footer">Feature Videos</a>
              <a href="#testimonials" className="transition-colors hover:opacity-100" style={{ color: 'rgba(255,255,255,0.85)' }}>Testimonials</a>
              <a href="/lawyer-faq" className="transition-colors hover:opacity-100" style={{ color: 'rgba(255,255,255,0.85)' }} data-testid="link-lawyer-faq-footer">Attorney FAQ</a>
              <a href="/press" className="transition-colors hover:opacity-100" style={{ color: 'rgba(255,255,255,0.85)' }} data-testid="link-press-footer">Press</a>
              <a href="#contact" className="transition-colors hover:opacity-100" style={{ color: 'rgba(255,255,255,0.85)' }}>Contact</a>
            </div>
          </nav>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-[11px] font-semibold uppercase tracking-wider mb-8">
            <a href="/privacy-policy" className="transition-colors hover:opacity-100" style={{ color: 'rgba(255,255,255,0.7)' }}>Privacy Policy</a>
            <a href="/terms-of-service" className="transition-colors hover:opacity-100" style={{ color: 'rgba(255,255,255,0.7)' }}>Terms of Service</a>
            <a href="/refund-policy" className="transition-colors hover:opacity-100" style={{ color: 'rgba(255,255,255,0.7)' }}>Refund Policy</a>
            <a href="/pricing" className="transition-colors hover:opacity-100" style={{ color: 'rgba(255,255,255,0.7)' }}>Pricing</a>
          </div>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
            © 2026 JustiGuide. Built by immigrants, for immigrants.
          </p>
        </div>
      </footer>
    </div>
  );
}
