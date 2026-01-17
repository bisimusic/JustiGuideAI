import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient } from "@/lib/queryClient";

interface ChannelPerformance {
  channel: string;
  config: {
    priority: number;
    responseRate: number;
    costPerLead: number;
    effectiveness: number;
  };
  actual: {
    responseRate: number;
    totalLeads: number;
    totalResponses: number;
  };
  efficiency: number;
  roi: number;
}

export function MultiChannelDashboard() {
  const [selectedLead, setSelectedLead] = useState<string>('');
  const [showOrchestrationDialog, setShowOrchestrationDialog] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string>('');

  // Fetch channel performance data
  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ["/api/outreach/channel-performance"],
    queryFn: async () => {
      const response = await fetch('/api/outreach/channel-performance');
      const result = await response.json();
      return result.success ? result : null;
    },
    refetchInterval: 60000 // Refresh every minute
  });

  // Orchestrate outreach mutation
  const orchestrateMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const response = await fetch('/api/outreach/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/outreach/channel-performance"] });
    }
  });

  // Execute step mutation
  const executeStepMutation = useMutation({
    mutationFn: async ({ leadId, channel, message }: { leadId: string, channel: string, message: string }) => {
      const response = await fetch('/api/outreach/execute-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, channel, message })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/outreach/channel-performance"] });
    }
  });

  const getChannelColor = (channel: string) => {
    const colors: Record<string, string> = {
      reddit: 'bg-orange-500',
      linkedin: 'bg-blue-500',
      email: 'bg-green-500',
      whatsapp: 'bg-emerald-500',
      phone: 'bg-purple-500'
    };
    return colors[channel] || 'bg-gray-500';
  };

  const getROIColor = (roi: number) => {
    if (roi >= 10) return 'text-green-600';
    if (roi >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleOrchestrate = async () => {
    if (!selectedLead) return;
    
    try {
      await orchestrateMutation.mutateAsync(selectedLead);
      setShowOrchestrationDialog(false);
      setSelectedLead('');
    } catch (error) {
      console.error('Orchestration failed:', error);
    }
  };

  if (performanceLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🎯 Multi-Channel Orchestration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Channel Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Multi-Channel Outreach Performance</CardTitle>
          <CardDescription>
            Optimized outreach sequences across Reddit, LinkedIn, email, WhatsApp, and phone
          </CardDescription>
        </CardHeader>
        <CardContent>
          {performanceData ? (
            <>
              {/* Performance Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {performanceData.summary?.bestROI?.channel?.toUpperCase() || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Best ROI Channel</div>
                  <div className="text-xs text-green-600">
                    {performanceData.summary?.bestROI?.roi?.toFixed(1) || 0}x return
                  </div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {performanceData.summary?.mostEffective?.channel?.toUpperCase() || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Highest Response Rate</div>
                  <div className="text-xs text-blue-600">
                    {((performanceData.summary?.mostEffective?.actual?.responseRate || 0) * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {performanceData.summary?.mostCostEffective?.channel?.toUpperCase() || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Most Cost Effective</div>
                  <div className="text-xs text-purple-600">
                    ${performanceData.summary?.mostCostEffective?.config?.costPerLead?.toFixed(2) || 0} per lead
                  </div>
                </div>
              </div>

              {/* Channel Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Channel Performance Details</h3>
                <div className="grid gap-4">
                  {performanceData.performance?.map((channel: ChannelPerformance) => (
                    <div key={channel.channel} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full ${getChannelColor(channel.channel)}`}></div>
                        <div>
                          <div className="font-medium capitalize">{channel.channel}</div>
                          <div className="text-sm text-gray-600">
                            {channel.actual.totalLeads} leads • {channel.actual.totalResponses} responses
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-sm font-medium">
                            {(channel.actual.responseRate * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">Response Rate</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm font-medium">
                            ${channel.config.costPerLead.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">Cost/Lead</div>
                        </div>
                        
                        <div className="text-center">
                          <div className={`text-sm font-medium ${getROIColor(channel.roi)}`}>
                            {channel.roi.toFixed(1)}x
                          </div>
                          <div className="text-xs text-gray-500">ROI</div>
                        </div>
                        
                        <div className="w-20">
                          <Progress 
                            value={Math.min(channel.efficiency * 100, 100)} 
                            className="h-2"
                          />
                          <div className="text-xs text-center mt-1">
                            {(channel.efficiency * 100).toFixed(0)}% efficiency
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No channel performance data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orchestration Controls */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Outreach Orchestration</CardTitle>
          <CardDescription>
            Create optimized multi-channel sequences based on lead characteristics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={() => setShowOrchestrationDialog(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Outreach Sequence
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/outreach/channel-performance"] })}
              >
                Refresh Performance Data
              </Button>
            </div>

            {/* Channel Templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">🚨 Urgent H1B Sequence</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Day 0: Email (urgent_h1b)</div>
                  <div>Day 0: WhatsApp (urgent_h1b)</div>
                  <div>Day 1: Phone (consultation_offer)</div>
                </div>
                <div className="mt-2 text-xs text-green-600">70% expected response rate</div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">💼 B2B Lawyer Sequence</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Day 0: LinkedIn (initial_response)</div>
                  <div>Day 2: Email (value_proposition)</div>
                  <div>Day 5: Phone (consultation_offer)</div>
                </div>
                <div className="mt-2 text-xs text-green-600">65% expected response rate</div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">🏆 Premium Client Sequence</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Day 0: LinkedIn (initial_response)</div>
                  <div>Day 1: Email (value_proposition)</div>
                  <div>Day 3: Phone (consultation_offer)</div>
                  <div>Day 5: WhatsApp (follow_up)</div>
                </div>
                <div className="mt-2 text-xs text-green-600">70% expected response rate</div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">📝 N400 Citizenship Sequence</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Day 0: Reddit (initial_response)</div>
                  <div>Day 2: Email (value_proposition)</div>
                  <div>Day 5: LinkedIn (case_study)</div>
                </div>
                <div className="mt-2 text-xs text-green-600">30% expected response rate</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orchestration Dialog */}
      <Dialog open={showOrchestrationDialog} onOpenChange={setShowOrchestrationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Outreach Sequence</DialogTitle>
            <DialogDescription>
              Generate an optimized multi-channel outreach sequence for a specific lead
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Lead ID</label>
              <Input
                placeholder="Enter lead ID"
                value={selectedLead}
                onChange={(e) => setSelectedLead(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrchestrationDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleOrchestrate}
              disabled={!selectedLead || orchestrateMutation.isPending}
            >
              {orchestrateMutation.isPending ? 'Creating...' : 'Create Sequence'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}