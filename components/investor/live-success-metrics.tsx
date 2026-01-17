import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, DollarSign, Clock, Activity, Target, Zap } from 'lucide-react';

interface LiveMetrics {
  conversions: {
    todayCount: number;
    todayRevenue: number;
    averageConversionTime: string;
    averageDealValue: number;
  };
  performance: {
    responseTime: number;
    cacheHitRate: number;
    uptime: number;
  };
  pipeline: {
    activeSequences: number;
    qualifiedLeads: number;
    conversionRate: number;
  };
}

interface ConversionEvent {
  leadId: string;
  amount: number;
  serviceType: string;
  conversionPath: string;
  timestamp: string;
}

export default function LiveSuccessMetrics() {
  const [metrics, setMetrics] = useState<LiveMetrics | null>(null);
  const [recentConversions, setRecentConversions] = useState<ConversionEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial metrics
    fetchMetrics();

    // Setup WebSocket connection for real-time updates
    setupWebSocket();

    return () => {
      // Cleanup WebSocket on unmount
      if (window.ws) {
        window.ws.close();
      }
    };
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/live-metrics');
      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Failed to fetch live metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      window.ws = new WebSocket(wsUrl);
      
      window.ws.onopen = () => {
        setIsConnected(true);
        console.log('🔌 Connected to live metrics WebSocket');
      };

      window.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      window.ws.onclose = () => {
        setIsConnected(false);
        console.log('🔌 WebSocket disconnected, attempting reconnection...');
        setTimeout(setupWebSocket, 5000); // Reconnect after 5 seconds
      };

      window.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
    }
  };

  const handleWebSocketMessage = (message: any) => {
    if (message.type === 'conversion') {
      const conversion: ConversionEvent = message.data;
      
      // Add to recent conversions
      setRecentConversions(prev => [conversion, ...prev.slice(0, 4)]);
      
      // Show celebration toast
      toast({
        title: "🎉 New Conversion!",
        description: `$${conversion.amount} from ${conversion.serviceType}`,
        duration: 5000,
      });

      // Refresh metrics to show updated totals
      fetchMetrics();
    }
  };

  const simulateConversion = async () => {
    try {
      const response = await fetch('/api/live-metrics/simulate-conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: 'demo-lead-' + Date.now(),
          conversionType: 'consultation',
          dealValue: Math.floor(Math.random() * 1000) + 500
        })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Demo Conversion Simulated",
          description: data.message,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to simulate conversion:', error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {isConnected ? 'Live updates connected' : 'Reconnecting...'}
          </span>
        </div>
        <Button onClick={simulateConversion} size="sm" variant="outline">
          <Zap className="h-4 w-4 mr-2" />
          Demo Conversion
        </Button>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Today's Revenue */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <Badge variant="secondary" className="text-green-700 bg-green-200">
                Today
              </Badge>
            </div>
            <div className="text-3xl font-bold text-green-800 mb-1">
              ${metrics?.conversions.todayRevenue.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-green-600">
              {metrics?.conversions.todayCount || 0} conversions today
            </div>
          </CardContent>
        </Card>

        {/* Average Deal Value */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-8 w-8 text-blue-600" />
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-800 mb-1">
              ${metrics?.conversions.averageDealValue.toFixed(0) || '0'}
            </div>
            <div className="text-sm text-blue-600">Average deal value</div>
          </CardContent>
        </Card>

        {/* Conversion Time */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-8 w-8 text-purple-600" />
              <Badge variant="outline" className="text-purple-700">
                Avg
              </Badge>
            </div>
            <div className="text-3xl font-bold text-purple-800 mb-1">
              {metrics?.conversions.averageConversionTime || 'N/A'}
            </div>
            <div className="text-sm text-purple-600">Time to convert</div>
          </CardContent>
        </Card>

        {/* System Performance */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-8 w-8 text-orange-600" />
              <Badge variant="secondary" className="text-orange-700 bg-orange-200">
                Live
              </Badge>
            </div>
            <div className="text-3xl font-bold text-orange-800 mb-1">
              {metrics?.performance.responseTime.toFixed(0) || '0'}ms
            </div>
            <div className="text-sm text-orange-600">
              Response time • {metrics?.performance.uptime.toFixed(1) || '0'}% uptime
            </div>
          </CardContent>
        </Card>

        {/* Active Pipeline */}
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-8 w-8 text-indigo-600" />
              <TrendingUp className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="text-3xl font-bold text-indigo-800 mb-1">
              {metrics?.pipeline.activeSequences || 0}
            </div>
            <div className="text-sm text-indigo-600">
              Active follow-up sequences
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-teal-600" />
              <Badge variant="outline" className="text-teal-700">
                Rate
              </Badge>
            </div>
            <div className="text-3xl font-bold text-teal-800 mb-1">
              {metrics?.pipeline.conversionRate.toFixed(1) || '0'}%
            </div>
            <div className="text-sm text-teal-600">
              Lead conversion rate
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Conversions Feed */}
      {recentConversions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Live Conversion Feed</span>
              <Badge variant="secondary">{recentConversions.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentConversions.map((conversion, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <div className="font-medium text-green-800">
                        ${conversion.amount} • {conversion.serviceType}
                      </div>
                      <div className="text-sm text-green-600">
                        Via {conversion.conversionPath}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-green-500">
                    {new Date(conversion.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Declare global WebSocket for TypeScript
declare global {
  interface Window {
    ws?: WebSocket;
  }
}