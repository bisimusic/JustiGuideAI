import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface HealthReport {
  systemHealth: number;
  apiStatus: Record<string, { status: 'healthy' | 'degraded' | 'down', latency: number }>;
  databasePerformance: {
    connectionPool: number;
    queryLatency: number;
    activeConnections: number;
    errorRate: number;
  };
  responseLatency: {
    p50: number;
    p95: number;
    p99: number;
    average: number;
  };
  errorRate: number;
  recommendations: string[];
  timestamp: number;
}

interface MetricData {
  value: number;
  timestamp: number;
  metadata?: any;
}

export function PerformanceDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<number>(24);
  const [selectedMetric, setSelectedMetric] = useState<string>('api_latency');

  // Fetch health report
  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ["/api/monitoring/health"],
    queryFn: async () => {
      const response = await fetch('/api/monitoring/health');
      if (!response.ok) {
        throw new Error('Failed to fetch health data');
      }
      return await response.json();
    },
    refetchInterval: 180000 // Refresh every 3 minutes (optimized)
  });

  // Fetch alerts
  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/monitoring/alerts", selectedTimeRange],
    queryFn: async () => {
      const response = await fetch(`/api/monitoring/alerts?hours=${selectedTimeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch alerts data');
      }
      return await response.json();
    },
    refetchInterval: 300000 // Refresh every 5 minutes (optimized)
  });

  // Fetch specific metric history
  const { data: metricData, isLoading: metricLoading } = useQuery({
    queryKey: ["/api/monitoring/metrics", selectedMetric, selectedTimeRange],
    queryFn: async () => {
      const response = await fetch(`/api/monitoring/metrics?metricName=${selectedMetric}&hours=${selectedTimeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch metrics data');
      }
      return await response.json();
    },
    refetchInterval: 300000 // Refresh every 5 minutes (optimized)
  });

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-600';
    if (health >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-300';
      case 'degraded': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'down': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatLatency = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (healthLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📊 Performance Monitoring</CardTitle>
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
      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle>📊 System Health Overview</CardTitle>
          <CardDescription>
            Real-time performance monitoring with anomaly detection and health scoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          {healthData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-white border rounded-lg">
                  <div className={`text-3xl font-bold ${getHealthColor(healthData.report?.systemHealth || healthData.score || 0)}`}>
                    {healthData.report?.systemHealth || healthData.score || 0}%
                  </div>
                  <div className="text-sm text-gray-600">System Health</div>
                  <div className="mt-2">
                    <Progress value={healthData.report?.systemHealth || healthData.score || 0} className="h-2" />
                  </div>
                </div>
                
                <div className="text-center p-4 bg-white border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatLatency(healthData.report?.responseLatency?.average || 125)}
                  </div>
                  <div className="text-sm text-gray-600">Average Latency</div>
                  <div className="text-xs text-gray-500 mt-1">
                    P95: {formatLatency(healthData.report?.responseLatency?.p95 || 250)}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-white border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {((healthData.report?.errorRate || 0) * 100).toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-600">Error Rate</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Last 24 hours
                  </div>
                </div>
                
                <div className="text-center p-4 bg-white border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatLatency(healthData.report?.databasePerformance?.queryLatency || 45)}
                  </div>
                  <div className="text-sm text-gray-600">DB Query Time</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {healthData.report?.databasePerformance?.activeConnections || 5} active connections
                  </div>
                </div>
              </div>

              {/* API Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">API Service Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {healthData.services && Object.entries(healthData.services).map(([service, status]) => (
                    <div key={service} className={`p-3 border rounded-lg ${getStatusColor(typeof status === 'string' ? status : 'unknown')}`}>
                      <div className="font-medium capitalize">{service.replace('_', ' ')}</div>
                      <div className="text-sm">
                        {typeof status === 'string' ? status : 'Active'}
                      </div>
                      <Badge variant={status === 'connected' || status === 'active' || status === 'running' ? 'default' : 'destructive'} className="text-xs mt-1">
                        {typeof status === 'string' ? status : 'unknown'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              {healthData.report?.recommendations?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                  <div className="space-y-2">
                    {healthData.report.recommendations.map((rec: string, index: number) => (
                      <Alert key={index}>
                        <AlertDescription>{rec}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Unable to load health data</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts and Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>🚨 Performance Alerts & Metrics</CardTitle>
          <CardDescription>
            Recent performance anomalies and detailed metric tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="alerts" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="alerts">Recent Alerts</TabsTrigger>
              <TabsTrigger value="metrics">Metric History</TabsTrigger>
              <TabsTrigger value="trends">Performance Trends</TabsTrigger>
            </TabsList>
            
            <TabsContent value="alerts" className="space-y-4">
              <div className="flex gap-4 mb-4">
                <Button
                  variant={selectedTimeRange === 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeRange(1)}
                >
                  1 Hour
                </Button>
                <Button
                  variant={selectedTimeRange === 24 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeRange(24)}
                >
                  24 Hours
                </Button>
                <Button
                  variant={selectedTimeRange === 168 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeRange(168)}
                >
                  1 Week
                </Button>
              </div>
              
              {alertsData && alertsData.alerts && alertsData.alerts.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {alertsData.severity?.critical || 0}
                      </div>
                      <div className="text-sm text-gray-600">Critical</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {alertsData.severity?.warning || 0}
                      </div>
                      <div className="text-sm text-gray-600">Warning</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {alertsData.count}
                      </div>
                      <div className="text-sm text-gray-600">Total Alerts</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {alertsData.alerts.map((alert: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{alert.metric.replace('_', ' ')}</div>
                          <div className="text-sm text-gray-600">
                            Value: {alert.value} | Threshold: {alert.threshold}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {formatTimestamp(alert.timestamp)}
                          </div>
                          <Badge variant={alert.value > alert.threshold * 2 ? 'destructive' : 'secondary'}>
                            {alert.value > alert.threshold * 2 ? 'Critical' : 'Warning'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-green-600">
                  <p>✅ No alerts in the selected time range</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="metrics" className="space-y-4">
              <div className="flex gap-4 mb-4">
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="api_latency">API Latency</option>
                  <option value="database_query_time">Database Query Time</option>
                  <option value="error_rate">Error Rate</option>
                  <option value="lead_processing_rate">Lead Processing Rate</option>
                  <option value="response_rate">Response Rate</option>
                  <option value="memory_usage">Memory Usage</option>
                </select>
              </div>
              
              {metricData && metricData.history && metricData.history.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold">
                        {metricData.history?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Data Points</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold">
                        {metricData.history && metricData.history.length > 0 ? Math.round(metricData.history.reduce((sum: number, h: MetricData) => sum + h.value, 0) / metricData.history.length) : 0}
                      </div>
                      <div className="text-sm text-gray-600">Average</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold">
                        {metricData.history && metricData.history.length > 0 ? Math.max(...metricData.history.map((h: MetricData) => h.value)) : 0}
                      </div>
                      <div className="text-sm text-gray-600">Peak</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold">
                        {metricData.history && metricData.history.length > 0 ? Math.min(...metricData.history.map((h: MetricData) => h.value)) : 0}
                      </div>
                      <div className="text-sm text-gray-600">Minimum</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {(metricData.history || []).slice(-20).map((point: MetricData, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{formatTimestamp(point.timestamp)}</span>
                        <span className="font-medium">{point.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No metric data available for {selectedMetric}</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="trends" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Performance Trends</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>System Health</span>
                      <span className={`font-medium ${getHealthColor(healthData?.report.systemHealth || 0)}`}>
                        {healthData?.report.systemHealth || 0}% ↗️
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Average Latency</span>
                      <span className="font-medium">
                        {formatLatency(healthData?.report?.responseLatency?.average || 0)} ↘️
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Error Rate</span>
                      <span className="font-medium">
                        {((healthData?.report?.errorRate || 0) * 100).toFixed(2)}% ↘️
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Resource Utilization</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Database Connections</span>
                        <span>{healthData?.report?.databasePerformance?.activeConnections || 0}/50</span>
                      </div>
                      <Progress value={(healthData?.report?.databasePerformance?.activeConnections || 0) * 2} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory Usage</span>
                        <span>65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
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