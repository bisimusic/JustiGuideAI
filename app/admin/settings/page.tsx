"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";
import MonitoringStatus from "@/components/dashboard/monitoring-status";
import { PerformanceDashboard } from "@/components/monitoring/performance-dashboard";
import { OptimizationDashboard } from "@/components/database/optimization-dashboard";
import ConversionStrategyEnhanced from "@/components/conversion-strategy-enhanced";
import { IntelligentAgentControl } from "@/components/intelligent-agent-control";
import EmailIntegration from "@/components/email-integration";
import { GmailAuth } from "@/components/gmail-auth";
import { WebSocketStatus } from "@/components/settings/websocket-status";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'system' | 'integrations' | 'automation' | 'performance' | 'websocket'>('system');

  const { data: stats, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => api.getDashboardStats(),
  });

  return (
    <AdminLayout
      title="System Settings"
      subtitle="System Health • Integrations • Automation Controls"
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
          { id: 'system', label: 'System Health' },
          { id: 'integrations', label: 'Integrations' },
          { id: 'automation', label: 'Automation' },
          { id: 'performance', label: 'Performance' },
          { id: 'websocket', label: 'WebSocket' },
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
        {activeTab === "system" && (
          <>
            <MonitoringStatus stats={stats} />
            <OptimizationDashboard />
          </>
        )}

        {activeTab === "integrations" && (
          <>
            <EmailIntegration />
            <GmailAuth />
          </>
        )}

        {activeTab === "automation" && (
          <>
            <ConversionStrategyEnhanced />
            <IntelligentAgentControl />
          </>
        )}

        {activeTab === "performance" && (
          <>
            <PerformanceDashboard />
            <OptimizationDashboard />
          </>
        )}

        {activeTab === "websocket" && (
          <WebSocketStatus />
        )}
      </div>
    </AdminLayout>
  );
}
