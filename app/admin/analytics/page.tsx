"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from '@/components/admin/AdminLayout';
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
import { api } from "@/lib/api";

interface AnalyticsInsights {
  bestConvertingContent: Array<{
    template: string;
    conversionRate: number;
    usageCount: number;
  }>;
  peakEngagementTimes: Array<{
    hour: number;
    engagement: number;
  }>;
  platformPerformance: Array<{
    platform: string;
    leads: number;
    conversions: number;
    revenue: number;
  }>;
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'conversion' | 'engagement' | 'revenue'>('overview');

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => api.getDashboardStats(),
  });

  return (
    <AdminLayout
      title="Analytics Dashboard"
      subtitle="Comprehensive insights into lead generation and conversion performance"
      headerActions={
        <Button 
          onClick={() => refetch()}
          className="flex items-center gap-2 px-5 py-3 rounded-[10px] text-sm font-semibold bg-[#181b22] text-[#f5f5f7] border border-white/10 hover:bg-[#1a1d25] hover:border-white/15 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      }
    >
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#111318] border border-white/5 mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">Overview</TabsTrigger>
          <TabsTrigger value="conversion" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">Conversion</TabsTrigger>
          <TabsTrigger value="engagement" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">Engagement</TabsTrigger>
          <TabsTrigger value="revenue" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] text-[#8e919a] font-medium">Total Leads</span>
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(0,212,170,0.15)] text-[#00d4aa] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
                {stats?.totalLeads?.toLocaleString() || "0"}
              </div>
            </div>
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] text-[#8e919a] font-medium">Conversion Rate</span>
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(96,165,250,0.15)] text-[#60a5fa] flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
              </div>
              <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
                {stats?.conversionRate?.toFixed(1) || "0"}%
              </div>
            </div>
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] text-[#8e919a] font-medium">Total Responses</span>
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(167,139,250,0.15)] text-[#a78bfa] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
              </div>
              <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
                {stats?.totalResponses?.toLocaleString() || "0"}
              </div>
            </div>
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] text-[#8e919a] font-medium">AI Score</span>
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(251,146,60,0.15)] text-[#fb923c] flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
              </div>
              <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
                {stats?.avgAiScore?.toFixed(1) || "0"}
              </div>
            </div>
          </div>
          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f5f5f7] mb-4">Analytics Overview</h3>
            <p className="text-sm text-[#8e919a]">Detailed analytics content will be displayed here...</p>
          </div>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f5f5f7] mb-4">Conversion Analytics</h3>
            <p className="text-sm text-[#8e919a]">Conversion metrics and insights...</p>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f5f5f7] mb-4">Engagement Analytics</h3>
            <p className="text-sm text-[#8e919a]">Engagement metrics and insights...</p>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f5f5f7] mb-4">Revenue Analytics</h3>
            <p className="text-sm text-[#8e919a]">Revenue metrics and insights...</p>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
