"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Video, CheckCircle2, Users, Zap, Shield, FileText, TrendingUp, Award, ArrowRight, CreditCard } from "lucide-react";
import Link from "next/link";

const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

const logoImage = "/assets/file-VqtLhVngyJTcoRdkTestqJ-Guarder Icon - Transparent_1759804664573.png";

export default function O1AWebinarPage() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const registrationMutation = useMutation({
    mutationFn: async (data: RegistrationForm) => {
      const response = await apiRequest("/api/waitlist", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          source: "o1a-webinar",
          type: "webinar-registration",
        }),
      });
      return response;
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Registration Successful! 🎉",
        description: "Check your email for the Zoom link and calendar invite.",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to register. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegistrationForm) => {
    registrationMutation.mutate(data);
  };

  const learningPoints = [
    "The exact USCIS criteria for O-1A eligibility",
    "How to evaluate yourself honestly",
    "The 8 evidence categories that matter most",
    "How founders, engineers, and creatives get approved",
    "Common reasons O-1As get denied",
    "A realistic timeline and budget",
    "How AI can accelerate your case prep",
  ];

  const targetAudience = [
    "Startup founders",
    "Engineers & researchers",
    "Designers & creatives",
    "Scientists",
    "Product leaders",
    "Athletes & performers",
    "Anyone building an extraordinary career in the U.S.",
  ];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Nunito, sans-serif' }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <img src={logoImage} alt="JustiGuide Logo" className="w-10 h-10" />
              <span className="text-2xl font-bold text-gray-900">JustiGuide</span>
            </Link>
            <Link href="/" className="text-[#475569] hover:text-[#6B5FCF] font-medium text-[15px] transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#6B5FCF]/20 to-[#5B8DEE]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#5B8DEE]/15 to-[#6B5FCF]/10 rounded-full blur-[100px]"></div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Video className="w-4 h-4" />
              <span>Free Live Webinar</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              From Zero to O-1A:
              <br />
              <span className="bg-gradient-to-r from-[#6B5FCF] to-[#5B8DEE] bg-clip-text text-transparent">
                A Clear, Step-by-Step Path to the Extraordinary Ability Visa
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Live weekly session with JustiGuide founder <strong>Bisi Obateru</strong> — learn exactly how to qualify, prepare evidence, and build a winning O-1A petition in 2026.
            </p>

            {/* Date/Time Block */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-8">
              <div className="grid md:grid-cols-4 gap-4 text-white mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#5B8DEE]" />
                  <div className="text-left">
                    <div className="text-sm text-gray-300">When</div>
                    <div className="font-semibold">Every Thursday</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#5B8DEE]" />
                  <div className="text-left">
                    <div className="text-sm text-gray-300">Time</div>
                    <div className="font-semibold">12:00 PM Pacific</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#5B8DEE]" />
                  <div className="text-left">
                    <div className="text-sm text-gray-300">Duration</div>
                    <div className="font-semibold">60 minutes</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-[#5B8DEE]" />
                  <div className="text-left">
                    <div className="text-sm text-gray-300">Platform</div>
                    <div className="font-semibold">Live on Zoom</div>
                  </div>
                </div>
              </div>
              
              {/* Join Webinar Button */}
              <div className="text-center pt-4 border-t border-white/20">
                <a
                  href="https://meet.google.com/uqu-ihbh-fzh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-white text-[#6B5FCF] px-8 py-4 rounded-full font-bold text-lg hover:bg-white/90 shadow-[0_4px_20px_rgba(255,255,255,0.2)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 transition-all"
                >
                  <Video className="w-5 h-5" />
                  Join Webinar Now
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4">
              What You'll Learn
            </h2>
            <p className="text-lg text-[#475569]">
              In this free live workshop, you'll discover:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {learningPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <CheckCircle2 className="w-6 h-6 text-[#6B5FCF] flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who This Is For Section */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4">
              Who This Is For
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {targetAudience.map((audience, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#E2E8F0] hover:shadow-md transition-shadow">
                <Users className="w-5 h-5 text-[#6B5FCF] flex-shrink-0" />
                <p className="text-gray-700 font-medium">{audience}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section className="py-20 bg-gradient-to-r from-[#6B5FCF] to-[#5B8DEE] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-2xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Reserve Your Seat
            </h2>
            <p className="text-lg text-white/90">
              Join us this Thursday at 12:00 PM Pacific. Limited spots available.
            </p>
          </div>

          {isSubmitted ? (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-white mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">You're Registered!</h3>
              <p className="text-white/90 mb-6">
                Check your email for the Zoom link and calendar invite. We'll see you on Thursday!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://meet.google.com/uqu-ihbh-fzh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#6B5FCF] hover:bg-white/90 px-6 py-3 rounded-full font-semibold transition-all"
                >
                  <Video className="w-5 h-5" />
                  Join Webinar Now
                </a>
                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  Register Another Person
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
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
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white"
                          />
                        </FormControl>
                        <FormMessage />
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
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={registrationMutation.isPending}
                    className="w-full bg-white text-[#6B5FCF] hover:bg-white/90 font-bold py-6 text-lg rounded-full"
                  >
                    {registrationMutation.isPending ? (
                      "Registering..."
                    ) : (
                      <>
                        Reserve My Seat
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </div>
      </section>

      {/* Next Step Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] rounded-2xl p-12 border border-[#E2E8F0]">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4">
                Your Next Step
              </h2>
              <p className="text-lg text-[#475569]">
                At the end of the session, you'll be invited to start with:
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border border-[#E2E8F0] mb-6">
              <div className="flex items-start gap-4 mb-6">
                <FileText className="w-8 h-8 text-[#6B5FCF] flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[#0F172A] mb-2">
                    O-1A Readiness Assessment – $149
                  </h3>
                  <p className="text-[#475569] leading-relaxed mb-4">
                    A personalized, attorney-reviewed roadmap to your O-1A eligibility.
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-[#475569]">
                      <CheckCircle2 className="w-4 h-4 text-[#6B5FCF]" />
                      <span>Personalized eligibility evaluation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#475569]">
                      <CheckCircle2 className="w-4 h-4 text-[#6B5FCF]" />
                      <span>Attorney-reviewed roadmap</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#475569]">
                      <CheckCircle2 className="w-4 h-4 text-[#6B5FCF]" />
                      <span>Evidence preparation guide</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#475569]">
                      <CheckCircle2 className="w-4 h-4 text-[#6B5FCF]" />
                      <span>Timeline and budget planning</span>
                    </div>
                  </div>
                  <Button
                    onClick={async () => {
                      try {
                        // Get form values if available (from registration form above)
                        const formEmail = form.getValues('email');
                        const formName = form.getValues('name');

                        // Create Stripe Checkout Session
                        const response = await fetch('/api/create-checkout-session', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            amount: 149,
                            serviceId: 'o1a_readiness_assessment',
                            serviceName: 'O-1A Readiness Assessment',
                            email: formEmail || undefined,
                            name: formName || undefined,
                          }),
                        });

                        const data = await response.json();

                        if (data.error) {
                          toast({
                            title: 'Payment Error',
                            description: data.error,
                            variant: 'destructive',
                          });
                          return;
                        }

                        // Redirect to Stripe Checkout
                        if (data.url) {
                          window.location.href = data.url;
                        } else {
                          toast({
                            title: 'Payment Error',
                            description: 'Failed to create checkout session',
                            variant: 'destructive',
                          });
                        }
                      } catch (error: any) {
                        console.error('Payment error:', error);
                        toast({
                          title: 'Payment Error',
                          description: error.message || 'Failed to initiate payment. Please try again.',
                          variant: 'destructive',
                        });
                      }
                    }}
                    className="w-full bg-gradient-to-r from-[#6B5FCF] to-[#5B8DEE] text-white hover:from-[#5B4FBF] hover:to-[#4B7DDE] font-bold py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                  >
                    <Shield className="w-5 h-5 mr-2" />
                    Purchase Assessment – $149
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <p className="text-xs text-[#94A3B8] text-center mt-3">
                    <Shield className="w-3 h-3 inline mr-1" />
                    Secure payment via Stripe
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-[#475569] mb-4">
                Join the webinar first to learn more about this assessment and get special pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <img src={logoImage} alt="JustiGuide Logo" className="w-10 h-10" />
              <span className="text-2xl font-bold">JustiGuide</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2026 JustiGuide. Built by immigrants, for immigrants.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
