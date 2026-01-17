import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Clock,
  Activity,
  MapPin
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface StagePerformance {
  sequenceType: string;
  stage: number;
  totalActivities: number;
  conversions: number;
  conversionRate: number;
  avgEngagement: number;
}

interface ConversionFunnel {
  sequenceType: string;
  totalSequences: number;
  completed: number;
  converted: number;
  avgStagesCompleted: number;
  avgConversionValue: number;
  conversionRate: number;
}

interface StageDistribution {
  sequenceType: string;
  currentStage: number;
  activeCount: number;
  status: string;
}

export default function StageAnalyticsDashboard() {
  
  const { data: stagePerformance, isLoading: performanceLoading } = useQuery<{ data: StagePerformance[] }>({
    queryKey: ["/api/analytics/stage-performance"],
    queryFn: async () => {
      const response = await fetch('/api/analytics/stage-performance');
      return response.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: conversionFunnels, isLoading: funnelLoading } = useQuery<{ data: ConversionFunnel[] }>({
    queryKey: ["/api/analytics/conversion-funnels"],
    queryFn: async () => {
      const response = await fetch('/api/analytics/conversion-funnels');
      return response.json();
    },
    refetchInterval: 30000
  });

  const { data: stageDistribution, isLoading: distributionLoading } = useQuery<{ data: StageDistribution[] }>({
    queryKey: ["/api/analytics/current-stage-distribution"],
    queryFn: async () => {
      const response = await fetch('/api/analytics/current-stage-distribution');
      return response.json();
    },
    refetchInterval: 30000
  });

  const getStageColor = (conversionRate: number) => {
    if (conversionRate >= 20) return "text-green-600";
    if (conversionRate >= 10) return "text-yellow-600";
    return "text-red-600";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const renderStagePerformanceTable = (stages: StagePerformance[]) => {
    const groupedByType = stages.reduce((acc, stage) => {
      if (!acc[stage.sequenceType]) acc[stage.sequenceType] = [];
      acc[stage.sequenceType].push(stage);
      return acc;
    }, {} as Record<string, StagePerformance[]>);

    return (
      <div className="space-y-6">
        {Object.entries(groupedByType).map(([type, typeStages]) => (
          <Card key={type}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {type.charAt(0).toUpperCase() + type.slice(1)} Sequence Performance
              </CardTitle>
              <CardDescription>
                Conversion rates and engagement by follow-up stage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {typeStages.map((stage) => (
                  <div key={`${type}-${stage.stage}`} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">Stage {stage.stage}</Badge>
                      <div className="text-sm">
                        <div className="font-medium">{stage.totalActivities} activities</div>
                        <div className="text-muted-foreground">Avg engagement: {stage.avgEngagement?.toFixed(1) || '0'}/10</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${getStageColor(stage.conversionRate)}`}>
                        {stage.conversionRate?.toFixed(1) || '0'}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stage.conversions} conversions
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderConversionFunnels = (funnels: ConversionFunnel[]) => (
    <div className="grid gap-6">
      {funnels.map((funnel) => (
        <Card key={funnel.sequenceType} data-testid={`funnel-${funnel.sequenceType}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {funnel.sequenceType.charAt(0).toUpperCase() + funnel.sequenceType.slice(1)} Conversion Funnel
            </CardTitle>
            <CardDescription>
              Complete journey analysis from start to conversion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{funnel.totalSequences}</div>
                <div className="text-sm text-blue-800">Total Sequences</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{funnel.completed}</div>
                <div className="text-sm text-yellow-800">Completed</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{funnel.converted}</div>
                <div className="text-sm text-green-800">Converted</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(funnel.avgConversionValue)}</div>
                <div className="text-sm text-purple-800">Avg Value</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Conversion Rate</span>
                <span className="font-medium">{funnel.conversionRate?.toFixed(1) || '0'}%</span>
              </div>
              <Progress value={funnel.conversionRate} className="h-2" />
            </div>
            
            <div className="mt-4 flex justify-between text-sm text-muted-foreground">
              <span>Avg stages completed: {funnel.avgStagesCompleted?.toFixed(1) || '0'}</span>
              <span>Total value: {formatCurrency(funnel.avgConversionValue * funnel.converted)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderStageDistribution = (distribution: StageDistribution[]) => {
    const groupedByType = distribution.reduce((acc, item) => {
      if (!acc[item.sequenceType]) acc[item.sequenceType] = [];
      acc[item.sequenceType].push(item);
      return acc;
    }, {} as Record<string, StageDistribution[]>);

    return (
      <div className="grid gap-6">
        {Object.entries(groupedByType).map(([type, items]) => {
          const totalActive = items.reduce((sum, item) => sum + item.activeCount, 0);
          
          return (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {type.charAt(0).toUpperCase() + type.slice(1)} - Active Leads by Stage
                </CardTitle>
                <CardDescription>
                  {totalActive} active sequences currently in progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {items.map((item) => {
                    const percentage = totalActive > 0 ? (item.activeCount / totalActive) * 100 : 0;
                    
                    return (
                      <div key={`${type}-stage-${item.currentStage}`} className="text-center p-3 border rounded-lg">
                        <div className="text-xl font-bold">{item.activeCount}</div>
                        <div className="text-sm text-muted-foreground mb-2">Stage {item.currentStage}</div>
                        <Progress value={percentage} className="h-1" />
                        <div className="text-xs text-muted-foreground mt-1">{percentage.toFixed(0)}%</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  if (performanceLoading || funnelLoading || distributionLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Stage Analytics Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Follow-Up Stage Analytics</h1>
        <Badge variant="secondary" className="ml-auto">
          Real-time tracking
        </Badge>
      </div>
      
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance" data-testid="tab-performance">
            <Target className="w-4 h-4 mr-2" />
            Stage Performance
          </TabsTrigger>
          <TabsTrigger value="funnels" data-testid="tab-funnels">
            <TrendingUp className="w-4 h-4 mr-2" />
            Conversion Funnels
          </TabsTrigger>
          <TabsTrigger value="distribution" data-testid="tab-distribution">
            <Users className="w-4 h-4 mr-2" />
            Current Distribution
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="mt-6">
          {stagePerformance?.data && stagePerformance.data.length > 0 ? (
            renderStagePerformanceTable(stagePerformance.data)
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-40">
                <div className="text-center">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No stage performance data available yet</p>
                  <p className="text-sm text-gray-500">Data will appear as follow-up sequences progress</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="funnels" className="mt-6">
          {conversionFunnels?.data && conversionFunnels.data.length > 0 ? (
            renderConversionFunnels(conversionFunnels.data)
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-40">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No conversion funnel data available yet</p>
                  <p className="text-sm text-gray-500">Funnels will appear as sequences complete</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="distribution" className="mt-6">
          {stageDistribution?.data && stageDistribution.data.length > 0 ? (
            renderStageDistribution(stageDistribution.data)
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-40">
                <div className="text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No active sequences to display</p>
                  <p className="text-sm text-gray-500">Distribution will show as follow-up sequences start</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}