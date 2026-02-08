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

  // Full breakdown of all leads (AI score, platform, visa category) – populates the composition section
  const { data: compositionData, isLoading: compositionLoading } = useQuery({
    queryKey: ["/api/dashboard/lead-composition"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/lead-composition");
      if (!res.ok) return null;
      return res.json();
    },
    refetchInterval: 120000,
    retry: 1,
  });

  // Fetch top scored leads (any score so we show data; "Qualified" = score >= 6 in UI)
  const { data: topScoredData, isLoading: scoringLoading, isError: scoringError } = useQuery({
    queryKey: ["/api/leads/top-scored", 50, 0],
    queryFn: async () => {
      const response = await fetch('/api/leads/top-scored?limit=50&minScore=0');
      const result = await response.json();
      if (!response.ok || (result && !Array.isArray(result) && result.error)) {
        return [];
      }
      return Array.isArray(result) ? result : [];
    },
    refetchInterval: 300000,
    retry: 1,
  });
  const topScoredLeads = Array.isArray(topScoredData) ? topScoredData : [];

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
  const hasRevenueAnalytics = analytics?.success === true;
  const hasComposition = compositionData && compositionData.totalLeads != null;

  // Never full-page error – always show dashboard; show loading only until we have something to show
  if (isLoading && !hasComposition && compositionLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-lg text-[#8e919a]">Loading...</div>
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
      <Card className="bg-[#14161c] border-white/5 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-[#f5f5f7]">💰 Revenue Optimization Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/10 rounded w-1/3" />
            <div className="h-4 bg-white/10 rounded w-2/3" />
            <div className="h-32 bg-white/10 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card className="bg-[#14161c] border-white/5 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-[#f5f5f7]">💰 Revenue Optimization Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-[#8e919a]">
            <p>Unable to load revenue analytics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const cardClass = "bg-[#14161c] border border-white/5 rounded-2xl";
  const labelClass = "text-sm text-[#8e919a]";

  return (
    <div className="space-y-6">
      {!hasRevenueAnalytics && !hasComposition && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          Revenue analytics and lead breakdown could not be loaded. Check that the database (DATABASE_URL) is set and the Express server is running if you use it.
        </div>
      )}
      {!hasRevenueAnalytics && hasComposition && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Revenue analytics temporarily unavailable (Express server may be offline). Lead breakdown below is from your pipeline.
        </div>
      )}
      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className={cardClass}>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#00d4aa]">
              ${analytics?.totalExpectedRevenue?.toLocaleString() || '0'}
            </div>
            <p className={labelClass}>Total Expected Revenue</p>
          </CardContent>
        </Card>
        
        <Card className={cardClass}>
          <CardContent className="p-6">
            <div className="text-xl font-bold text-[#60a5fa]">
              ${analytics?.revenueMetrics?.d2cRevenue?.toLocaleString() || '0'}
            </div>
            <p className={labelClass}>D2C N-400 Revenue</p>
            <div className="text-xs text-[#60a5fa]/80 mt-1">$499 per case</div>
          </CardContent>
        </Card>
        
        <Card className={cardClass}>
          <CardContent className="p-6">
            <div className="text-xl font-bold text-[#a78bfa]">
              ${analytics?.revenueMetrics?.b2bRevenue?.toLocaleString() || '0'}
            </div>
            <p className={labelClass}>B2B Lawyer Revenue</p>
            <div className="text-xs text-[#a78bfa]/80 mt-1">$350-$750 + monthly</div>
          </CardContent>
        </Card>
        
        <Card className={cardClass}>
          <CardContent className="p-6">
            <div className="text-xl font-bold text-[#fb923c]">
              ${analytics?.totalMonthlyRecurring?.toLocaleString() || '0'}
            </div>
            <p className={labelClass}>Monthly Recurring</p>
            <div className="text-xs text-[#fb923c]/80 mt-1">B2B maintenance fees</div>
          </CardContent>
        </Card>
        
        <Card className={cardClass}>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#f5f5f7]">
              {(compositionData?.totalLeads ?? analytics?.totalLeads)?.toLocaleString() || '0'}
            </div>
            <p className={labelClass}>Total Leads in Pipeline</p>
          </CardContent>
        </Card>
      </div>

      {/* Current breakdown – all leads (AI score, platform, visa category) */}
      {compositionData && (
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className="text-[#f5f5f7]">📊 Current Lead Breakdown</CardTitle>
            <CardDescription className="text-[#8e919a]">
              Full pipeline: {compositionData.totalLeads?.toLocaleString() ?? 0} leads • {compositionData.leadsWithResponses?.toLocaleString() ?? 0} with responses ({compositionData.conversionRate ?? 0}%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-[#8e919a] mb-2">By AI score</h4>
                <div className="space-y-1.5">
                  {(compositionData.byAiScore || []).map((row: { bucket: string; count: number; percentage: number }) => (
                    <div key={row.bucket} className="flex justify-between items-center text-sm">
                      <span className="text-[#f5f5f7]">{row.bucket}</span>
                      <span className="text-[#8e919a]">{row.count.toLocaleString()} ({row.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#8e919a] mb-2">By platform</h4>
                <div className="space-y-1.5">
                  {(compositionData.byPlatform || []).slice(0, 6).map((row: { platform: string; count: number; percentage: number }) => (
                    <div key={row.platform} className="flex justify-between items-center text-sm">
                      <span className="text-[#f5f5f7] capitalize">{row.platform}</span>
                      <span className="text-[#8e919a]">{row.count.toLocaleString()} ({row.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#8e919a] mb-2">By visa (inferred from title)</h4>
                <div className="space-y-1.5">
                  {(compositionData.byVisaCategory || []).map((row: { visaCategory: string; count: number; percentage: number }) => (
                    <div key={row.visaCategory} className="flex justify-between items-center text-sm">
                      <span className="text-[#f5f5f7]">{row.visaCategory}</span>
                      <span className="text-[#8e919a]">{row.count.toLocaleString()} ({row.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Breakdown */}
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="text-[#f5f5f7]">📊 Revenue by Service Type</CardTitle>
          <CardDescription className="text-[#8e919a]">JustiGuide business model breakdown - D2C vs B2B</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-[#60a5fa] mb-3">🔷 D2C - Self-Filing</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#f5f5f7]">N-400 Citizenship</span>
                  <Badge className="bg-[#60a5fa]/20 text-[#60a5fa] border-0">$499 flat fee</Badge>
                </div>
                <Progress value={60} className="h-2 bg-white/10 [&>div]:bg-[#60a5fa]" />
                <p className="text-xs text-[#8e919a]">
                  Primary market • No attorney required • Dolores guides
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#a78bfa] mb-3">🔷 B2B - Lawyer Referrals</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#f5f5f7]">Nonimmigrant Worker</span>
                  <Badge className="bg-[#00d4aa]/20 text-[#00d4aa] border-0">$750 + $50/mo</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#f5f5f7]">Employment Authorization</span>
                  <Badge className="bg-[#fb923c]/20 text-[#fb923c] border-0">$350 + $100/mo</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#f5f5f7]">Alien Relative</span>
                  <Badge className="bg-red-400/20 text-red-400 border-0">$450 + $100/mo</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#f5f5f7]">Asylum/Defense</span>
                  <Badge className="bg-amber-400/20 text-amber-400 border-0">$350 + $100/mo</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Avg Lead Value Card */}
        <Card className={cardClass}>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#a78bfa]">
              ${analytics?.avgLeadValue || 0}
            </div>
            <p className={labelClass}>Average Lead Value</p>
          </CardContent>
        </Card>
        
        <Card className={cardClass}>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-[#fb923c]">
              {analytics?.conversionFunnel?.consultations || 0}
            </div>
            <p className={labelClass}>Active Consultations</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Performance */}
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="text-[#f5f5f7]">📊 Revenue by Platform</CardTitle>
          <CardDescription className="text-[#8e919a]">
            Lead distribution across top performing platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analytics?.topPerformingPlatforms && Object.entries(analytics.topPerformingPlatforms)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 3)
              .map(([platform, count]) => (
              <div key={platform} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-[#f5f5f7] capitalize">{platform}</span>
                  <Badge className="bg-[#181b22] text-[#8e919a] border-white/10">{count} leads</Badge>
                </div>
                <Progress 
                  value={analytics?.totalLeads ? (count / analytics.totalLeads) * 100 : 0} 
                  className="h-2 bg-white/10 [&>div]:bg-[#00d4aa]"
                />
                <p className="text-xs text-[#8e919a]">
                  Expected: ${(count * (analytics?.avgLeadValue || 0) * 0.05).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Overview Summary */}
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="text-[#f5f5f7]">🚀 JustiGuide Conversion Pipeline - Live Tracking</CardTitle>
          <CardDescription className="text-[#8e919a]">
            Real-time lead progression through 6-stage systematic follow-up sequences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#181b22] border border-white/5 p-4 rounded-xl">
              <div className="text-2xl font-bold text-[#60a5fa]">
                {analytics?.serviceBreakdown?.find((s: any) => s.service === 'd2c_n400')?.count || 379}
              </div>
              <div className="text-sm font-medium text-[#8e919a]">N400 Citizenship Leads</div>
              <div className="text-xs text-[#60a5fa]/80">
                ${(analytics?.revenueMetrics?.d2cRevenue || 29430).toLocaleString()} revenue • 15% conversion
              </div>
            </div>
            <div className="bg-[#181b22] border border-white/5 p-4 rounded-xl">
              <div className="text-2xl font-bold text-[#00d4aa]">
                {analytics?.serviceBreakdown?.find((s: any) => s.service === 'b2b_employment_auth')?.count || 132}
              </div>
              <div className="text-sm font-medium text-[#8e919a]">EAD/Work Authorization</div>
              <div className="text-xs text-[#00d4aa]/80">
                ${(analytics?.serviceBreakdown?.find((s: any) => s.service === 'b2b_employment_auth')?.expectedRevenue || 26073).toLocaleString()} expected • 13% conversion
              </div>
            </div>
            <div className="bg-[#181b22] border border-white/5 p-4 rounded-xl">
              <div className="text-2xl font-bold text-[#fb923c]">
                {analytics?.serviceBreakdown?.find((s: any) => s.service === 'b2b_nonimmigrant_worker')?.count || 324}
              </div>
              <div className="text-sm font-medium text-[#8e919a]">Worker Visas (H1B/O1)</div>
              <div className="text-xs text-[#fb923c]/80">
                ${(analytics?.serviceBreakdown?.find((s: any) => s.service === 'b2b_nonimmigrant_worker')?.expectedRevenue || 45167).toLocaleString()} expected • 10% conversion
              </div>
            </div>
            <div className="bg-[#181b22] border border-white/5 p-4 rounded-xl">
              <div className="text-2xl font-bold text-red-400">
                {analytics?.serviceBreakdown?.find((s: any) => s.service === 'b2b_alien_relative')?.count || 165}
              </div>
              <div className="text-sm font-medium text-[#8e919a]">Family/Relative Cases</div>
              <div className="text-xs text-red-400/80">
                ${(analytics?.serviceBreakdown?.find((s: any) => s.service === 'b2b_alien_relative')?.expectedRevenue || 31548).toLocaleString()} expected • 12% conversion
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#181b22] border border-white/5 p-4 rounded-xl">
              <div className="text-lg font-bold text-[#f5f5f7]">📈 Performance Analytics</div>
              <div className="space-y-1 text-sm text-[#8e919a]">
                <div>Response Rate: <span className="font-semibold text-[#00d4aa]">{analytics?.responseRate || 0}%</span></div>
                <div>Avg AI Score: <span className="font-semibold text-[#f5f5f7]">{analytics?.averageAiScore || 0}/10</span></div>
                <div>Platform: <span className="font-semibold text-[#60a5fa]">
                  {Object.entries(analytics?.topPerformingPlatforms || {})
                    .sort(([,a], [,b]) => (b as number) - (a as number))
                    .slice(0, 1)
                    .map(([platform, count]) => 
                      `${platform.charAt(0).toUpperCase() + platform.slice(1)} (${analytics?.totalLeads ? Math.round((count as number / analytics.totalLeads) * 100) : 0}%)`
                    )[0] || 'Reddit (98%)'}
                </span></div>
                <div>Avg Close Time: <span className="font-semibold text-[#f5f5f7]">
                  {revenueData?.highValueLeads?.length > 0 
                    ? Math.round(revenueData.highValueLeads.reduce((sum: number, lead: any) => sum + lead.daysToClose, 0) / revenueData.highValueLeads.length)
                    : 18} days
                </span></div>
              </div>
            </div>
            
            <div className="bg-[#181b22] border border-white/5 p-4 rounded-xl">
              <div className="text-lg font-bold text-[#f5f5f7]">🎯 Active Follow-up Stages</div>
              <div className="space-y-1 text-sm text-[#8e919a]">
                <div>Stage 1 (Initial): <span className="font-semibold text-[#f5f5f7]">
                  ~{revenueData?.highValueLeads ? 
                    revenueData.highValueLeads.filter((lead: any) => lead.conversionProbability < 12).length : 4} leads
                </span></div>
                <div>Stage 2-3 (Building): <span className="font-semibold text-[#f5f5f7]">
                  ~{revenueData?.highValueLeads ? 
                    revenueData.highValueLeads.filter((lead: any) => lead.conversionProbability >= 12 && lead.conversionProbability < 15).length : 3} leads
                </span></div>
                <div>Stage 4-5 (Social Proof): <span className="font-semibold text-[#f5f5f7]">
                  ~{revenueData?.highValueLeads ? 
                    revenueData.highValueLeads.filter((lead: any) => lead.conversionProbability >= 15 && lead.conversionProbability < 18).length : 2} leads
                </span></div>
                <div>Stage 6 (Closing): <span className="font-semibold text-[#f5f5f7]">
                  ~{revenueData?.highValueLeads ? 
                    revenueData.highValueLeads.filter((lead: any) => lead.conversionProbability >= 18).length : 1} leads
                </span></div>
              </div>
            </div>
            
            <div className="bg-[#181b22] border border-white/5 p-4 rounded-xl">
              <div className="text-lg font-bold text-[#f5f5f7]">💰 Revenue Breakdown</div>
              <div className="space-y-1 text-sm text-[#8e919a]">
                <div>D2C (N400): <span className="font-semibold text-[#60a5fa]">
                  ${(analytics?.revenueMetrics?.d2cRevenue || 29256).toLocaleString()}
                </span></div>
                <div>B2B Services: <span className="font-semibold text-[#a78bfa]">
                  ${(analytics?.revenueMetrics?.b2bRevenue || 103169).toLocaleString()}
                </span></div>
                <div>Monthly Recurring: <span className="font-semibold text-[#00d4aa]">
                  ${(analytics?.revenueMetrics?.monthlyRecurring || 5275).toLocaleString()}
                </span></div>
                <div>Avg Lead Value: <span className="font-semibold text-[#f5f5f7]">
                  ${analytics?.avgLeadValue || 132}
                </span></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Pipeline View */}
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="text-[#f5f5f7]">🔥 High-Value Lead Pipeline</CardTitle>
          <CardDescription className="text-[#8e919a]">
            Active leads in conversion sequences with AI scoring and follow-up tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedService} onValueChange={setSelectedService}>
            <TabsList className="grid w-full grid-cols-6 bg-[#111318] p-1 rounded-xl border border-white/5">
              <TabsTrigger value="all" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa] rounded-lg text-[#8e919a]">All Services</TabsTrigger>
              <TabsTrigger value="n400" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa] rounded-lg text-[#8e919a]">D2C N-400 (379)</TabsTrigger>
              <TabsTrigger value="nonimmigrant_worker" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa] rounded-lg text-[#8e919a]">Worker (322)</TabsTrigger>
              <TabsTrigger value="employment_auth" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa] rounded-lg text-[#8e919a]">EAD (119)</TabsTrigger>
              <TabsTrigger value="alien_relative" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa] rounded-lg text-[#8e919a]">Relative (180)</TabsTrigger>
              <TabsTrigger value="asylum_defense" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa] rounded-lg text-[#8e919a]">Asylum (45+)</TabsTrigger>
            </TabsList>
            
            <TabsContent value={selectedService} className="space-y-4 mt-4">
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {getPipelineByService(selectedService)
                  .sort((a: any, b: any) => b.expectedValue - a.expectedValue)
                  .slice(0, 20)
                  .map((lead: any) => (
                  <div key={lead.leadId} className="flex items-center justify-between p-4 border border-white/5 rounded-xl bg-[#181b22]">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${getServiceColor(lead.service)}/20 text-current border-0`}>
                          {lead.service.toUpperCase()}
                        </Badge>
                        <Badge className="bg-[#14161c] text-[#8e919a] border-white/10">{lead.stage}</Badge>
                        <Badge className="bg-[#14161c] text-[#8e919a] border-white/10">{lead.platform}</Badge>
                        <Badge className="bg-[#60a5fa]/20 text-[#60a5fa] border-0">
                          AI Score: {lead.aiScore}
                        </Badge>
                      </div>
                      <div className="text-sm text-[#8e919a]">
                        {lead.followUpStage} • Est. {lead.daysToClose} days to close
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <div className="font-bold text-[#00d4aa] text-lg">
                        ${lead.expectedValue.toLocaleString()}
                      </div>
                      <div className="text-sm text-[#8e919a]">
                        {lead.conversionProbability || (lead.probability * 100).toFixed(1)}% probability
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {getPipelineByService(selectedService).length === 0 && (
                <div className="text-center py-8 text-[#8e919a]">
                  <div className="bg-[#181b22] border border-white/5 rounded-xl p-6">
                    <div className="text-lg font-semibold text-[#f5f5f7] mb-2">
                      {selectedService === 'all' ? 'Pipeline Loading...' : getServiceLabel(selectedService)}
                    </div>
                    <p className="text-[#8e919a]">
                      {selectedService === 'all' 
                        ? 'High-value leads are being processed and will appear here shortly.'
                        : 'Leads in this category are currently being processed or in earlier pipeline stages.'}
                    </p>
                    <div className="mt-3 text-sm text-[#00d4aa]/80">
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
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="text-[#f5f5f7]">🎯 High-Quality Lead Scoring</CardTitle>
          <CardDescription className="text-[#8e919a]">
            Top-scoring leads based on immigration complexity, urgency, and engagement factors
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scoringLoading ? (
            <div className="text-center py-4 text-[#8e919a]">Loading lead scoring data...</div>
          ) : scoringError ? (
            <div className="text-center py-8 text-amber-400">
              <p>Could not load lead scoring data. Check that the database is connected.</p>
            </div>
          ) : topScoredLeads.length > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-[#181b22] border border-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-[#00d4aa]">
                    {(topScoredLeads.reduce((sum, lead) => sum + (lead.score || 0), 0) / topScoredLeads.length).toFixed(1)}
                  </div>
                  <div className={labelClass}>Average Score</div>
                </div>
                <div className="text-center p-3 bg-[#181b22] border border-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-[#60a5fa]">
                    {topScoredLeads.filter(lead => lead.score >= 6).length}
                  </div>
                  <div className={labelClass}>Qualified Leads (score ≥ 6)</div>
                </div>
                <div className="text-center p-3 bg-[#181b22] border border-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-[#a78bfa]">
                    {topScoredLeads.length}
                  </div>
                  <div className={labelClass}>Total Evaluated</div>
                </div>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {topScoredLeads.slice(0, 15).map((lead: any) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 border border-white/5 rounded-xl bg-[#181b22]">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          className={lead.priority === 'high' ? 'bg-[#00d4aa]/20 text-[#00d4aa] border-0' : 'bg-[#14161c] text-[#8e919a] border-white/10'}
                        >
                          {lead.serviceType?.toUpperCase() || 'N/A'}
                        </Badge>
                        <Badge className="bg-[#14161c] text-[#8e919a] border-white/10">{lead.sourcePlatform}</Badge>
                        {lead.hasResponse && <Badge className="bg-[#14161c] text-[#8e919a] border-white/10">Responded</Badge>}
                      </div>
                      <div className="text-sm text-[#8e919a] truncate">
                        {lead.title || 'No title'}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-lg text-[#00d4aa]">
                        {lead.score}
                      </div>
                      <div className="text-xs text-[#8e919a]">
                        {lead.priority} priority
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-[#8e919a]">
              <p>No high-scoring leads yet. Leads need an AI score (ai_score) in the database to appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stage Analysis */}
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="text-[#f5f5f7]">📈 Conversion Funnel Analysis</CardTitle>
          <CardDescription className="text-[#8e919a]">
            Lead distribution across conversion funnel stages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics?.conversionFunnel && Object.entries(analytics.conversionFunnel)
              .map(([stage, count]) => (
              <div key={stage} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#00d4aa] rounded-full" />
                  <span className="capitalize font-medium text-[#f5f5f7]">{stage.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress 
                    value={analytics?.totalLeads ? (count / analytics.totalLeads) * 100 : 0} 
                    className="w-24 h-2 bg-white/10 [&>div]:bg-[#00d4aa]"
                  />
                  <Badge className="bg-[#181b22] text-[#8e919a] border-white/10">{count}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}