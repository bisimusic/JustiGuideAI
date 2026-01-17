import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Target, 
  Users, 
  BarChart3, 
  TestTube, 
  Zap,
  ArrowUp,
  ArrowDown,
  Play,
  Pause
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface VisaPathPerformance {
  visaType: string;
  serviceType: string;
  totalLeads: number;
  clickThroughRate: number;
  conversionRate: number;
  avgResponseTime: number;
  avgAiScore: number;
  topPerformingTemplates: string[];
  currentStrategy: string;
  recommendedOptimizations: string[];
}

interface OptimizationDashboardData {
  visaPathPerformance: VisaPathPerformance[];
  activeOptimizationTests: number;
  totalLeadsOptimized: number;
  averageConversionRate: number;
  topPerformingPaths: VisaPathPerformance[];
  optimizationOpportunities: VisaPathPerformance[];
}

interface ABTestResult {
  testId: string;
  testName: string;
  visaType: string;
  status: 'running' | 'completed' | 'paused';
  variants: {
    name: string;
    conversionRate: number;
    sampleSize: number;
    confidence: number;
  }[];
  winner: string | null;
  improvement: number;
}

export function ConversionOptimizationDashboard() {
  const [selectedVisaType, setSelectedVisaType] = useState<string>('all');

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/optimization/dashboard'],
    refetchInterval: 60000 // Refresh every minute
  });

  const { data: abTestResults } = useQuery({
    queryKey: ['/api/optimization/ab-tests'],
    refetchInterval: 30000
  });

  if (isLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading optimization data...</p>
        </div>
      </div>
    );
  }

  const data = dashboardData as OptimizationDashboardData;

  return (
    <div className="space-y-6" data-testid="optimization-dashboard">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card data-testid="total-leads-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads Optimized</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalLeadsOptimized?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card data-testid="avg-conversion-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.averageConversionRate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all visa paths
            </p>
          </CardContent>
        </Card>

        <Card data-testid="active-tests-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active A/B Tests</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeOptimizationTests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card data-testid="opportunities-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimization Opportunities</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.optimizationOpportunities?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Paths to improve
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedVisaType} onValueChange={setSelectedVisaType} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All Paths</TabsTrigger>
          <TabsTrigger value="h1b">H1B</TabsTrigger>
          <TabsTrigger value="green_card">Green Card</TabsTrigger>
          <TabsTrigger value="citizenship">Citizenship</TabsTrigger>
          <TabsTrigger value="asylum">Asylum</TabsTrigger>
          <TabsTrigger value="family_visa">Family</TabsTrigger>
          <TabsTrigger value="eb5">EB5</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Top Performing Paths */}
          <Card data-testid="top-performing-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Top Performing Visa Paths
              </CardTitle>
              <CardDescription>
                Best converting paths in the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topPerformingPaths?.map((path, index) => (
                  <div 
                    key={`${path.visaType}-${path.serviceType}`} 
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    data-testid={`top-path-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-blue-600">#{index + 1}</div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {path.visaType.toUpperCase()} - {path.serviceType}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {path.totalLeads} leads • AI Score: {path.avgAiScore}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {path.conversionRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {path.clickThroughRate.toFixed(1)}% CTR
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Optimization Opportunities */}
          <Card data-testid="optimization-opportunities-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Optimization Opportunities
              </CardTitle>
              <CardDescription>
                Visa paths with the highest improvement potential
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.optimizationOpportunities?.map((opportunity, index) => (
                  <div 
                    key={`${opportunity.visaType}-${opportunity.serviceType}`}
                    className="border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-lg p-4"
                    data-testid={`opportunity-${index}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {opportunity.visaType.toUpperCase()} - {opportunity.serviceType}
                      </h3>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        {opportunity.totalLeads} leads
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</div>
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-medium">{opportunity.conversionRate.toFixed(1)}%</div>
                          <ArrowDown className="h-4 w-4 text-red-500" />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Click-Through Rate</div>
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-medium">{opportunity.clickThroughRate.toFixed(1)}%</div>
                          <ArrowDown className="h-4 w-4 text-red-500" />
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Recommended Optimizations:</div>
                      <div className="space-y-1">
                        {opportunity.recommendedOptimizations.map((rec, idx) => (
                          <div key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <span className="text-yellow-600">•</span>
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button 
                      size="sm" 
                      className="w-full"
                      data-testid={`start-optimization-${index}`}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start A/B Test
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual visa type tabs would show filtered data */}
        {(['h1b', 'green_card', 'citizenship', 'asylum', 'family_visa', 'eb5'] as const).map(visaType => (
          <TabsContent key={visaType} value={visaType} className="space-y-6">
            <VisaTypeOptimizationView 
              visaType={visaType} 
              data={data.visaPathPerformance?.filter(path => path.visaType === visaType) || []}
              abTests={abTestResults?.filter((test: ABTestResult) => test.visaType === visaType) || []}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Active A/B Tests Section */}
      {abTestResults && abTestResults.length > 0 && (
        <Card data-testid="active-ab-tests-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Active A/B Tests
            </CardTitle>
            <CardDescription>
              Currently running optimization experiments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {abTestResults.map((test: ABTestResult, index: number) => (
                <div 
                  key={test.testId} 
                  className="border rounded-lg p-4"
                  data-testid={`ab-test-${index}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{test.testName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {test.visaType.toUpperCase()} • {test.status}
                      </p>
                    </div>
                    <Badge 
                      variant={test.status === 'running' ? 'default' : test.status === 'completed' ? 'secondary' : 'outline'}
                    >
                      {test.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {test.variants.map((variant, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                        <div className="font-medium text-sm">{variant.name}</div>
                        <div className="text-lg font-bold text-blue-600">
                          {variant.conversionRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {variant.sampleSize} samples • {variant.confidence}% confidence
                        </div>
                      </div>
                    ))}
                  </div>

                  {test.winner && (
                    <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <div className="text-sm text-green-800 dark:text-green-400">
                        Winner: {test.winner} (+{test.improvement.toFixed(1)}% improvement)
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function VisaTypeOptimizationView({ 
  visaType, 
  data, 
  abTests 
}: { 
  visaType: string; 
  data: VisaPathPerformance[]; 
  abTests: ABTestResult[];
}) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No optimization data available for {visaType.toUpperCase()} visa path yet.</p>
            <p className="text-sm">Data will appear once leads are processed for this category.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalLeads = data.reduce((sum, path) => sum + path.totalLeads, 0);
  const avgConversion = data.reduce((sum, path) => sum + path.conversionRate, 0) / data.length;
  const avgClickThrough = data.reduce((sum, path) => sum + path.clickThroughRate, 0) / data.length;

  return (
    <div className="space-y-6">
      {/* Visa Type Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalLeads.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Total Leads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{avgConversion.toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">Avg Conversion Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{avgClickThrough.toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">Avg Click-Through Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Performance */}
      <Card>
        <CardHeader>
          <CardTitle>{visaType.toUpperCase()} Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((path, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{path.serviceType}</h3>
                  <Badge variant="outline">{path.totalLeads} leads</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-sm text-gray-600">Conversion Rate</div>
                    <Progress value={path.conversionRate} className="h-2 mt-1" />
                    <div className="text-sm font-medium">{path.conversionRate.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">AI Score</div>
                    <Progress value={path.avgAiScore * 10} className="h-2 mt-1" />
                    <div className="text-sm font-medium">{path.avgAiScore.toFixed(1)}/10</div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">Current Strategy:</div>
                <div className="text-sm font-medium mb-2">{path.currentStrategy}</div>

                {path.recommendedOptimizations.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Recommendations:</div>
                    <div className="space-y-1">
                      {path.recommendedOptimizations.slice(0, 2).map((rec, idx) => (
                        <div key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Tests for this Visa Type */}
      {abTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active {visaType.toUpperCase()} Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {abTests.map((test, index) => (
                <div key={index} className="border rounded p-3">
                  <div className="font-medium">{test.testName}</div>
                  <div className="text-sm text-gray-600">{test.status}</div>
                  {test.winner && (
                    <div className="text-sm text-green-600 mt-1">
                      Winner: {test.winner} (+{test.improvement.toFixed(1)}%)
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}