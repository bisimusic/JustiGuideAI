"use client";
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";

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

export default function N400TrackerPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'conversions' | 'pipeline' | 'analytics'>('overview');

  const { data: conversions, isLoading, refetch } = useQuery({
    queryKey: ['/api/n400/conversions'],
    queryFn: async () => {
      const response = await fetch('/api/n400/conversions');
      return response.json();
    },
  });

  return (
    <AdminLayout
      title="N-400 Tracker"
      subtitle="Track and manage N-400 naturalization leads through the conversion pipeline"
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
          <TabsTrigger value="conversions" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">Conversions</TabsTrigger>
          <TabsTrigger value="pipeline" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">Pipeline</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] text-[#8e919a] font-medium">Total Leads</span>
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(0,212,170,0.15)] text-[#00d4aa] flex items-center justify-center">
                  <span className="text-xl">📋</span>
                </div>
              </div>
              <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
                {conversions?.length || 0}
              </div>
            </div>
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] text-[#8e919a] font-medium">Active</span>
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(96,165,250,0.15)] text-[#60a5fa] flex items-center justify-center">
                  <span className="text-xl">🔄</span>
                </div>
              </div>
              <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
                {conversions?.filter((c: N400Conversion) => c.status === 'active').length || 0}
              </div>
            </div>
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] text-[#8e919a] font-medium">Converted</span>
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(167,139,250,0.15)] text-[#a78bfa] flex items-center justify-center">
                  <span className="text-xl">✅</span>
                </div>
              </div>
              <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
                {conversions?.filter((c: N400Conversion) => c.status === 'converted').length || 0}
              </div>
            </div>
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] text-[#8e919a] font-medium">Total Value</span>
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(251,146,60,0.15)] text-[#fb923c] flex items-center justify-center">
                  <span className="text-xl">💰</span>
                </div>
              </div>
              <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
                ${conversions?.reduce((sum: number, c: N400Conversion) => sum + (c.estimatedValue || 0), 0).toLocaleString() || "0"}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-6">
          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f5f5f7] mb-4">N-400 Conversions</h3>
            {isLoading ? (
              <p className="text-sm text-[#8e919a]">Loading conversions...</p>
            ) : (
              <p className="text-sm text-[#8e919a]">Conversion tracking interface...</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f5f5f7] mb-4">Conversion Pipeline</h3>
            <p className="text-sm text-[#8e919a]">Pipeline visualization...</p>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f5f5f7] mb-4">N-400 Analytics</h3>
            <p className="text-sm text-[#8e919a]">Analytics and insights...</p>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
