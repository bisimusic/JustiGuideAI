"use client";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/layout/sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp, DollarSign, Users, ArrowRight, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FunnelStage {
  stage: string;
  uniqueLeads: number;
  totalEvents: number;
  totalValue: number;
  avgValuePerLead: number;
  conversionRate: number;
  dropoffRate: number;
  dropoffCount: number;
}

interface FunnelData {
  success: boolean;
  dateRange: { start: string; end: string };
  platform: string;
  funnel: FunnelStage[];
  summary: {
    totalLeads: number;
    totalConversions: number;
    overallConversionRate: number;
    totalRevenue: number;
    avgRevenuePerLead: number;
  };
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#06b6d4'];

export default function ConversionFunnelPage() {
  const [platform, setPlatform] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30');

  const { data: funnelData, isLoading, refetch } = useQuery<FunnelData>({
    queryKey: ['/api/analytics/conversion-funnel', { platform, dateRange }],
    queryFn: async () => {
      const startDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();
      const params = new URLSearchParams({ startDate, endDate });
      if (platform !== 'all') params.append('platform', platform);
      
      const response = await fetch(`/api/analytics/conversion-funnel?${params}`);
      if (!response.ok) throw new Error('Failed to fetch funnel data');
      return response.json();
    },
    refetchInterval: 30000
  });

  const chartData = funnelData?.funnel.map((stage, index) => ({
    name: stage.stage,
    value: stage.uniqueLeads,
    conversionRate: stage.conversionRate,
    dropoff: stage.dropoffCount,
    fill: COLORS[index % COLORS.length]
  })) || [];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100" data-testid="heading-conversion-funnel">
                    Conversion Funnel Analytics
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Track Devvit → Booking → Payment journey with drop-off analysis
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-[140px]" data-testid="select-daterange">
                    <SelectValue placeholder="Date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="w-[140px]" data-testid="select-platform">
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="reddit">Reddit</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="calendly">Calendly</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={() => refetch()} variant="outline" size="icon" data-testid="button-refresh">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading funnel data...</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card data-testid="card-total-leads">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold" data-testid="text-total-leads">
                        {funnelData?.summary.totalLeads.toLocaleString() || 0}
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-conversions">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Conversions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold" data-testid="text-conversions">
                        {funnelData?.summary.totalConversions.toLocaleString() || 0}
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-conversion-rate">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold" data-testid="text-conversion-rate">
                        {funnelData?.summary.overallConversionRate.toFixed(1) || 0}%
                      </div>
                      <Badge variant={
                        (funnelData?.summary.overallConversionRate || 0) > 5 ? 'default' : 'destructive'
                      }>
                        {(funnelData?.summary.overallConversionRate || 0) > 5 ? 'Good' : 'Low'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-total-revenue">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold" data-testid="text-total-revenue">
                        ${(funnelData?.summary.totalRevenue || 0).toLocaleString()}
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Funnel Visualization */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Funnel Visualization</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Stage Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Stage-by-Stage Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {funnelData?.funnel.map((stage, index) => (
                      <div key={stage.stage} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <h3 className="font-semibold text-lg">{stage.stage}</h3>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge variant="outline" data-testid={`badge-leads-${index}`}>
                              {stage.uniqueLeads} leads
                            </Badge>
                            {index < (funnelData?.funnel.length - 1) && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">→</span>
                                <Badge variant={stage.conversionRate > 50 ? 'default' : 'destructive'}>
                                  {stage.conversionRate}% convert
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div>
                            <p className="text-sm text-gray-600">Total Events</p>
                            <p className="text-xl font-semibold" data-testid={`text-events-${index}`}>
                              {stage.totalEvents}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Value</p>
                            <p className="text-xl font-semibold" data-testid={`text-value-${index}`}>
                              ${stage.totalValue.toLocaleString()}
                            </p>
                          </div>
                          {index < (funnelData?.funnel.length - 1) && (
                            <div>
                              <p className="text-sm text-gray-600 flex items-center">
                                <TrendingDown className="h-4 w-4 mr-1 text-red-500" />
                                Drop-off
                              </p>
                              <p className="text-xl font-semibold text-red-600" data-testid={`text-dropoff-${index}`}>
                                {stage.dropoffCount} ({stage.dropoffRate}%)
                              </p>
                            </div>
                          )}
                        </div>

                        {index < (funnelData?.funnel.length - 1) && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Conversion to next stage</span>
                              <span className="font-medium">{stage.conversionRate}%</span>
                            </div>
                            <Progress value={stage.conversionRate} className="h-2" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
