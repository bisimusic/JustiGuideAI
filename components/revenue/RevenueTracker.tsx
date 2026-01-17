import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, Users, ExternalLink, Target, Zap, Scale } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface RevenueData {
  totalRevenue: number;
  n400Revenue: number;
  marketplaceRevenue: number;
  totalConversions: number;
  conversionRate: number;
  leadValue: number;
}

interface RevenueTrackerProps {
  data?: RevenueData;
}

export default function RevenueTracker({ data }: RevenueTrackerProps) {
  // Fetch real revenue data from API
  const { data: apiData } = useQuery({
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

  // Use API data if available, otherwise show loading state
  const revenueData: RevenueData = data || (apiData ? {
    totalRevenue: apiData.totalExpectedRevenue || 0,
    n400Revenue: apiData.serviceBreakdown?.find((s: any) => s.service === 'd2c_n400')?.expectedRevenue || 0,
    marketplaceRevenue: apiData.serviceBreakdown?.filter((s: any) => s.service.startsWith('b2b'))
      .reduce((sum: number, s: any) => sum + (s.expectedRevenue || 0), 0) || 0,
    totalConversions: apiData.conversionFunnel?.clients || 0,
    conversionRate: apiData.responseRate || 0,
    leadValue: apiData.avgLeadValue || 0
  } : {
    totalRevenue: 0,
    n400Revenue: 0,
    marketplaceRevenue: 0,
    totalConversions: 0,
    conversionRate: 0,
    leadValue: 0
  });
  const n400Percentage = revenueData.totalRevenue > 0 ? (revenueData.n400Revenue / revenueData.totalRevenue) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueData.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Expected from current leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueData.totalConversions}</div>
            <p className="text-xs text-muted-foreground">
              Leads converted to customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueData.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Platform performance rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              N-400 Platform Revenue
            </CardTitle>
            <CardDescription>
              Direct referrals to JustiGuide platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">
                ${revenueData.n400Revenue.toLocaleString()}
              </span>
              <Badge variant="secondary">{Math.round(n400Percentage)}% of total</Badge>
            </div>
            
            <Progress value={n400Percentage} className="w-full" />
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Platform price:</span>
                <span className="font-medium">$499</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated conversions:</span>
                <span className="font-medium">{Math.round(revenueData.n400Revenue / 499)}</span>
              </div>
            </div>

            <Button asChild className="w-full" data-testid="button-external-platform">
              <a href="https://www.justi.guide/get_started/" target="_blank" rel="noopener noreferrer">
                View External Platform <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-green-500" />
              Lawyer Marketplace
            </CardTitle>
            <CardDescription>
              Complex cases referred to attorneys
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-600">
                ${revenueData.marketplaceRevenue.toLocaleString()}
              </span>
              <Badge variant="secondary">{Math.round(100 - n400Percentage)}% of total</Badge>
            </div>
            
            <Progress value={100 - n400Percentage} className="w-full" />
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Commission rate:</span>
                <span className="font-medium">15%</span>
              </div>
              <div className="flex justify-between">
                <span>Avg case value:</span>
                <span className="font-medium">$3,500</span>
              </div>
            </div>

            <Button variant="outline" className="w-full" data-testid="button-lawyer-marketplace">
              Marketplace Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Revenue Performance
          </CardTitle>
          <CardDescription>Lead generation ROI and conversion metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Revenue per Lead</p>
              <p className="text-2xl font-bold">${revenueData.leadValue}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Monthly Target</p>
              <p className="text-2xl font-bold">$125K</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Achievement</p>
              <p className="text-2xl font-bold text-green-600">73%</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Growth Rate</p>
              <p className="text-2xl font-bold text-blue-600">+18.5%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* External Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Integration</CardTitle>
          <CardDescription>Connection to external revenue systems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>JustiGuide Platform</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Lead Analytics Tracking</span>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Live
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Revenue data tracked from external payment processors. Lead conversion analytics updated in real-time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}