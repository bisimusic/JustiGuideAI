"use client";
import { useState } from 'react';
import Sidebar from '@/components/layout/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import InvestorDashboard from '@/app/admin/investors/page';
import AnalyticsToolsPage from '@/app/admin/analytics-tools/page';
import { TrendingUp, BarChart3, DollarSign } from 'lucide-react';

export default function RevenueAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'investor-dashboard' | 'analytics-tools'>('investor-dashboard');

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Revenue Analytics
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Track conversions, revenue metrics, and optimize for 95% conversion rates
                </p>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="investor-dashboard" className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Investor Dashboard
              </TabsTrigger>
              <TabsTrigger value="analytics-tools" className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics Tools
              </TabsTrigger>
            </TabsList>

            <TabsContent value="investor-dashboard" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Tracking & Investor Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Real-time financial metrics and operational KPIs for tracking lead-to-revenue conversion performance.
                  </p>
                </CardContent>
              </Card>
              <InvestorDashboard />
            </TabsContent>

            <TabsContent value="analytics-tools" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Analytics & Performance Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Deep-dive analytics, A/B testing, and conversion optimization tools to achieve 95% conversion rates.
                  </p>
                </CardContent>
              </Card>
              <AnalyticsToolsPage />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}