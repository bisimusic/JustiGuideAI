"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Download, Calendar } from "lucide-react";
import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const serviceId = searchParams?.get('service') || null;
  const paymentIntent = searchParams?.get('payment_intent') || null;
  const sessionId = searchParams?.get('session_id') || null;

  const serviceNames = {
    'o1a_readiness_assessment': 'O-1A Readiness Assessment',
    'd2c_n400': 'U.S. Citizenship Application (N-400)',
    'b2b_nonimmigrant_worker': 'Work Visa Services',
    'b2b_employment_auth': 'Employment Authorization (EAD)', 
    'b2b_alien_relative': 'Family-Based Immigration'
  };

  useEffect(() => {
    // Track conversion event
    if ((paymentIntent || sessionId) && serviceId) {
      fetch('/api/track-conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntent,
          sessionId,
          serviceId,
          conversionType: 'payment',
          source: serviceId === 'o1a_readiness_assessment' ? 'o1a-webinar' : 'direct_payment'
        })
      }).catch(console.error);
    }
  }, [paymentIntent, sessionId, serviceId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-700 dark:text-green-400">
            Payment Successful!
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Thank you for choosing JustiGuide for your {serviceNames[serviceId as keyof typeof serviceNames] || 'immigration'} needs
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              What happens next?
            </h3>
            <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
              <li>• You'll receive a confirmation email within 5 minutes</li>
              <li>• Our expert team will contact you within 24 hours</li>
              <li>• We'll start preparing your case immediately</li>
              <li>• Track your progress through our client portal</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center gap-2" data-testid="button-download-receipt">
              <Download className="h-4 w-4" />
              Download Receipt
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2" data-testid="button-schedule-consultation">
              <Calendar className="h-4 w-4" />
              Schedule Call
            </Button>
            
            <Link href="/dashboard">
              <Button className="w-full flex items-center gap-2" data-testid="button-view-dashboard">
                View Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Need help? Contact our support team:</p>
            <p className="font-medium">support@justi.guide | 1-800-JUSTI-GUIDE</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center"><div>Loading...</div></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}