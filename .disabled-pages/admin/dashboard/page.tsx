"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
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
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">JustiGuide GTM Engine</h1>
              <p className="text-blue-100 mt-1">Go-to-Market Operations • AI-Powered Lead Generation • Immigration Tech Platform</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm bg-blue-500 px-2 py-1 rounded">Lead Generation</span>
                <span className="text-sm bg-green-500 px-2 py-1 rounded">{stats?.totalLeads || 0} Leads</span>
                <span className="text-sm bg-purple-500 px-2 py-1 rounded">AI-Powered</span>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex space-x-3">
              <button 
                onClick={() => refetchStats()}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
              >
                Sync Data
              </button>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm font-medium">
                Send Daily Update
              </button>
            </div>
          </div>
        </header>

        {/* Navigation Tabs - Organized to match sidebar structure */}
        <div className="bg-white border-b border-gray-200">
          <nav className="px-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>🎯</span><span>Overview</span>
              </button>
              <button
                onClick={() => setActiveTab("leads")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "leads"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>👥</span><span>Leads & Pipeline</span>
              </button>
              <button
                onClick={() => setActiveTab("ai-analysis")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "ai-analysis"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>🤖</span><span>AI Analysis</span>
              </button>
              <button
                onClick={() => setActiveTab("monitoring")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "monitoring"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>📊</span><span>Source Monitoring</span>
              </button>




            </div>
          </nav>
        </div>



        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
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
