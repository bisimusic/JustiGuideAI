"use client";
import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { ContentConverter } from '@/components/ContentConverter';
import { WidgetGenerator } from '@/components/WidgetGenerator';
import { BlogDisplay } from '@/components/BlogDisplay';
import { CrossPromotionAnalytics } from '@/components/CrossPromotionAnalytics';
import LawyerRecruitment from '@/app/admin/lawyer-recruitment/page';
import { FileText, Zap, Link2, BarChart3, Users } from 'lucide-react';

export default function ContentMarketingPage() {
  const [activeTab, setActiveTab] = useState<'converter' | 'cross-promotion' | 'analytics' | 'blog-integration' | 'lawyer-recruitment'>('converter');

  return (
    <AdminLayout
      title="Content Strategy Hub"
      subtitle="Transform blog content into $25K EB-5 lead conversion machines"
    >
      {/* Tabs */}
      <div className="flex gap-1 bg-[#111318] p-1 rounded-xl mb-6 w-fit">
        {[
          { id: 'converter', label: 'Content Converter', icon: Zap },
          { id: 'cross-promotion', label: 'Cross Promotion', icon: Link2 },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'blog-integration', label: 'Blog Integration', icon: FileText },
          { id: 'lawyer-recruitment', label: 'Lawyer Recruitment', icon: Users },
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

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'converter' && (
          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <ContentConverter />
          </div>
        )}
        {activeTab === 'cross-promotion' && (
          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <WidgetGenerator />
            <div className="mt-6">
              <CrossPromotionAnalytics />
            </div>
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <CrossPromotionAnalytics />
          </div>
        )}
        {activeTab === 'blog-integration' && (
          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <BlogDisplay />
          </div>
        )}
        {activeTab === 'lawyer-recruitment' && (
          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <LawyerRecruitment />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
