"use client";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp, DollarSign, Users, ArrowRight } from 'lucide-react';
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

export default function ConversionFunnelPage() {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [dateRange, setDateRange] = useState('all'); // Default to "all" to show all data

  const { data: funnelData, isLoading, isError, error } = useQuery({
    queryKey: ['/api/admin/funnel', selectedPlatform, dateRange],
    queryFn: async () => {
      const response = await fetch(`/api/admin/funnel?platform=${selectedPlatform}&range=${dateRange}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Enable refetch on mount to get data
    retry: false,
    staleTime: 5 * 60 * 1000,
    throwOnError: false,
  });

  // Always use data (will be placeholder initially, then real data)
  const funnel = Array.isArray(funnelData?.funnel) ? funnelData.funnel : [];

  return (
    <AdminLayout
      title="Conversion Funnel"
      subtitle="Track leads through each stage of the conversion process"
    >
      {/* Filters */}
      <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6 mb-6">
        <div className="flex gap-4">
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-[200px] bg-[#181b22] border-white/5 text-[#f5f5f7]">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent className="bg-[#14161c] border-white/5">
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="reddit">Reddit</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[200px] bg-[#181b22] border-white/5 text-[#f5f5f7]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent className="bg-[#14161c] border-white/5">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-[#f5f5f7] mb-6">Funnel Stages</h2>
        {isLoading && funnel.length === 0 ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-[#181b22] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-red-400 mb-2">Error loading funnel data</p>
            <p className="text-sm text-[#5a5d66]">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        ) : funnel.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#8e919a] mb-2">No funnel data available</p>
            <p className="text-sm text-[#5a5d66]">Try selecting a different date range or platform</p>
          </div>
        ) : (
          <div className="space-y-4">
            {funnel.map((stage: FunnelStage, index: number) => (
              <div key={index} className="bg-[#181b22] rounded-xl p-6 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#f5f5f7]">{stage.stage}</h3>
                    <p className="text-sm text-[#8e919a]">{stage.uniqueLeads.toLocaleString()} leads</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#00d4aa] font-['JetBrains_Mono',monospace]">
                      ${stage.totalValue.toLocaleString()}
                    </div>
                    <p className="text-xs text-[#5a5d66]">Total Value</p>
                  </div>
                </div>
                <Progress value={stage.conversionRate} className="h-2 bg-[#14161c]" />
                <div className="flex justify-between mt-2 text-xs text-[#8e919a]">
                  <span>Conversion: {stage.conversionRate.toFixed(1)}%</span>
                  <span>Dropoff: {stage.dropoffRate.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
