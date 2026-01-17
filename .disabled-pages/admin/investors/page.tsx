"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Sidebar from "@/components/layout/sidebar";
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


export default function InvestorDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'revenue' | 'reports' | 'strategy' | 'outreach' | 'leverage' | 'live'>('overview');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => api.getDashboardStats(),
  });

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-green-600 to-green-800 text-white px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Investor Relations Dashboard</h1>
              <p className="text-green-100 mt-1">Financial Metrics • Investor Updates • Growth Analytics</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm bg-green-500 px-2 py-1 rounded">Financial Tracking</span>
                <span className="text-sm bg-blue-500 px-2 py-1 rounded">Revenue Analytics</span>
                <span className="text-sm bg-purple-500 px-2 py-1 rounded">Investor Reporting</span>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <nav className="px-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "overview"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>📊</span><span>Overview</span>
              </button>
              <button
                onClick={() => setActiveTab("metrics")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "metrics"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>📈</span><span>Financial Metrics</span>
              </button>
              <button
                onClick={() => setActiveTab("revenue")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "revenue"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>💰</span><span>Revenue Analytics</span>
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "reports"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>📋</span><span>Reports</span>
              </button>
              <button
                onClick={() => setActiveTab("strategy")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "strategy"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>🎯</span><span>Strategy</span>
              </button>
              <button
                onClick={() => setActiveTab("outreach")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "outreach"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>📧</span><span>Enhanced Outreach</span>
              </button>
              <button
                onClick={() => setActiveTab("leverage")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "leverage"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>🤝</span><span>Leverage Current</span>
              </button>
              <button
                onClick={() => setActiveTab("live")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "live"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>⚡</span><span>Live Metrics</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <InvestorDashboardComponent />
            </div>
          )}

          {activeTab === "metrics" && (
            <div className="space-y-6">
              <FinancialOverview standalone={true} variant="detailed" />
            </div>
          )}

          {activeTab === "revenue" && (
            <div className="space-y-6">
              <RevenueDashboard />
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-6">
              <DailyReportingDashboard />
            </div>
          )}

          {activeTab === "strategy" && (
            <div className="space-y-6">
              <InvestorStrategyDashboard />
            </div>
          )}

          {activeTab === "outreach" && (
            <div className="space-y-6">
              <StrategicEngagementDashboard />
            </div>
          )}

          {activeTab === "leverage" && (
            <div className="space-y-6">
              <CurrentInvestorOutreach />
            </div>
          )}

          {activeTab === "live" && (
            <div className="space-y-6">
              <LiveSuccessMetrics />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}