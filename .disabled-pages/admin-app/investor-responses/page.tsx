"use client";
import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw } from "lucide-react";

interface FollowUpStats {
  total: number;
  responded: number;
  pending: number;
  responseRate: string;
  bySequence: {
    initial: number;
    first: number;
    second: number;
    final: number;
  };
}

export default function InvestorResponseDashboard() {
  const [stats, setStats] = useState<FollowUpStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/investor/follow-up-stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminLayout
      title="Investor Response Tracking"
      subtitle="Monitor investor follow-up responses and engagement rates"
      headerActions={
        <Button 
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 rounded-[10px] text-sm font-semibold bg-[#181b22] text-[#f5f5f7] border border-white/10 hover:bg-[#1a1d25] hover:border-white/15 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] text-[#8e919a] font-medium">Total Follow-ups</span>
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(0,212,170,0.15)] text-[#00d4aa] flex items-center justify-center">
              <span className="text-xl">📧</span>
            </div>
          </div>
          <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
            {stats?.total || 0}
          </div>
        </div>
        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] text-[#8e919a] font-medium">Responded</span>
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(96,165,250,0.15)] text-[#60a5fa] flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
          </div>
          <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
            {stats?.responded || 0}
          </div>
        </div>
        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] text-[#8e919a] font-medium">Pending</span>
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(251,146,60,0.15)] text-[#fb923c] flex items-center justify-center">
              <span className="text-xl">⏳</span>
            </div>
          </div>
          <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
            {stats?.pending || 0}
          </div>
        </div>
        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] text-[#8e919a] font-medium">Response Rate</span>
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(167,139,250,0.15)] text-[#a78bfa] flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
          </div>
          <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
            {stats?.responseRate || "0%"}
          </div>
        </div>
      </div>

      {/* Sequence Breakdown */}
      <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-[#f5f5f7] mb-4">Response by Sequence</h3>
        {loading ? (
          <p className="text-sm text-[#8e919a]">Loading stats...</p>
        ) : stats ? (
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(stats.bySequence).map(([sequence, count]) => (
              <div key={sequence} className="bg-[#181b22] border border-white/5 rounded-xl p-4">
                <div className="text-sm text-[#8e919a] mb-2 capitalize">{sequence}</div>
                <div className="text-2xl font-bold text-[#f5f5f7] font-['JetBrains_Mono',monospace]">{count}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#8e919a]">No data available</p>
        )}
      </div>
    </AdminLayout>
  );
}
