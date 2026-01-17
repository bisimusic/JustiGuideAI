import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CheckCircle, Clock, Shield, Users, ArrowRight, Star } from "lucide-react";

const services = [
  {
    id: 'd2c_n400',
    name: 'N-400 Citizenship Application',
    price: 499,
    type: 'D2C',
    description: 'Complete support for your U.S. citizenship application',
    features: [
      'Complete N-400 form preparation',
      'Document review and guidance',
      'Interview preparation',
      'Expert legal support',
      'Status tracking and updates'
    ],
    popular: true,
    processingTime: '6-12 months',
    successRate: '98%'
  },
  {
    id: 'b2b_nonimmigrant_worker',
    name: 'Nonimmigrant Worker Visa',
    price: 750,
    type: 'B2B',
    description: 'Professional H-1B, L-1, and other work visa services',
    features: [
      'Petition preparation and filing',
      'Labor condition application',
      'Premium processing available',
      'Employer compliance guidance',
      'Extension and transfer support'
    ],
    popular: false,
    processingTime: '3-8 months',
    successRate: '94%'
  },
  {
    id: 'b2b_employment_auth',
    name: 'Employment Authorization',
    price: 350,
    type: 'B2B',
    description: 'Work permits and employment authorization documents',
    features: [
      'I-765 form preparation',
      'Supporting documentation',
      'Renewal assistance',
      'Expedite requests when eligible',
      'Status updates and tracking'
    ],
    popular: false,
    processingTime: '3-5 months',
    successRate: '96%'
  },
  {
    id: 'b2b_alien_relative',
    name: 'Family-Based Immigration',
    price: 450,
    type: 'B2B',
    description: 'Reunite with family through immigration petitions',
    features: [
      'I-130 petition preparation',
      'Consular processing guidance',
      'Adjustment of status support',
      'Priority date tracking',
      'Family unity protection'
    ],
    popular: false,
    processingTime: '12-24 months',
    successRate: '92%'
  },
  {
    id: 'b2b_asylum_defense',
    name: 'Asylum & Defense Services',
    price: 350,
    type: 'B2B',
    description: 'Protection and defense for those seeking asylum',
    features: [
      'I-589 asylum application',
      'Court representation',
      'Country condition research',
      'Witness preparation',
      'Appeal assistance'
    ],
    popular: false,
    processingTime: '1-3 years',
    successRate: '85%'
  }
];

export default function Services() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Professional Immigration Services
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Expert legal support to guide you through every step of your immigration journey
            </p>
            <div className="flex justify-center items-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span>Licensed Attorneys</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>10,000+ Cases Won</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                <span>4.9/5 Client Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Service
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Professional immigration services tailored to your specific needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card key={service.id} className={`relative ${service.popular ? 'ring-2 ring-blue-500' : ''}`}>
              {service.popular && (
                <Badge className="absolute -top-2 -right-2 bg-blue-500">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader>
                <CardTitle className="text-xl mb-2">{service.name}</CardTitle>
                <div className="text-3xl font-bold text-blue-600">
                  ${service.price}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {service.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{service.processingTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{service.successRate} success</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Included:</h4>
                  <ul className="space-y-1">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href={`/checkout?service=${service.id}`}>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    data-testid={`button-select-${service.id}`}
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Why Choose JustiGuide?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Trusted by thousands of immigrants nationwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600 dark:text-gray-300">Successful Cases</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">15+</div>
              <div className="text-gray-600 dark:text-gray-300">Years Experience</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">4.9/5</div>
              <div className="text-gray-600 dark:text-gray-300">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}