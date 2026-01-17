import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Users, Mail, Brain, Target, MessageCircle, Calendar, Building2 } from "lucide-react";

interface Persona {
  id: string;
  name: string;
  email: string;
  profileType: 'investor' | 'customer' | 'consultation' | 'referral';
  communicationStyle: string;
  keyInterests: string[];
  painPoints: string[];
  engagementScore: number;
  preferredContactTime: string;
  immigrationNeeds: string[];
  businessContext: string;
  personaSummary: string;
  lastInteraction: string;
  interactionCount: number;
  createdAt: string;
  updatedAt: string;
}

export function PersonaManagement() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const queryClient = useQueryClient();

  const { data: personas, isLoading } = useQuery({
    queryKey: ["/api/personas"],
    queryFn: async () => {
      const response = await fetch('/api/personas');
      const data = await response.json();
      return data.personas || [];
    },
  });

  const analyzePersonasMutation = useMutation({
    mutationFn: async ({ maxEmails = 50 }: { maxEmails?: number }) => {
      const response = await fetch('/api/personas/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxEmails })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personas"] });
      setIsAnalyzing(false);
    },
    onError: () => {
      setIsAnalyzing(false);
    }
  });

  const handleAnalyzePersonas = () => {
    setIsAnalyzing(true);
    analyzePersonasMutation.mutate({ maxEmails: 100 });
  };

  const getProfileTypeColor = (type: string) => {
    switch (type) {
      case 'investor': return 'bg-green-100 text-green-800 border-green-200';
      case 'customer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'consultation': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'referral': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEngagementLevel = (score: number) => {
    if (score >= 80) return { label: 'Very High', color: 'text-green-600' };
    if (score >= 60) return { label: 'High', color: 'text-blue-600' };
    if (score >= 40) return { label: 'Medium', color: 'text-yellow-600' };
    return { label: 'Low', color: 'text-red-600' };
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Email Personas</h2>
            <p className="text-gray-600">Loading persona profiles...</p>
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Email Personas
          </h2>
          <p className="text-gray-600">
            AI-generated customer personas based on email conversation history
          </p>
        </div>
        
        <Button
          onClick={handleAnalyzePersonas}
          disabled={isAnalyzing}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isAnalyzing ? (
            <>
              <Brain className="h-4 w-4 mr-2 animate-spin" />
              Analyzing Emails...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Analyze Email History
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Personas</p>
                <p className="text-xl font-semibold">{personas?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">High Engagement</p>
                <p className="text-xl font-semibold">
                  {personas?.filter((p: Persona) => p.engagementScore >= 70).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Investors</p>
                <p className="text-xl font-semibold">
                  {personas?.filter((p: Persona) => p.profileType === 'investor').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Active Conversations</p>
                <p className="text-xl font-semibold">
                  {personas?.filter((p: Persona) => p.interactionCount >= 5).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personas List */}
      {personas && personas.length > 0 ? (
        <div className="grid gap-6">
          {personas.map((persona: Persona) => {
            const engagement = getEngagementLevel(persona.engagementScore);
            
            return (
              <Card key={persona.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{persona.name}</CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        {persona.email}
                      </CardDescription>
                    </div>
                    
                    <div className="flex gap-2">
                      <Badge className={getProfileTypeColor(persona.profileType)}>
                        {persona.profileType}
                      </Badge>
                      <Badge variant="outline" className={engagement.color}>
                        {engagement.label} Engagement
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Engagement Score */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Engagement Score</span>
                      <span className="text-sm text-gray-600">{persona.engagementScore}/100</span>
                    </div>
                    <Progress value={persona.engagementScore} className="h-2" />
                  </div>
                  
                  {/* Persona Summary */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Persona Summary</h4>
                    <p className="text-sm text-gray-700">{persona.personaSummary}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* Key Interests */}
                      {persona.keyInterests && persona.keyInterests.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Key Interests
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {persona.keyInterests.map((interest, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Immigration Needs */}
                      {persona.immigrationNeeds && persona.immigrationNeeds.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Immigration Needs</h4>
                          <div className="flex flex-wrap gap-1">
                            {persona.immigrationNeeds.map((need, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {need}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* Communication Style */}
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          Communication Style
                        </h4>
                        <Badge variant="outline">{persona.communicationStyle}</Badge>
                      </div>
                      
                      {/* Business Context */}
                      {persona.businessContext && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            Business Context
                          </h4>
                          <p className="text-xs text-gray-600">{persona.businessContext}</p>
                        </div>
                      )}
                      
                      {/* Interaction Stats */}
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Interaction Stats
                        </h4>
                        <div className="text-xs text-gray-600">
                          <p>{persona.interactionCount} conversations</p>
                          <p>Last contact: {new Date(persona.lastInteraction).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pain Points */}
                  {persona.painPoints && persona.painPoints.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Pain Points</h4>
                      <div className="flex flex-wrap gap-1">
                        {persona.painPoints.map((pain, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {pain}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Personas Found</h3>
            <p className="text-gray-600 mb-4">
              Click "Analyze Email History" to generate AI-powered personas from your Gmail conversations.
            </p>
            <Button onClick={handleAnalyzePersonas} disabled={isAnalyzing}>
              {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}