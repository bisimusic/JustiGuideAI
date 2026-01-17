import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Play, Database, TrendingUp, Globe, Hash, MessageSquare } from 'lucide-react';

interface ApifyStatus {
  success: boolean;
  status: string;
  capabilities: Record<string, string>;
  usage: {
    totalDatasets: number;
    recentActivity: number;
  };
}

interface CollectionResult {
  collected: number;
  stored: number;
  qualityScore: number;
  sources: string[];
  platforms: Array<{
    name: string;
    count: number;
  }>;
}

export function ApifyIntegration() {
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectionProgress, setCollectionProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get Apify status
  const { data: status, isLoading: statusLoading } = useQuery<ApifyStatus>({
    queryKey: ['/api/apify/status'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Initialize Apify service
  const initializeMutation = useMutation({
    mutationFn: () => apiRequest('/api/apify/initialize', { method: 'POST' }),
    onSuccess: () => {
      toast({
        title: "Apify Initialized",
        description: "Enhanced data collection service is ready"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/apify/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Initialization Failed",
        description: error.message || "Failed to initialize Apify service",
        variant: "destructive"
      });
    }
  });

  // Collect enhanced leads
  const collectMutation = useMutation({
    mutationFn: () => apiRequest('/api/apify/collect-leads', { method: 'POST' }),
    onSuccess: (data: { data: CollectionResult }) => {
      const result = data.data;
      toast({
        title: "Lead Collection Complete",
        description: `Collected ${result.collected} leads, stored ${result.stored}. Quality score: ${result.qualityScore}%`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setIsCollecting(false);
      setCollectionProgress(0);
    },
    onError: (error: any) => {
      toast({
        title: "Collection Failed",
        description: error.message || "Failed to collect enhanced leads",
        variant: "destructive"
      });
      setIsCollecting(false);
      setCollectionProgress(0);
    }
  });

  const handleCollectLeads = async () => {
    setIsCollecting(true);
    setCollectionProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setCollectionProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    collectMutation.mutate();
  };

  const platforms = [
    { name: 'Reddit', icon: MessageSquare, color: 'bg-orange-500' },
    { name: 'LinkedIn', icon: Globe, color: 'bg-blue-600' },
    { name: 'Twitter', icon: Hash, color: 'bg-sky-500' },
    { name: 'Facebook', icon: Globe, color: 'bg-blue-700' },
    { name: 'Instagram', icon: Hash, color: 'bg-pink-500' },
    { name: 'TikTok', icon: Play, color: 'bg-black' }
  ];

  if (statusLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Enhanced Data Collection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Enhanced Data Collection
        </CardTitle>
        <CardDescription>
          Advanced multi-platform lead scraping with Apify
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Service Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${
              status?.status === 'operational' ? 'bg-green-500' : 
              status?.status === 'degraded' ? 'bg-yellow-500' :
              status?.status === 'invalid_key' ? 'bg-orange-500' :
              'bg-red-500'
            }`} />
            <span className="text-sm font-medium">
              Service Status: {status?.status === 'operational' ? 'Operational' :
                              status?.status === 'degraded' ? 'Degraded' :
                              status?.status === 'invalid_key' ? 'Invalid API Key' :
                              status?.status === 'not_configured' ? 'Not Configured' :
                              'Unknown'}
            </span>
          </div>
          {status?.status !== 'operational' && (
            <Button 
              onClick={() => initializeMutation.mutate()}
              disabled={initializeMutation.isPending}
              size="sm"
              data-testid="button-initialize"
            >
              {initializeMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Initialize'
              )}
            </Button>
          )}
        </div>

        {/* Platform Capabilities */}
        {status && (
          <div>
            <h4 className="text-sm font-medium mb-3">Supported Platforms</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                const isActive = status.capabilities[platform.name.toLowerCase()] === 'Active';
                return (
                  <div key={platform.name} className="flex items-center gap-2 p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                    <div className={`p-1 rounded ${platform.color} text-white`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-medium">{platform.name}</span>
                    <Badge variant={isActive ? "default" : "secondary"} className="ml-auto text-xs">
                      {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Usage Statistics */}
        {status && (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {status.usage.totalDatasets}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Datasets
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {status.usage.recentActivity}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Recent Activity
              </div>
            </div>
          </div>
        )}

        {/* Collection Progress */}
        {isCollecting && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Collecting leads...</span>
              <span className="text-sm text-gray-600">{Math.round(collectionProgress)}%</span>
            </div>
            <Progress value={collectionProgress} className="h-2" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={handleCollectLeads}
            disabled={isCollecting || collectMutation.isPending || status?.status !== 'operational'}
            className="flex-1"
            data-testid="button-collect"
          >
            {isCollecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Collecting...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Collect Enhanced Leads
              </>
            )}
          </Button>
        </div>

        {/* Capabilities List */}
        {status && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Enhanced Capabilities</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Multi-platform lead scraping</li>
              <li>• Quality scoring and validation</li>
              <li>• Engagement metrics analysis</li>
              <li>• Real-time data collection</li>
              <li>• Authentic source verification</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}