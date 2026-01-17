"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Sidebar from "@/components/layout/sidebar";
import MonitoringStatus from "@/components/dashboard/monitoring-status";
import { PerformanceDashboard } from "@/components/monitoring/performance-dashboard";
import { OptimizationDashboard } from "@/components/database/optimization-dashboard";
import ConversionStrategyEnhanced from "@/components/conversion-strategy-enhanced";
import { IntelligentAgentControl } from "@/components/intelligent-agent-control";
import EmailIntegration from "@/components/email-integration";
import { GmailAuth } from "@/components/gmail-auth";
import { WebSocketStatus } from "@/components/settings/websocket-status";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'system' | 'integrations' | 'automation' | 'performance' | 'websocket'>('system');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => api.getDashboardStats(),
  });

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-gray-600 to-gray-800 text-white px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">System Settings</h1>
              <p className="text-gray-100 mt-1">System Health • Integrations • Automation Controls</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm bg-green-500 px-2 py-1 rounded">System Health</span>
                <span className="text-sm bg-blue-500 px-2 py-1 rounded">API Management</span>
                <span className="text-sm bg-purple-500 px-2 py-1 rounded">Database Tools</span>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <nav className="px-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab("system")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "system"
                    ? "border-gray-500 text-gray-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>⚙️</span><span>System Health</span>
              </button>
              <button
                onClick={() => setActiveTab("integrations")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "integrations"
                    ? "border-gray-500 text-gray-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>🔗</span><span>Integrations</span>
              </button>
              <button
                onClick={() => setActiveTab("automation")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "automation"
                    ? "border-gray-500 text-gray-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>🤖</span><span>Automation</span>
              </button>
              <button
                onClick={() => setActiveTab("performance")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "performance"
                    ? "border-gray-500 text-gray-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>📊</span><span>Performance</span>
              </button>
              <button
                onClick={() => setActiveTab("websocket")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "websocket"
                    ? "border-gray-500 text-gray-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>🔌</span><span>WebSocket</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {activeTab === "system" && (
            <div className="space-y-6">
              <MonitoringStatus stats={stats} />
              <OptimizationDashboard />
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="space-y-6">
              <EmailIntegration />
              <GmailAuth />
            </div>
          )}

          {activeTab === "automation" && (
            <div className="space-y-6">
              <ConversionStrategyEnhanced />
              <IntelligentAgentControl />
            </div>
          )}

          {activeTab === "performance" && (
            <div className="space-y-6">
              <PerformanceDashboard />
              <OptimizationDashboard />
            </div>
          )}

          {activeTab === "websocket" && (
            <div className="space-y-6">
              <WebSocketStatus />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}