"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";
import { InvestorDashboard as InvestorDashboardComponent } from "@/components/gtm/investor-dashboard";
import { RevenueDashboard } from "@/components/gtm/revenue-dashboard";
import { FinancialOverview } from "@/components/dashboard/financial-overview";
import InvestorStrategyDashboard from "@/components/investor/investor-strategy-dashboard";
import EnhancedOutreachDashboard from "@/components/investor/enhanced-outreach-dashboard";
import StrategicEngagementDashboard from "@/components/investor/strategic-engagement-dashboard";
import LeverageDashboard from "@/components/investor/leverage-dashboard";
import CurrentInvestorOutreach from "@/components/investor/current-investor-outreach";
import LiveSuccessMetrics from "@/components/investor/live-success-metrics";
import DailyReportingDashboard from "@/components/reporting/daily-reporting-dashboard";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InvestorDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'revenue' | 'reports' | 'strategy' | 'outreach' | 'leverage' | 'live'>('overview');

  const { data: stats, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => api.getDashboardStats(),
  });

  return (
    <AdminLayout
      title="Investor Relations Dashboard"
      subtitle="Financial Metrics • Investor Updates • Growth Analytics"
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
      {/* Tabs */}
      <div className="flex gap-1 bg-[#111318] p-1 rounded-xl mb-6 w-fit">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'metrics', label: 'Live Metrics' },
          { id: 'revenue', label: 'Revenue Analytics' },
          { id: 'reports', label: 'Daily Reports' },
          { id: 'strategy', label: 'Strategy' },
          { id: 'outreach', label: 'Outreach' },
          { id: 'leverage', label: 'Leverage' },
          { id: 'live', label: 'Live Success' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-[#14161c] text-[#f5f5f7] shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                : "text-[#8e919a] hover:text-[#f5f5f7]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            <InvestorDashboardComponent />
            <FinancialOverview standalone={true} variant="compact" />
          </>
        )}
        {activeTab === 'metrics' && <LiveSuccessMetrics />}
        {activeTab === 'revenue' && <RevenueDashboard />}
        {activeTab === 'reports' && <DailyReportingDashboard />}
        {activeTab === 'strategy' && <InvestorStrategyDashboard />}
        {activeTab === 'outreach' && (
          <>
            <EnhancedOutreachDashboard />
            <CurrentInvestorOutreach />
          </>
        )}
        {activeTab === 'leverage' && <LeverageDashboard />}
        {activeTab === 'live' && <StrategicEngagementDashboard />}
      </div>
    </AdminLayout>
  );
}
