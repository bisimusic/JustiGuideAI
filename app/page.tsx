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
import { Award, CheckCircle, Clock, Users, MessageCircle, Shield, Zap, Globe, Heart, Star, Mail, MapPin, Phone, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Nunito, sans-serif' }}>
      {/* O1A Launch Announcement Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white py-3 px-4" data-testid="banner-o1a-launch">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-sm md:text-base">
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-white text-[#0F172A]" style={{ backgroundColor: 'white', color: '#0F172A' }}>NEW</span>
          <span className="font-medium">O1A Jet-Filing for Founders — Just-In-Time, attorney review, 80% cost reduction</span>
          <a 
            href="https://immigrant.justi.guide/jit"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 rounded-full font-semibold text-sm transition-opacity whitespace-nowrap hover:opacity-90"
            style={{ background: 'linear-gradient(to right, #6B5FCF, #5B8DEE)', color: 'white' }}
            data-testid="link-o1a-early-access"
          >
            Learn More →
          </a>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="JustiGuide Logo" className="w-10 h-10" data-testid="logo-image" />
              <span className="text-2xl font-bold text-gray-900">JustiGuide</span>
            </div>
            
            <div className="hidden md:flex items-center gap-10">
              <a href="https://immigrant.justi.guide/assessment" target="_blank" rel="noopener noreferrer" className="text-[#475569] hover:text-[#6B5FCF] font-medium text-[15px] transition-colors">Free Assessment</a>
              <a href="#how-it-works" className="text-[#475569] hover:text-[#6B5FCF] font-medium text-[15px] transition-colors">How It Works</a>
              <a href="#features" className="text-[#475569] hover:text-[#6B5FCF] font-medium text-[15px] transition-colors">Benefits</a>
              <a href="#pricing" className="text-[#475569] hover:text-[#6B5FCF] font-medium text-[15px] transition-colors">Pricing</a>
              <a href="#testimonials" className="text-[#475569] hover:text-[#6B5FCF] font-medium text-[15px] transition-colors">Testimonials</a>
              <a href="#contact" className="text-[#475569] hover:text-[#6B5FCF] font-medium text-[15px] transition-colors">Contact</a>
            </div>

            <a
              href="https://immigrant.justi.guide/assessment"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] inline-flex items-center justify-center bg-gradient-to-r from-[#6B5FCF] to-[#5B8DEE] text-white px-7 py-3 rounded-full font-semibold text-[15px] hover:shadow-[0_8px_20px_rgba(107,95,207,0.3)] hover:-translate-y-0.5 transition-all"
              data-testid="nav-cta"
            >
              Free Assessment
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-[100px] pb-20 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        {/* Blob decoration */}
        <div className="absolute top-12 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#6B5FCF]/10 to-[#5B8DEE]/10 rounded-full opacity-30 blur-[100px]"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-[900px] mx-auto">
            {/* TIME Best Inventions Badge - SEO Link */}
            <a 
              href="https://time.com/collections/best-inventions-2025/7318500/justiguide-relo/" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white border border-gray-200 text-gray-900 px-6 py-3 rounded-full font-medium text-base mb-8 hover:border-gray-300 hover:shadow-md transition-all"
              data-testid="badge-time-inventions"
            >
              <Award className="h-5 w-5 text-gray-700" />
              <span>TIME Best Inventions 2025</span>
            </a>

            <h1 className="text-[56px] md:text-[56px] font-bold text-[#0F172A] mb-6 leading-[1.1]">
              From <span className="bg-gradient-to-r from-[#6B5FCF] to-[#5B8DEE] bg-clip-text text-transparent">Months to Hours</span>
            </h1>

            <p className="text-xl text-[#475569] font-semibold mb-5">
              Your new life, your secure path—with certainty at every step.
            </p>

            <p className="text-xl text-[#94A3B8] mb-6 max-w-2xl mx-auto leading-[1.7]">
              JustiGuide connects you with vetted lawyers and AI-powered tools so you can move from overwhelming to ready—faster.
            </p>

            {/* 5-second test: clear visa categories (audit Stage 2) */}
            <p className="text-sm text-[#64748B] mb-10 font-medium">
              We help with: <span className="text-[#0F172A]">O-1A</span> · <span className="text-[#0F172A]">EB-1</span> · <span className="text-[#0F172A]">EB-2 NIW</span> · <span className="text-[#0F172A]">N-400</span> · <span className="text-[#0F172A]">H-1B</span> · <span className="text-[#0F172A]">Green Card</span> · <span className="text-[#0F172A]">and more</span>
            </p>

            <div className="flex gap-4 justify-center mb-20 flex-wrap">
              <a
                href="https://immigrant.justi.guide/assessment"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] min-w-[180px] inline-flex items-center justify-center bg-gradient-to-r from-[#6B5FCF] to-[#5B8DEE] text-white px-8 py-4 rounded-full font-semibold text-base shadow-[0_4px_20px_rgba(107,95,207,0.25)] hover:shadow-[0_8px_30px_rgba(107,95,207,0.35)] hover:-translate-y-0.5 transition-all"
                data-testid="button-hero-cta"
              >
                Get my personalized roadmap
              </a>
              <p className="text-[#64748B] text-sm mt-2">See your eligibility score in minutes—no commitment.</p>
              <a
                href="https://justi.guide/get_started/"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] min-w-[180px] inline-flex items-center justify-center bg-white text-[#6B5FCF] px-8 py-4 rounded-full font-semibold text-base border-2 border-[#E8E5FF] hover:bg-[#E8E5FF] hover:-translate-y-0.5 transition-all"
                data-testid="button-lawyer-cta"
              >
                Join as Lawyer - $699/case
              </a>
            </div>

            {/* Process Steps */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-6 shadow-2xl">
              <div className="bg-white rounded-xl p-10" id="how-it-works">
                <div className="flex justify-center items-center gap-10 mb-10 flex-wrap">
                  <div className="text-center flex-1 min-w-[150px]">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#6B5FCF] to-[#5B8DEE] text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                      1
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Legal Research Assistant</h3>
                    <p className="text-sm text-gray-600">Dolores AI answers instantly</p>
                  </div>
                  <div className="text-center flex-1 min-w-[150px]">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#6B5FCF] to-[#5B8DEE] text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                      2
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">VetMatch™ Pairing</h3>
                    <p className="text-sm text-gray-600">Perfect lawyer in minutes</p>
                  </div>
                  <div className="text-center flex-1 min-w-[150px]">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#6B5FCF] to-[#5B8DEE] text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                      3
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">FastTrack Processing™</h3>
                    <p className="text-sm text-gray-600">Complete in 3 hours</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-center gap-20 mt-12 pt-10 bg-gradient-to-r from-[#6B5FCF]/5 to-[#5B8DEE]/5 rounded-2xl p-10 flex-wrap">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#6B5FCF]" data-testid="stat-users">47,000+</div>
                    <div className="text-sm text-gray-600 mt-1">Users Helped</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#6B5FCF]" data-testid="stat-lawyers">500+</div>
                    <div className="text-sm text-gray-600 mt-1">Vetted Lawyers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#6B5FCF]" data-testid="stat-success">95%</div>
                    <div className="text-sm text-gray-600 mt-1">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why choose JustiGuide – trust strip (builds trust as user scrolls) */}
      <section className="py-14 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-center text-[#64748B] text-sm font-semibold uppercase tracking-wider mb-8">
            Why choose JustiGuide
          </h2>
          <div className="grid md:grid-cols-3 gap-10 text-center">
            <div>
              <p className="text-lg font-bold text-[#0F172A] mb-2">Built by top accelerators</p>
              <p className="text-[#475569] text-sm leading-relaxed">
                Our platform is built by Y Combinator and TechCrunch Showcase winners. Trust our track record of innovation and reliability.
              </p>
            </div>
            <div>
              <p className="text-lg font-bold text-[#0F172A] mb-2">95% success rate</p>
              <p className="text-[#475569] text-sm leading-relaxed">
                We focus on transparency and quality at every step. Our proven success rate gives you confidence in your immigration journey.
              </p>
            </div>
            <div>
              <p className="text-lg font-bold text-[#0F172A] mb-2">U.S. licensed attorneys</p>
              <p className="text-[#475569] text-sm leading-relaxed">
                Every case is reviewed by vetted, U.S.-licensed immigration attorneys. Expert guidance from assessment to submission.
              </p>
            </div>
          </div>
          {/* Trust: satisfaction guarantee (audit Stage 3) */}
          <div className="mt-10 pt-8 border-t border-[#E2E8F0] text-center">
            <p className="text-[#0F172A] font-semibold mb-1">100% satisfaction guarantee</p>
            <p className="text-[#475569] text-sm max-w-xl mx-auto">If your application is denied due to our error, we refund the service fee. Transparency and honesty at every stage.</p>
          </div>
        </div>
      </section>

      {/* Achievements Banner */}
      <section className="py-12 bg-gradient-to-r from-[#6B5FCF] to-[#5B8DEE]" data-testid="section-achievements">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3 text-white" data-testid="achievement-time-best-inventions">
              <Award className="w-8 h-8" />
              <div>
                <p className="text-sm font-medium opacity-90">Selected As</p>
                <p className="text-lg font-bold">TIME Best Inventions 2025</p>
              </div>
            </div>
            
            <div className="hidden md:block w-px h-12 bg-white/30"></div>
            
            <div className="flex items-center gap-3 text-white" data-testid="achievement-techcrunch">
              <Award className="w-8 h-8" />
              <div>
                <p className="text-sm font-medium opacity-90">Winner</p>
                <p className="text-lg font-bold">TechCrunch Best Showcase Pitch 2025</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Extraordinary Talent Section - O1A for Founders */}
      <section id="extraordinary-talent" className="py-[100px] bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] relative overflow-hidden" data-testid="section-extraordinary-talent">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#6B5FCF]/20 to-[#5B8DEE]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#5B8DEE]/15 to-[#6B5FCF]/10 rounded-full blur-[100px]"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4 text-[#5B8DEE]" />
                <span>For Founders & Extraordinary Talent</span>
              </div>
              
              <h2 className="text-[42px] md:text-[52px] font-bold text-white mb-6 leading-[1.1]">
                Immigration<br />
                <span className="bg-gradient-to-r from-[#6B5FCF] to-[#5B8DEE] bg-clip-text text-transparent">Done For You</span>
              </h2>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                We handle your immigration while you build your legacy.
              </p>
              
              <p className="text-base text-gray-400 mb-10 leading-relaxed">
                O1A Jet-Filing is about to change everything. We're launching a done-for-you service for founders who qualify — Just-In-Time delivery with attorney review included.
              </p>

              {/* Key Benefits */}
              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#6B5FCF]/30 to-[#5B8DEE]/30 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#5B8DEE]" />
                  </div>
                  <div>
                    <span className="text-white font-semibold">Just-In-Time Delivery</span>
                    <span className="text-gray-400 ml-2">— Full application when you need it</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#6B5FCF]/30 to-[#5B8DEE]/30 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#5B8DEE]" />
                  </div>
                  <div>
                    <span className="text-white font-semibold">Attorney Review Included</span>
                    <span className="text-gray-400 ml-2">— Expert eyes on every detail</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#6B5FCF]/30 to-[#5B8DEE]/30 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-[#5B8DEE]" />
                  </div>
                  <div>
                    <span className="text-white font-semibold">80% Cost Reduction</span>
                    <span className="text-gray-400 ml-2">— Premium service, fraction of the price</span>
                  </div>
                </div>
              </div>

              <a
                href="mailto:o1a@justiguide.com?subject=O1A Beta Access Request"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#6B5FCF] to-[#5B8DEE] text-white px-8 py-4 rounded-full font-semibold text-lg shadow-[0_4px_20px_rgba(107,95,207,0.4)] hover:shadow-[0_8px_30px_rgba(107,95,207,0.5)] hover:-translate-y-0.5 transition-all"
                data-testid="button-o1a-beta-access"
              >
                Request Beta Access
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">10 spots</span>
              </a>
            </div>

            {/* Right Content - Stats Card */}
            <div className="relative">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-10">
                <div className="text-center mb-10">
                  <p className="text-sm font-semibold text-[#5B8DEE] uppercase tracking-wider mb-3">OUR BIGGEST LAUNCH YET</p>
                  <h3 className="text-3xl font-bold text-white mb-2">47,000+ Immigrants Served</h3>
                  <p className="text-gray-400">This year alone</p>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="bg-white/5 rounded-2xl p-6 text-center">
                    <div className="text-3xl font-bold text-white mb-1">JIT</div>
                    <div className="text-sm text-gray-400">Just-In-Time</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-6 text-center">
                    <div className="text-3xl font-bold text-white mb-1">80%</div>
                    <div className="text-sm text-gray-400">Cost Savings</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-6 text-center">
                    <div className="text-3xl font-bold text-white mb-1">100%</div>
                    <div className="text-sm text-gray-400">Attorney Reviewed</div>
                   </div>
                  <div className="bg-white/5 rounded-2xl p-6 text-center">
                    <div className="text-3xl font-bold text-white mb-1">10</div>
                    <div className="text-sm text-gray-400">Beta Spots</div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-8">
                  <p className="text-center text-gray-400 text-sm mb-4">Perfect for</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <span className="bg-white/10 text-white px-4 py-2 rounded-full text-sm">Startup Founders</span>
                    <span className="bg-white/10 text-white px-4 py-2 rounded-full text-sm">Tech Leaders</span>
                    <span className="bg-white/10 text-white px-4 py-2 rounded-full text-sm">Researchers</span>
                    <span className="bg-white/10 text-white px-4 py-2 rounded-full text-sm">Artists</span>
                    <span className="bg-white/10 text-white px-4 py-2 rounded-full text-sm">Athletes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EU Residency Section */}
      <section className="py-[80px] bg-gradient-to-br from-[#F8FAFC] to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-[#6B5FCF]/5 to-[#5B8DEE]/5 rounded-full blur-[80px]"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="bg-white rounded-3xl p-10 shadow-xl border border-gray-200">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6B5FCF]/10 to-[#5B8DEE]/10 border border-[#6B5FCF]/20 text-[#6B5FCF] px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Globe className="w-4 h-4" />
                  <span>European Residency</span>
                </div>
                
                <h2 className="text-[36px] md:text-[42px] font-bold text-[#0F172A] mb-4 leading-[1.1]">
                  Earn a Highly Qualified Talent Residency in Europe
                </h2>
                
                <p className="text-lg text-[#1E293B] mb-6 leading-relaxed">
                  Fast-track your path to European residency with university-backed support. Residency granted in 4-6 months — faster than most EU residency paths.
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#6B5FCF] flex-shrink-0" />
                    <span className="text-[#1E293B]">Faster than most EU residency/citizenship paths</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#6B5FCF] flex-shrink-0" />
                    <span className="text-[#1E293B]">Supporting University backs your application</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#6B5FCF] flex-shrink-0" />
                    <span className="text-[#1E293B]">Residency granted in 4-6 months</span>
                  </div>
                </div>

                <a
                  href="/eu"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-[#6B5FCF] to-[#5B8DEE] text-white px-8 py-4 rounded-full font-semibold text-lg shadow-[0_4px_20px_rgba(107,95,207,0.25)] hover:shadow-[0_8px_30px_rgba(107,95,207,0.35)] hover:-translate-y-0.5 transition-all"
                >
                  Learn More About EU Residency
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-[#6B5FCF]/10 to-[#5B8DEE]/10 rounded-2xl p-8 border border-[#6B5FCF]/20">
                  <div className="text-center">
                    <Globe className="w-20 h-20 text-[#6B5FCF] mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-[#0F172A] mb-4">European Access</h3>
                    <p className="text-[#1E293B] leading-relaxed">
                      Gain residency rights in Europe, opening doors to work, study, and live across EU member states.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dolores AI Section */}
      <section className="py-[100px] bg-white relative">
        <div className="absolute left-[-150px] top-[100px] w-[400px] h-[400px] bg-[#5B8DEE]/10 rounded-full blur-[60px]"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#6B5FCF] uppercase tracking-wider mb-4">BEYOND FORMS: TRUE AI INTELLIGENCE</p>
            <h2 className="text-[48px] font-bold text-[#0F172A] mb-5">
              Meet Dolores AI™<br/>
              <span className="bg-gradient-to-r from-[#6B5FCF] to-[#5B8DEE] bg-clip-text text-transparent">1M+ Cases. 12 Languages. 3 Second Answers.</span>
            </h2>
            <p className="text-lg text-[#475569] max-w-3xl mx-auto leading-relaxed">
              Dolores provides legal reasoning, strategy analysis, and predictive insights<br className="hidden md:block"/>
              - like having an immigration expert available 24/7.
            </p>
          </div>

          <div className="flex justify-center gap-20 flex-wrap mt-12">
            <div className="text-center">
              <h3 className="text-5xl font-bold text-[#6B5FCF] mb-2">99.7%</h3>
              <p className="text-[#475569]">Accuracy Rate</p>
            </div>
            <div className="text-center">
              <h3 className="text-5xl font-bold text-[#6B5FCF] mb-2">3 sec</h3>
              <p className="text-[#475569]">Response Time</p>
            </div>
            <div className="text-center">
              <h3 className="text-5xl font-bold text-[#6B5FCF] mb-2">24/7</h3>
              <p className="text-[#475569]">Always Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="features" className="py-[100px] bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#6B5FCF] uppercase tracking-wider mb-4">WHY JUSTIGUIDE</p>
            <h2 className="text-[48px] font-bold text-[#0F172A] mb-5">
              From Months to Hours
            </h2>
            <p className="text-xl text-[#475569] max-w-3xl mx-auto leading-relaxed">
              JustiGuide delivers completed applications in just 3 hours.<br className="hidden md:block"/>
              Here's how we make immigration simple:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-[40px] font-bold text-[#0F172A] mb-8">For Lawyers: 10x Your Practice</h3>

              <div className="space-y-8">
                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#6B5FCF]/10 to-[#5B8DEE]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-[#6B5FCF]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">50% More Cases</h4>
                    <p className="text-base text-gray-600 leading-relaxed">
                      Handle 40 cases/month instead of 20 - with the same team
                    </p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#6B5FCF]/10 to-[#5B8DEE]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-[#6B5FCF]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">93% Time Reduction</h4>
                    <p className="text-base text-gray-600 leading-relaxed">
                      From 40+ hours to 3 hours per case - verified by 500+ lawyers
                    </p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#6B5FCF]/10 to-[#5B8DEE]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-[#6B5FCF]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Zero Errors Guaranteed</h4>
                    <p className="text-base text-gray-600 leading-relaxed">
                      AI triple-checks every form - 100% RFE prevention rate
                    </p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#6B5FCF]/10 to-[#5B8DEE]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-[#6B5FCF]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">$300K+ Additional Revenue</h4>
                    <p className="text-base text-gray-600 leading-relaxed">
                      Average lawyer adds $25K/month with our efficiency gains
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-[#5B8DEE]/20 to-[#6B5FCF]/20 rounded-full blur-3xl"></div>
              <div className="relative h-full flex items-center justify-center">
                <Globe className="w-64 h-64 text-[#6B5FCF]/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-[100px] bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#6B5FCF] uppercase tracking-wider mb-4">TESTIMONIALS</p>
            <h2 className="text-[48px] font-bold text-[#0F172A] mb-5">
              Why people <strong>LOVE</strong> JustiGuide
            </h2>
            <p className="text-lg text-[#475569] max-w-2xl mx-auto leading-relaxed">
              Read what our satisfied customers say. Join the community who trust us for quality, reliability, and service.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-base text-gray-700 mb-6 leading-relaxed">
                "JustiGuide made my H1B process incredibly smooth. What used to take months took just 3 hours!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#6B5FCF] to-[#5B8DEE] rounded-full flex items-center justify-center text-white font-semibold">
                  PR
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Priya Reddy</h4>
                  <p className="text-sm text-gray-600">Software Engineer</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-base text-gray-700 mb-6 leading-relaxed">
                "Finally got my Green Card! The lawyer matching was perfect. Highly recommend JustiGuide."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#6B5FCF] to-[#5B8DEE] rounded-full flex items-center justify-center text-white font-semibold">
                  MC
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Miguel Chen</h4>
                  <p className="text-sm text-gray-600">Business Owner</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-base text-gray-700 mb-6 leading-relaxed">
                "Dolores AI answered all my questions instantly. Best immigration platform I've used!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#6B5FCF] to-[#5B8DEE] rounded-full flex items-center justify-center text-white font-semibold">
                  SK
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Sarah Kim</h4>
                  <p className="text-sm text-gray-600">Medical Resident</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-[100px] bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#6B5FCF] uppercase tracking-wider mb-4">PLATFORM FEATURES</p>
            <h2 className="text-[48px] font-bold text-[#0F172A] mb-5">
              Everything You Need in One Platform
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#F8FAFC] p-8 rounded-2xl border border-[#E2E8F0] hover:shadow-xl hover:-translate-y-2 transition-all">
              <div className="w-full h-[200px] rounded-xl mb-6 overflow-hidden flex items-center justify-center bg-white">
                <img src={aiFormImage} alt="AI-Assisted Form Filling Interface" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold text-[#0F172A] mb-3">AI-Assisted Form Filling</h3>
              <p className="text-gray-600 leading-relaxed">Reduce errors and save time across multiple immigration applications</p>
            </div>

            <div className="bg-[#F8FAFC] p-8 rounded-2xl border border-[#E2E8F0] hover:shadow-xl hover:-translate-y-2 transition-all">
              <div className="w-full h-[200px] rounded-xl mb-6 overflow-hidden flex items-center justify-center bg-white">
                <img src={multilingualImage} alt="Multilingual Support Interface" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold text-[#0F172A] mb-3">Multilingual Support</h3>
              <p className="text-gray-600 leading-relaxed">Break language barriers effortlessly for diverse client bases</p>
            </div>

            <div className="bg-[#F8FAFC] p-8 rounded-2xl border border-[#E2E8F0] hover:shadow-xl hover:-translate-y-2 transition-all">
              <div className="w-full h-[200px] rounded-xl mb-6 overflow-hidden flex items-center justify-center bg-white">
                <img src={caseManagementImage} alt="Case Management Dashboard Interface" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold text-[#0F172A] mb-3">Case Management Dashboard</h3>
              <p className="text-gray-600 leading-relaxed">Stay organized and on top of every immigration case</p>
            </div>

            <div className="bg-[#F8FAFC] p-8 rounded-2xl border border-[#E2E8F0] hover:shadow-xl hover:-translate-y-2 transition-all">
              <div className="w-full h-[200px] rounded-xl mb-6 overflow-hidden flex items-center justify-center bg-white">
                <img src={realTimeUpdatesImage} alt="Real-Time Updates Interface" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold text-[#0F172A] mb-3">Real-Time Updates</h3>
              <p className="text-gray-600 leading-relaxed">Keep clients informed at every step of their immigration journey</p>
            </div>

            <div className="bg-[#F8FAFC] p-8 rounded-2xl border border-[#E2E8F0] hover:shadow-xl hover:-translate-y-2 transition-all">
              <div className="w-full h-[200px] rounded-xl mb-6 overflow-hidden flex items-center justify-center bg-white">
                <img src={legalResearchImage} alt="Legal Research Assistant Interface" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold text-[#0F172A] mb-3">Legal Research Assistant</h3>
              <p className="text-gray-600 leading-relaxed">Access comprehensive immigration law resources instantly</p>
            </div>

            <div className="bg-[#F8FAFC] p-8 rounded-2xl border border-[#E2E8F0] hover:shadow-xl hover:-translate-y-2 transition-all">
              <div className="w-full h-[200px] rounded-xl mb-6 overflow-hidden flex items-center justify-center bg-white">
                <img src={documentVerificationImage} alt="Document Verification Interface" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold text-[#0F172A] mb-3">Document Verification</h3>
              <p className="text-gray-600 leading-relaxed">Automated checks ensure accuracy and compliance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent pricing (Stage 6: eliminate budget uncertainty, e-sign, pay-per-phase) */}
      <section id="pricing" className="py-16 bg-[#F8FAFC] border-t border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-[32px] font-bold text-[#0F172A] mb-4">Transparent pricing</h2>
          <p className="text-[#475569] mb-8 max-w-2xl mx-auto">
            No hidden fees. Know your investment before you start.
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
              <p className="text-[#6B5FCF] font-semibold mb-1">O-1A Just-In-Time Filing</p>
              <p className="text-2xl font-bold text-[#0F172A]">From $8,000</p>
              <p className="text-sm text-[#64748B] mt-2">Attorney-reviewed · Full petition · 80% vs traditional counsel</p>
              <p className="text-xs text-[#64748B] mt-2">E-signature ready · Review &amp; sign online</p>
              <a href="https://immigrant.justi.guide/assessment" target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-[#6B5FCF] font-semibold text-sm hover:underline">Get started →</a>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
              <p className="text-[#6B5FCF] font-semibold mb-1">Other visas &amp; green card</p>
              <p className="text-2xl font-bold text-[#0F172A]">Starting from</p>
              <p className="text-sm text-[#64748B] mt-2">Free assessment · Tiered packages · Clear fee breakdown</p>
              <p className="text-xs text-[#64748B] mt-2">Pay per phase available · No large upfront retainer</p>
              <a href="https://immigrant.justi.guide/assessment" target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-[#6B5FCF] font-semibold text-sm hover:underline">See options →</a>
            </div>
          </div>
          <p className="text-[#64748B] text-sm mt-6">Financing and pay-over-time options available. <a href="/pricing" className="text-[#6B5FCF] font-semibold hover:underline">Full pricing →</a></p>
        </div>
      </section>

      {/* Lead capture CTA (audit: CTA clarity – "Get My Personalized Roadmap") */}
      <section id="waitlist" className="py-[100px] bg-gradient-to-r from-[#6B5FCF] to-[#5B8DEE] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-[48px] md:text-[56px] font-bold text-white mb-6 leading-tight">
              Get your personalized roadmap
            </h2>
            <p className="text-lg text-white/90">
              Free assessment · See your best path in minutes · No commitment
            </p>
          </div>

          {/* Stage 5: What happens next – 15-min discovery + Success Probability */}
          <div className="mb-10 p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-center">
            <h3 className="text-lg font-bold text-white mb-2">What happens next</h3>
            <p className="text-white/90 text-sm mb-2">15-minute discovery call to understand your background and goals.</p>
            <p className="text-white/90 text-sm">Get your <strong>Success Probability score</strong>—AI analyzes thousands of cases to show your likelihood of approval.</p>
          </div>

          {isSubmitted ? (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-12 text-center">
              <CheckCircle className="w-16 h-16 text-white mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">You're on the list! 🎉</h3>
              <p className="text-white/90">We'll be in touch within 1 hour to schedule your discovery call.</p>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
              {/* Trust: Security & Privacy badge (audit Stage 4) */}
              <div className="flex items-center justify-center gap-2 mb-6 text-white/90 text-sm">
                <Shield className="h-4 w-4" />
                <span>Secure &amp; private · Your data is never shared</span>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-semibold">Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="John Doe"
                            autoComplete="name"
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white min-h-[48px]"
                            data-testid="input-name"
                          />
                        </FormControl>
                        <FormMessage className="text-white/90" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-semibold">Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email"
                            placeholder="john@example.com"
                            autoComplete="email"
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white min-h-[48px]"
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage className="text-white/90" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-semibold">Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="+1 (555) 123-4567"
                            autoComplete="tel"
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white min-h-[48px]"
                            data-testid="input-phone"
                          />
                        </FormControl>
                        <FormMessage className="text-white/90" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="immigrationStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-semibold">Immigration Status (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger 
                              className="bg-white/20 border-white/30 text-white focus:border-white"
                              data-testid="select-status"
                            >
                              <SelectValue placeholder="Select your status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white">
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
                    className="w-full min-h-[48px] bg-white text-[#6B5FCF] hover:bg-white/90 font-bold py-6 text-lg rounded-full"
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
      <section id="contact" className="py-[100px] bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#6B5FCF] uppercase tracking-wider mb-4">GET IN TOUCH</p>
            <h2 className="text-[48px] font-bold text-[#0F172A] mb-5">Contact Us</h2>
            <p className="text-lg text-[#475569] max-w-2xl mx-auto leading-relaxed">
              Have questions? We're here to help you navigate your immigration journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-8 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6B5FCF]/10 to-[#5B8DEE]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-[#6B5FCF]" />
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Email Us</h3>
              <a href="mailto:info@justiguide.com" className="text-[#6B5FCF] hover:underline" data-testid="link-email">
                info@justiguide.com
              </a>
            </div>

            <div className="text-center p-8 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6B5FCF]/10 to-[#5B8DEE]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-[#6B5FCF]" />
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Call Us</h3>
              <a href="tel:+18667795127" className="text-[#6B5FCF] hover:underline" data-testid="link-phone">
                +1 (866) 779-5127
              </a>
            </div>

            <div className="text-center p-8 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6B5FCF]/10 to-[#5B8DEE]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-[#6B5FCF]" />
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Visit Us</h3>
              <p className="text-[#475569]">
                San Francisco, CA<br />United States
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <img src={logoImage} alt="JustiGuide Logo" className="w-10 h-10" data-testid="footer-logo-image" />
              <span className="text-2xl font-bold">JustiGuide</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 mb-6">
              <a href="https://immigrant.justi.guide/assessment" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">Free Assessment</a>
              <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</a>
              <a href="#features" className="text-gray-400 hover:text-white transition-colors">Benefits</a>
              <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
              <a href="/features" className="text-gray-400 hover:text-white transition-colors" data-testid="link-features-footer">Feature Videos</a>
              <a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Testimonials</a>
              <a href="/lawyer-faq" className="text-gray-400 hover:text-white transition-colors" data-testid="link-lawyer-faq-footer">Attorney FAQ</a>
              <a href="/press" className="text-gray-400 hover:text-white transition-colors" data-testid="link-press-footer">Press</a>
              <a href="https://nexpathglobal.ai" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" data-testid="link-nexpath-footer">NexPath Global</a>
              <a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-gray-500 text-sm">
              <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</a>
              <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            <p>© 2026 JustiGuide. Built by immigrants, for immigrants.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
