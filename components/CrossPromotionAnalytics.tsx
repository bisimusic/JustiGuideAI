import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Users, ExternalLink, Mail, BarChart3, DollarSign } from 'lucide-react';

interface CrossPromotionMetrics {
  blogToPlatform: {
    totalClicks: number;
    conversions: number;
    conversionRate: number;
    topSources: Array<{ source: string; clicks: number; conversions: number }>;
  };
  platformToBlog: {
    totalClicks: number;
    engagement: number;
    topContent: Array<{ title: string; clicks: number; engagement: number }>;
  };
  emailSyncStats: {
    totalSynced: number;
    duplicatesRemoved: number;
    activeSubscribers: number;
  };
}

export function CrossPromotionAnalytics() {
  const { data: metricsData, isLoading, error } = useQuery({
    queryKey: ['/api/cross-promotion/metrics'],
    queryFn: () => fetch('/api/cross-promotion/metrics').then(res => res.json()),
    refetchInterval: false, // Disable auto-refresh to prevent loops
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  const { data: promotionsData } = useQuery({
    queryKey: ['/api/cross-promotion/promotions'],
    queryFn: () => fetch('/api/cross-promotion/promotions').then(res => res.json()),
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600 dark:text-red-400 text-center">
            Failed to load cross-promotion analytics.
          </p>
        </CardContent>
      </Card>
    );
  }

  const metrics = (metricsData as any) || {
    blogToPlatform: { totalClicks: 0, conversions: 0, conversionRate: 0, topSources: [] },
    platformToBlog: { totalClicks: 0, engagement: 0, topContent: [] },
    emailSyncStats: { totalSynced: 0, duplicatesRemoved: 0, activeSubscribers: 0 }
  };
  
  const promotions = (promotionsData as any)?.promotions || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculateConversionValue = (conversions: number, avgValue: number = 5000) => {
    return conversions * avgValue;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Cross-Promotion Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track performance between your Substack blog and lead generation platform
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Real-time
        </Badge>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ExternalLink className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Blog → Platform
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {metrics.blogToPlatform.totalClicks}
                </p>
                <p className="text-xs text-gray-500">
                  clicks
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Conversions
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {metrics.blogToPlatform.conversions}
                </p>
                <p className="text-xs text-gray-500">
                  {(metrics.blogToPlatform.conversionRate * 100).toFixed(1)}% rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Synced Emails
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {metrics.emailSyncStats.activeSubscribers}
                </p>
                <p className="text-xs text-gray-500">
                  active subscribers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Estimated Value
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(calculateConversionValue(metrics.blogToPlatform.conversions))}
                </p>
                <p className="text-xs text-gray-500">
                  from conversions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Flow</TabsTrigger>
          <TabsTrigger value="promotions">Content Promotions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Blog to Platform Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Blog → Platform Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Conversion Rate</span>
                  <span className="text-sm text-gray-600">
                    {(metrics.blogToPlatform.conversionRate * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress value={metrics.blogToPlatform.conversionRate * 100} className="w-full" />
                
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Top Performing Content</h4>
                  {metrics.blogToPlatform.topSources.map((source: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="truncate">{source.source}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {source.clicks} clicks
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {source.conversions} conv
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Platform to Blog Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Platform → Blog Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Engagement Rate</span>
                  <span className="text-sm text-gray-600">
                    {(metrics.platformToBlog.engagement * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress value={metrics.platformToBlog.engagement * 100} className="w-full" />
                
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Popular Blog Content</h4>
                  {metrics.platformToBlog.topContent.map((content: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="truncate">{content.title}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {content.clicks} clicks
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {(content.engagement * 100).toFixed(0)}% eng
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Flow Visualization */}
            <Card>
              <CardHeader>
                <CardTitle>Cross-Platform Traffic Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-between w-80">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-2">
                          <BarChart3 className="h-8 w-8 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium">Substack Blog</p>
                        <p className="text-xs text-gray-500">Source Content</p>
                      </div>
                      
                      <div className="flex-1 mx-4">
                        <div className="relative">
                          <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
                          <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
                            <Badge variant="secondary" className="text-xs">
                              {metrics.blogToPlatform.totalClicks} clicks
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-2">
                          <Users className="h-8 w-8 text-purple-600" />
                        </div>
                        <p className="text-sm font-medium">JustiGuide Platform</p>
                        <p className="text-xs text-gray-500">Lead Conversion</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Synchronization Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Email List Synchronization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {metrics.emailSyncStats.totalSynced}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Total Synced
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                      {metrics.emailSyncStats.duplicatesRemoved}
                    </p>
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      Duplicates Removed
                    </p>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {metrics.emailSyncStats.activeSubscribers}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Active Subscribers
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="promotions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Promotion Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              {promotions.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                  No content promotions available. Generate some promotional widgets to get started.
                </p>
              ) : (
                <div className="space-y-4">
                  {promotions.slice(0, 5).map((promotion: any, index: number) => (
                    <div
                      key={promotion.postId}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      data-testid={`promotion-${promotion.postId}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {promotion.postTitle}
                          </h3>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {promotion.relevantMagnets.length} relevant magnets
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Est. reach: {promotion.estimatedReach}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Promotion potential: High value for cross-platform lead generation
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(promotion.postUrl, '_blank')}
                          data-testid={`view-promotion-${promotion.postId}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-lg font-semibold">Cross-Platform ROI</span>
              </div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(calculateConversionValue(metrics.blogToPlatform.conversions))}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Estimated lead value from blog traffic
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-lg font-semibold">Audience Growth</span>
              </div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                +{Math.floor((metrics.emailSyncStats.activeSubscribers / 30) * 100)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monthly growth from cross-promotion
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="h-6 w-6 text-purple-600 mr-2" />
                <span className="text-lg font-semibold">Content Synergy</span>
              </div>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {((metrics.platformToBlog.engagement + metrics.blogToPlatform.conversionRate) * 50).toFixed(0)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Overall platform integration score
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}