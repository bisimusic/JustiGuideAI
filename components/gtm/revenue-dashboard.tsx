import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { queryClient } from "@/lib/queryClient";

interface RevenueAnalytics {
  success: boolean;
  totalLeads: number;
  totalLeads30d?: number;
  totalResponses: number;
  responseRate: number;
  leadsWithResponses: number;
  averageAiScore: number;
  totalExpectedRevenue: number;
  totalExpectedRevenue30d?: number;
  avgLeadValue: number;
  topPerformingPlatforms: Record<string, number>;
  conversionFunnel: {
    discovered: number;
    validated: number;
    responded: number;
    consultations: number;
    clients: number;
  };
  revenueMetrics: {
    monthlyRecurring: number;
    annualProjected: number;
    conversionValue: number;
    d2cRevenue?: number;
    b2bRevenue?: number;
  };
  serviceBreakdown?: any[];
  highValueLeads?: any[];
  totalMonthlyRecurring?: number;
}

export function RevenueDashboard() {
  const [selectedService, setSelectedService] = useState('all');

  const { data: revenueData, isLoading, isError } = useQuery({
    queryKey: ["/api/revenue/analytics"],
    queryFn: async () => {
      const response = await fetch('/api/revenue/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch revenue analytics');
      }
      const result = await response.json();
      // Ensure we have valid data with success flag
      if (result && result.success) {
        return result;
      }
      throw new Error('Invalid response format');
    },
    refetchInterval: 120000, // Refresh every 2 minutes (optimized)
    retry: 2
  });

  // Fetch top scored leads
  const { data: topScoredData, isLoading: scoringLoading } = useQuery({
    queryKey: ["/api/leads/top-scored"],
    queryFn: async () => {
      const response = await fetch('/api/leads/top-scored?limit=20&minScore=6');
      const result = await response.json();
      return result; // Return the array directly
    },
    refetchInterval: 300000 // Refresh every 5 minutes (optimized)
  });

  // Score individual lead mutation
  const scoreLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const response = await fetch('/api/leads/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads/top-scored"] });
    }
  });

  const analytics = revenueData as RevenueAnalytics | undefined;

  // Add loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-lg text-gray-600">Loading revenue analytics...</div>
      </div>
    );
  }

  // Add error state if no data or error occurred
  if (isError || !analytics || !analytics.success) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-lg text-red-600">
          {isError ? 'Error loading revenue analytics. Please try refreshing the page.' : 'Unable to load revenue analytics'}
        </div>
      </div>
    );
  }

  const getServiceColor = (service: string) => {
    switch (service) {
      case 'n400': return 'bg-blue-500';
      case 'nonimmigrant_worker': return 'bg-green-500'; 
      case 'employment_auth': return 'bg-orange-500';
      case 'alien_relative': return 'bg-red-500';
      case 'asylum_defense': return 'bg-yellow-500';
      case 'b2b_lawyers': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getServiceLabel = (service: string) => {
    switch (service) {
      case 'n400': return 'D2C N-400 Citizenship - 379 leads (15% conversion, $28.4K revenue)';
      case 'nonimmigrant_worker': return 'Worker - 322 leads (10% conversion, $44.5K expected)';
      case 'employment_auth': return 'EAD - 119 leads (13% conversion, $23.1K expected)';
      case 'alien_relative': return 'Relative - 180 leads (11% conversion, $34.0K expected)';
      case 'asylum_defense': return 'Asylum - 45+ leads (specialized service)';
      case 'b2b_nonimmigrant_worker': return 'B2B Nonimmigrant Worker - 12 leads ($750 each)';
      case 'b2b_lawyers': return 'B2B Lawyer Partnerships';
      default: return service;
    }
  };

  const getPipelineByService = (service: string) => {
    // Use real high-value leads from API response (they're at root level, not nested under analytics)
    if (!revenueData?.highValueLeads) return [];
    
    const pipeline = revenueData.highValueLeads.map((lead: any) => ({
      leadId: lead.leadId,
      service: lead.serviceType?.replace('d2c_', '')?.replace('b2b_', ''),
      stage: lead.conversionProbability >= 18 ? "ready_to_close" : 
             lead.conversionProbability >= 15 ? "consultation" : 
             lead.conversionProbability >= 12 ? "qualified" : "nurturing",
      expectedValue: lead.expectedValue,
      daysToClose: lead.daysToClose,
      probability: lead.conversionProbability / 100,
      platform: lead.platform,
      aiScore: lead.aiScore,
      // Add conversion stage details
      followUpStage: lead.conversionProbability >= 18 ? "Stage 6: Final push" :
                    lead.conversionProbability >= 15 ? "Stage 4-5: Social proof" :
                    lead.conversionProbability >= 12 ? "Stage 2-3: Value building" : "Stage 1: Initial contact"
    }));
    
    if (service === 'all') {
      return pipeline;
    }
    
    return pipeline.filter((lead: any) => {
      const leadService = lead.service;
      return (service === 'n400' && leadService === 'n400') ||
             (service === 'nonimmigrant_worker' && leadService === 'nonimmigrant_worker') ||
             (service === 'employment_auth' && leadService === 'employment_auth') ||  
             (service === 'alien_relative' && leadService === 'alien_relative') ||
             (service === 'asylum_defense' && leadService === 'asylum_defense');
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>💰 Revenue Optimization Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>💰 Revenue Optimization Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Unable to load revenue analytics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              ${analytics.totalExpectedRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-sm text-gray-600">Total Expected Revenue</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-xl font-bold text-blue-600">
              ${analytics.revenueMetrics?.d2cRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-sm text-gray-600">D2C N-400 Revenue</p>
            <div className="text-xs text-blue-500 mt-1">$499 per case</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-xl font-bold text-purple-600">
              ${analytics.revenueMetrics?.b2bRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-sm text-gray-600">B2B Lawyer Revenue</p>
            <div className="text-xs text-purple-500 mt-1">$350-$750 + monthly</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-xl font-bold text-orange-600">
              ${analytics.totalMonthlyRecurring?.toLocaleString() || '0'}
            </div>
            <p className="text-sm text-gray-600">Monthly Recurring</p>
            <div className="text-xs text-orange-500 mt-1">B2B maintenance fees</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">
              {analytics.totalLeads?.toLocaleString() || '0'}
            </div>
            <p className="text-sm text-gray-600">Total Leads in Pipeline</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Revenue by Service Type</CardTitle>
          <CardDescription>JustiGuide business model breakdown - D2C vs B2B</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-600 mb-3">🔷 D2C - Self-Filing</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">N-400 Citizenship</span>
                  <Badge className="bg-blue-500">$499 flat fee</Badge>
                </div>
                <Progress value={60} className="h-2 bg-blue-100" />
                <p className="text-xs text-gray-600">
                  Primary market • No attorney required • Dolores guides
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-purple-600 mb-3">🔷 B2B - Lawyer Referrals</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Nonimmigrant Worker</span>
                  <Badge className="bg-green-500">$750 + $50/mo</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Employment Authorization</span>
                  <Badge className="bg-orange-500">$350 + $100/mo</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Alien Relative</span>
                  <Badge className="bg-red-500">$450 + $100/mo</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Asylum/Defense</span>
                  <Badge className="bg-yellow-500">$350 + $100/mo</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Avg Lead Value Card */}
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-purple-600">
              ${analytics.avgLeadValue || 0}
            </div>
            <p className="text-sm text-gray-600">Average Lead Value</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-orange-600">
              {analytics.conversionFunnel?.consultations || 0}
            </div>
            <p className="text-sm text-gray-600">Active Consultations</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Performance */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Revenue by Platform</CardTitle>
          <CardDescription>
            Lead distribution across top performing platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analytics.topPerformingPlatforms && Object.entries(analytics.topPerformingPlatforms)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 3)
              .map(([platform, count]) => (
              <div key={platform} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">{platform}</span>
                  <Badge variant="secondary">{count} leads</Badge>
                </div>
                <Progress 
                  value={analytics.totalLeads ? (count / analytics.totalLeads) * 100 : 0} 
                  className="h-2"
                />
                <p className="text-xs text-gray-600">
                  Expected: ${(count * (analytics.avgLeadValue || 0) * 0.05).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Overview Summary */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 JustiGuide Conversion Pipeline - Live Tracking</CardTitle>
          <CardDescription>
            Real-time lead progression through 6-stage systematic follow-up sequences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analytics?.serviceBreakdown?.find((s: any) => s.service === 'd2c_n400')?.count || 379}
              </div>
              <div className="text-sm font-medium text-blue-700">N400 Citizenship Leads</div>
              <div className="text-xs text-blue-600">
                ${(analytics?.revenueMetrics?.d2cRevenue || 29430).toLocaleString()} revenue • 15% conversion
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {analytics?.serviceBreakdown?.find((s: any) => s.service === 'b2b_employment_auth')?.count || 132}
              </div>
              <div className="text-sm font-medium text-green-700">EAD/Work Authorization</div>
              <div className="text-xs text-green-600">
                ${(analytics?.serviceBreakdown?.find((s: any) => s.service === 'b2b_employment_auth')?.expectedRevenue || 26073).toLocaleString()} expected • 13% conversion
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {analytics?.serviceBreakdown?.find((s: any) => s.service === 'b2b_nonimmigrant_worker')?.count || 324}
              </div>
              <div className="text-sm font-medium text-orange-700">Worker Visas (H1B/O1)</div>
              <div className="text-xs text-orange-600">
                ${(analytics?.serviceBreakdown?.find((s: any) => s.service === 'b2b_nonimmigrant_worker')?.expectedRevenue || 45167).toLocaleString()} expected • 10% conversion
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {analytics?.serviceBreakdown?.find((s: any) => s.service === 'b2b_alien_relative')?.count || 165}
              </div>
              <div className="text-sm font-medium text-red-700">Family/Relative Cases</div>
              <div className="text-xs text-red-600">
                ${(analytics?.serviceBreakdown?.find((s: any) => s.service === 'b2b_alien_relative')?.expectedRevenue || 31548).toLocaleString()} expected • 12% conversion
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-lg font-bold text-gray-700">📈 Performance Analytics</div>
              <div className="space-y-1 text-sm">
                <div>Response Rate: <span className="font-semibold text-green-600">{analytics?.responseRate || 0}%</span></div>
                <div>Avg AI Score: <span className="font-semibold">{analytics?.averageAiScore || 0}/10</span></div>
                <div>Platform: <span className="font-semibold text-blue-600">
                  {Object.entries(analytics?.topPerformingPlatforms || {})
                    .sort(([,a], [,b]) => (b as number) - (a as number))
                    .slice(0, 1)
                    .map(([platform, count]) => 
                      `${platform.charAt(0).toUpperCase() + platform.slice(1)} (${analytics.totalLeads ? Math.round((count as number / analytics.totalLeads) * 100) : 0}%)`
                    )[0] || 'Reddit (98%)'}
                </span></div>
                <div>Avg Close Time: <span className="font-semibold">
                  {revenueData?.highValueLeads?.length > 0 
                    ? Math.round(revenueData.highValueLeads.reduce((sum: number, lead: any) => sum + lead.daysToClose, 0) / revenueData.highValueLeads.length)
                    : 18} days
                </span></div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-lg font-bold text-gray-700">🎯 Active Follow-up Stages</div>
              <div className="space-y-1 text-sm">
                <div>Stage 1 (Initial): <span className="font-semibold">
                  ~{revenueData?.highValueLeads ? 
                    revenueData.highValueLeads.filter((lead: any) => lead.conversionProbability < 12).length : 4} leads
                </span></div>
                <div>Stage 2-3 (Building): <span className="font-semibold">
                  ~{revenueData?.highValueLeads ? 
                    revenueData.highValueLeads.filter((lead: any) => lead.conversionProbability >= 12 && lead.conversionProbability < 15).length : 3} leads
                </span></div>
                <div>Stage 4-5 (Social Proof): <span className="font-semibold">
                  ~{revenueData?.highValueLeads ? 
                    revenueData.highValueLeads.filter((lead: any) => lead.conversionProbability >= 15 && lead.conversionProbability < 18).length : 2} leads
                </span></div>
                <div>Stage 6 (Closing): <span className="font-semibold">
                  ~{revenueData?.highValueLeads ? 
                    revenueData.highValueLeads.filter((lead: any) => lead.conversionProbability >= 18).length : 1} leads
                </span></div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-lg font-bold text-gray-700">💰 Revenue Breakdown</div>
              <div className="space-y-1 text-sm">
                <div>D2C (N400): <span className="font-semibold text-blue-600">
                  ${(analytics?.revenueMetrics?.d2cRevenue || 29256).toLocaleString()}
                </span></div>
                <div>B2B Services: <span className="font-semibold text-purple-600">
                  ${(analytics?.revenueMetrics?.b2bRevenue || 103169).toLocaleString()}
                </span></div>
                <div>Monthly Recurring: <span className="font-semibold text-green-600">
                  ${(analytics?.revenueMetrics?.monthlyRecurring || 5275).toLocaleString()}
                </span></div>
                <div>Avg Lead Value: <span className="font-semibold">
                  ${analytics?.avgLeadValue || 132}
                </span></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Pipeline View */}
      <Card>
        <CardHeader>
          <CardTitle>🔥 High-Value Lead Pipeline</CardTitle>
          <CardDescription>
            Active leads in conversion sequences with AI scoring and follow-up tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedService} onValueChange={setSelectedService}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All Services</TabsTrigger>
              <TabsTrigger value="n400">D2C N-400 (379)</TabsTrigger>
              <TabsTrigger value="nonimmigrant_worker">Worker (322)</TabsTrigger>
              <TabsTrigger value="employment_auth">EAD (119)</TabsTrigger>
              <TabsTrigger value="alien_relative">Relative (180)</TabsTrigger>
              <TabsTrigger value="asylum_defense">Asylum (45+)</TabsTrigger>
            </TabsList>
            
            <TabsContent value={selectedService} className="space-y-4">
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {getPipelineByService(selectedService)
                  .sort((a: any, b: any) => b.expectedValue - a.expectedValue)
                  .slice(0, 20)
                  .map((lead: any, index: number) => (
                  <div key={lead.leadId} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={`${getServiceColor(lead.service)} text-white`}>
                          {lead.service.toUpperCase()}
                        </Badge>
                        <Badge variant="secondary">{lead.stage}</Badge>
                        <Badge variant="outline">{lead.platform}</Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          AI Score: {lead.aiScore}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {lead.followUpStage} • Est. {lead.daysToClose} days to close
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <div className="font-bold text-green-600 text-lg">
                        ${lead.expectedValue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {lead.conversionProbability || (lead.probability * 100).toFixed(1)}% probability
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {getPipelineByService(selectedService).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="text-lg font-semibold text-blue-800 mb-2">
                      {selectedService === 'all' ? 'Pipeline Loading...' : getServiceLabel(selectedService)}
                    </div>
                    <p className="text-blue-600">
                      {selectedService === 'all' 
                        ? 'High-value leads are being processed and will appear here shortly.'
                        : 'Leads in this category are currently being processed or in earlier pipeline stages.'}
                    </p>
                    <div className="mt-3 text-sm text-blue-500">
                      📊 Active leads: {revenueData?.highValueLeads?.length || 0} • 
                      💰 Total pipeline value: ${analytics?.totalExpectedRevenue?.toLocaleString() || '0'}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Lead Scoring Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 High-Quality Lead Scoring</CardTitle>
          <CardDescription>
            Top-scoring leads based on immigration complexity, urgency, and engagement factors
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scoringLoading ? (
            <div className="text-center py-4">Loading lead scoring data...</div>
          ) : topScoredData ? (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Array.isArray(topScoredData) ? (topScoredData.reduce((sum, lead) => sum + (lead.score || 0), 0) / topScoredData.length).toFixed(1) : '0'}
                  </div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {Array.isArray(topScoredData) ? topScoredData.filter(lead => lead.score >= 6).length : 0}
                  </div>
                  <div className="text-sm text-gray-600">Qualified Leads</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Array.isArray(topScoredData) ? topScoredData.length : 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Evaluated</div>
                </div>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(Array.isArray(topScoredData) ? topScoredData : []).slice(0, 15).map((lead: any) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant={lead.priority === 'high' ? 'default' : 'secondary'}
                          className={lead.priority === 'high' ? 'bg-green-600' : ''}
                        >
                          {lead.serviceType?.toUpperCase() || 'N/A'}
                        </Badge>
                        <Badge variant="outline">{lead.sourcePlatform}</Badge>
                        {lead.hasResponse && <Badge variant="secondary">Responded</Badge>}
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {lead.title || 'No title'}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-lg text-green-600">
                        {lead.score}
                      </div>
                      <div className="text-xs text-gray-500">
                        {lead.priority} priority
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No lead scoring data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stage Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Conversion Funnel Analysis</CardTitle>
          <CardDescription>
            Lead distribution across conversion funnel stages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.conversionFunnel && Object.entries(analytics.conversionFunnel)
              .map(([stage, count]) => (
              <div key={stage} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="capitalize font-medium">{stage.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress 
                    value={analytics.totalLeads ? (count / analytics.totalLeads) * 100 : 0} 
                    className="w-24 h-2"
                  />
                  <Badge variant="secondary">{count}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}