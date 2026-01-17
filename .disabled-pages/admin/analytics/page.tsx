"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  MessageSquare, 
  Clock, 
  Target, 
  AlertTriangle,
  BarChart3,
  Activity,
  Calendar,
  Star,
  ArrowUpRight,
  RefreshCw
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from "recharts";

interface AnalyticsInsights {
  bestConvertingContent: Array<{
    template: string;
    conversionRate: number;
    avgResponseTime: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    totalSent: number;
    totalConversions: number;
  }>;
  optimalResponseTime: {
    hourOfDay: number;
    dayOfWeek: string;
    avgConversionRate: number;
  };
  highValuePatterns: Array<{
    pattern: string;
    frequency: number;
    avgScore: number;
    commonKeywords: string[];
  }>;
  platformROI: Array<{
    platform: string;
    totalLeads: number;
    highQualityLeads: number;
    conversionRate: number;
    avgRevenue: number;
    roi: number;
    costEfficiency: number;
  }>;
  contentResonance: Array<{
    topic: string;
    engagementRate: number;
    avgScore: number;
    platforms: string[];
  }>;
  weeklyForecast: {
    expectedLeads: number;
    projectedRevenue: number;
    confidenceLevel: number;
  };
  monthlyProjection: {
    totalRevenue: number;
    leadGrowthRate: number;
    conversionTrend: string;
  };
  churnPrediction: {
    riskLevel: 'low' | 'medium' | 'high';
    predictedChurnRate: number;
    retentionStrategies: string[];
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsPage() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: insightsData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/analytics/insights'],
    staleTime: 5 * 60 * 1000,
    select: (data) => data as { success: boolean; insights: AnalyticsInsights; generatedAt: string }
  });

  const insights = insightsData?.insights;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <Button disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <Button onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-lg font-semibold mb-2">Analytics Unavailable</h3>
            <p className="text-muted-foreground">Unable to load analytics insights. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'decreasing') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-blue-500" />;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content Performance</TabsTrigger>
          <TabsTrigger value="platforms">Platform ROI</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Forecast</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insights.weeklyForecast.expectedLeads}</div>
                <p className="text-xs text-muted-foreground">
                  Expected leads (+{Math.round(insights.weeklyForecast.confidenceLevel * 100)}% confidence)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projected Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${insights.weeklyForecast.projectedRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Weekly projection
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${insights.monthlyProjection.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {getTrendIcon(insights.monthlyProjection.conversionTrend)}
                  <span className="ml-1">{insights.monthlyProjection.leadGrowthRate}% growth</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Churn Risk</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getRiskColor(insights.churnPrediction.riskLevel)}`}>
                  {insights.churnPrediction.riskLevel.toUpperCase()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(insights.churnPrediction.predictedChurnRate * 100)}% predicted churn
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Optimal Timing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Optimal Response Timing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {insights.optimalResponseTime.dayOfWeek}s at {insights.optimalResponseTime.hourOfDay}:00
                </Badge>
                <div className="text-sm text-muted-foreground">
                  {Math.round(insights.optimalResponseTime.avgConversionRate * 100)}% conversion rate
                </div>
              </div>
            </CardContent>
          </Card>

          {/* High Value Patterns */}
          {insights.highValuePatterns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  High-Value Lead Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.highValuePatterns.slice(0, 5).map((pattern, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{pattern.pattern}</div>
                        <div className="text-sm text-muted-foreground">
                          Keywords: {pattern.commonKeywords.join(', ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{pattern.frequency} leads</div>
                        <div className="text-sm text-muted-foreground">
                          Avg score: {pattern.avgScore.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Best Converting Content Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.bestConvertingContent.slice(0, 8).map((content, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{content.template}</h4>
                      <Badge variant={content.sentiment === 'positive' ? 'default' : 'secondary'}>
                        {content.sentiment}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Conversion Rate</div>
                        <div className="font-semibold">{Math.round(content.conversionRate * 100)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Total Sent</div>
                        <div className="font-semibold">{content.totalSent}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avg Response Time</div>
                        <div className="font-semibold">{content.avgResponseTime.toFixed(1)}h</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {insights.contentResonance.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Content Resonance by Topic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.contentResonance.slice(0, 6).map((topic, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{topic.topic}</div>
                        <div className="text-sm text-muted-foreground">
                          Platforms: {topic.platforms.join(', ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">Score: {topic.avgScore.toFixed(1)}</div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round(topic.engagementRate * 100)}% engagement
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Platform ROI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.platformROI.map((platform, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold capitalize">{platform.platform}</h4>
                      <Badge variant={platform.roi > 5 ? 'default' : 'secondary'}>
                        {platform.roi.toFixed(1)}x ROI
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total Leads</div>
                        <div className="font-semibold">{platform.totalLeads}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">High Quality</div>
                        <div className="font-semibold">{platform.highQualityLeads}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Conversion Rate</div>
                        <div className="font-semibold">{Math.round(platform.conversionRate * 100)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avg Revenue</div>
                        <div className="font-semibold">${platform.avgRevenue.toFixed(0)}</div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Cost Efficiency</span>
                        <span>{platform.costEfficiency.toFixed(1)}%</span>
                      </div>
                      <Progress value={platform.costEfficiency} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Forecast</CardTitle>
                <CardDescription>Next 7 days projection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Expected Leads</span>
                    <span className="font-semibold">{insights.weeklyForecast.expectedLeads}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Projected Revenue</span>
                    <span className="font-semibold">${insights.weeklyForecast.projectedRevenue.toLocaleString()}</span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Confidence Level</span>
                      <span>{Math.round(insights.weeklyForecast.confidenceLevel * 100)}%</span>
                    </div>
                    <Progress value={insights.weeklyForecast.confidenceLevel * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Projection</CardTitle>
                <CardDescription>Next 30 days outlook</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Total Revenue</span>
                    <span className="font-semibold">${insights.monthlyProjection.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Lead Growth Rate</span>
                    <span className="font-semibold flex items-center">
                      {getTrendIcon(insights.monthlyProjection.conversionTrend)}
                      <span className="ml-1">{insights.monthlyProjection.leadGrowthRate}%</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Conversion Trend</span>
                    <Badge variant="outline">{insights.monthlyProjection.conversionTrend}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Churn Prediction & Retention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground">Risk Level</div>
                    <div className={`text-xl font-bold ${getRiskColor(insights.churnPrediction.riskLevel)}`}>
                      {insights.churnPrediction.riskLevel.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Predicted Churn Rate</div>
                    <div className="text-xl font-bold">
                      {Math.round(insights.churnPrediction.predictedChurnRate * 100)}%
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2">Recommended Retention Strategies</h4>
                  <ul className="space-y-2">
                    {insights.churnPrediction.retentionStrategies.map((strategy, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <ArrowUpRight className="h-4 w-4 mr-2 text-blue-500" />
                        {strategy}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}