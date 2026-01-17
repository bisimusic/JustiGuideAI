"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, 
  DollarSign, 
  Clock, 
  Target, 
  AlertTriangle, 
  TrendingUp,
  Users,
  MessageSquare
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface QuickAction {
  priority: 'urgent' | 'high' | 'medium';
  action: string;
  expectedRevenue: number;
  timeToComplete: string;
  conversionProbability: number;
}

export default function QuickActionDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [executingActions, setExecutingActions] = useState<Set<number>>(new Set());

  // Fetch market projections with real attorney pricing
  const { data: marketProjections } = useQuery({
    queryKey: ["/api/revenue/market-projections"],
    queryFn: async () => {
      const response = await fetch('/api/revenue/market-projections');
      if (!response.ok) return null;
      return response.json();
    },
    refetchInterval: 300000, // Refresh every 5 minutes
    retry: 1
  });

  // Fetch real revenue analytics data
  const { data: revenueAnalytics } = useQuery({
    queryKey: ["/api/revenue/analytics"],
    queryFn: async () => {
      const response = await fetch('/api/revenue/analytics');
      if (!response.ok) return null;
      const result = await response.json();
      return result.success ? result : null;
    },
    refetchInterval: 300000, // Refresh every 5 minutes
    retry: 1
  });

  // Fetch quick metrics (response rate, active leads, etc.)
  const { data: quickMetrics, isError: quickMetricsError } = useQuery({
    queryKey: ["/api/solo/quick-metrics"],
    queryFn: async () => {
      const response = await fetch('/api/solo/quick-metrics');
      if (!response.ok) return null;
      const result = await response.json();
      return result.success ? result : null;
    },
    refetchInterval: 60000, // Refresh every minute
    retry: 1
  });

  // Generate actions from real data
  const generateQuickActions = (): QuickAction[] => {
    if (!revenueAnalytics || !revenueAnalytics.serviceBreakdown) {
      // Return empty array if no real data available
      return [];
    }

    const actions: QuickAction[] = [];
    
    // N-400 Citizenship leads
    const d2cService = revenueAnalytics.serviceBreakdown.find((s: any) => s.service === 'd2c_n400');
    if (d2cService && d2cService.count > 0) {
      actions.push({
        priority: 'high',
        action: `Direct N-400 platform promotion to ${d2cService.count} citizenship leads`,
        expectedRevenue: d2cService.expectedRevenue,
        timeToComplete: '1-2 hours',
        conversionProbability: d2cService.avgConversionProbability / 100
      });
    }

    // B2B Work Visas
    const workVisaService = revenueAnalytics.serviceBreakdown.find((s: any) => s.service === 'b2b_nonimmigrant_worker');
    if (workVisaService && workVisaService.count > 0) {
      actions.push({
        priority: 'high',
        action: `Lawyer referrals for ${workVisaService.count} work visa cases`,
        expectedRevenue: workVisaService.expectedRevenue,
        timeToComplete: '1-2 hours',
        conversionProbability: workVisaService.avgConversionProbability / 100
      });
    }

    // B2B Employment Authorization
    const empAuthService = revenueAnalytics.serviceBreakdown.find((s: any) => s.service === 'b2b_employment_auth');
    if (empAuthService && empAuthService.count > 0) {
      actions.push({
        priority: 'urgent',
        action: `Fast-track ${empAuthService.count} employment authorization cases`,
        expectedRevenue: empAuthService.expectedRevenue,
        timeToComplete: '30-60 minutes',
        conversionProbability: empAuthService.avgConversionProbability / 100
      });
    }

    // B2B Family Cases
    const familyService = revenueAnalytics.serviceBreakdown.find((s: any) => s.service === 'b2b_alien_relative');
    if (familyService && familyService.count > 0) {
      actions.push({
        priority: 'medium',
        action: `Family case referrals for ${familyService.count} leads`,
        expectedRevenue: familyService.expectedRevenue,
        timeToComplete: '1-2 hours',
        conversionProbability: familyService.avgConversionProbability / 100
      });
    }

    return actions.sort((a, b) => (b.expectedRevenue * b.conversionProbability) - (a.expectedRevenue * a.conversionProbability));
  };

  const quickActions = generateQuickActions();

  // Use the total expected revenue from market projections (real attorney pricing)
  const totalPotentialRevenue = marketProjections?.success ? marketProjections.totals.expectedRevenue : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'secondary';
    }
  };

  // Execute action mutation
  const executeActionMutation = useMutation({
    mutationFn: async (action: QuickAction) => {
      let endpoint = '';
      
      // Map actions to API endpoints based on content
      if (action.action.toLowerCase().includes('n-400') || action.action.toLowerCase().includes('citizenship')) {
        endpoint = '/api/nurturing/n400-campaign';
      } else if (action.action.toLowerCase().includes('lawyer') || action.action.toLowerCase().includes('work visa')) {
        endpoint = '/api/nurturing/lawyer-connection-campaign';
      } else if (action.action.toLowerCase().includes('follow-up') || action.action.toLowerCase().includes('systematic')) {
        endpoint = '/api/nurturing/systematic-follow-up';
      } else {
        // Generic conversion campaign
        endpoint = '/api/nurturing/conversion-campaign';
      }
      
      return apiRequest(endpoint, { method: 'POST', body: JSON.stringify({}) });
    },
    onSuccess: (data, action) => {
      toast({
        title: "Action Started Successfully! 🚀",
        description: `${action.action} is now running. Expected revenue: $${Math.round(action.expectedRevenue).toLocaleString()}`,
      });
      
      // Refresh analytics data
      queryClient.invalidateQueries({ queryKey: ["/api/revenue/analytics"] });
    },
    onError: (error, action) => {
      console.error('Action execution failed:', error);
      toast({
        title: "Action Failed ❌",
        description: `Failed to start: ${action.action}. Please try again.`,
        variant: "destructive",
      });
    }
  });

  const handleStartAction = async (action: QuickAction, index: number) => {
    setExecutingActions(prev => new Set([...prev, index]));
    
    try {
      await executeActionMutation.mutateAsync(action);
    } finally {
      setExecutingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  // Calculate time estimate based on number of actions
  const estimatedHours = quickActions.length > 3 ? '4-6 hours' : quickActions.length > 1 ? '2-4 hours' : '1-2 hours';
  const avgHours = quickActions.length > 3 ? 5 : quickActions.length > 1 ? 3 : 1.5;
  const hourlyROI = totalPotentialRevenue > 0 ? Math.round(totalPotentialRevenue / avgHours) : 0;

  return (
    <div className="space-y-6">
      {/* Revenue Opportunity Overview */}
      {totalPotentialRevenue > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Revenue Opportunity
            </CardTitle>
            <CardDescription>
              Expected revenue from current pipeline actions (Last 30 Days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 mb-2">
              ${(totalPotentialRevenue / 1000000).toFixed(1)}M
            </div>
            <p className="text-sm text-green-600">
              Total pipeline across {revenueAnalytics?.totalLeads?.toLocaleString() || 0} active leads
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-600">Time Investment:</span>
                <p className="font-semibold">
                  {estimatedHours} focused work
                </p>
              </div>
              <div>
                <span className="text-green-600">ROI Estimate:</span>
                <p className="font-semibold">
                  ~${hourlyROI.toLocaleString()}/hour
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Priority Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Priority Conversion Actions
          </CardTitle>
          <CardDescription>
            Ranked by expected value (revenue × conversion probability)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quickActions.map((action, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(action.priority)}`}></div>
                    <Badge variant={getPriorityBadge(action.priority) as any}>
                      {action.priority}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      ${Math.round(action.expectedRevenue).toLocaleString()}
                    </div>
                    <p className="text-xs text-black">expected value</p>
                  </div>
                </div>
                
                <h4 className="font-semibold text-black mb-2">{action.action}</h4>
                
                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-black">Time:</span>
                    <p className="font-medium text-black">{action.timeToComplete}</p>
                  </div>
                  <div>
                    <span className="text-black">Max Revenue:</span>
                    <p className="font-medium text-black">${action.expectedRevenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-black">Conversion:</span>
                    <p className="font-medium text-black">{Math.round(action.conversionProbability * 100)}%</p>
                  </div>
                </div>
                
                <Progress value={action.conversionProbability * 100} className="mb-3" />
                
                <Button 
                  className="w-full" 
                  variant={action.priority === 'urgent' ? 'default' : 'outline'}
                  data-testid={`button-action-${index}`}
                  onClick={() => handleStartAction(action, index)}
                  disabled={executingActions.has(index) || executeActionMutation.isPending}
                >
                  {executingActions.has(index) ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Executing...
                    </div>
                  ) : (
                    'Start This Action'
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Solo Operator Metrics - Dynamic Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-response-rate">
              {quickMetrics ? `${quickMetrics.responseRate}%` : '...'}
            </div>
            <p className="text-xs text-black">
              {quickMetrics 
                ? `${quickMetrics.totalResponses.toLocaleString()} responses to ${quickMetrics.totalLeads.toLocaleString()} leads`
                : 'Loading...'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-active-leads">
              {quickMetrics ? quickMetrics.unrespondedHighPriority.toLocaleString() : '...'}
            </div>
            <p className="text-xs text-black">
              Unresponded high-priority leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-response-time">
              {quickMetrics ? quickMetrics.avgResponseTime : '...'}
            </div>
            <p className="text-xs text-black">
              vs industry 4+ hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lead Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Lead Segmentation Analysis
          </CardTitle>
          <CardDescription>
            Revenue potential by lead type for focused outreach
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {revenueAnalytics?.serviceBreakdown?.map((service: any, index: number) => {
              const colors = ['text-purple-600', 'text-orange-600', 'text-blue-600', 'text-green-600'];
              const serviceNames: { [key: string]: string } = {
                'd2c_n400': 'N-400 Citizenship',
                'b2b_nonimmigrant_worker': 'Work Visas',
                'b2b_employment_auth': 'Employment Auth',
                'b2b_alien_relative': 'Family Cases'
              };
              return (
                <div key={service.service} className="text-center p-4 border rounded-lg">
                  <div className={`text-2xl font-bold ${colors[index % colors.length]}`}>{service.count}</div>
                  <p className="text-sm font-medium text-black">{serviceNames[service.service] || service.service}</p>
                  <p className="text-xs text-black">{service.avgConversionProbability}% conversion</p>
                </div>
              );
            }) || (
              // Fallback static display if no data
              <>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">-</div>
                  <p className="text-sm font-medium">Loading...</p>
                  <p className="text-xs text-muted-foreground">Getting data</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Win Recommendations */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Solo Operator Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {quickActions.slice(0, 3).map((action, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full ${
                  index === 0 ? 'bg-red-100' : index === 1 ? 'bg-orange-100' : 'bg-blue-100'
                } flex items-center justify-center mt-0.5`}>
                  <span className={`${
                    index === 0 ? 'text-red-600' : index === 1 ? 'text-orange-600' : 'text-blue-600'
                  } text-xs font-bold`}>{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-black">{action.action}</p>
                  <p className="text-sm text-black">
                    Expected: ${Math.round(action.expectedRevenue).toLocaleString()} 
                    ({Math.round(action.conversionProbability * 100)}% conversion rate)
                  </p>
                </div>
              </div>
            ))}
            {quickActions.length === 0 && (
              <div className="text-center text-black">
                <p>Loading recommendations based on your pipeline data...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}