"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";
import LeadsList from "@/components/dashboard/leads-list";
import { SourceValidation } from "@/components/dashboard/source-validation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Users, Globe, MessageSquare, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Lead } from "@/types";

interface LeadWithUrgency extends Lead {
  urgencyLevel?: string;
}

export default function LeadsPage() {
  const [activeView, setActiveView] = useState<'list' | 'kanban'>('list');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [limit] = useState(100); // Load 100 leads at a time

  // Reset to first page when platform filter changes
  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    setPage(0);
  };

  const { data: leads, isLoading, refetch, error } = useQuery({
    queryKey: ["/api/leads", selectedPlatform, page, limit],
    queryFn: () => api.getLeads(selectedPlatform === 'all' ? undefined : selectedPlatform, limit, page * limit),
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

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
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const filteredLeads = enrichedLeads?.filter((lead) => {
    const matchesSearch = !searchKeyword || 
      lead.title?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      lead.content?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      lead.authorUsername?.toLowerCase().includes(searchKeyword.toLowerCase());
    
    const matchesPlatform = selectedPlatform === 'all' || lead.sourcePlatform === selectedPlatform;
    const matchesUrgency = selectedUrgency === 'all' || lead.urgencyLevel === selectedUrgency;
    
    return matchesSearch && matchesPlatform && matchesUrgency;
  }) || [];

  const platforms = Array.from(new Set(enrichedLeads?.map(l => l.sourcePlatform).filter(Boolean) || []));

  return (
    <AdminLayout
      title="Lead Management"
      subtitle="AI-Powered Lead Discovery • Real-time Monitoring • Conversion Tracking"
      headerActions={
        <>
          <Button 
            onClick={() => refetch()}
            className="flex items-center gap-2 px-5 py-3 rounded-[10px] text-sm font-semibold bg-[#181b22] text-[#f5f5f7] border border-white/10 hover:bg-[#1a1d25] hover:border-white/15 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] text-[#8e919a] font-medium">Total Leads</span>
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(0,212,170,0.15)] text-[#00d4aa] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
            {stats?.totalLeads?.toLocaleString() || 0}
          </div>
        </div>
        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] text-[#8e919a] font-medium">Filtered Results</span>
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(96,165,250,0.15)] text-[#60a5fa] flex items-center justify-center">
              <Filter className="w-5 h-5" />
            </div>
          </div>
          <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
            {filteredLeads.length.toLocaleString()}
          </div>
        </div>
        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] text-[#8e919a] font-medium">Platforms</span>
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(167,139,250,0.15)] text-[#a78bfa] flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
            {platforms.length}
          </div>
        </div>
        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] text-[#8e919a] font-medium">With Responses</span>
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(251,146,60,0.15)] text-[#fb923c] flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
            {stats?.leadsWithResponses?.toLocaleString() || 0}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6 mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8e919a]" />
            <Input
              placeholder="Search leads by title, content, or author..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-10 bg-[#181b22] border-white/5 text-[#f5f5f7] placeholder:text-[#5a5d66] focus:border-[#00d4aa]/30"
            />
          </div>
          <Select value={selectedPlatform} onValueChange={handlePlatformChange}>
            <SelectTrigger className="w-[200px] bg-[#181b22] border-white/5 text-[#f5f5f7]">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent className="bg-[#14161c] border-white/5">
              <SelectItem value="all">All Platforms</SelectItem>
              {platforms.map((platform) => (
                <SelectItem key={platform} value={platform}>{platform}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
            <SelectTrigger className="w-[180px] bg-[#181b22] border-white/5 text-[#f5f5f7]">
              <SelectValue placeholder="All Urgency" />
            </SelectTrigger>
            <SelectContent className="bg-[#14161c] border-white/5">
              <SelectItem value="all">All Urgency</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Leads List */}
      <div className="bg-[#14161c] border border-white/5 rounded-2xl overflow-hidden">
        {error ? (
          <div className="p-8 text-center">
            <p className="text-red-400 mb-2">Error loading leads</p>
            <p className="text-sm text-[#5a5d66]">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        ) : (
          <>
            <LeadsList leads={filteredLeads} isLoading={isLoading} />
            {/* Pagination */}
            {leads && leads.length > 0 && (
              <div className="p-4 border-t border-white/5 flex items-center justify-between">
                <div className="text-sm text-[#8e919a]">
                  Showing {page * limit + 1}-{Math.min((page + 1) * limit, (page * limit) + leads.length)} of {stats?.totalLeads?.toLocaleString() || 'many'} leads
                  {selectedPlatform !== 'all' && ` (${selectedPlatform} only)`}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0 || isLoading}
                    className="px-4 py-2 bg-[#181b22] border border-white/5 text-[#f5f5f7] hover:bg-[#1a1d25] disabled:opacity-50"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setPage(p => p + 1)}
                    disabled={leads.length < limit || isLoading}
                    className="px-4 py-2 bg-[#181b22] border border-white/5 text-[#f5f5f7] hover:bg-[#1a1d25] disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
