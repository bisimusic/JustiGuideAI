"use client";
import { useState } from 'react';
import Sidebar from '@/components/layout/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { WidgetGenerator } from '@/components/WidgetGenerator';
import { BlogDisplay } from '@/components/BlogDisplay';
import { CrossPromotionAnalytics } from '@/components/CrossPromotionAnalytics';
import { Link2, BarChart3, Zap, Rss } from 'lucide-react';

export default function CrossPromotionPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'widget-generator' | 'blog-display' | 'content-strategy'>('analytics');

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <Link2 className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Cross-Promotion Hub
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Maximize synergy between your Substack blog and lead generation platform
                </p>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analytics" className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="widget-generator" className="flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Widget Generator
              </TabsTrigger>
              <TabsTrigger value="blog-display" className="flex items-center">
                <Rss className="h-4 w-4 mr-2" />
                Blog Integration
              </TabsTrigger>
              <TabsTrigger value="content-strategy" className="flex items-center">
                <Link2 className="h-4 w-4 mr-2" />
                Strategy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6 mt-6">
              <CrossPromotionAnalytics />
            </TabsContent>

            <TabsContent value="widget-generator" className="space-y-6 mt-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Generate Promotional Widgets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Create customizable promotional widgets to embed in your Substack blog posts. 
                      These widgets will drive traffic from your blog to your lead generation platform and capture high-quality leads.
                    </p>
                  </CardContent>
                </Card>
                <WidgetGenerator />
              </div>
            </TabsContent>

            <TabsContent value="blog-display" className="space-y-6 mt-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Blog Content Integration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Display your latest Substack blog posts on your lead generation platform to keep visitors engaged 
                      with your content ecosystem and drive traffic back to your blog.
                    </p>
                  </CardContent>
                </Card>
                <BlogDisplay 
                  limit={6}
                  layout="grid"
                  title="Recent Immigration Navigator Posts"
                  showCategories={true}
                />
              </div>
            </TabsContent>

            <TabsContent value="content-strategy" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cross-Promotion Strategy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Blog → Platform Traffic Flow
                      </h3>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Embed lead magnet widgets in high-performing posts</li>
                        <li>• Add platform promotion banners to newsletter content</li>
                        <li>• Create content-specific call-to-action buttons</li>
                        <li>• Use exit-intent popups for email capture</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Platform → Blog Traffic Flow
                      </h3>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Display recent blog posts on dashboard</li>
                        <li>• Include blog links in lead magnet thank-you pages</li>
                        <li>• Add blog subscription CTAs in email sequences</li>
                        <li>• Cross-promote blog content in platform emails</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Content Synergy Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        High-Value Content Matches
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                          <p className="font-medium text-blue-900 dark:text-blue-100">H-1B Strategic Content</p>
                          <p className="text-blue-700 dark:text-blue-300">Blog posts → H-1B alternatives lead magnet → Platform consultation</p>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                          <p className="font-medium text-purple-900 dark:text-purple-100">EB-5 Investment Content</p>
                          <p className="text-purple-700 dark:text-purple-300">Blog analysis → Investment guide download → $25k+ client leads</p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                          <p className="font-medium text-green-900 dark:text-green-100">Policy Update Content</p>
                          <p className="text-green-700 dark:text-green-300">Newsletter updates → Email capture → Platform onboarding</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Implementation Roadmap</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                        <div className="w-8 h-8 bg-orange-200 dark:bg-orange-800 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-orange-700 dark:text-orange-300 font-bold">1</span>
                        </div>
                        <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Setup Phase</h3>
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                          Generate promotional widgets and add to high-traffic blog posts
                        </p>
                      </div>
                      
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="w-8 h-8 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-blue-700 dark:text-blue-300 font-bold">2</span>
                        </div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Integration Phase</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Display blog content on platform and sync email lists
                        </p>
                      </div>
                      
                      <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="w-8 h-8 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-green-700 dark:text-green-300 font-bold">3</span>
                        </div>
                        <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Optimization Phase</h3>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Monitor analytics and optimize based on conversion data
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}