"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Scale, GraduationCap, Building, DollarSign, Users, Target, Brain } from "lucide-react";

interface PersonaCounts {
  lawyers: number;
  schools: number;
  employers: number;
  investors: number;
  total: number;
}

interface Persona {
  id: string;
  name: string;
  email: string;
  profileType: 'investor' | 'customer' | 'consultation' | 'referral';
  communicationStyle: string;
  keyInterests: string[];
  painPoints: string[];
  engagementScore: number;
  immigrationNeeds: string[];
  businessContext: string;
  interactionCount: number;
}

export function PersonaSelection({ onPersonaSelect }: { onPersonaSelect?: (persona: string) => void }) {
  const [selectedPersona, setSelectedPersona] = useState<string>('lawyers');
  
  const { data: personas, isLoading } = useQuery({
    queryKey: ["/api/personas"],
    queryFn: async () => {
      const response = await fetch('/api/personas');
      const data = await response.json();
      return data.personas || [];
    },
  });

  const { data: contacts } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: async () => {
      const response = await fetch('/api/contacts');
      const data = await response.json();
      return data.contacts || [];
    },
  });

  // Get accurate persona counts from database
  const { data: personaCounts, isLoading: countsLoading } = useQuery<{
    lawyers: number;
    schools: number;
    employers: number;
    investors: number;
    total: number;
  }>({
    queryKey: ["/api/persona-analytics"],
    enabled: true
  });

  const getPersonaCounts = (): PersonaCounts => {
    if (countsLoading || !personaCounts) {
      return { lawyers: 0, schools: 0, employers: 0, investors: 0, total: 0 };
    }

    // Handle different response formats safely
    const data = personaCounts || {};
    
    // If it's the expected format from persona-analytics endpoint
    if (typeof data === 'object' && 'lawyers' in data) {
      const counts = data as any;
      return {
        lawyers: counts.lawyers || 0,
        schools: counts.schools || 0,
        employers: counts.employers || 0,
        investors: counts.investors || 0,
        total: counts.total || 0
      };
    }

    // Fallback: calculate from personas array if available
    if (personas && Array.isArray(personas) && personas.length > 0) {
      const counts = { lawyers: 0, schools: 0, employers: 0, investors: 0 };
      
      personas.forEach((persona: Persona) => {
        const businessContext = persona.businessContext?.toLowerCase() || '';
        const interests = persona.keyInterests?.join(' ').toLowerCase() || '';
        const immigrationNeeds = persona.immigrationNeeds?.join(' ').toLowerCase() || '';
        
        if (persona.profileType === 'investor' || 
            businessContext.includes('investor') || 
            businessContext.includes('venture') ||
            businessContext.includes('funding') ||
            immigrationNeeds.includes('eb-5')) {
          counts.investors++;
        } else if (businessContext.includes('education') || 
                   businessContext.includes('university') || 
                   businessContext.includes('school') ||
                   businessContext.includes('academic') ||
                   interests.includes('education') ||
                   immigrationNeeds.includes('f-1') ||
                   immigrationNeeds.includes('student')) {
          counts.schools++;
        } else if (businessContext.includes('employer') || 
                   businessContext.includes('hiring') || 
                   businessContext.includes('hr') ||
                   businessContext.includes('company') ||
                   businessContext.includes('corporation') ||
                   immigrationNeeds.includes('h1b') ||
                   immigrationNeeds.includes('employment')) {
          counts.employers++;
        } else {
          counts.lawyers++; // Default to lawyers for general consultation
        }
      });
      
      return {
        ...counts,
        total: counts.lawyers + counts.schools + counts.employers + counts.investors
      };
    }

    // Final fallback
    return { lawyers: 0, schools: 0, employers: 0, investors: 0, total: 0 };
  };

  const currentPersonaCounts = getPersonaCounts();

  const personaOptions = [
    {
      id: 'lawyers',
      icon: Scale,
      title: 'Lawyers',
      count: currentPersonaCounts.lawyers,
      description: 'Legal professionals seeking consultation services',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      id: 'schools',
      icon: GraduationCap,
      title: 'Schools',
      count: currentPersonaCounts.schools,
      description: 'Educational institutions and academic contacts',
      color: 'bg-green-100 text-green-800 border-green-200',
      iconColor: 'text-green-600'
    },
    {
      id: 'employers',
      icon: Building,
      title: 'Employers',
      count: currentPersonaCounts.employers,
      description: 'Companies needing H1B and employment visa services',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      iconColor: 'text-purple-600'
    },
    {
      id: 'investors',
      icon: DollarSign,
      title: 'Investors',
      count: currentPersonaCounts.investors,
      description: 'High-net-worth individuals interested in EB-5',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      iconColor: 'text-orange-600'
    }
  ];

  const handlePersonaSelect = (personaId: string) => {
    setSelectedPersona(personaId);
    onPersonaSelect?.(personaId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Target Persona Selection</h2>
          <p className="text-gray-600">Loading persona data from email analysis...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Target className="h-6 w-6" />
          Target Persona Selection
        </h2>
        <p className="text-gray-600">
          Choose the primary audience for lead strategy generation
        </p>
        {currentPersonaCounts.total > 0 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Brain className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-600">
              Based on analysis of {currentPersonaCounts.total} email personas
            </span>
          </div>
        )}
      </div>

      {/* Persona Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {personaOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedPersona === option.id;
          
          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-blue-500 border-blue-500 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handlePersonaSelect(option.id)}
            >
              <CardContent className="p-6 text-center space-y-4">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-xl mx-auto flex items-center justify-center ${
                  isSelected ? 'bg-blue-600' : option.color.split(' ')[0]
                }`}>
                  <Icon className={`h-8 w-8 ${
                    isSelected ? 'text-white' : option.iconColor
                  }`} />
                </div>
                
                {/* Title and Count */}
                <div>
                  <h3 className="text-lg font-semibold mb-1">{option.title}</h3>
                  <Badge 
                    variant={isSelected ? 'default' : 'secondary'}
                    className={`text-lg font-bold px-3 py-1 ${
                      isSelected ? 'bg-blue-600 text-white' : ''
                    }`}
                  >
                    {option.count} leads
                  </Badge>
                </div>
                
                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  {option.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Data State */}
      {currentPersonaCounts.total === 0 && (
        <Card className="text-center py-12 bg-gray-50">
          <CardContent className="space-y-4">
            <Users className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Persona Data Available</h3>
              <p className="text-gray-600 mb-4">
                To populate these persona categories with real data, analyze your email history first.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Go to <strong>Email Personas</strong> tab and click <strong>Analyze Email History</strong>
              </p>
              <p className="text-sm text-gray-500">
                This will scan your Gmail conversations and categorize contacts automatically
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Info */}
      {currentPersonaCounts.total > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900">Persona Analysis Summary</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-blue-900">{currentPersonaCounts.lawyers}</div>
              <div className="text-blue-700">Legal Consultations</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-900">{currentPersonaCounts.schools}</div>
              <div className="text-green-700">Educational Contacts</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-purple-900">{currentPersonaCounts.employers}</div>
              <div className="text-purple-700">Corporate Clients</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-orange-900">{currentPersonaCounts.investors}</div>
              <div className="text-orange-700">Investment Inquiries</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      {selectedPersona && currentPersonaCounts.total > 0 && (
        <div className="text-center">
          <Button 
            onClick={() => handlePersonaSelect(selectedPersona)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
          >
            Generate Strategy for {personaOptions.find(p => p.id === selectedPersona)?.title}
          </Button>
        </div>
      )}
    </div>
  );
}