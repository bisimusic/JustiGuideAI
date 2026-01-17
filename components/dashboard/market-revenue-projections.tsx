import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Users, Target, Award } from 'lucide-react';

interface MarketProjections {
  success: boolean;
  totals: {
    totalLeads: number;
    expectedRevenue: number;
    avgLeadValue: number;
  };
  categoryBreakdown: any[]; // Empty array from API
  generatedAt: string;
}

export function MarketRevenueProjections() {
  const { data: projections, isLoading } = useQuery<MarketProjections>({
    queryKey: ["/api/revenue/market-projections"],
    queryFn: async () => {
      const response = await fetch('/api/revenue/market-projections');
      const result = await response.json();
      return result;
    },
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  if (isLoading || !projections) {
    return (
      <Card className="bg-white shadow-lg">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-4 gap-4 mt-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totals } = projections;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card data-testid="card-total-pipeline">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Pipeline Value</span>
              <Target className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              ${(totals.expectedRevenue / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {totals.totalLeads.toLocaleString()} leads (Last 30 days)
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-expected-revenue">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Average Lead Value</span>
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${totals.avgLeadValue.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Per lead expected value
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-leads">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Active Leads</span>
              <Users className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {totals.totalLeads.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              With estimated value data
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card - Simplified View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Pipeline Summary</span>
          </CardTitle>
          <CardDescription>
            Revenue metrics based on actual estimated_value data • Last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl font-bold text-green-600 mb-2">
              ${(totals.expectedRevenue / 1000000).toFixed(1)}M
            </div>
            <p className="text-lg text-gray-600 mb-4">
              Total Pipeline Value
            </p>
            <div className="grid grid-cols-2 gap-6 mt-6 max-w-md mx-auto">
              <div>
                <div className="text-2xl font-bold text-blue-600">{totals.totalLeads.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Active Leads</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">${totals.avgLeadValue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Avg Lead Value</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
