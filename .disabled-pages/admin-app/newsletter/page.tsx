"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Send, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  RefreshCw
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import NewsletterGenerator from "@/components/newsletter/NewsletterGenerator";

export default function NewsletterPage() {
  const { data: statsData, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/newsletter/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/newsletter/stats");
      return response.json();
    },
  });

  const stats = statsData?.stats || {};

  return (
    <AdminLayout
      title="Newsletter Management"
      subtitle="Email Campaigns • Subscriber Management • Analytics"
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
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] text-[#8e919a] font-medium">Total Subscribers</span>
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(0,212,170,0.15)] text-[#00d4aa] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
            {stats.totalSubscribers?.toLocaleString() || "0"}
          </div>
        </div>
        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] text-[#8e919a] font-medium">Campaigns Sent</span>
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(96,165,250,0.15)] text-[#60a5fa] flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
            {stats.campaignsSent?.toLocaleString() || "0"}
          </div>
        </div>
        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] text-[#8e919a] font-medium">Open Rate</span>
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(167,139,250,0.15)] text-[#a78bfa] flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
          </div>
          <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
            {stats.openRate ? `${stats.openRate}%` : "0%"}
          </div>
        </div>
        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] text-[#8e919a] font-medium">Click Rate</span>
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(251,146,60,0.15)] text-[#fb923c] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
            {stats.clickRate ? `${stats.clickRate}%` : "0%"}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="bg-[#181b22] border border-white/5 mb-6">
            <TabsTrigger value="generator" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">Newsletter Generator</TabsTrigger>
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">Campaigns</TabsTrigger>
            <TabsTrigger value="subscribers" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">Subscribers</TabsTrigger>
          </TabsList>
          <TabsContent value="generator" className="space-y-4">
            <NewsletterGenerator />
          </TabsContent>
          <TabsContent value="campaigns" className="space-y-4">
            <p className="text-[#8e919a]">Campaign management content goes here...</p>
          </TabsContent>
          <TabsContent value="subscribers" className="space-y-4">
            <p className="text-[#8e919a]">Subscriber management content goes here...</p>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
