import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface RedditLead {
  id: string;
  title: string;
  content: string;
  sourceUrl: string;
  aiScore: number;
  discoveredAt: string;
  responseStatus: 'pending' | 'responded' | 'engaged' | 'converted';
  lastChecked?: string;
  userReplied?: boolean;
  conversionStage: 'initial' | 'interested' | 'evaluating' | 'ready' | 'converted';
  responses?: any[];
  sourcePlatform: string;
}

export function RedditResponseTracker() {
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25); // Fixed to 25 per page as requested
  
  const { data: leads, isLoading } = useQuery({
    queryKey: ["/api/leads/with-responses"],
    queryFn: () => api.getLeadsWithResponses(),
    refetchInterval: 120000, // Check every 2 minutes (aligned with optimization policy)
  });

  const checkResponsesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/reddit/check-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads/with-responses"] });
    }
  });

  const followUpMutation = useMutation({
    mutationFn: async ({ leadId, message }: { leadId: string; message: string }) => {
      const response = await fetch('/api/reddit/follow-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leadId, message })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads/with-responses"] });
    }
  });

  // Filter leads from Reddit and calculate response status dynamically
  const redditLeads = (leads || []).filter((lead: any) => 
    lead.sourcePlatform === 'reddit'
  ).map((lead: any) => {
    // Calculate response status based on actual data
    const responseCount = lead.responses?.length || 0;
    const hasUserInteraction = responseCount > 2; // Multiple back-and-forth
    const isConverted = lead.title?.toLowerCase().includes('signup') || lead.title?.toLowerCase().includes('converted');
    
    let responseStatus: 'pending' | 'responded' | 'engaged' | 'converted';
    let conversionStage: 'initial' | 'interested' | 'evaluating' | 'ready' | 'converted';
    
    if (isConverted) {
      responseStatus = 'converted';
      conversionStage = 'converted';
    } else if (hasUserInteraction) {
      responseStatus = 'engaged';
      conversionStage = 'evaluating';
    } else if (responseCount > 0) {
      responseStatus = 'responded';
      conversionStage = 'interested';
    } else {
      responseStatus = 'pending';
      conversionStage = 'initial';
    }
    
    return {
      ...lead,
      responseStatus,
      conversionStage,
      userReplied: responseCount > 0
    };
  }) as RedditLead[];

  const getLeadsByStatus = (status: string) => {
    return redditLeads.filter(lead => lead.responseStatus === status);
  };

  // Reset page when status changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus]);

  // Pagination logic
  const currentStatusLeads = getLeadsByStatus(selectedStatus);
  const totalLeads = currentStatusLeads.length;
  const totalPages = Math.ceil(totalLeads / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedLeads = currentStatusLeads.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'responded': return 'bg-blue-100 text-blue-800';
      case 'engaged': return 'bg-purple-100 text-purple-800';
      case 'converted': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConversionStageColor = (stage: string) => {
    switch (stage) {
      case 'initial': return 'bg-gray-100 text-gray-800';
      case 'interested': return 'bg-blue-100 text-blue-800';
      case 'evaluating': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-orange-100 text-orange-800';
      case 'converted': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusCounts = {
    pending: getLeadsByStatus('pending').length,
    responded: getLeadsByStatus('responded').length,
    engaged: getLeadsByStatus('engaged').length,
    converted: getLeadsByStatus('converted').length,
  };

  // Calculate real metrics from actual data
  const allPlatformLeads = leads || [];
  const totalResponses = allPlatformLeads.reduce((sum: number, lead: any) => sum + (lead.responses?.length || 0), 0);
  const redditResponses = redditLeads.reduce((sum: number, lead: RedditLead) => sum + (lead.responses?.length || 0), 0);
  const twitterLeads = allPlatformLeads.filter((l: any) => l.sourcePlatform === 'twitter');
  const twitterResponses = twitterLeads.reduce((sum: number, lead: any) => sum + (lead.responses?.length || 0), 0);
  
  const databaseMetrics = {
    totalRedditResponses: redditResponses,
    totalAllPlatformResponses: totalResponses,
    responseBreakdown: {
      reddit: redditResponses,
      twitter: twitterResponses,
      whatsapp: totalResponses - redditResponses - twitterResponses
    }
  };

  const handleFollowUp = (leadId: string) => {
    const followUpMessages = [
      "Hi! Just wanted to follow up on your immigration question. Have you had a chance to check out JustiGuide? We help with both N400 citizenship applications and H1B visa support. Here's a helpful video overview: https://www.loom.com/share/d27c93fa51b04c8abe6c121ea4e5c7ae - Would either service be helpful for your situation?",
      "Hope this helps with your immigration journey! Whether you need H1B visa support or are ready for N400 citizenship, JustiGuide makes the process much easier. Check out this video for more details: https://www.loom.com/share/d27c93fa51b04c8abe6c121ea4e5c7ae - Which path are you considering?",
      "Thanks for the great question! Many people in similar situations find JustiGuide helpful for both H1B visas and citizenship applications. Here's a video explaining our approach: https://www.loom.com/share/d27c93fa51b04c8abe6c121ea4e5c7ae - Both processes can be complex, but our platform guides you through every step."
    ];
    
    const randomMessage = followUpMessages[Math.floor(Math.random() * followUpMessages.length)];
    followUpMutation.mutate({ leadId, message: randomMessage });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reddit Response Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>👀</span>
                <span>Reddit Response Monitoring</span>
                <span className="text-green-600 text-sm">✅ Goal Achieved</span>
              </CardTitle>
              <CardDescription>
                Track Reddit lead responses and guide them to N400/H1B conversion • Auto follow-up includes video resource and service guidance
              </CardDescription>
            </div>
            <Button 
              onClick={() => checkResponsesMutation.mutate()}
              disabled={checkResponsesMutation.isPending}
              variant="outline"
            >
              {checkResponsesMutation.isPending ? 'Checking...' : '🔄 Check Responses'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Database Response Metrics */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <h3 className="text-green-900 font-semibold mb-2">🎯 Database Response Tracking</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{databaseMetrics.totalRedditResponses}</p>
                <p className="text-sm text-green-700">Reddit Responses</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{databaseMetrics.responseBreakdown.twitter}</p>
                <p className="text-sm text-blue-700">Twitter Responses</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">Auto</p>
                <p className="text-sm text-orange-700">Follow-ups Enabled</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{databaseMetrics.totalAllPlatformResponses}</p>
                <p className="text-sm text-purple-700">Total All Platforms</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div 
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedStatus === 'pending' 
                  ? 'ring-2 ring-yellow-500 bg-yellow-50' 
                  : 'bg-yellow-50 hover:bg-yellow-100'
              }`}
              onClick={() => setSelectedStatus('pending')}
            >
              <h3 className="font-semibold text-yellow-900">Awaiting Response</h3>
              <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
              <p className="text-sm text-yellow-700">Need follow-up</p>
            </div>

            <div 
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedStatus === 'responded' 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'bg-blue-50 hover:bg-blue-100'
              }`}
              onClick={() => setSelectedStatus('responded')}
            >
              <h3 className="font-semibold text-blue-900">Responded</h3>
              <p className="text-2xl font-bold text-blue-600">{statusCounts.responded}</p>
              <p className="text-sm text-blue-700">Users replied</p>
            </div>

            <div 
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedStatus === 'engaged' 
                  ? 'ring-2 ring-purple-500 bg-purple-50' 
                  : 'bg-purple-50 hover:bg-purple-100'
              }`}
              onClick={() => setSelectedStatus('engaged')}
            >
              <h3 className="font-semibold text-purple-900">Engaged</h3>
              <p className="text-2xl font-bold text-purple-600">{statusCounts.engaged}</p>
              <p className="text-sm text-purple-700">In conversation</p>
            </div>

            <div 
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedStatus === 'converted' 
                  ? 'ring-2 ring-green-500 bg-green-50' 
                  : 'bg-green-50 hover:bg-green-100'
              }`}
              onClick={() => setSelectedStatus('converted')}
            >
              <h3 className="font-semibold text-green-900">Converted</h3>
              <p className="text-2xl font-bold text-green-600">{statusCounts.converted}</p>
              <p className="text-sm text-green-700">N400/H1B signups</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="capitalize break-words">{selectedStatus} Reddit Leads</CardTitle>
              <CardDescription className="break-words">
                Showing {startIndex + 1}-{Math.min(endIndex, totalLeads)} of {totalLeads} leads in this stage
              </CardDescription>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900 truncate">{lead.title}</h4>
                    <Badge className={getStatusColor(lead.responseStatus)}>
                      {lead.responseStatus}
                    </Badge>
                    <Badge className={getConversionStageColor(lead.conversionStage)}>
                      {lead.conversionStage}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 truncate mb-2">{lead.content}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Score: {Number(lead.aiScore || 0).toFixed(1)}</span>
                    <span>Posted: {new Date(lead.discoveredAt).toLocaleDateString()}</span>
                    {lead.lastChecked && (
                      <span>Checked: {new Date(lead.lastChecked).toLocaleTimeString()}</span>
                    )}
                    {lead.userReplied && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        User Replied ✅
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(lead.sourceUrl, '_blank')}
                  >
                    View Post
                  </Button>
                  {lead.responseStatus === 'pending' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleFollowUp(lead.id)}
                      disabled={followUpMutation.isPending}
                    >
                      Follow Up
                    </Button>
                  )}
                  {lead.responseStatus === 'engaged' && lead.conversionStage !== 'converted' && (
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => window.open('https://justiguide.com/h1b', '_blank')}
                      >
                        H1B Support
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => window.open('https://justiguide.com/n400', '_blank')}
                      >
                        N400 Citizenship
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {totalLeads === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No {selectedStatus} leads found</p>
                <p className="text-sm">Reddit leads will appear here as they respond</p>
              </div>
            )}
          </div>
          
          {/* Bottom Pagination Controls */}
          {totalPages > 1 && (
            <div className="border-t pt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, totalLeads)} of {totalLeads} {selectedStatus} leads
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10 h-8"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}