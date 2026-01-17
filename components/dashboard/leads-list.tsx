import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, MessageSquare, Star, Filter, CheckCircle, Clock, Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { Lead } from "@/types";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import ResponseGenerator from "@/components/response-generator";

interface LeadsListProps {
  leads?: Lead[];
  isLoading: boolean;
}

export default function LeadsList({ leads, isLoading }: LeadsListProps) {
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterResponse, setFilterResponse] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);


  // Get leads that have been responded to
  const { data: leadsWithResponses } = useQuery({
    queryKey: ["/api/leads/with-responses"],
    queryFn: () => api.getLeadsWithResponses(),
  });

  // Get leads with response details (including response URLs)
  const { data: leadsWithResponseDetails } = useQuery({
    queryKey: ["/api/leads/with-response-details"],
    queryFn: () => fetch("/api/leads/with-response-details").then(res => res.json()),
  });

  const respondedToLeadIds = new Set(Array.isArray(leadsWithResponses) ? leadsWithResponses.map((lead: Lead) => lead.id) : []);

  const filteredLeads = leads?.filter(lead => {
    const platformFilter = filterPlatform === "all" || lead.sourcePlatform === filterPlatform;
    const responseFilter = filterResponse === "all" || 
      (filterResponse === "responded" && respondedToLeadIds.has(lead.id)) ||
      (filterResponse === "not-responded" && !respondedToLeadIds.has(lead.id));
    
    // Search filter - check title, content, and author username
    const searchFilter = searchQuery === "" || 
      lead.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.authorUsername?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return platformFilter && responseFilter && searchFilter;
  }) || [];

  // Calculate pagination
  const totalLeads = filteredLeads.length;
  const totalPages = Math.ceil(totalLeads / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  // Always use pagination mode - slice leads for current page only
  const displayedLeads = filteredLeads.slice(startIndex, endIndex);
  
  // Disable load more functionality - use pagination only
  const hasMore = false;
  const canLoadMore = false;

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'reddit':
        return <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
          <i className="fab fa-reddit text-orange-600" />
        </div>;
      case 'linkedin':
        return <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <i className="fab fa-linkedin text-blue-600" />
        </div>;
      case 'twitter':
        return <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <i className="fab fa-twitter text-gray-600" />
        </div>;
      case 'facebook':
        return <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <i className="fab fa-facebook text-blue-600" />
        </div>;
      case 'instagram':
        return <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <i className="fab fa-instagram text-purple-600" />
        </div>;
      case 'tiktok':
        return <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <i className="fab fa-tiktok text-white" />
        </div>;
      case 'directory':
      case 'directories':
        return <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
          <i className="fas fa-book text-amber-600" />
        </div>;
      case 'discord':
        return <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
          <i className="fab fa-discord text-indigo-600" />
        </div>;
      case 'whatsapp':
        return <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
          <i className="fab fa-whatsapp text-green-600" />
        </div>;
      case 'quora':
        return <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
          <i className="fab fa-quora text-red-600" />
        </div>;
      default:
        return <div className="w-8 h-8 bg-gray-100 rounded-lg" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", className: string }> = {
      high: { variant: "default", className: "bg-green-500 text-white" },
      medium: { variant: "secondary", className: "bg-yellow-500 text-white" },
      low: { variant: "outline", className: "bg-gray-400 text-white" }
    };
    
    return (
      <Badge className={variants[priority]?.className || "bg-gray-400 text-white"}>
        {priority === "high" ? "High Priority" : priority === "medium" ? "Medium" : "Low"}
      </Badge>
    );
  };

  const getValidationBadge = (isValidated: boolean) => {
    return isValidated ? (
      <Badge className="bg-green-500 text-white">
        <i className="fas fa-check mr-1" />Validated
      </Badge>
    ) : (
      <Badge className="bg-yellow-500 text-white">
        <i className="fas fa-clock mr-1" />Pending
      </Badge>
    );
  };

  const getResponseBadge = (leadId: string) => {
    const hasResponse = respondedToLeadIds.has(leadId);
    return hasResponse ? (
      <Badge className="bg-blue-500 text-white">
        <CheckCircle className="w-3 h-3 mr-1" />
        Responded
      </Badge>
    ) : (
      <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
        <Clock className="w-3 h-3 mr-1" />
        No Response
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CardTitle className="text-lg font-semibold text-gray-900">Recent Leads</CardTitle>
              <Badge variant="outline" className="text-sm font-medium">
                {displayedLeads.length} of {filteredLeads.length} {filterPlatform !== "all" || filterResponse !== "all" || searchQuery ? "filtered" : "total"} leads
              </Badge>
            </div>
            
            {/* View Mode and Page Size Controls */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Show:</span>
              <Select value={pageSize.toString()} onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Quick Filter Presets */}
            <div className="flex items-center space-x-2">
              <Button
                variant={filterPlatform === "reddit" && filterResponse === "not-responded" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilterPlatform("reddit");
                  setFilterResponse("not-responded");
                  setSearchQuery("");
                  setPageSize(25);
                  setCurrentPage(1);
                }}
                className="text-xs"
                data-testid="filter-pending-reddit"
              >
                <i className="fab fa-reddit mr-1 text-orange-500" />
                Pending Reddit
              </Button>
              <Button
                variant={filterPlatform === "all" && filterResponse === "not-responded" && searchQuery === "" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilterPlatform("all");
                  setFilterResponse("not-responded");
                  setSearchQuery("");
                }}
                className="text-xs"
                data-testid="filter-all-pending"
              >
                <Clock className="w-3 h-3 mr-1" />
                All Pending
              </Button>
              <Button
                variant={filterPlatform === "all" && filterResponse === "all" && searchQuery === "" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilterPlatform("all");
                  setFilterResponse("all");
                  setSearchQuery("");
                }}
                className="text-xs"
                data-testid="filter-clear-all"
              >
                Clear Filters
              </Button>
            </div>
            
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select value={filterPlatform} onValueChange={setFilterPlatform}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="reddit">🟠 Reddit</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="directories">Directories</SelectItem>
                <SelectItem value="discord">Discord</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="quora">🔴 Quora</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterResponse} onValueChange={setFilterResponse}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leads</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
                <SelectItem value="not-responded">No Response</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
          <div className="divide-y divide-gray-200">
            {filteredLeads.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No leads found. Try scanning for new leads or adjust your filters.
              </div>
            ) : (
              <>
                {displayedLeads.map((lead) => (
                <div key={lead.id} className="p-6 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
                  <div className="flex items-start justify-between gap-4 w-full">
                    <div className="flex-1 min-w-0 overflow-hidden pr-4">
                      <div className="flex items-center space-x-3 mb-2">
                        {getPlatformIcon(lead.sourcePlatform)}
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <h4 className="text-sm font-medium text-gray-900 break-words leading-5 mb-1 overflow-wrap-anywhere word-break-all w-full">
                            {lead.title}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {lead.subreddit ? `r/${lead.subreddit}` : lead.sourcePlatform} • {
                              new Date(lead.discoveredAt).toLocaleDateString()
                            } • u/{lead.authorUsername}
                          </p>
                        </div>
                        {getValidationBadge(lead.isValidated)}
                        {getResponseBadge(lead.id)}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed break-words overflow-hidden overflow-wrap-anywhere word-break-all w-full">
                        {lead.content.length > 300 ? `${lead.content.slice(0, 300)}...` : lead.content}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {lead.aiScore && (
                          <span className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-500 mr-1" />
                            AI Score: <strong className="text-gray-900 ml-1">{Number(lead.aiScore).toFixed(1)}</strong>
                          </span>
                        )}
                        {lead.engagement?.comments && (
                          <span className="flex items-center">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {lead.engagement.comments} comments
                          </span>
                        )}
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 h-auto text-primary hover:underline"
                          onClick={() => window.open(lead.sourceUrl, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Source →
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 flex-shrink-0 min-w-[120px]">
                      {getPriorityBadge(lead.priority)}
                      
                      <div className="flex flex-col space-y-2 items-end">
                        {/* Response Generator for unresponded leads */}
                        {!respondedToLeadIds.has(lead.id) && (
                          <ResponseGenerator lead={lead} />
                        )}
                        
                        {/* Response URL button if available */}
                        {(() => {
                          const leadWithDetails = Array.isArray(leadsWithResponseDetails) 
                            ? leadsWithResponseDetails.find((l: any) => l.id === lead.id)
                            : null;
                          const responseUrl = leadWithDetails?.responseUrl;
                          
                          if (responseUrl) {
                            return (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                onClick={() => window.open(responseUrl, '_blank')}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View Response
                              </Button>
                            );
                          }
                          return null;
                        })()}
                        
                        {/* Main source button */}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-gray-200 text-gray-700 hover:bg-gray-50"
                          onClick={() => window.open(lead.sourceUrl, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Source
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                ))}
                
                {/* Load More Button for Scroll Mode */}
                {canLoadMore && (
                  <div className="p-4 text-center border-t border-gray-200">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="w-full max-w-sm"
                    >
                      Load More Leads ({totalLeads - (currentPage * pageSize)} remaining)
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, totalLeads)} of {totalLeads} leads
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10 h-8"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

    </Card>
  );
}
