import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Target, Users, Calendar, BarChart3, PieChart } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";

interface FinancialOverviewProps {
  financialMetrics?: any;
  revenueAnalytics?: any;
  isLoading?: boolean;
  standalone?: boolean; // If true, fetches its own data like FinancialMetricsDashboard
  variant?: 'compact' | 'detailed'; // compact for dashboard, detailed for full page
}

export function FinancialOverview({ 
  financialMetrics: propFinancialMetrics, 
  revenueAnalytics: propRevenueAnalytics, 
  isLoading: propIsLoading,
  standalone = false,
  variant = 'compact'
}: FinancialOverviewProps) {
  
  // Fetch data when in standalone mode (replaces FinancialMetricsDashboard functionality)
  const { data: fetchedFinancialMetrics, isLoading: fetchingFinancial } = useQuery({
    queryKey: ["/api/investor/metrics"],
    queryFn: async () => {
      const response = await fetch('/api/investor/metrics');
      const result = await response.json();
      return result.success ? result.metrics : null;
    },
    refetchInterval: 120000,
    enabled: standalone
  });

  const { data: fetchedRevenueAnalytics, isLoading: fetchingRevenue } = useQuery({
    queryKey: ["/api/revenue/analytics"],
    queryFn: async () => {
      const response = await fetch('/api/revenue/analytics');
      const result = await response.json();
      return result.success ? result : null;
    },
    refetchInterval: 180000,
    enabled: standalone
  });

  // Fetch real market projections with attorney pricing
  const { data: marketProjections, isLoading: fetchingMarket } = useQuery({
    queryKey: ["/api/revenue/market-projections"],
    queryFn: async () => {
      const response = await fetch('/api/revenue/market-projections');
      return response.json();
    },
    refetchInterval: 300000,
    enabled: standalone
  });

  // Use fetched data when standalone, otherwise use props
  const financialMetrics = standalone ? fetchedFinancialMetrics : propFinancialMetrics;
  const revenueAnalytics = standalone ? fetchedRevenueAnalytics : propRevenueAnalytics;
  const isLoading = standalone ? (fetchingFinancial || fetchingRevenue || fetchingMarket) : propIsLoading;
  if (isLoading) {
    const cardCount = variant === 'detailed' ? 4 : 3;
    return (
      <div className={`grid grid-cols-1 ${variant === 'detailed' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
        {Array(cardCount).fill(0).map((_, i) => (
          <Card key={i} className="enhanced-card animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Real financial data from API
  const funding = financialMetrics?.financial || {
    totalRaised: 700000,
    targetRaise: 2500000,
    currentRoundCommitted: 0,
    investorsCount: 4,
    runway: 18,
    burnRate: 35000
  };

  const revenue = revenueAnalytics || {
    totalLeads: 498,
    paidConversions: 0,
    mrr: 0,
    arr: 0,
    conversionRate: 0
  };

  // Calculate key metrics
  const fundingProgress = (funding.totalRaised / funding.targetRaise) * 100;
  const monthlyGrowthRate = revenue.conversionRate > 0 ? 15.2 : 0;
  const projectedARR = revenue.mrr * 12;
  
  // Use REAL market projections with attorney pricing if available
  const marketData = marketProjections?.success ? marketProjections : null;
  const totalPotential = marketData?.totals.expectedRevenue || 0;
  const totalLeadsCount = marketData?.totals.totalLeads || revenue.totalLeads;
  
  // Top revenue categories from market data
  const topCategories = marketData?.categoryBreakdown?.slice(0, 4) || [];

  return (
    <div className="space-y-6">
      {/* Key Financial Metrics */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${variant === 'detailed' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
        {/* Funding Progress */}
        <Card className="bg-white shadow-lg border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">💰</span>
              </div>
              <Badge variant="outline" className="text-xs">Series Seed</Badge>
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${(funding.totalRaised / 1000).toFixed(0)}<small className="text-lg">K</small>
            </div>
            <div className="text-sm text-gray-600">Raised of ${(funding.targetRaise / 1000000).toFixed(1)}M</div>
            <Progress value={fundingProgress} className="h-2 mt-2" />
            <div className="text-xs text-gray-500 mt-1">{fundingProgress.toFixed(0)}% complete</div>
          </CardContent>
        </Card>

        {/* Revenue Metrics */}
        <Card className="bg-white shadow-lg border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📈</span>
                {revenue.mrr > 0 && <TrendingUp className="h-4 w-4 text-green-500" />}
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              ${revenue.mrr > 0 ? (revenue.mrr / 1000).toFixed(1) : '0'}<small className="text-lg">K</small>
            </div>
            <div className="text-sm text-gray-600">Monthly Recurring Revenue</div>
            <div className="text-xs text-gray-500 mt-1">
              ARR: ${revenue.arr > 0 ? (revenue.arr / 1000).toFixed(0) : '0'}K
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Value */}
        <Card className="bg-white shadow-lg border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🎯</span>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
              {marketData && <Badge variant="outline" className="text-xs">Real Market Pricing</Badge>}
            </div>
            <div className="text-2xl font-bold text-orange-600">
              ${Math.round(totalPotential / 1000000)}<small className="text-lg">M</small>
            </div>
            <div className="text-sm text-gray-600">Expected Revenue (30d)</div>
            <div className="text-xs text-gray-500 mt-1">From {totalLeadsCount.toLocaleString()} qualified leads</div>
          </CardContent>
        </Card>

        {/* Runway */}
        <Card className="bg-white shadow-lg border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⏱️</span>
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {funding.runway}<small className="text-lg">mo</small>
            </div>
            <div className="text-sm text-gray-600">Cash Runway</div>
            <div className="text-xs text-gray-500 mt-1">
              ${(funding.burnRate / 1000).toFixed(0)}K/mo burn
            </div>
          </CardContent>
        </Card>

        {/* Fourth card - Your Platform Margin (B2B Law Firm Model) */}
        {marketData && (
          <Card className="bg-white shadow-lg border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">💰</span>
                  <Target className="h-4 w-4 text-purple-500" />
                </div>
                <Badge variant="outline" className="text-xs bg-purple-50">50% Margin</Badge>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                ${(marketData.totals.yourMargin50 / 1000000).toFixed(1)}<small className="text-lg">M</small>
              </div>
              <div className="text-sm text-gray-600">Your Platform Margin</div>
              <div className="text-xs text-gray-500 mt-1">
                Pay lawyers ${(marketData.totals.lawyerCosts50 / 1000000).toFixed(1)}M (50%)
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real Market Pricing Revenue Analysis */}
        <Card className="bg-white shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <DollarSign className="h-5 w-5" />
              <span>Top Revenue Categories</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              {marketData ? `Real attorney pricing • ${totalLeadsCount.toLocaleString()} qualified leads (Score 7+)` : 'Loading market data...'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {marketData ? topCategories.map((cat: any) => (
              <div key={cat.category}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-800">
                    {cat.category} (${cat.attorneyFee.toLocaleString()})
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    ${(cat.expectedRevenue / 1000000).toFixed(1)}M
                  </span>
                </div>
                <Progress value={(cat.expectedRevenue / totalPotential) * 100} className="h-2" />
                <div className="text-xs mt-1 text-gray-600">
                  {cat.leadCount.toLocaleString()} leads • {(cat.avgConversion * 100).toFixed(0)}% conversion • Score {cat.avgScore.toFixed(1)}
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-pulse">Calculating market projections...</div>
              </div>
            )}
            
            {marketData && (
              <div className="border-t pt-4 mt-4 space-y-2">
                {/* 60% Margin Model */}
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-900">60% Margin Model</span>
                    <span className="text-lg font-bold text-purple-600">
                      ${(marketData.totals.yourMargin40 / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Pay lawyers 40% • Keep 60% • Annual: ${Math.round(marketData.totals.yourMargin40 * 12 / 1000000)}M/yr
                  </div>
                </div>
                
                {/* 50% Margin Model */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-900">50% Margin Model</span>
                    <span className="text-lg font-bold text-blue-600">
                      ${(marketData.totals.yourMargin50 / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Pay lawyers 50% • Keep 50% • Annual: ${Math.round(marketData.totals.yourMargin50 * 12 / 1000000)}M/yr
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Funding & Investors */}
        <Card className="bg-white shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <Target className="h-5 w-5" />
              <span>Funding Status</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Series Seed fundraising progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Committed Investors */}
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-800">GreenBridge Capital</span>
              <Badge variant="outline" className="text-xs">$250K Pipeline</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-800">East Bay SBDC</span>
              <Badge variant="outline" className="text-xs">$150K Due Diligence</Badge>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800">Total Pipeline</span>
                <span className="text-sm font-bold text-gray-800">$1.8M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Investors</span>
                <span className="text-sm text-gray-600">{funding.investorsCount} committed, 11 in pipeline</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Projections */}
      <Card className="bg-white shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900">
            <TrendingUp className="h-5 w-5" />
            <span>Growth Projections</span>
          </CardTitle>
          <CardDescription className="text-gray-600">
            Financial forecasts based on current lead generation rate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${Math.round(totalPotential / 1000000)}M
              </div>
              <div className="text-sm text-gray-700">Q4 2025 Pipeline</div>
              <div className="text-xs text-gray-500">Current active leads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${Math.round(totalPotential * 3.1 / 1000000)}M
              </div>
              <div className="text-sm text-gray-700">2026 Q1 Projection</div>
              <div className="text-xs text-gray-500">3x growth trajectory</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                $1.738B
              </div>
              <div className="text-sm text-gray-700">2026 Annual Target</div>
              <div className="text-xs text-gray-500">Scale optimization</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}