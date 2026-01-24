"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Send } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import StatsGrid from "@/components/dashboard/stats-grid";
import LeadsList from "@/components/dashboard/leads-list";
import AIInsights from "@/components/dashboard/ai-insights";
import { SourceValidation } from "@/components/dashboard/source-validation";
import MonitoringStatus from "@/components/dashboard/monitoring-status";
import ConversionStrategyEnhanced from "@/components/conversion-strategy-enhanced";
import { IntelligentAgentControl } from "@/components/intelligent-agent-control";
import EmailIntegration from "@/components/email-integration";
import { GmailContactExtraction } from "@/components/gmail-contact-extraction";
import { PersonaManagement } from "@/components/persona-management";
import { GmailAuth } from "@/components/gmail-auth";
import { LeadPipeline } from "@/components/gtm/lead-pipeline";
import { InvestorDashboard } from "@/components/gtm/investor-dashboard";
import { OperationsDashboard } from "@/components/gtm/operations-dashboard";
import { RedditResponseTracker } from "@/components/conversion/reddit-response-tracker";
import { RevenueDashboard } from "@/components/gtm/revenue-dashboard";
import { MultiChannelDashboard } from "@/components/outreach/multi-channel-dashboard";
import { ComplianceDashboard } from "@/components/ai/compliance-dashboard";
import { PerformanceDashboard } from "@/components/monitoring/performance-dashboard";
import { OptimizationDashboard } from "@/components/database/optimization-dashboard";
import RealtimeUpdates from "@/components/monitoring/RealtimeUpdates";
import ImmigrationChannels from "@/components/monitoring/ImmigrationChannels";
import { FinancialOverview } from "@/components/dashboard/financial-overview";
import { ApifyIntegration } from "@/components/dashboard/apify-integration";
import { AvvoEmailMarketing } from "@/components/avvo/avvo-email-marketing";
import { TikTokN400Dashboard } from "@/components/tiktok/tiktok-n400-dashboard";
import { MetaFocusDashboard } from "@/components/meta/meta-focus-dashboard";
import InvestorStrategyDashboard from "@/components/investor/investor-strategy-dashboard";
import DailyReportingDashboard from "@/components/reporting/daily-reporting-dashboard";
import EnhancedPersonaDashboard from "@/components/persona/enhanced-persona-dashboard";
import RevenueTracker from "@/components/revenue/RevenueTracker";
import QuickActionDashboard from "@/components/solo/QuickActionDashboard";
import UniversalCampaignWorkbench from "@/components/campaigns/UniversalCampaignWorkbench";
import { MarketRevenueProjections } from "@/components/dashboard/market-revenue-projections";

import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'ai-analysis' | 'monitoring'>('overview');

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => api.getDashboardStats(),
    // Remove automatic refresh - manual control only
  });

  const { data: leads, isLoading: leadsLoading, refetch: refetchLeads } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: () => api.getLeads(), // Backend already returns all leads for filtering
    // Remove automatic refresh - manual control only
  });

  // Fetch financial metrics for dashboard overview
  const { data: financialMetrics, isLoading: financialLoading } = useQuery({
    queryKey: ["/api/investor/metrics"],
    queryFn: async () => {
      const response = await fetch('/api/investor/metrics');
      const result = await response.json();
      return result.success ? result.metrics : null;
    },
    refetchInterval: 120000 // Refresh every 2 minutes (optimized)
  });

  // Fetch revenue analytics
  const { data: revenueAnalytics } = useQuery({
    queryKey: ["/api/revenue/analytics"],
    queryFn: async () => {
      const response = await fetch('/api/revenue/analytics');
      const result = await response.json();
      return result.success ? result : null; // Fixed: return result directly, not result.analytics
    },
    refetchInterval: 300000 // Refresh every 5 minutes (optimized)
  });





  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Enterprise Grade */}
        <header className="bg-white border-b border-slate-200 shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">JustiGuide GTM Engine</h1>
                <p className="text-slate-600">Go-to-Market Operations • AI-Powered Lead Generation • Immigration Tech Platform</p>
                <div className="flex items-center space-x-3 mt-3">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Lead Generation
                  </Badge>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    {stats?.totalLeads || 0} Leads
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    AI-Powered
                  </Badge>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => refetchStats()}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Sync Data
                </Button>
                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <Send className="h-4 w-4" />
                  Send Daily Update
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs - Enterprise Grade */}
        <div className="bg-white border-b border-slate-200">
          <nav className="px-8">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-4 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === "overview"
                    ? "border-blue-600 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>🎯</span><span>Overview</span>
              </button>
              <button
                onClick={() => setActiveTab("leads")}
                className={`px-4 py-4 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === "leads"
                    ? "border-blue-600 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>👥</span><span>Leads & Pipeline</span>
              </button>
              <button
                onClick={() => setActiveTab("ai-analysis")}
                className={`px-4 py-4 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === "ai-analysis"
                    ? "border-blue-600 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>🤖</span><span>AI Analysis</span>
              </button>
              <button
                onClick={() => setActiveTab("monitoring")}
                className={`px-4 py-4 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === "monitoring"
                    ? "border-blue-600 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>📊</span><span>Source Monitoring</span>
              </button>




            </div>
          </nav>
        </div>



        {/* Dashboard Content - Enterprise Grade */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-white to-slate-50 p-8 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <StatsGrid stats={stats} isLoading={statsLoading} />
              <QuickActionDashboard />
              <UniversalCampaignWorkbench />
              <FinancialOverview 
                standalone={true}
                variant="compact"
              />
            </div>
          )}

          {activeTab === "leads" && (
            <div className="space-y-6">
              <LeadPipeline />
              <MultiChannelDashboard />
              <OperationsDashboard />
            </div>
          )}

          {activeTab === "ai-analysis" && (
            <div className="space-y-6">
              <ComplianceDashboard />
              <EnhancedPersonaDashboard />
            </div>
          )}

          {activeTab === "monitoring" && (
            <div className="space-y-6">
              <MonitoringStatus stats={stats} />
              <ApifyIntegration />
              <PerformanceDashboard />
              <ImmigrationChannels />
              <RedditResponseTracker />
              <OptimizationDashboard />
            </div>
          )}








        </div>
      </main>
    </div>
  );
}
