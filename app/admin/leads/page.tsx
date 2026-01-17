"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Sidebar from "@/components/layout/sidebar";
import LeadsList from "@/components/dashboard/leads-list";
import { SourceValidation } from "@/components/dashboard/source-validation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Users, Globe, MessageSquare } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LeadWithUrgency {
  id: string;
  title: string;
  content: string;
  sourcePlatform: string;
  sourceUrl: string;
  authorUsername: string;
  discoveredAt: string;
  aiScore: number;
  urgencyLevel?: string;
}

export default function LeadsPage() {
  const [activeView, setActiveView] = useState<'list' | 'kanban'>('list');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');

  const { data: leads, isLoading } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: () => api.getLeads(),
  });

  // Add urgencyLevel to leads based on aiScore if not present
  const enrichedLeads = leads?.map((lead: any) => ({
    ...lead,
    urgencyLevel: lead.urgencyLevel || (
      lead.aiScore >= 8 ? 'high' : 
      lead.aiScore >= 6 ? 'medium' : 
      'low'
    )
  })) as LeadWithUrgency[];

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => api.getDashboardStats(),
  });

  // Filter leads based on search and filters
  const filteredLeads = enrichedLeads?.filter((lead: LeadWithUrgency) => {
    const matchesKeyword = searchKeyword === '' || 
      lead.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      lead.content.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      lead.authorUsername.toLowerCase().includes(searchKeyword.toLowerCase());
    
    const matchesPlatform = selectedPlatform === 'all' || lead.sourcePlatform === selectedPlatform;
    const matchesUrgency = selectedUrgency === 'all' || lead.urgencyLevel === selectedUrgency;
    
    return matchesKeyword && matchesPlatform && matchesUrgency;
  }) || [];

  // Define all tracked platforms (from replit.md)
  const trackedPlatforms = [
    'reddit',
    'linkedin', 
    'facebook',
    'instagram',
    'twitter',
    'discord',
    'whatsapp',
    'directories',
    'quora',
    'tiktok',
    'uploaded'
  ];

  // Get platforms from actual leads and merge with tracked platforms
  const leadsFromPlatforms = Array.from(new Set(enrichedLeads?.map((lead: LeadWithUrgency) => lead.sourcePlatform) || []));
  const allPlatforms = Array.from(new Set([...trackedPlatforms, ...leadsFromPlatforms]));
  
  const platformCounts = allPlatforms.reduce((acc, platform) => {
    acc[platform] = enrichedLeads?.filter((lead: LeadWithUrgency) => lead.sourcePlatform === platform).length || 0;
    return acc;
  }, {} as Record<string, number>);

  // Separate platforms with leads vs tracked platforms with no leads
  const platformsWithLeads = allPlatforms.filter(platform => platformCounts[platform] > 0);
  const trackedPlatformsNoLeads = trackedPlatforms.filter(platform => platformCounts[platform] === 0);

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'reddit': return '🟠';
      case 'linkedin': return '💼';
      case 'twitter': case 'x': return '🐦';
      case 'discord': return '💬';
      case 'facebook': return '📘';
      case 'instagram': return '📷';
      case 'whatsapp': return '💚';
      case 'tiktok': return '🎵';
      case 'quora': return '🔴';
      case 'directories': return '📝';
      case 'uploaded': return '📤';
      default: return '🌐';
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Lead Management</h1>
              <p className="text-purple-100 mt-1">Search • Filter • Source Validation • Lead Pipeline</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm bg-purple-500 px-2 py-1 rounded">
                  {filteredLeads.length} of {stats?.totalLeads || 0} Leads
                </span>
                <span className="text-sm bg-blue-500 px-2 py-1 rounded">
                  {platformsWithLeads.length} Platforms
                </span>
                <span className="text-sm bg-green-500 px-2 py-1 rounded">Multi-Source</span>
              </div>
            </div>
          </div>
        </header>

        {/* Search and Filters */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search leads by title, content, or author..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Platform Filter */}
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms ({leads?.length || 0})</SelectItem>
                {platformsWithLeads.map(platform => (
                  <SelectItem key={platform} value={platform}>
                    {getPlatformIcon(platform)} {platform} ({platformCounts[platform]})
                  </SelectItem>
                ))}
                {trackedPlatformsNoLeads.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 border-t">Monitoring (No Leads)</div>
                    {trackedPlatformsNoLeads.map(platform => (
                      <SelectItem key={platform} value={platform} disabled>
                        {getPlatformIcon(platform)} {platform} (0)
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>

            {/* Urgency Filter */}
            <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="high">🔴 High</SelectItem>
                <SelectItem value="medium">🟡 Medium</SelectItem>
                <SelectItem value="low">🟢 Low</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex rounded-md border">
              <Button
                variant={activeView === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('list')}
                className="rounded-r-none"
              >
                List View
              </Button>
              <Button
                variant={activeView === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('kanban')}
                className="rounded-l-none"
              >
                Kanban View
              </Button>
            </div>
          </div>
        </div>

        {/* Platform Summary */}
        <div className="bg-white px-6 py-3 border-b border-gray-100">
          <div className="flex items-center space-x-2 text-sm flex-wrap gap-2">
            <span className="text-gray-600 font-medium">Sources:</span>
            
            {/* Active platforms with leads */}
            {platformsWithLeads.slice(0, 4).map(platform => (
              <Badge 
                key={platform} 
                variant="default"
                className="cursor-pointer hover:bg-blue-600 bg-blue-500"
                onClick={() => setSelectedPlatform(platform)}
              >
                {getPlatformIcon(platform)} {platform} ({platformCounts[platform]})
              </Badge>
            ))}
            
            {/* Monitored platforms without leads */}
            {trackedPlatformsNoLeads.slice(0, 3).map(platform => (
              <Badge 
                key={platform} 
                variant="outline"
                className="text-gray-500 border-gray-300"
              >
                {getPlatformIcon(platform)} {platform} (0)
              </Badge>
            ))}
            
            {/* Show more indicator */}
            {(platformsWithLeads.length > 4 || trackedPlatformsNoLeads.length > 3) && (
              <Badge 
                variant="secondary" 
                className="cursor-pointer"
                onClick={() => {/* Could open a modal with all platforms */}}
              >
                +{Math.max(0, (platformsWithLeads.length - 4) + Math.max(0, trackedPlatformsNoLeads.length - 3))} more
              </Badge>
            )}
            
            <span className="text-xs text-gray-500 ml-2">
              • Active: {platformsWithLeads.length} • Monitoring: {trackedPlatformsNoLeads.length}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Main Leads View */}
            <div className="lg:col-span-2">
              {activeView === 'list' ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Leads ({filteredLeads.length})</span>
                      {searchKeyword && (
                        <Badge variant="secondary">Filtered by "{searchKeyword}"</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LeadsList leads={filteredLeads as any} isLoading={isLoading} />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5" />
                      <span>Kanban Pipeline</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      Kanban view coming soon - shows leads organized by stage
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Source Validation Sidebar */}
            <div className="lg:col-span-1">
              <SourceValidation />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}