"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { RefreshCw, Send, Users, Shield, Brain, Clock, TrendingUp, Zap, FileText, Mail, Gift, Target, BarChart3, Activity, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Dashboard() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'ai-analysis' | 'monitoring'>('overview');

  const { data: stats, isLoading: statsLoading, refetch: refetchStats, error: statsError } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('📊 Dashboard stats fetched:', data); // Debug log
      return data;
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    throwOnError: false,
    // Use placeholderData instead of initialData to allow data to update
    placeholderData: {
      totalLeads: 0,
      dailyLeads: 0,
      totalResponses: 0,
      leadsWithResponses: 0,
      conversionRate: 0,
      avgAiScore: 0,
      validatedSourcesPercentage: 0,
      platformBreakdown: {},
    },
  });

  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: async () => {
      const response = await fetch("/api/leads?limit=100&offset=0");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    throwOnError: false,
    placeholderData: [],
  });

  const { data: priorityActionsData, isLoading: priorityLoading } = useQuery({
    queryKey: ["/api/dashboard/priority-actions"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/priority-actions");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    throwOnError: false,
    placeholderData: { actions: [] },
  });

  const { data: segmentationData, isLoading: segmentationLoading } = useQuery({
    queryKey: ["/api/dashboard/lead-segmentation"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/lead-segmentation");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    throwOnError: false,
    placeholderData: { segments: [] },
  });

  const { data: weeklyTrendData, isLoading: weeklyTrendLoading } = useQuery({
    queryKey: ["/api/dashboard/weekly-trend"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/weekly-trend");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    throwOnError: false,
    placeholderData: { total: 0, change: 0, chartData: [] },
  });

  const { data: liveActivityData, isLoading: liveActivityLoading } = useQuery({
    queryKey: ["/api/dashboard/live-activity"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/live-activity");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds for live data
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 1,
    staleTime: 0,
    gcTime: 2 * 60 * 1000,
    throwOnError: false,
    placeholderData: { activities: [] }, // Use activities (not activity) to match API response
  });

  // Use stats data or defaults if loading/error
  const totalLeads = stats?.totalLeads ?? 0;
  const validatedPercentage = stats?.validatedSourcesPercentage ?? 0;
  const avgAiScore = stats?.avgAiScore ?? 0;
  const conversionRate = stats?.conversionRate ?? 0;
  
  // Show loading only when actively loading and we don't have real data yet
  // Check if we have real data (not just placeholder 0s)
  // With placeholderData, stats will exist but might be placeholder, so check values
  const hasRealData = stats && (
    (typeof stats.totalLeads === 'number' && stats.totalLeads > 0) || 
    (typeof stats.avgAiScore === 'number' && stats.avgAiScore > 0) || 
    (typeof stats.validatedSourcesPercentage === 'number' && stats.validatedSourcesPercentage > 0)
  );
  // Only show "..." if loading AND we don't have real data yet (first load)
  // Once we have real data, always show it even if refetching
  const isStatsLoading = statsLoading && !hasRealData && !statsError;
  
  // Debug: Log to console to verify data is loading (only in browser)
  if (typeof window !== 'undefined' && stats) {
    console.log('📊 Dashboard Stats:', {
      totalLeads: stats.totalLeads,
      avgAiScore: stats.avgAiScore,
      validatedSourcesPercentage: stats.validatedSourcesPercentage,
      hasRealData,
      isStatsLoading,
      statsLoading
    });
  }

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-[#f5f5f7] font-['DM_Sans',sans-serif]">
      {/* Animated background gradient */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% -20%, rgba(0, 212, 170, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(167, 139, 250, 0.06) 0%, transparent 50%)
          `
        }}
      />

      <div className="flex min-h-screen relative z-10">
        {/* Sidebar */}
        <aside className="w-[260px] bg-[#111318] border-r border-white/5 flex flex-col fixed h-screen z-50">
          {/* Logo Section */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00d4aa] to-[#00b894] rounded-[10px] flex items-center justify-center font-['Fraunces',serif] font-bold text-lg text-[#0a0b0d]">
                J
              </div>
              <div className="flex flex-col">
                <span className="font-['Fraunces',serif] font-semibold text-lg text-[#f5f5f7] tracking-tight">JustiGuide</span>
                <span className="text-[11px] text-[#5a5d66] uppercase tracking-wide">GTM Engine</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="mb-6">
              <div className="text-[10px] font-semibold text-[#5a5d66] uppercase tracking-wider px-3 py-2">Overview</div>
              <Link href="/admin/dashboard" className={`flex items-center gap-3 px-3.5 py-3 rounded-[10px] text-sm font-medium transition-all relative ${
                pathname === "/admin/dashboard" 
                  ? "bg-[rgba(0,212,170,0.15)] text-[#00d4aa]" 
                  : "text-[#8e919a] hover:bg-[#181b22] hover:text-[#f5f5f7]"
              }`}>
                {pathname === "/admin/dashboard" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#00d4aa] rounded-r" />
                )}
                <BarChart3 className="w-5 h-5 opacity-70" />
                Dashboard
              </Link>
              <Link href="/admin/leads" className={`flex items-center gap-3 px-3.5 py-3 rounded-[10px] text-sm font-medium transition-all relative ${
                pathname === "/admin/leads" 
                  ? "bg-[rgba(0,212,170,0.15)] text-[#00d4aa]" 
                  : "text-[#8e919a] hover:bg-[#181b22] hover:text-[#f5f5f7]"
              }`}>
                {pathname === "/admin/leads" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#00d4aa] rounded-r" />
                )}
                <Users className="w-5 h-5 opacity-70" />
                Lead Management
                <span className="ml-auto bg-[#00d4aa] text-[#0a0b0d] text-[11px] font-bold px-2 py-0.5 rounded-full font-['JetBrains_Mono',monospace]">
                  {totalLeads.toLocaleString()}
                </span>
              </Link>
            </div>

            <div className="mb-6">
              <div className="text-[10px] font-semibold text-[#5a5d66] uppercase tracking-wider px-3 py-2">Optimization</div>
              <Link href="/admin/conversion-funnel" className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] text-sm font-medium text-[#8e919a] hover:bg-[#181b22] hover:text-[#f5f5f7] transition-all">
                <Zap className="w-5 h-5 opacity-70" />
                Conversion Funnel
              </Link>
              <Link href="/admin/conversion-optimization" className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] text-sm font-medium text-[#8e919a] hover:bg-[#181b22] hover:text-[#f5f5f7] transition-all">
                <Target className="w-5 h-5 opacity-70" />
                Conversion Optimization
              </Link>
              <Link href="/admin/content-strategy" className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] text-sm font-medium text-[#8e919a] hover:bg-[#181b22] hover:text-[#f5f5f7] transition-all">
                <FileText className="w-5 h-5 opacity-70" />
                Content Strategy
              </Link>
            </div>

            <div className="mb-6">
              <div className="text-[10px] font-semibold text-[#5a5d66] uppercase tracking-wider px-3 py-2">Engage</div>
              <Link href="/admin/contacts" className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] text-sm font-medium text-[#8e919a] hover:bg-[#181b22] hover:text-[#f5f5f7] transition-all">
                <Users className="w-5 h-5 opacity-70" />
                Contacts
              </Link>
              <Link href="/admin/newsletter" className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] text-sm font-medium text-[#8e919a] hover:bg-[#181b22] hover:text-[#f5f5f7] transition-all">
                <Mail className="w-5 h-5 opacity-70" />
                Newsletter
              </Link>
              <Link href="/admin/referrals" className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] text-sm font-medium text-[#8e919a] hover:bg-[#181b22] hover:text-[#f5f5f7] transition-all">
                <Gift className="w-5 h-5 opacity-70" />
                Referral Program
              </Link>
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#fb923c] to-[#f97316] flex items-center justify-center font-semibold text-sm">
              BO
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-[#f5f5f7]">Bisi Obateru</div>
              <div className="text-xs text-[#5a5d66]">Founder & CEO</div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-[260px] p-8">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex flex-col gap-2">
                <h1 className="font-['Fraunces',serif] text-[32px] font-semibold tracking-tight text-[#f5f5f7]">Command Center</h1>
                <p className="text-sm text-[#8e919a]">AI-Powered Lead Generation • Immigration Tech Platform</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[rgba(0,212,170,0.15)] text-[#00d4aa] border border-[rgba(0,212,170,0.3)]">
                    {totalLeads.toLocaleString()} Leads
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#181b22] text-[#8e919a] border border-white/5">
                    AI-Powered
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#181b22] text-[#8e919a] border border-white/5">
                    180+ Countries
                  </span>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <button 
                  onClick={() => refetchStats()}
                  className="flex items-center gap-2 px-5 py-3 rounded-[10px] text-sm font-semibold bg-[#181b22] text-[#f5f5f7] border border-white/10 hover:bg-[#1a1d25] hover:border-white/15 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Sync Data
                </button>
                <button className="flex items-center gap-2 px-5 py-3 rounded-[10px] text-sm font-semibold bg-gradient-to-br from-[#00d4aa] to-[#00b894] text-[#0a0b0d] hover:shadow-[0_8px_24px_rgba(0,212,170,0.15)] hover:-translate-y-0.5 transition-all">
                  <Send className="w-4 h-4" />
                  Send Daily Update
                </button>
              </div>
            </div>
          </header>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#111318] p-1 rounded-xl mb-6 w-fit">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'leads', label: 'Leads & Pipeline', icon: Users },
              { id: 'ai-analysis', label: 'AI Analysis', icon: Brain },
              { id: 'monitoring', label: 'Source Monitoring', icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-[#14161c] text-[#f5f5f7] shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                    : "text-[#8e919a] hover:text-[#f5f5f7]"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* Total Leads */}
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6 relative overflow-hidden transition-all hover:border-white/10 hover:-translate-y-0.5 group">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00d4aa] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] text-[#8e919a] font-medium">Total Leads</span>
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(0,212,170,0.15)] text-[#00d4aa] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
                {isStatsLoading ? "..." : totalLeads.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 text-[13px] text-[#00d4aa]">
                <TrendingUp className="w-3.5 h-3.5" />
                +126% <span className="text-[#5a5d66]">week-over-week</span>
              </div>
            </div>

            {/* Validated Sources */}
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6 relative overflow-hidden transition-all hover:border-white/10 hover:-translate-y-0.5 group">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00d4aa] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] text-[#8e919a] font-medium">Validated Sources</span>
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(167,139,250,0.15)] text-[#a78bfa] flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
              </div>
              <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
                {isStatsLoading ? "..." : `${validatedPercentage.toFixed(1)}%`}
              </div>
              <div className="flex items-center gap-1.5 text-[13px] text-[#00d4aa]">
                <TrendingUp className="w-3.5 h-3.5" />
                99.2% <span className="text-[#5a5d66]">validation accuracy</span>
              </div>
            </div>

            {/* AI Score */}
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6 relative overflow-hidden transition-all hover:border-white/10 hover:-translate-y-0.5 group">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00d4aa] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] text-[#8e919a] font-medium">AI Score</span>
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(96,165,250,0.15)] text-[#60a5fa] flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
              </div>
              <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
                {isStatsLoading ? "..." : avgAiScore.toFixed(1)}
              </div>
              <div className="flex items-center gap-1.5 text-[13px] text-[#00d4aa]">
                <TrendingUp className="w-3.5 h-3.5" />
                6.2/10 <span className="text-[#5a5d66]">average lead quality</span>
              </div>
            </div>

            {/* Active Monitoring */}
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6 relative overflow-hidden transition-all hover:border-white/10 hover:-translate-y-0.5 group">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00d4aa] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] text-[#8e919a] font-medium">Active Monitoring</span>
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(251,146,60,0.15)] text-[#fb923c] flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
                24/7
              </div>
              <div className="flex items-center gap-1.5 text-[13px] text-[#00d4aa]">
                <TrendingUp className="w-3.5 h-3.5" />
                878K <span className="text-[#5a5d66]">AI responses generated</span>
              </div>
            </div>
          </div>

          {/* Main Grid - Priority Actions & Lead Segments */}
          <div className="grid grid-cols-[2fr_1fr] gap-6 mb-6">
            {/* Priority Conversion Actions */}
            <div className="bg-[#14161c] border border-white/5 rounded-2xl overflow-hidden">
              <div className="flex justify-between items-center p-5 border-b border-white/5">
                <span className="text-base font-semibold text-[#f5f5f7] flex items-center gap-2.5">
                  <Zap className="w-6 h-6 text-[#00d4aa]" />
                  Priority Conversion Actions
                </span>
                <span className="text-[13px] text-[#00d4aa] cursor-pointer font-medium">View All →</span>
              </div>
              <div className="p-6">
                {priorityLoading && !priorityActionsData?.actions ? (
                  <div className="text-center py-8 text-[#8e919a]">Loading priority actions...</div>
                ) : (priorityActionsData?.actions || []).length === 0 ? (
                  <div className="text-center py-8 text-[#8e919a]">No priority actions available</div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {(priorityActionsData?.actions || []).slice(0, 5).map((action: any, i: number) => (
                      <div key={action.id || i} className="flex items-center gap-4 p-4 bg-[#181b22] rounded-xl border border-transparent hover:border-white/10 hover:bg-[#1a1d25] transition-all cursor-pointer">
                        <div className={`w-2 h-2 rounded-full ${
                          action.priority === 'high' ? 'bg-[#ff6b6b] shadow-[0_0_12px_rgba(255,107,107,0.5)]' :
                          action.priority === 'medium' ? 'bg-[#ffc53d] shadow-[0_0_12px_rgba(255,197,61,0.5)]' :
                          'bg-[#00d4aa] shadow-[0_0_12px_rgba(0,212,170,0.5)]'
                        }`} />
                        <div className="flex-1">
                          <div className="font-semibold text-sm mb-1">{action.title}</div>
                          <div className="text-xs text-[#5a5d66]">{action.meta}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-['JetBrains_Mono',monospace] text-base font-semibold text-[#00d4aa]">{action.amount}</div>
                          <div className="text-xs text-[#5a5d66]">{action.prob} probability</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Lead Segmentation */}
            <div className="bg-[#14161c] border border-white/5 rounded-2xl overflow-hidden">
              <div className="flex justify-between items-center p-5 border-b border-white/5">
                <span className="text-base font-semibold text-[#f5f5f7] flex items-center gap-2.5">
                  <Target className="w-6 h-6 text-[#00d4aa]" />
                  Lead Segmentation
                </span>
              </div>
              <div className="p-6">
                <div className="flex flex-col gap-4">
                  {segmentationLoading && !segmentationData?.segments ? (
                    <div className="text-center py-8 text-[#8e919a]">Loading segmentation...</div>
                  ) : (segmentationData?.segments || []).length === 0 ? (
                    <div className="text-center py-8 text-[#8e919a]">No segmentation data available</div>
                  ) : (
                    (segmentationData?.segments || []).map((segment: any, i: number) => (
                    <div key={i}>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-11 h-11 rounded-[10px] flex items-center justify-center text-xl" style={{ background: `rgba(${segment.color === '#00d4aa' ? '0,212,170' : segment.color === '#a78bfa' ? '167,139,250' : segment.color === '#60a5fa' ? '96,165,250' : '251,146,60'}, 0.15)` }}>
                          {segment.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm mb-1">{segment.name}</div>
                          <div className="text-xs text-[#5a5d66]">{segment.count}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-['JetBrains_Mono',monospace] text-sm font-semibold mb-0.5">{segment.revenue}</div>
                          <div className="text-[11px] text-[#00d4aa]">{segment.growth}</div>
                        </div>
                      </div>
                      <div className="w-full h-1 bg-[#181b22] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: segment.width, background: segment.color }} />
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* Response Rate */}
            <div className="bg-[#14161c] border border-white/5 rounded-2xl overflow-hidden">
              <div className="flex justify-between items-center p-5 border-b border-white/5">
                <span className="text-base font-semibold text-[#f5f5f7]">Response Rate</span>
                <span className="text-[13px] text-[#8e919a] cursor-pointer">7 days</span>
              </div>
              <div className="p-6">
                <div className="flex justify-center items-center py-5">
                  <div className="relative w-[120px] h-[120px]">
                    <svg className="rotate-[-90deg]" width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" fill="none" stroke="#181b22" strokeWidth="8" />
                      <circle 
                        cx="60" cy="60" r="54" 
                        fill="none" 
                        stroke="#00d4aa" 
                        strokeWidth="8" 
                        strokeLinecap="round"
                        strokeDasharray="339.292"
                        strokeDashoffset="67.858"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <div className="font-['JetBrains_Mono',monospace] text-[28px] font-semibold">{conversionRate.toFixed(0)}%</div>
                      <div className="text-[11px] text-[#5a5d66]">Response</div>
                    </div>
                  </div>
                </div>
                <div className="text-center text-[#5a5d66] text-[13px] mt-2">
                  vs industry avg 4+ hours
                </div>
              </div>
            </div>

            {/* Weekly Trend */}
            <div className="bg-[#14161c] border border-white/5 rounded-2xl overflow-hidden">
              <div className="flex justify-between items-center p-5 border-b border-white/5">
                <span className="text-base font-semibold text-[#f5f5f7]">Weekly Lead Trend</span>
                <span className="text-[13px] text-[#8e919a] cursor-pointer">This week</span>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-['JetBrains_Mono',monospace] text-[28px] font-semibold">
                    {weeklyTrendLoading && !weeklyTrendData ? '...' : `+${(weeklyTrendData?.total || 0).toLocaleString()}`}
                  </span>
                  <span className="text-[#00d4aa] text-[13px]">
                    {(weeklyTrendData?.change || 0) > 0 ? '+' : ''}
                    {weeklyTrendData ? `${weeklyTrendData.change.toFixed(0)}%` : '0%'} vs last week
                  </span>
                </div>
                <div className="h-[60px] flex items-end gap-1 mt-4">
                  {(weeklyTrendData?.chartData || [
                    { day: 'Mon', height: 10 },
                    { day: 'Tue', height: 10 },
                    { day: 'Wed', height: 10 },
                    { day: 'Thu', height: 10 },
                    { day: 'Fri', height: 10 },
                    { day: 'Sat', height: 10 },
                    { day: 'Sun', height: 10 },
                  ]).map((dayData: any, i: number) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-[#00d4aa] rounded-t transition-all duration-300 hover:opacity-100"
                      style={{ height: `${dayData.height}%`, opacity: i === 6 ? 1 : 0.3 }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[11px] text-[#5a5d66]">
                  {(weeklyTrendData?.chartData || [
                    { day: 'Mon' },
                    { day: 'Tue' },
                    { day: 'Wed' },
                    { day: 'Thu' },
                    { day: 'Fri' },
                    { day: 'Sat' },
                    { day: 'Sun' },
                  ]).map((dayData: any) => (
                    <span key={dayData.day}>{dayData.day}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Activity */}
            <div className="bg-[#14161c] border border-white/5 rounded-2xl overflow-hidden">
              <div className="flex justify-between items-center p-5 border-b border-white/5">
                <span className="text-base font-semibold text-[#f5f5f7]">Live Activity</span>
                <div className="flex items-center gap-2 text-xs text-[#00d4aa]">
                  <div className="w-2 h-2 bg-[#00d4aa] rounded-full animate-pulse" />
                  Live
                </div>
              </div>
              <div className="p-4 max-h-[280px] overflow-y-auto">
                {liveActivityLoading && !liveActivityData?.activities ? (
                  <div className="text-center py-8 text-[#8e919a]">Loading activity...</div>
                ) : (liveActivityData?.activities || []).length === 0 ? (
                  <div className="text-center py-8 text-[#8e919a]">No recent activity</div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {(liveActivityData?.activities || []).map((feed: any, i: number) => (
                      <div key={feed.timestamp || i} className="flex items-start gap-3 p-3 bg-[#181b22] rounded-[10px] animate-[fadeIn_0.3s_ease]">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${
                          feed.type === 'new-lead' ? 'bg-[#00d4aa]' :
                          feed.type === 'response' ? 'bg-[#60a5fa]' :
                          'bg-[#a78bfa]'
                        }`} />
                        <div className="flex-1">
                          <div className="text-[13px] leading-relaxed mb-1">{feed.text}</div>
                          <div className="text-[11px] text-[#5a5d66]">{feed.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(0, 212, 170, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(0, 212, 170, 0);
          }
        }
        .animate-pulse {
          animation: pulse 2s infinite;
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.15);
        }
      `}</style>
    </div>
  );
}
