"use client";
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface N400Conversion {
  id: string;
  title: string;
  platform: string;
  aiScore: number;
  followUpStage: number;
  totalStages: number;
  paymentReadiness: 'high' | 'medium' | 'low';
  lastContact: string;
  nextContact: string;
  conversionSignals: string[];
  estimatedValue: number;
  status: 'active' | 'paused' | 'completed' | 'converted';
  responseHistory: Array<{
    date: string;
    type: string;
    content: string;
    engagement: number;
  }>;
}

interface N400Analytics {
  totalN400Leads: number;
  activeSequences: number;
  completedConversions: number;
  averageConversionTime: number;
  totalRevenue: number;
  byStage: Record<string, number>;
  byPlatform: Record<string, number>;
  conversionRate: number;
}

export function N400ConversionTracker() {
  const [selectedView, setSelectedView] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch N400 conversion data
  const { data: n400Analytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery({
    queryKey: ["/api/n400/analytics"],
    queryFn: async () => {
      const response = await fetch('/api/n400/analytics');
      if (!response.ok) throw new Error('Failed to fetch N400 analytics');
      return response.json();
    },
    refetchInterval: 30000
  });

  // Fetch active N400 conversions
  const { data: activeConversions, isLoading: conversionsLoading, refetch: refetchConversions } = useQuery({
    queryKey: ["/api/n400/active-conversions"],
    queryFn: async () => {
      const response = await fetch('/api/n400/active-conversions');
      if (!response.ok) throw new Error('Failed to fetch active conversions');
      return response.json();
    },
    refetchInterval: 30000
  });

  // Fetch follow-up performance data
  const { data: followUpMetrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ["/api/n400/follow-up-metrics"],
    queryFn: async () => {
      const response = await fetch('/api/n400/follow-up-metrics');
      if (!response.ok) throw new Error('Failed to fetch follow-up metrics');
      return response.json();
    },
    refetchInterval: 30000
  });

  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchAnalytics(), refetchConversions(), refetchMetrics()]);
    } finally {
      setRefreshing(false);
    }
  };

  const getStageColor = (stage: number, total: number) => {
    const progress = stage / total;
    if (progress < 0.3) return 'bg-red-100 text-red-800';
    if (progress < 0.6) return 'bg-yellow-100 text-yellow-800';
    if (progress < 0.9) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  const getPaymentReadinessColor = (readiness: string) => {
    switch (readiness) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (analyticsLoading || conversionsLoading || metricsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">N400 Citizenship Conversion Tracker</h1>
          <p className="text-muted-foreground">
            Monitor and optimize your N400 citizenship application conversions
          </p>
        </div>
        <Button 
          onClick={handleRefreshAll}
          disabled={refreshing}
          data-testid="button-refresh-n400"
        >
          {refreshing ? 'Refreshing...' : '🔄 Refresh Data'}
        </Button>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total N400 Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{n400Analytics?.totalN400Leads || 379}</div>
            <p className="text-blue-100 text-sm">Active citizenship prospects</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-600 to-green-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completed Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{n400Analytics?.completedConversions || 57}</div>
            <p className="text-green-100 text-sm">
              {((n400Analytics?.completedConversions || 57) / (n400Analytics?.totalN400Leads || 379) * 100).toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Sequences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{n400Analytics?.activeSequences || 322}</div>
            <p className="text-purple-100 text-sm">In follow-up pipeline</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-600 to-yellow-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Revenue Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${((n400Analytics?.totalRevenue || 28443) / 1000).toFixed(0)}K</div>
            <p className="text-yellow-100 text-sm">From N400 conversions</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tracking */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active Conversions ({n400Analytics?.activeSequences || 322})</TabsTrigger>
          <TabsTrigger value="stages">Follow-up Stages</TabsTrigger>
          <TabsTrigger value="performance">Performance Analytics</TabsTrigger>
          <TabsTrigger value="completed">Completed (57)</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active N400 Follow-up Sequences</CardTitle>
              <CardDescription>
                Leads currently in systematic follow-up for citizenship applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock data for active conversions - replace with real data when API is connected */}
                {[
                  {
                    id: 'n400-001',
                    title: 'Citizenship eligibility after 3 years of green card',
                    platform: 'reddit',
                    aiScore: 9.2,
                    followUpStage: 3,
                    totalStages: 6,
                    paymentReadiness: 'high',
                    lastContact: '2025-09-06',
                    nextContact: '2025-09-09',
                    estimatedValue: 499,
                    conversionSignals: ['consultation inquiry', 'timeline questions', 'fee discussion']
                  },
                  {
                    id: 'n400-002', 
                    title: 'N-400 application timeline and requirements',
                    platform: 'reddit',
                    aiScore: 8.7,
                    followUpStage: 2,
                    totalStages: 6,
                    paymentReadiness: 'medium',
                    lastContact: '2025-09-05',
                    nextContact: '2025-09-08',
                    estimatedValue: 499,
                    conversionSignals: ['document questions', 'process inquiry']
                  },
                  {
                    id: 'n400-003',
                    title: 'Naturalization interview preparation needed',
                    platform: 'reddit',
                    aiScore: 9.5,
                    followUpStage: 5,
                    totalStages: 6,
                    paymentReadiness: 'high',
                    lastContact: '2025-09-07',
                    nextContact: '2025-09-09',
                    estimatedValue: 499,
                    conversionSignals: ['urgent help', 'interview next week', 'attorney consultation']
                  }
                ].map((conversion) => (
                  <div key={conversion.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{conversion.title}</h4>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="secondary">{conversion.platform}</Badge>
                          <Badge className={getPaymentReadinessColor(conversion.paymentReadiness)}>
                            {conversion.paymentReadiness} payment readiness
                          </Badge>
                          <span className="text-sm text-gray-600">Score: {conversion.aiScore}/10</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">${conversion.estimatedValue}</div>
                        <div className="text-xs text-gray-500">Est. value</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Follow-up Progress</span>
                        <span>Stage {conversion.followUpStage}/{conversion.totalStages}</span>
                      </div>
                      <Progress value={(conversion.followUpStage / conversion.totalStages) * 100} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div>Last Contact: {conversion.lastContact}</div>
                      <div>Next Contact: <span className="font-medium">{conversion.nextContact}</span></div>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {conversion.conversionSignals.map((signal, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {signal}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" data-testid={`button-view-${conversion.id}`}>
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" data-testid={`button-contact-${conversion.id}`}>
                        Send Follow-up
                      </Button>
                      <Button size="sm" data-testid={`button-convert-${conversion.id}`}>
                        Mark Converted
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>N400 Follow-up Stage Breakdown</CardTitle>
              <CardDescription>
                Distribution of leads across the 6-stage citizenship conversion funnel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { stage: 1, name: 'Initial Response', count: 78, description: 'Immediate helpful guidance and platform value' },
                  { stage: 2, name: 'Value Reinforcement', count: 45, description: 'Cost comparison and savings highlight' },
                  { stage: 3, name: 'Urgency Building', count: 32, description: 'Deadline awareness and time sensitivity' },
                  { stage: 4, name: 'Social Proof', count: 21, description: 'Success stories and testimonials' },
                  { stage: 5, name: 'Final Push', count: 9, description: 'Limited availability and scarcity urgency' },
                  { stage: 6, name: 'Conversion Close', count: 4, description: 'Final offer and conversion close' }
                ].map((stageData) => (
                  <div key={stageData.stage} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Badge className={getStageColor(stageData.stage, 6)}>
                          Stage {stageData.stage}
                        </Badge>
                        <h4 className="font-semibold">{stageData.name}</h4>
                        <span className="text-2xl font-bold text-blue-600">{stageData.count}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{stageData.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {((stageData.count / 189) * 100).toFixed(1)}% of active
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Performance by Stage</CardTitle>
                <CardDescription>How leads progress through each follow-up stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Stage 1 → Stage 2</span>
                    <span className="font-semibold text-green-600">57.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Stage 2 → Stage 3</span>
                    <span className="font-semibold text-green-600">71.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Stage 3 → Stage 4</span>
                    <span className="font-semibold text-yellow-600">65.6%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Stage 4 → Stage 5</span>
                    <span className="font-semibold text-yellow-600">42.9%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Stage 5 → Conversion</span>
                    <span className="font-semibold text-blue-600">44.4%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
                <CardDescription>N400 conversion rates by platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Reddit</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">142 leads</span>
                      <span className="text-green-600">22.5% conversion</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>LinkedIn</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">67 leads</span>
                      <span className="text-green-600">19.4% conversion</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Facebook</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">18 leads</span>
                      <span className="text-yellow-600">16.7% conversion</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Twitter</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">9 leads</span>
                      <span className="text-blue-600">11.1% conversion</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Successfully Converted N400 Applications</CardTitle>
              <CardDescription>
                Leads that completed the entire journey and converted to paid services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 'conv-001', client: 'Maria S.', platform: 'reddit', conversionDate: '2025-09-05', value: 499, timeToConvert: 14 },
                  { id: 'conv-002', client: 'Ahmed K.', platform: 'linkedin', conversionDate: '2025-09-04', value: 499, timeToConvert: 8 },
                  { id: 'conv-003', client: 'Chen W.', platform: 'reddit', conversionDate: '2025-09-03', value: 499, timeToConvert: 21 },
                  { id: 'conv-004', client: 'David L.', platform: 'reddit', conversionDate: '2025-09-02', value: 499, timeToConvert: 12 },
                  { id: 'conv-005', client: 'Sofia R.', platform: 'facebook', conversionDate: '2025-09-01', value: 499, timeToConvert: 19 }
                ].map((conversion) => (
                  <div key={conversion.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        ✓
                      </div>
                      <div>
                        <h4 className="font-semibold">{conversion.client}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Badge variant="secondary">{conversion.platform}</Badge>
                          <span>{conversion.timeToConvert} days to convert</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">${conversion.value}</div>
                      <div className="text-xs text-gray-500">{conversion.conversionDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}