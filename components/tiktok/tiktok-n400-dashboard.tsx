import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Search, TrendingUp, DollarSign, MessageSquare, Eye, Send } from "lucide-react";

interface N400Analysis {
  urgencyLevel: 'high' | 'medium' | 'low';
  eligibilityIndicators: string[];
  conversionProbability: number;
  recommendedApproach: string;
  estimatedValue: number;
}

interface TikTokLead {
  id: string;
  title: string;
  content: string;
  sourceUrl: string;
  authorUsername?: string;
  engagement: any;
  aiScore?: string;
  discoveredAt: string;
}

export function TikTokN400Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  // Get all leads and filter TikTok ones
  const { data: allLeads, isLoading: leadsLoading } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: () => api.getLeads(),
  });

  const tiktokLeads = (allLeads || []).filter(lead => 
    lead.sourcePlatform === 'tiktok'
  ) as TikTokLead[];

  // Scan TikTok leads for N400 opportunities
  const scanMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/tiktok/n400-scan');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to scan TikTok leads');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "TikTok N400 Scan Complete",
        description: `Found ${data.data.n400Opportunities} N400 opportunities from ${data.data.totalScanned} TikTok leads`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Scan Failed",
        description: error.message,
      });
    }
  });

  // Analyze specific lead for N400
  const { data: leadAnalysis, isLoading: analysisLoading } = useQuery({
    queryKey: [`/api/tiktok/lead/${selectedLead}/n400-analysis`],
    queryFn: async () => {
      if (!selectedLead) return null;
      const response = await fetch(`/api/tiktok/lead/${selectedLead}/n400-analysis`);
      if (!response.ok) return null;
      const result = await response.json();
      return result.success ? result.analysis : null;
    },
    enabled: !!selectedLead
  });

  // Generate N400 response
  const generateResponseMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const response = await fetch(`/api/tiktok/lead/${leadId}/n400-response`, {
        method: 'POST'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate response');
      }
      return response.json();
    },
    onSuccess: (data, leadId) => {
      toast({
        title: "N400 Response Generated",
        description: `TikTok-optimized N400 response created for lead`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Response Generation Failed", 
        description: error.message,
      });
    }
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-pink-600" />
              <CardTitle>TikTok N400 Lead Management</CardTitle>
            </div>
            <Button
              onClick={() => scanMutation.mutate()}
              disabled={scanMutation.isPending}
              className="bg-pink-600 hover:bg-pink-700"
            >
              {scanMutation.isPending ? (
                "Scanning..."
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Scan for N400
                </>
              )}
            </Button>
          </div>
          <CardDescription>
            Identify and convert TikTok leads for N400 citizenship applications ($499 flat fee)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-pink-50 dark:bg-pink-950 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-pink-600" />
                <span className="font-medium">TikTok Leads</span>
              </div>
              <p className="text-2xl font-bold text-pink-600 mt-2">{tiktokLeads.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total discovered</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="font-medium">N400 Value</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-2">$499</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Per citizenship application</p>
            </div>

            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <span className="font-medium">High Engagement</span>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {tiktokLeads.filter(lead => 
                  (lead.engagement?.likes || 0) > 1000 || 
                  (lead.engagement?.comments || 0) > 100
                ).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Viral potential leads</p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-purple-600" />
                <span className="font-medium">AI Score 8+</span>
              </div>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {tiktokLeads.filter(lead => parseFloat(lead.aiScore || '0') >= 8).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">High-quality leads</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TikTok Leads List */}
      <Card>
        <CardHeader>
          <CardTitle>TikTok Leads for N400 Analysis</CardTitle>
          <CardDescription>
            Click on a lead to analyze its N400 potential and generate targeted responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leadsLoading ? (
            <div className="text-center py-8">Loading TikTok leads...</div>
          ) : tiktokLeads.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No TikTok leads found</p>
              <p className="text-sm text-gray-500">Run TikTok scraping to discover leads</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tiktokLeads.map((lead) => (
                <div
                  key={lead.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedLead === lead.id
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-950'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedLead(lead.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {lead.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {lead.content.substring(0, 200)}...
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="outline">@{lead.authorUsername || 'Unknown'}</Badge>
                        {lead.aiScore && (
                          <Badge 
                            variant={parseFloat(lead.aiScore) >= 8 ? "default" : "secondary"}
                          >
                            AI Score: {lead.aiScore}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          👍 {lead.engagement?.likes || 0} | 💬 {lead.engagement?.comments || 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead.id);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Analyze
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          generateResponseMutation.mutate(lead.id);
                        }}
                        disabled={generateResponseMutation.isPending}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        N400 Response
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Analysis Panel */}
      {selectedLead && (
        <Card>
          <CardHeader>
            <CardTitle>N400 Analysis</CardTitle>
            <CardDescription>
              Detailed analysis of TikTok lead's potential for N400 citizenship application
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysisLoading ? (
              <div className="text-center py-8">Analyzing lead for N400 potential...</div>
            ) : leadAnalysis ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Urgency Level</h4>
                      <Badge className={getUrgencyColor(leadAnalysis.urgencyLevel)}>
                        {leadAnalysis.urgencyLevel.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Conversion Probability</h4>
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${leadAnalysis.conversionProbability * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round(leadAnalysis.conversionProbability * 100)}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Estimated Value</h4>
                      <p className="text-lg font-bold text-green-600">
                        ${leadAnalysis.estimatedValue}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Recommended Approach</h4>
                      <Badge variant="outline">
                        {leadAnalysis.recommendedApproach.replace(/_/g, ' ')}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">N400 Indicators Found</h4>
                      <div className="space-y-1">
                        {leadAnalysis.eligibilityIndicators.map((indicator, index) => (
                          <div key={index} className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                            {indicator}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No N400 potential detected for this lead
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}