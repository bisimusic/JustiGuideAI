// JustiGuide Payment Page - Direct Conversion Capture
import { useState, useEffect } from 'react';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield, Clock, Users } from "lucide-react";

// Load Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Service offerings based on revenue calculator pricing
const services = [
  {
    id: 'd2c_n400',
    name: 'U.S. Citizenship Application (N-400)',
    description: 'Complete assistance with your naturalization application',
    price: 499,
    features: ['Expert guidance', 'Document preparation', 'Application review', '90-day support'],
    popular: true,
    type: 'one-time'
  },
  {
    id: 'b2b_nonimmigrant_worker', 
    name: 'Work Visa Services (H1B, O-1, L-1)',
    description: 'Professional work authorization assistance',
    price: 750,
    monthly: 50,
    features: ['Visa application prep', 'Legal consultation', 'Ongoing support', 'Case monitoring'],
    type: 'subscription'
  },
  {
    id: 'b2b_employment_auth',
    name: 'Employment Authorization (EAD)',
    description: 'Work permit application and renewal services',  
    price: 350,
    monthly: 100,
    features: ['Application preparation', 'Renewal tracking', 'Legal support', 'Priority processing'],
    type: 'subscription'
  },
  {
    id: 'b2b_alien_relative',
    name: 'Family-Based Immigration',
    description: 'Reunite with family through immigration',
    price: 450,  
    monthly: 100,
    features: ['Petition preparation', 'Process guidance', 'Document support', 'Case updates'],
    type: 'subscription'
  }
];

const CheckoutForm = ({ selectedService, clientSecret }: { selectedService: any, clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?service=${selectedService.id}`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            Complete Your {selectedService.name} Purchase
          </CardTitle>
          <CardDescription>
            Secure payment processed by Stripe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{selectedService.name}</h3>
              <span className="text-2xl font-bold">${selectedService.price}</span>
            </div>
            {selectedService.monthly && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Then ${selectedService.monthly}/month for ongoing support
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedService.features.map((feature: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={!stripe || processing}
              data-testid="button-complete-payment"
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Processing Payment...
                </div>
              ) : (
                <>Complete Payment - ${selectedService.price}</>
              )}
            </Button>
          </form>
          
          <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
            <Shield className="h-4 w-4 mr-1" />
            Secured by 256-bit SSL encryption
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ServiceSelector = ({ onSelectService }: { onSelectService: (service: any) => void }) => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Choose Your Immigration Service</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Expert legal assistance for your immigration journey
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {services.map((service) => (
          <Card 
            key={service.id} 
            className={`relative cursor-pointer hover:shadow-lg transition-shadow ${
              service.popular ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => onSelectService(service)}
            data-testid={`card-service-${service.id}`}
          >
            {service.popular && (
              <Badge className="absolute -top-2 -right-2 bg-blue-500">
                Most Popular
              </Badge>
            )}
            
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{service.name}</span>
                <div className="text-right">
                  <div className="text-2xl font-bold">${service.price}</div>
                  {service.monthly && (
                    <div className="text-sm text-gray-500">
                      +${service.monthly}/mo
                    </div>
                  )}
                </div>
              </CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2 mb-4">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {feature}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Fast processing
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Expert support
                </div>
              </div>
              
              <Button className="w-full" data-testid={`button-select-${service.id}`}>
                Select This Service
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default function Checkout() {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedService) {
      setLoading(true);
      
      // Create payment intent with service details
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: selectedService.price,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          serviceType: selectedService.type
        })
      })
      .then(res => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Payment intent creation failed:', error);
        setLoading(false);
      });
    }
  }, [selectedService]);

  if (!selectedService) {
    return <ServiceSelector onSelectService={setSelectedService} />;
  }

  if (loading || !clientSecret) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
          <p>Preparing secure payment...</p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm selectedService={selectedService} clientSecret={clientSecret} />
    </Elements>
  );
}