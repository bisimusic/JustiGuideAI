"use client";
import { useState } from 'react';
import Sidebar from '@/components/layout/sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ContentConverter } from '@/components/ContentConverter';
import { WidgetGenerator } from '@/components/WidgetGenerator';
import { BlogDisplay } from '@/components/BlogDisplay';
import { CrossPromotionAnalytics } from '@/components/CrossPromotionAnalytics';
import LawyerRecruitment from '@/app/admin/lawyer-recruitment/page';
import { FileText, Zap, Link2, BarChart3, Users } from 'lucide-react';

export default function ContentMarketingPage() {
  const [activeTab, setActiveTab] = useState<'converter' | 'cross-promotion' | 'analytics' | 'blog-integration' | 'lawyer-recruitment'>('converter');

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Content Strategy Hub</h1>
              <p className="text-blue-100 mt-1">Transform blog content into $25K EB-5 lead conversion machines</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm bg-blue-500 px-2 py-1 rounded">AI-Powered Conversion</span>
                <span className="text-sm bg-purple-500 px-2 py-1 rounded">Revenue Optimization</span>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <nav className="px-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab("converter")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "converter"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Converter</span>
              </button>
              <button
                onClick={() => setActiveTab("cross-promotion")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "cross-promotion"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Zap className="h-4 w-4" />
                <span>Widgets</span>
              </button>
              <button
                onClick={() => setActiveTab("blog-integration")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "blog-integration"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Link2 className="h-4 w-4" />
                <span>Blog Feed</span>
              </button>
              <button
                onClick={() => setActiveTab("lawyer-recruitment")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "lawyer-recruitment"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Partnerships</span>
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "analytics"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'converter' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-green-800 dark:text-green-200">📄 Converter</h3>
                    <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-green-700 dark:text-green-300 mb-4">Ready for conversion</p>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">Active</div>
                </div>
              </div>
              
              <div className="p-4">
                <ContentConverter />
              </div>
            </div>
          )}

          {activeTab === 'cross-promotion' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200">⚡ Widgets</h3>
                    <Zap className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <p className="text-yellow-700 dark:text-yellow-300 mb-4">Cross-promotion tools</p>
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">Active</div>
                </div>
              </div>
              
              <div className="p-4">
                <WidgetGenerator />
              </div>
            </div>
          )}

          {activeTab === 'blog-integration' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200">🔗 Blog Feed</h3>
                    <Link2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-blue-700 dark:text-blue-300 mb-4">Content integration</p>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">Active</div>
                </div>
              </div>
              
              <div className="p-4">
                <BlogDisplay />
              </div>
            </div>
          )}

          {activeTab === 'lawyer-recruitment' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-purple-800 dark:text-purple-200">👥 Partnerships</h3>
                    <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-purple-700 dark:text-purple-300 mb-4">Lawyer network</p>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">Active</div>
                </div>
              </div>
              
              <div className="p-4">
                <LawyerRecruitment />
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-red-800 dark:text-red-200">📊 Analytics</h3>
                    <BarChart3 className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-red-700 dark:text-red-300 mb-4">Performance metrics</p>
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">Active</div>
                </div>
              </div>
              
              <div className="p-4">
                <CrossPromotionAnalytics />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}