import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  Settings,
  Play,
  Users
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface DailyReport {
  date: string;
  executiveSummary: string;
  metrics: {
    leadGeneration: {
      totalNewLeads: number;
      platformBreakdown: Record<string, number>;
      qualityScore: number;
      topPerformingPlatforms: string[];
    };
    responseActivity: {
      totalResponses: number;
      responseRate: number;
      averageResponseTime: number;
      successfulConversions: number;
    };
    aiPerformance: {
      averageLeadScore: number;
      scoringAccuracy: number;
      responseQuality: number;
      automationEfficiency: number;
    };
    businessMetrics: {
      revenueGenerated: number;
      costPerLead: number;
      conversionValue: number;
      roi: number;
    };
  };
  insights: Array<{
    category: string;
    priority: 'high' | 'medium' | 'low';
    insight: string;
    actionableSteps: string[];
    expectedImpact: string;
    timeframe: string;
  }>;
  recommendations: string[];
  nextDayFocus: string[];
  performanceComparison: {
    vsYesterday: Record<string, number>;
    vsWeekAgo: Record<string, number>;
    trend: 'improving' | 'stable' | 'declining';
  };
}

const priorityColors = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
};

const trendIcons = {
  improving: TrendingUp,
  stable: BarChart3,
  declining: TrendingDown
};

const trendColors = {
  improving: 'text-green-600',
  stable: 'text-blue-600',
  declining: 'text-red-600'
};

export default function DailyReportingDashboard() {
  const [reportingSchedule, setReportingSchedule] = useState('0 6 * * *'); // 6 AM daily
  const queryClient = useQueryClient();

  // Fetch daily reports (30 most recent)
  const { data: reportData, isLoading: reportLoading, refetch: refetchReport } = useQuery({
    queryKey: ['/api/reports/daily'],
    enabled: true
  });

  // Fetch pipeline summary for comprehensive analytics
  const { data: pipelineSummary, isLoading: pipelineLoading } = useQuery({
    queryKey: ['/api/reports/pipeline-summary'],
    enabled: true,
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  const reports = (reportData as any) || [];
  const latestReport = reports.length > 0 ? reports[0] : null;

  // Update reporting schedule
  const updateSchedule = useMutation({
    mutationFn: (schedule: string) => 
      apiRequest('/api/reports/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reports/schedule'] });
    }
  });

  // Generate manual report
  const generateReport = useMutation({
    mutationFn: () => apiRequest('/api/reports/daily/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: new Date().toISOString() })
    }),
    onSuccess: () => {
      refetchReport();
    }
  });

  const handleGenerateReport = () => {
    generateReport.mutate();
  };

  if (reportLoading) {
    return (
      <div className="p-6">
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show pipeline summary even without daily reports
  const pipeline = pipelineSummary as any;
  const summary = pipeline?.summary || {};
  const topVisaTypes = pipeline?.topVisaTypes || [];
  const premiumVisas = pipeline?.premiumVisaPerformance || [];

  const getVisaEmoji = (visaType: string) => {
    const type = visaType?.toLowerCase() || '';
    if (type.includes('green') || type.includes('gc')) return '🟢';
    if (type.includes('h-1b') || type.includes('h1b')) return '🔵';
    if (type.includes('eb-1') || type.includes('eb1')) return '💎';
    if (type.includes('niw')) return '💎';
    if (type.includes('o-1') || type.includes('o1')) return '💎';
    if (type.includes('eb-5') || type.includes('eb5')) return '💎';
    if (type.includes('citizenship') || type.includes('n-400')) return '🇺🇸';
    if (type.includes('asylum')) return '🛡️';
    return '💼';
  };

  if (reportLoading || pipelineLoading) {
    return (
      <div className="p-6">
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!latestReport && !pipeline) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Reporting Dashboard</CardTitle>
            <CardDescription>Generate your first daily report to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGenerateReport} disabled={generateReport.isPending} data-testid="button-generate-report">
              {generateReport.isPending ? 'Generating...' : 'Generate Daily Report'}
              <Play className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Parse the latest report data if available
  const reportDate = latestReport ? new Date(latestReport.report_date).toLocaleDateString() : null;
  const engagementMetrics = latestReport?.engagement_metrics || {};
  const learnings = latestReport?.learnings || {};
  const platformBreakdown = latestReport?.platform_breakdown || { platforms: [], visaTypes: [] };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pipeline & Reports Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive pipeline analytics and daily operational insights
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {reportDate && (
            <Badge variant="outline" className="px-3 py-1" data-testid="badge-next-report">
              Last Report: {reportDate}
            </Badge>
          )}
          <Button onClick={handleGenerateReport} disabled={generateReport.isPending} size="sm" data-testid="button-generate-now">
            {generateReport.isPending ? 'Generating...' : 'Generate Daily Report'}
            <Play className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Pipeline Summary - Always visible */}
      {pipeline && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>💰 Pipeline Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground">Total Leads</div>
                  <div className="text-3xl font-bold" data-testid="text-total-leads">{summary.totalLeads?.toLocaleString() || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Pipeline Value</div>
                  <div className="text-3xl font-bold text-green-600" data-testid="text-pipeline-value">
                    ${(summary.totalPipelineValue / 1000000).toFixed(1)}M
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Average Lead Value</div>
                  <div className="text-3xl font-bold text-blue-600" data-testid="text-avg-lead-value">
                    ${summary.avgLeadValue?.toLocaleString() || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Premium Leads (≥$15K)</div>
                  <div className="text-3xl font-bold text-purple-600" data-testid="text-premium-leads">
                    {summary.premiumLeadsCount?.toLocaleString() || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${(summary.premiumPipelineValue / 1000000).toFixed(1)}M value
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Visa Types by Revenue */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Top Visa Types by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 pb-2 border-b font-medium text-sm">
                  <div>Visa Type</div>
                  <div className="text-right">Leads</div>
                  <div className="text-right">Avg Value</div>
                  <div className="text-right">Total Value</div>
                </div>
                {topVisaTypes.slice(0, 8).map((visa: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-4 gap-4 items-center" data-testid={`row-visa-${idx}`}>
                    <div className="flex items-center space-x-2">
                      <span>{getVisaEmoji(visa.visaType)}</span>
                      <span className="font-medium capitalize">{visa.visaType}</span>
                    </div>
                    <div className="text-right">{visa.leadCount?.toLocaleString()}</div>
                    <div className="text-right">${visa.avgValue?.toLocaleString()}</div>
                    <div className="text-right font-bold">
                      ${(visa.totalValue / 1000000).toFixed(1)}M
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Premium Visa Performance */}
          {premiumVisas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>🎯 Premium Visa Performance</CardTitle>
                <CardDescription>High-value visa types with average fees ≥$15K</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {premiumVisas.map((visa: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg" data-testid={`premium-visa-${idx}`}>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">💎</span>
                        <div>
                          <div className="font-bold uppercase">{visa.visaType}</div>
                          <div className="text-sm text-muted-foreground">
                            {visa.leadCount} leads @ avg ${visa.avgValue?.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">
                          ${(visa.totalValue / 1000000).toFixed(1)}M
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                    <div className="font-bold text-lg">
                      Total Premium Visa Pipeline: ${(premiumVisas.reduce((sum: number, v: any) => sum + v.totalValue, 0) / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Across {premiumVisas.reduce((sum: number, v: any) => sum + v.leadCount, 0)} high-value leads
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Daily Report Section - Only shown if reports exist */}
      {latestReport && (
        <>
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Daily Summary - {reportDate}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {latestReport.summary || 'No summary available'}
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics" data-testid="tab-metrics">Metrics</TabsTrigger>
          <TabsTrigger value="engagement" data-testid="tab-engagement">Engagement</TabsTrigger>
          <TabsTrigger value="platform" data-testid="tab-platform">Platform Performance</TabsTrigger>
          <TabsTrigger value="recommendations" data-testid="tab-recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Leads Discovered */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Leads Discovered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-leads-discovered">{latestReport.total_leads_discovered || 0}</div>
                <div className="text-xs text-muted-foreground">New leads found</div>
              </CardContent>
            </Card>

            {/* Responses Sent */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Responses Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-responses-sent">{latestReport.responses_sent || 0}</div>
                <div className="text-xs text-muted-foreground">AI-generated responses</div>
              </CardContent>
            </Card>

            {/* Clicks Tracked */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Clicks Tracked</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-clicks-tracked">{latestReport.clicks_tracked || 0}</div>
                <div className="text-xs text-muted-foreground">Link engagements</div>
              </CardContent>
            </Card>

            {/* Pipeline Value */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-pipeline-value">${(latestReport.pipeline_value || 0).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">
                  Avg: ${(latestReport.avg_lead_value || 0).toLocaleString()}/lead
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Tests Run:</span>
                  <span className="font-bold">{latestReport.tests_run || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tests Passed:</span>
                  <span className="font-bold text-green-600">{latestReport.tests_passed || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Critical Errors:</span>
                  <span className="font-bold text-red-600">{latestReport.critical_errors || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">AI Learning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Patterns Discovered:</span>
                  <span className="font-bold">{latestReport.new_patterns_discovered || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Templates Optimized:</span>
                  <span className="font-bold">{latestReport.templates_optimized || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Model Updates:</span>
                  <span className="font-bold">{latestReport.ai_model_updates || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {latestReport.top_insight && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <span>Top Insight</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{latestReport.top_insight}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="platform" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Top Platform</h4>
                  <p className="text-2xl font-bold capitalize">{latestReport.top_platform || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Top Visa Type</h4>
                  <p className="text-2xl font-bold uppercase">{latestReport.top_visa_type || 'N/A'}</p>
                </div>
                {platformBreakdown.platforms && platformBreakdown.platforms.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Platform Breakdown</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {platformBreakdown.platforms.map((p: any, idx: number) => (
                        <div key={idx} className="text-center">
                          <div className="text-2xl font-bold">{p.leads}</div>
                          <div className="text-sm text-muted-foreground capitalize">{p.platform}</div>
                          <div className="text-xs text-muted-foreground">${p.value?.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <span>Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestReport.recommendations && Array.isArray(latestReport.recommendations) && latestReport.recommendations.length > 0 ? (
                <ul className="space-y-3">
                  {latestReport.recommendations.map((rec: any, index: number) => (
                    <li key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{rec.action || rec}</p>
                        {rec.priority && (
                          <Badge className="mt-1" variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                            {rec.priority}
                          </Badge>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No recommendations available for this report.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </>
      )}
    </div>
  );
}