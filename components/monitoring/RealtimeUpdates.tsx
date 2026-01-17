import { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  CheckCircle, 
  DollarSign, 
  Users, 
  MessageSquare,
  TrendingUp,
  Activity,
  Zap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
// import WebSocketTest from './WebSocketTest'; // Component not found, commented out

interface RealtimeStatsProps {
  onStatsUpdate?: (stats: any) => void;
}

export default function RealtimeUpdates({ onStatsUpdate }: RealtimeStatsProps) {
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [recentResponses, setRecentResponses] = useState<any[]>([]);
  const [recentConversions, setRecentConversions] = useState<any[]>([]);
  const [liveStats, setLiveStats] = useState({
    totalLeads: 0,
    dailyLeads: 0,
    conversionRate: 0,
    weeklyRevenue: 0
  });

  const handleNewLead = (leadData: any) => {
    const { lead, visaType, platform, urgency } = leadData;
    
    setRecentLeads(prev => [{
      id: lead.id,
      title: lead.title,
      platform,
      visaType,
      urgency,
      timestamp: new Date().toISOString()
    }, ...prev.slice(0, 9)]);

    // Show notification
    toast({
      title: `New ${urgency.toUpperCase()} priority lead!`,
      description: `${visaType} inquiry from ${platform}`,
      duration: 5000,
    });
  };

  const handleResponseSent = (responseData: any) => {
    const { leadId, platform, responseContent, timestamp } = responseData;
    
    setRecentResponses(prev => [{
      id: leadId,
      platform,
      content: responseContent,
      timestamp
    }, ...prev.slice(0, 9)]);

    toast({
      title: "Response sent successfully",
      description: `Replied to lead on ${platform}`,
      duration: 3000,
    });
  };

  const handleConversion = (conversionData: any) => {
    const { leadId, amount, serviceType, conversionPath } = conversionData;
    
    setRecentConversions(prev => [{
      id: leadId,
      amount,
      serviceType,
      conversionPath,
      timestamp: new Date().toISOString()
    }, ...prev.slice(0, 9)]);

    toast({
      title: "🎉 New Conversion!",
      description: `$${amount} from ${serviceType} service`,
      duration: 8000,
    });
  };

  const handleAnalyticsUpdate = (statsData: any) => {
    setLiveStats(statsData);
    onStatsUpdate?.(statsData);
  };

  const { isConnected, connectionError, reconnectAttempts, connect } = useWebSocket({
    onNewLead: handleNewLead,
    onResponseSent: handleResponseSent,
    onConversion: handleConversion,
    onAnalyticsUpdate: handleAnalyticsUpdate,
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              {isConnected ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              Real-time Updates
            </span>
            {isConnected ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Wifi className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-red-600 border-red-600">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Disconnected
                </Badge>
                {reconnectAttempts > 0 && (
                  <Button variant="outline" size="sm" onClick={connect}>
                    Retry ({reconnectAttempts}/5)
                  </Button>
                )}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        {connectionError && (
          <CardContent>
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {connectionError}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Live Statistics */}
      {isConnected && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveStats.totalLeads}</div>
              <p className="text-xs text-muted-foreground">
                +{liveStats.dailyLeads} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveStats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Live tracking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(liveStats.weeklyRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Leads</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveStats.dailyLeads}</div>
              <p className="text-xs text-muted-foreground">
                Last 24 hours
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* WebSocket Test Panel */}
      {/* <WebSocketTest /> */}

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Recent Leads
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLeads.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                No new leads yet
              </div>
            ) : (
              recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{lead.visaType}</div>
                    <div className="text-xs text-muted-foreground">
                      {lead.platform} • {formatTime(lead.timestamp)}
                    </div>
                  </div>
                  <Badge variant={getUrgencyColor(lead.urgency)} className="ml-2">
                    {lead.urgency}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Responses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Recent Responses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentResponses.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                No responses sent yet
              </div>
            ) : (
              recentResponses.map((response) => (
                <div key={response.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{response.platform}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(response.timestamp)}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {response.content}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Conversions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Recent Conversions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentConversions.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                No conversions yet
              </div>
            ) : (
              recentConversions.map((conversion, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm text-green-600">
                      {formatCurrency(conversion.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(conversion.timestamp)}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {conversion.serviceType} via {conversion.conversionPath}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}