"use client";
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Clock,
  Activity,
  MapPin,
  RefreshCw
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

interface StagePerformance {
  sequenceType: string;
  stage: number;
  totalActivities: number;
  conversions: number;
  conversionRate: number;
  avgEngagement: number;
}

interface ConversionFunnel {
  sequenceType: string;
  totalSequences: number;
  completed: number;
  converted: number;
  conversionRate: number;
}

export default function StageAnalyticsPage() {
  const { data: stageData, isLoading, refetch } = useQuery({
    queryKey: ['/api/stage-analytics'],
    queryFn: async () => {
      const response = await fetch('/api/stage-analytics');
      return response.json();
    },
  });

  return (
    <AdminLayout
      title="Stage Analytics"
      subtitle="Track conversion performance across different stages and sequences"
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
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#111318] border border-white/5 mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">Overview</TabsTrigger>
          <TabsTrigger value="stages" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">Stages</TabsTrigger>
          <TabsTrigger value="funnel" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">Funnel</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] text-[#8e919a] font-medium">Total Stages</span>
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(0,212,170,0.15)] text-[#00d4aa] flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
                {stageData?.totalStages || 0}
              </div>
            </div>
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] text-[#8e919a] font-medium">Avg Conversion</span>
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(96,165,250,0.15)] text-[#60a5fa] flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
              </div>
              <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
                {stageData?.avgConversionRate?.toFixed(1) || "0"}%
              </div>
            </div>
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] text-[#8e919a] font-medium">Total Sequences</span>
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(167,139,250,0.15)] text-[#a78bfa] flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>
              <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
                {stageData?.totalSequences || "0"}
              </div>
            </div>
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] text-[#8e919a] font-medium">Completed</span>
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(251,146,60,0.15)] text-[#fb923c] flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
                {stageData?.completedSequences || "0"}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stages" className="space-y-6">
          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f5f5f7] mb-4">Stage Performance</h3>
            <p className="text-sm text-[#8e919a]">Stage analytics content...</p>
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f5f5f7] mb-4">Conversion Funnel</h3>
            <p className="text-sm text-[#8e919a]">Funnel visualization...</p>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
