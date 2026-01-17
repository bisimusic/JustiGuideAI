import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { Lead as ImportedLead } from "@/types";

interface Lead extends ImportedLead {
  status?: 'new' | 'contacted' | 'nurturing' | 'qualified' | 'converted';
}

export function LeadPipeline() {
  const [selectedStage, setSelectedStage] = useState('new');
  const [displayCount, setDisplayCount] = useState<Record<string, number>>({
    new: 20,
    contacted: 20,
    nurturing: 20,
    qualified: 20,
    converted: 20
  });
  
  const { data: leads, isLoading } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: () => api.getLeads(),
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => api.getDashboardStats(),
  });

  const { data: pipelineData } = useQuery({
    queryKey: ["/api/leads/pipeline"],
    queryFn: () => fetch('/api/leads/pipeline').then(res => res.json()),
  });

  // Use actual pipeline data from the API
  const totalLeads = pipelineData?.totalLeads || 0;
  const newLeadsCount = pipelineData?.newLeads || 0;
  const contactedCount = pipelineData?.contactedLeads || 0;
  const nurturingCount = pipelineData?.nurturingLeads || 0;
  const qualifiedCount = pipelineData?.qualifiedLeads || 0;
  const convertedCount = pipelineData?.convertedLeads || 0;

  const getLeadsByStage = (stage: string) => {
    if (!leads) return [];
    
    switch (stage) {
      case 'new':
        // Return leads with no AI score or score of 0
        return leads?.filter((lead: Lead) => !lead.aiScore || lead.aiScore === '0').slice(0, 20) || [];
      case 'contacted':
        // Return leads with AI score 1-5
        return leads?.filter((lead: Lead) => lead.aiScore && parseFloat(lead.aiScore) > 0 && parseFloat(lead.aiScore) < 6).slice(0, 20) || [];
      case 'nurturing':
        // Return leads with AI score 6-7
        return leads?.filter((lead: Lead) => lead.aiScore && parseFloat(lead.aiScore) >= 6 && parseFloat(lead.aiScore) < 8).slice(0, 15) || [];
      case 'qualified':
        // Return leads with AI score 8-9.4
        return leads?.filter((lead: Lead) => lead.aiScore && parseFloat(lead.aiScore) >= 8 && parseFloat(lead.aiScore) < 9.5).slice(0, 10) || [];
      case 'converted':
        // Return leads with AI score 9.5+
        return leads?.filter((lead: Lead) => lead.aiScore && parseFloat(lead.aiScore) >= 9.5).slice(0, 5) || [];
      default:
        return [];
    }
  };

  const stageStats = [
    { stage: 'new', label: 'New Leads', count: newLeadsCount, color: 'bg-blue-500' },
    { stage: 'contacted', label: 'Contacted', count: contactedCount, color: 'bg-yellow-500' },
    { stage: 'nurturing', label: 'Nurturing', count: nurturingCount, color: 'bg-orange-500' },
    { stage: 'qualified', label: 'Qualified', count: qualifiedCount, color: 'bg-purple-500' },
    { stage: 'converted', label: 'Converted', count: convertedCount, color: 'bg-green-500' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lead Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🎯</span>
            <span>Lead Pipeline Overview</span>
            {totalLeads > 0 && (
              <span className="ml-4 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {totalLeads.toLocaleString()} Total Leads
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Track leads through the entire customer journey from discovery to conversion
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totalLeads > 0 ? (
            <div className="grid grid-cols-5 gap-4">
              {stageStats.map((stat) => (
              <div
                key={stat.stage}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedStage === stat.stage 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => {
                  setSelectedStage(stat.stage);
                  // Reset display count when changing stages
                  setDisplayCount(prev => ({
                    ...prev,
                    [stat.stage]: 10
                  }));
                }}
              >
                <div className={`w-3 h-3 rounded-full ${stat.color} mb-2`}></div>
                <h3 className="font-semibold text-gray-900">{stat.label}</h3>
                <p className="text-2xl font-bold text-gray-800">{stat.count}</p>
                <p className="text-sm text-gray-600">
                  {stat.stage === 'new' ? 'Active prospects' : 
                   stat.stage === 'contacted' ? 'Contacted leads' :
                   stat.stage === 'nurturing' ? 'In nurturing' :
                   stat.stage === 'qualified' ? 'Ready to convert' : 'Converted successfully'}
                </p>
              </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No pipeline data available</p>
              <p className="text-sm">Connect your lead sources to start tracking the pipeline</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Lead View */}
      <Card>
        <CardHeader>
          <CardTitle className="capitalize break-words">{selectedStage} Leads</CardTitle>
          <CardDescription className="break-words">
            {getLeadsByStage(selectedStage).length} leads in this stage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="kanban">Kanban View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="space-y-4">
              <div className="space-y-3">
                {getLeadsByStage(selectedStage).slice(0, displayCount[selectedStage] || 10).map((lead) => (
                  <div key={lead.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="space-y-3">
                      {/* Title and badges */}
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-semibold text-gray-900 break-words leading-5 flex-1 min-w-0">
                          {lead.title}
                        </h4>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <Badge className={getPriorityColor(lead.priority || 'medium')}>
                            {lead.priority || 'medium'}
                          </Badge>
                          <Badge variant="outline">
                            {lead.sourcePlatform}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Content with proper wrapping */}
                      <p className="text-sm text-gray-600 break-words whitespace-pre-wrap leading-relaxed">
                        {lead.content}
                      </p>
                      
                      {/* Metadata and actions */}
                      <div className="flex items-center justify-between pt-2">
                        <p className="text-xs text-gray-500">
                          Discovered: {new Date(lead.discoveredAt).toLocaleDateString()}
                        </p>
                        
                        <div className="flex items-center space-x-3">
                          <div className={`px-2 py-1 rounded text-xs font-semibold ${getScoreColor(Number(lead.aiScore) || 0)}`}>
                            {lead.aiScore ? Number(lead.aiScore).toFixed(1) : 'N/A'}
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(lead.sourceUrl, '_blank')}
                              className="border-gray-200 text-gray-700 hover:bg-gray-50"
                            >
                              View Source →
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
              
              {getLeadsByStage(selectedStage).length > (displayCount[selectedStage] || 10) && (
                <div className="text-center py-4">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setDisplayCount(prev => ({
                        ...prev,
                        [selectedStage]: (prev[selectedStage] || 10) + 10
                      }));
                    }}
                  >
                    Load More ({getLeadsByStage(selectedStage).length - (displayCount[selectedStage] || 10)} remaining)
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="kanban">
              <div className="text-center py-8 text-gray-500">
                <p>Kanban view coming soon...</p>
                <p className="text-sm">Drag and drop leads between stages</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}