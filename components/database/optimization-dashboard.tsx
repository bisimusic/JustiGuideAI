import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { queryClient } from "@/lib/queryClient";

interface DatabaseStats {
  queryTime: number;
  cacheHits: number;
  cacheMisses: number;
  totalQueries: number;
  cacheEfficiency: number;
  averageQueryTime: number;
}

interface PerformanceAnalysis {
  cacheEfficiency: number;
  averageQueryTime: number;
  totalQueries: number;
  recommendations: string[];
}

export function OptimizationDashboard() {
  const [selectedAction, setSelectedAction] = useState<string>('');

  // Fetch database statistics
  const { data: dbStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["/api/database/stats"],
    queryFn: async () => {
      const response = await fetch('/api/database/stats');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch performance analysis
  const { data: analysisData, isLoading: analysisLoading, error: analysisError } = useQuery({
    queryKey: ["/api/database/performance-analysis"],
    queryFn: async () => {
      const response = await fetch('/api/database/performance-analysis');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result;
    },
    refetchInterval: 60000 // Refresh every minute
  });

  // Optimize indexes mutation
  const optimizeIndexesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/database/optimize-indexes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/database/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/database/performance-analysis"] });
    }
  });

  // Clear cache mutation
  const clearCacheMutation = useMutation({
    mutationFn: async (pattern?: string) => {
      const url = pattern ? `/api/database/cache?pattern=${pattern}` : '/api/database/cache';
      const response = await fetch(url, { method: 'DELETE' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/database/stats"] });
    }
  });

  const getCacheEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return 'text-green-600';
    if (efficiency >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQueryTimeColor = (time: number) => {
    if (time <= 100) return 'text-green-600';
    if (time <= 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatMs = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (statsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🗄️ Database Optimization</CardTitle>
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
      {/* Database Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>🗄️ Database Performance Overview</CardTitle>
          <CardDescription>
            Intelligent caching, query optimization, and performance monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dbStats ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className={`text-3xl font-bold ${getCacheEfficiencyColor(dbStats.stats.cacheEfficiency || 0)}`}>
                    {(dbStats.stats.cacheEfficiency || 0).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Cache Efficiency</div>
                  <div className="mt-2">
                    <Progress value={dbStats.stats.cacheEfficiency || 0} className="h-2" />
                  </div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className={`text-2xl font-bold ${getQueryTimeColor(dbStats.stats.averageQueryTime || 0)}`}>
                    {formatMs(dbStats.stats.averageQueryTime || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Query Time</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Total: {formatMs(dbStats.stats.queryTime || 0)}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {dbStats.stats.totalQueries || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Queries</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Hits: {dbStats.stats.cacheHits || 0} | Misses: {dbStats.stats.cacheMisses || 0}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {dbStats.cacheSize || 0}
                  </div>
                  <div className="text-sm text-gray-600">Cache Entries</div>
                  <div className="text-xs text-gray-500 mt-1">
                    5 min timeout
                  </div>
                </div>
              </div>

              {/* Cache Performance Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Cache Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cache Hits</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{dbStats.stats.cacheHits || 0}</span>
                        <div className="w-20 h-2 bg-gray-200 rounded">
                          <div 
                            className="h-full bg-green-500 rounded"
                            style={{ 
                              width: `${dbStats.stats.totalQueries > 0 ? 
                                (dbStats.stats.cacheHits / dbStats.stats.totalQueries) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cache Misses</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{dbStats.stats.cacheMisses || 0}</span>
                        <div className="w-20 h-2 bg-gray-200 rounded">
                          <div 
                            className="h-full bg-red-500 rounded"
                            style={{ 
                              width: `${dbStats.stats.totalQueries > 0 ? 
                                (dbStats.stats.cacheMisses / dbStats.stats.totalQueries) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Optimization Features</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">5-minute intelligent caching</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Optimized database indexes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Query result pagination</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Automatic cache cleanup</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Performance monitoring</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : statsLoading ? (
            <div className="text-center py-8 text-blue-500">
              <p>Loading database statistics...</p>
            </div>
          ) : (
            <div className="text-center py-8 text-red-500">
              <p>Unable to load database statistics</p>
              {statsError && <p className="text-sm mt-2">{statsError.message}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Analysis & Actions */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Performance Analysis & Optimization</CardTitle>
          <CardDescription>
            Automated performance analysis with optimization recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analysis">Performance Analysis</TabsTrigger>
              <TabsTrigger value="optimization">Optimization Actions</TabsTrigger>
              <TabsTrigger value="indexes">Database Indexes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="analysis" className="space-y-4">
              {analysisData && analysisData.analysis ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {analysisData.analysis.cacheEfficiency.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Cache Efficiency</div>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {formatMs(analysisData.analysis.averageQueryTime)}
                      </div>
                      <div className="text-sm text-gray-600">Avg Query Time</div>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {analysisData.analysis.totalQueries}
                      </div>
                      <div className="text-sm text-gray-600">Total Queries</div>
                    </div>
                  </div>

                  {analysisData.analysis.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Optimization Recommendations</h4>
                      <div className="space-y-2">
                        {analysisData.analysis.recommendations.map((rec: string, index: number) => (
                          <Alert key={index}>
                            <AlertDescription>{rec}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : analysisLoading ? (
                <div className="text-center py-8 text-blue-500">
                  <p>Loading performance analysis...</p>
                </div>
              ) : (
                <div className="text-center py-8 text-red-500">
                  <p>Unable to load performance analysis</p>
                  {analysisError && <p className="text-sm mt-2">{analysisError.message}</p>}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="optimization" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Cache Management</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => clearCacheMutation.mutate()}
                      disabled={clearCacheMutation.isPending}
                    >
                      {clearCacheMutation.isPending ? 'Clearing...' : 'Clear All Cache'}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => clearCacheMutation.mutate('leads')}
                      disabled={clearCacheMutation.isPending}
                    >
                      Clear Leads Cache
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => clearCacheMutation.mutate('dashboard')}
                      disabled={clearCacheMutation.isPending}
                    >
                      Clear Dashboard Cache
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Database Optimization</h4>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => optimizeIndexesMutation.mutate()}
                      disabled={optimizeIndexesMutation.isPending}
                      className="w-full"
                    >
                      {optimizeIndexesMutation.isPending ? 'Optimizing...' : 'Optimize Database Indexes'}
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/database/stats"] })}
                      className="w-full"
                    >
                      Refresh Statistics
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="indexes" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium">Active Database Indexes</h4>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">idx_leads_score_date</div>
                    <div className="text-xs text-gray-600">Optimizes lead queries by AI score and discovery date</div>
                    <Badge variant="secondary" className="text-xs mt-1">leads(ai_score DESC, discovered_at DESC)</Badge>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">idx_leads_platform_score</div>
                    <div className="text-xs text-gray-600">Optimizes platform-filtered lead queries</div>
                    <Badge variant="secondary" className="text-xs mt-1">leads(source_platform, ai_score DESC)</Badge>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">idx_responses_lead_date</div>
                    <div className="text-xs text-gray-600">Optimizes response lookup and ordering</div>
                    <Badge variant="secondary" className="text-xs mt-1">lead_responses(lead_id, posted_at DESC)</Badge>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">idx_leads_high_score</div>
                    <div className="text-xs text-gray-600">Partial index for high-priority leads</div>
                    <Badge variant="secondary" className="text-xs mt-1">leads(ai_score) WHERE ai_score {">="} 5</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}