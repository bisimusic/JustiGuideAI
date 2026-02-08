"use client";
import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { WidgetGenerator } from '@/components/WidgetGenerator';
import { BlogDisplay } from '@/components/BlogDisplay';
import { CrossPromotionAnalytics } from '@/components/CrossPromotionAnalytics';
import { Link2, BarChart3, Zap, Rss } from 'lucide-react';

export default function CrossPromotionPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'widget-generator' | 'blog-display' | 'content-strategy'>('analytics');

  return (
    <AdminLayout
      title="Cross-Promotion Hub"
      subtitle="Maximize synergy between your Substack blog and lead generation platform"
    >
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#111318] border border-white/5 mb-6">
          <TabsTrigger value="analytics" className="flex items-center data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="widget-generator" className="flex items-center data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">
            <Zap className="h-4 w-4 mr-2" />
            Widget Generator
          </TabsTrigger>
          <TabsTrigger value="blog-display" className="flex items-center data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">
            <Rss className="h-4 w-4 mr-2" />
            Blog Integration
          </TabsTrigger>
          <TabsTrigger value="content-strategy" className="flex items-center data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">
            <Link2 className="h-4 w-4 mr-2" />
            Strategy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <CrossPromotionAnalytics />
          </div>
        </TabsContent>

        <TabsContent value="widget-generator" className="space-y-6">
          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f5f5f7] mb-2">Generate Promotional Widgets</h3>
            <p className="text-sm text-[#8e919a] mb-6">
              Create customizable promotional widgets to embed in your Substack blog posts. 
              These widgets will drive traffic from your blog to your lead generation platform and capture high-quality leads.
            </p>
            <WidgetGenerator />
          </div>
        </TabsContent>

        <TabsContent value="blog-display" className="space-y-6">
          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f5f5f7] mb-2">Blog Content Integration</h3>
            <p className="text-sm text-[#8e919a] mb-6">
              Display your latest Substack blog posts on your lead generation platform to keep visitors engaged 
              with your content ecosystem and drive traffic back to your blog.
            </p>
            <BlogDisplay 
              limit={6}
              layout="grid"
              title="Recent Immigration Navigator Posts"
              showCategories={true}
            />
          </div>
        </TabsContent>

        <TabsContent value="content-strategy" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#f5f5f7] mb-4">Cross-Promotion Strategy</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-[#f5f5f7] mb-2">Blog → Platform Traffic Flow</h4>
                  <ul className="text-sm text-[#8e919a] space-y-1">
                    <li>• Embed lead magnet widgets in high-performing posts</li>
                    <li>• Add platform promotion banners to newsletter content</li>
                    <li>• Create content-specific call-to-action buttons</li>
                    <li>• Use exit-intent popups for email capture</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-[#f5f5f7] mb-2">Platform → Blog Traffic Flow</h4>
                  <ul className="text-sm text-[#8e919a] space-y-1">
                    <li>• Display recent blog posts on dashboard</li>
                    <li>• Include blog links in lead magnet thank-you pages</li>
                    <li>• Add blog subscription CTAs in email sequences</li>
                    <li>• Cross-promote blog content in platform emails</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#f5f5f7] mb-4">Content Synergy Opportunities</h3>
              <div className="space-y-3">
                <div className="p-3 bg-[rgba(96,165,250,0.1)] rounded-lg border border-[rgba(96,165,250,0.2)]">
                  <p className="font-medium text-[#60a5fa] mb-1">H-1B Strategic Content</p>
                  <p className="text-xs text-[#8e919a]">Blog posts → H-1B alternatives lead magnet → Platform consultation</p>
                </div>
                <div className="p-3 bg-[rgba(167,139,250,0.1)] rounded-lg border border-[rgba(167,139,250,0.2)]">
                  <p className="font-medium text-[#a78bfa] mb-1">EB-5 Investment Content</p>
                  <p className="text-xs text-[#8e919a]">Blog analysis → Investment guide download → $25k+ client leads</p>
                </div>
                <div className="p-3 bg-[rgba(0,212,170,0.1)] rounded-lg border border-[rgba(0,212,170,0.2)]">
                  <p className="font-medium text-[#00d4aa] mb-1">Policy Update Content</p>
                  <p className="text-xs text-[#8e919a]">Newsletter updates → Email capture → Platform onboarding</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
