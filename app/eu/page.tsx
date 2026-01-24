"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ArrowRight, Globe, Clock, Shield, Award } from "lucide-react";
import Link from "next/link";

const logoImage = "/assets/file-VqtLhVngyJTcoRdkTestqJ-Guarder Icon - Transparent_1759804664573.png";

const inquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

type InquiryForm = z.infer<typeof inquirySchema>;

export default function EUResidencyPage() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<InquiryForm>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const inquiryMutation = useMutation({
    mutationFn: async (data: InquiryForm) => {
      const response = await fetch("/api/eu-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit inquiry");
      }
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Inquiry Submitted! 🎉",
        description: "We'll contact you soon about your EU residency application.",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit inquiry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InquiryForm) => {
    inquiryMutation.mutate(data);
  };
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
      <section className="relative py-[100px] pb-20 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        {/* Blob decoration */}
        <div className="absolute top-12 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#6B5FCF]/10 to-[#5B8DEE]/10 rounded-full opacity-30 blur-[100px]"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-[900px] mx-auto">
            <h1 className="text-[56px] md:text-[64px] font-bold text-[#0F172A] mb-8 leading-[1.1]">
              Earn a <span className="bg-gradient-to-r from-[#6B5FCF] to-[#5B8DEE] bg-clip-text text-transparent">Highly Qualified Talent Residency</span> in Europe
            </h1>

            <p className="text-xl text-[#1E293B] mb-12 max-w-2xl mx-auto leading-[1.7]">
              Fast-track your path to European residency with university-backed support and streamlined processing.
            </p>

            {/* Key Benefits */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 shadow-2xl mb-12">
              <div className="bg-white rounded-xl p-10">
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#6B5FCF] to-[#5B8DEE] text-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">Faster than most EU residency/citizenship paths</h3>
                      <p className="text-gray-800">Streamlined process designed for qualified professionals</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#6B5FCF] to-[#5B8DEE] text-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">Supporting University backs your application</h3>
                      <p className="text-gray-800">Academic endorsement strengthens your case</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#6B5FCF] to-[#5B8DEE] text-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">Residency granted in 4-6 months</h3>
                      <p className="text-gray-800">Expedited timeline compared to traditional routes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose This Path Section */}
      <section className="py-[100px] bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#6B5FCF] uppercase tracking-wider mb-4">WHY THIS PATH</p>
            <h2 className="text-[48px] font-bold text-[#0F172A] mb-5">
              The Fastest Route to European Residency
            </h2>
            <p className="text-xl text-[#1E293B] max-w-3xl mx-auto leading-relaxed">
              Designed for highly qualified professionals seeking a streamlined path to European residency.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#F8FAFC] p-8 rounded-2xl border border-[#E2E8F0] hover:shadow-xl hover:-translate-y-2 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6B5FCF]/10 to-[#5B8DEE]/10 rounded-full flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-[#6B5FCF]" />
              </div>
              <h3 className="text-xl font-semibold text-[#0F172A] mb-3">Expedited Timeline</h3>
              <p className="text-gray-800 leading-relaxed">
                Complete your residency application in 4-6 months, significantly faster than traditional EU immigration paths.
              </p>
            </div>

            <div className="bg-[#F8FAFC] p-8 rounded-2xl border border-[#E2E8F0] hover:shadow-xl hover:-translate-y-2 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6B5FCF]/10 to-[#5B8DEE]/10 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-[#6B5FCF]" />
              </div>
              <h3 className="text-xl font-semibold text-[#0F172A] mb-3">University Support</h3>
              <p className="text-gray-800 leading-relaxed">
                Benefit from academic endorsement that strengthens your application and demonstrates your qualifications.
              </p>
            </div>

            <div className="bg-[#F8FAFC] p-8 rounded-2xl border border-[#E2E8F0] hover:shadow-xl hover:-translate-y-2 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6B5FCF]/10 to-[#5B8DEE]/10 rounded-full flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-[#6B5FCF]" />
              </div>
              <h3 className="text-xl font-semibold text-[#0F172A] mb-3">European Access</h3>
              <p className="text-gray-800 leading-relaxed">
                Gain residency rights in Europe, opening doors to work, study, and live across EU member states.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-[100px] bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#6B5FCF] uppercase tracking-wider mb-4">HOW IT WORKS</p>
            <h2 className="text-[48px] font-bold text-[#0F172A] mb-5">
              Simple, Streamlined Process
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6B5FCF] to-[#5B8DEE] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Initial Assessment</h3>
              <p className="text-sm text-gray-800">Evaluate your qualifications and eligibility</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6B5FCF] to-[#5B8DEE] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">University Endorsement</h3>
              <p className="text-sm text-gray-800">Secure academic backing for your application</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6B5FCF] to-[#5B8DEE] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Application Submission</h3>
              <p className="text-sm text-gray-800">Complete and submit your residency application</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6B5FCF] to-[#5B8DEE] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
                4
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Residency Granted</h3>
              <p className="text-sm text-gray-800">Receive your residency in 4-6 months</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-[100px] bg-gradient-to-r from-[#6B5FCF] to-[#5B8DEE] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-[48px] md:text-[56px] font-bold text-white mb-6 leading-tight">
            Ready to Start Your European Journey?
          </h2>
          <p className="text-lg text-white/90 mb-10">
            Join highly qualified professionals who are fast-tracking their path to European residency.
          </p>
          {isSubmitted ? (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center">
              <CheckCircle className="w-16 h-16 text-white mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Inquiry Submitted!</h3>
              <p className="text-white/90 mb-6">
                We'll contact you soon about your EU residency application.
              </p>
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Submit Another Inquiry
              </Button>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Get Started</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white"
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
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white"
                          />
                        </FormControl>
                        <FormMessage className="text-white/90" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={inquiryMutation.isPending}
                    className="w-full bg-white text-[#6B5FCF] hover:bg-white/90 font-bold py-6 text-lg rounded-full"
                  >
                    {inquiryMutation.isPending ? (
                      "Submitting..."
                    ) : (
                      <>
                        Get Started
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <img src={logoImage} alt="JustiGuide Logo" className="w-10 h-10" />
              <span className="text-2xl font-bold">JustiGuide</span>
            </div>
            
            <div className="flex justify-center gap-10 mb-10">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
              <Link href="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link>
              <Link href="/lawyer-faq" className="text-gray-400 hover:text-white transition-colors">Attorney FAQ</Link>
              <Link href="/press" className="text-gray-400 hover:text-white transition-colors">Press</Link>
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
