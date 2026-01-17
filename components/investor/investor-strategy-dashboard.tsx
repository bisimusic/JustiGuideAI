import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvestorUpdateManager from './investor-update-manager';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  Target, 
  Users, 
  Calendar, 
  Mail, 
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  BarChart3,
  Lightbulb
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface StrategicInsight {
  type: 'growth' | 'milestone' | 'market' | 'competitive' | 'risk' | 'opportunity';
  priority: 'high' | 'medium' | 'low';
  title: string;
  insight: string;
  data: Record<string, any>;
  actionable: string[];
  followUpTiming: string;
  investorRelevance: string[];
}

interface FollowUpStrategy {
  investorType: string;
  timing: string;
  context: string;
  keyPoints: string[];
  askStrategy: string;
  successMetrics: string[];
}

const priorityColors = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
};

const typeIcons = {
  growth: TrendingUp,
  milestone: Target,
  market: BarChart3,
  competitive: Users,
  risk: AlertCircle,
  opportunity: Lightbulb
};

export default function InvestorStrategyDashboard() {
  const [selectedInvestorType, setSelectedInvestorType] = useState<string>('marl5g-strategic');
  const [generatedEmail, setGeneratedEmail] = useState<string>('');
  
  const queryClient = useQueryClient();

  // Fetch strategic insights
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['/api/investor/insights'],
    enabled: true
  });

  // Fetch follow-up strategies
  const { data: strategies, isLoading: strategiesLoading } = useQuery({
    queryKey: ['/api/investor/follow-up-strategies'],
    enabled: true
  });

  // Fetch automation schedule
  const { data: automationSchedule, isLoading: scheduleLoading } = useQuery({
    queryKey: ['/api/investor/automation-schedule'],
    enabled: true
  });

  // Generate follow-up communication
  const generateCommunication = useMutation({
    mutationFn: (investorType: string) => 
      apiRequest(`/api/investor/generate-followup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investorType })
      }),
    onSuccess: (data) => {
      if (data.success) {
        setGeneratedEmail(data.communication);
      }
    }
  });

  const handleGenerateFollowUp = () => {
    generateCommunication.mutate(selectedInvestorType);
  };

  if (insightsLoading || strategiesLoading || scheduleLoading) {
    return (
      <div className="p-6">
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Convert our API response to expected format
  const strategicInsights: StrategicInsight[] = insights ? [
    {
      type: 'growth' as const,
      priority: 'high' as const,
      title: 'Strong Growth Trajectory',
      insight: `Current runway of ${(insights as any)?.runway || 'N/A'} months with ${(insights as any)?.growthRate || 'N/A'}% growth rate shows strong momentum.`,
      data: {
        totalFunding: (insights as any)?.totalFunding || 0,
        burnRate: (insights as any)?.burnRate || 0,
        runway: (insights as any)?.runway || 0,
        growthRate: (insights as any)?.growthRate || 0
      },
      actionable: (insights as any)?.recommendations || [
        'Continue current growth trajectory',
        'Prepare Series A materials',
        'Focus on unit economics'
      ],
      followUpTiming: 'Weekly',
      investorRelevance: ['strategic', 'growth-stage']
    }
  ] : [];

  const followUpStrategies: Record<string, FollowUpStrategy> = strategies ? 
    Object.fromEntries(
      ((strategies as any)?.strategies || []).map((strat: any, index: number) => [
        `strategy-${index}`, 
        {
          investorType: strat.investor || 'Unknown',
          timing: strat.lastContact || 'Unknown',
          context: strat.nextAction || 'Follow up needed',
          keyPoints: [strat.nextAction || 'Update on progress'],
          askStrategy: `Priority: ${strat.priority || 'medium'}`,
          successMetrics: ['Response received', 'Meeting scheduled']
        }
      ])
    ) : {};

  const schedule = automationSchedule ? {
    'daily-reports': {
      automationEnabled: true,
      nextFollowUp: new Date().toISOString(),
      frequency: 'daily',
      template: 'Daily metrics and lead generation report...'
    },
    'weekly-updates': {
      automationEnabled: true, 
      nextFollowUp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      frequency: 'weekly',
      template: 'Weekly performance summary with key metrics...'
    }
  } : {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Investor Strategy Insights</h2>
          <p className="text-muted-foreground">
            Strategic follow-up insights based on current performance metrics
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {strategicInsights.length} Active Insights
        </Badge>
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="insights">Strategic Insights</TabsTrigger>
          <TabsTrigger value="strategies">Follow-up Strategies</TabsTrigger>
          <TabsTrigger value="generate">Generate Communications</TabsTrigger>
          <TabsTrigger value="automation">Automation Schedule</TabsTrigger>
          <TabsTrigger value="updates">Current Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {strategicInsights.map((insight, index) => {
              const IconComponent = typeIcons[insight.type];
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                      </div>
                      <div className="flex space-x-2">
                        <Badge className={priorityColors[insight.priority]}>
                          {insight.priority}
                        </Badge>
                        <Badge variant="outline">
                          {insight.type}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{insight.insight}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.keys(insight.data).length > 0 && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Key Metrics</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(insight.data).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                              <span className="font-medium">
                                {typeof value === 'number' 
                                  ? (key.includes('Rate') || key.includes('Growth') 
                                      ? `${value}%` 
                                      : value.toLocaleString())
                                  : String(value)
                                }
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                        Actionable Items
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {insight.actionable.map((action, actionIndex) => (
                          <li key={actionIndex}>{action}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Follow-up: {insight.followUpTiming}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {insight.investorRelevance.map((relevance, relevanceIndex) => (
                          <Badge key={relevanceIndex} variant="secondary" className="text-xs">
                            {relevance.replace('-', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(followUpStrategies).map(([type, strategy]) => (
              <Card key={type}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span>{strategy.investorType}</span>
                    </CardTitle>
                    <Badge variant="outline">
                      {strategy.timing}
                    </Badge>
                  </div>
                  <CardDescription>{strategy.context}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Key Points to Highlight</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {strategy.keyPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                    <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-300">Ask Strategy</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-400">{strategy.askStrategy}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Success Metrics</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {strategy.successMetrics.map((metric, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <Target className="h-4 w-4 text-green-600" />
                          <span>{metric}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-primary" />
                <span>Generate Strategic Communication</span>
              </CardTitle>
              <CardDescription>
                Create personalized follow-up communications based on strategic insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Investor Type</label>
                  <Select value={selectedInvestorType} onValueChange={setSelectedInvestorType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select investor type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marl5g-strategic">Marl5G Strategic</SelectItem>
                      <SelectItem value="growth-investors">Growth VCs</SelectItem>
                      <SelectItem value="board-members">Board Members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleGenerateFollowUp}
                  disabled={generateCommunication.isPending}
                  className="mt-6"
                >
                  {generateCommunication.isPending ? 'Generating...' : 'Generate Email'}
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              {generatedEmail && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Generated Communication</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(generatedEmail)}
                    >
                      Copy to Clipboard
                    </Button>
                  </div>
                  <ScrollArea className="h-96 w-full border rounded-lg">
                    <Textarea
                      value={generatedEmail}
                      onChange={(e) => setGeneratedEmail(e.target.value)}
                      className="min-h-96 border-none resize-none"
                      placeholder="Generated communication will appear here..."
                    />
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(schedule).map(([type, scheduleInfo]: [string, any]) => (
              <Card key={type}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span>{type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </CardTitle>
                    <Badge variant={scheduleInfo.automationEnabled ? 'default' : 'secondary'}>
                      {scheduleInfo.automationEnabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Next Follow-up:</span>
                      <p className="font-medium">{new Date(scheduleInfo.nextFollowUp).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Frequency:</span>
                      <p className="font-medium capitalize">{scheduleInfo.frequency}</p>
                    </div>
                  </div>
                  
                  {scheduleInfo.template && (
                    <div>
                      <h4 className="font-medium mb-2">Scheduled Template Preview</h4>
                      <ScrollArea className="h-32 bg-muted/50 rounded-lg p-3">
                        <pre className="text-xs whitespace-pre-wrap">
                          {scheduleInfo.template.slice(0, 300)}...
                        </pre>
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="updates" className="space-y-4">
          <InvestorUpdateManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}