import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, Target, Mail, Phone, LinkedinIcon, 
  TrendingUp, Clock, CheckCircle, Star, 
  ArrowRight, Award, Copy, Download
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CurrentInvestor {
  name: string;
  email: string;
  company: string;
  role: string;
  connectionStrength: string;
  networkQuality: string;
  introductionCapacity: number;
  preferredOutreach: string;
  notes: string;
}

interface IntroductionTarget {
  name: string;
  firm: string;
  stage: string;
  checkSize: string;
  focusArea: string;
  connectionPath: string;
  introductionLikelihood: string;
  timeline: string;
  approach: string;
}

interface LeverageStrategy {
  currentInvestor: CurrentInvestor;
  targetIntroductions: IntroductionTarget[];
  outreachMessage: string;
  followUpPlan: string[];
  expectedOutcome: string;
  timeline: string;
}

export default function LeverageDashboard() {
  const { toast } = useToast();

  const { data: analysisData, isLoading: analysisLoading } = useQuery({
    queryKey: ['/api/investor/current-analysis'],
    refetchInterval: 300000,
  });

  const { data: strategiesData, isLoading: strategiesLoading } = useQuery({
    queryKey: ['/api/investor/leverage-strategies'],
  });

  const { data: targetsData, isLoading: targetsLoading } = useQuery({
    queryKey: ['/api/investor/introduction-targets'],
  });

  const { data: materialsData, isLoading: materialsLoading } = useQuery({
    queryKey: ['/api/investor/introduction-materials'],
  });

  const { data: actionPlanData, isLoading: actionPlanLoading } = useQuery({
    queryKey: ['/api/investor/leverage-action-plan'],
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Content has been copied successfully",
    });
  };

  if (analysisLoading || strategiesLoading || targetsLoading || materialsLoading || actionPlanLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        <span className="ml-2">Analyzing investor leverage opportunities...</span>
      </div>
    );
  }

  const analysis = analysisData?.analysis;
  const strategies = strategiesData?.strategies;
  const targets = targetsData?.targets;
  const materials = materialsData?.materials;
  const actionPlan = actionPlanData?.actionPlan;

  return (
    <div className="space-y-6" data-testid="leverage-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Investor Leverage Strategy</h2>
          <p className="text-muted-foreground">Maximize warm introductions from current investors including Marl5G</p>
        </div>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/investor/current-analysis'] })}>
          Refresh Analysis
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="targets">Targets</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="action-plan">Action Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card data-testid="card-current-investors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Investors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis?.currentInvestors?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Ready to leverage
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-network-reach">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network Reach</CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis?.totalNetworkReach || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Total introductions possible
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-introduction-potential">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Introduction Potential</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{analysis?.introductionPotential || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Expected successful intros
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-tier1-investors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tier 1 Network</CardTitle>
                <Star className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {analysis?.currentInvestors?.filter((inv: CurrentInvestor) => inv.networkQuality === 'tier1').length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Premium connections
                </p>
              </CardContent>
            </Card>
          </div>

          {analysis?.currentInvestors && (
            <Card>
              <CardHeader>
                <CardTitle>Current Investor Portfolio</CardTitle>
                <CardDescription>Your existing investors and their leverage potential</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.currentInvestors.map((investor: CurrentInvestor, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{investor.name}</h4>
                          <p className="text-sm text-muted-foreground">{investor.company} • {investor.role}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant={investor.connectionStrength === 'strong' ? 'default' : 'secondary'}>
                              {investor.connectionStrength} connection
                            </Badge>
                            <Badge variant="outline">
                              {investor.networkQuality} network
                            </Badge>
                            <Badge variant="secondary">
                              {investor.introductionCapacity} intros
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 text-sm">
                            {investor.preferredOutreach === 'email' && <Mail className="h-4 w-4" />}
                            {investor.preferredOutreach === 'call' && <Phone className="h-4 w-4" />}
                            {investor.preferredOutreach === 'linkedin' && <LinkedinIcon className="h-4 w-4" />}
                            <span className="capitalize">{investor.preferredOutreach}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{investor.notes}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {analysis?.leverageOpportunities && (
            <Card>
              <CardHeader>
                <CardTitle>Leverage Opportunities</CardTitle>
                <CardDescription>Strategic insights for maximizing introductions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.leverageOpportunities.map((opportunity: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 rounded">
                      <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span className="text-sm">{opportunity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          {strategies && (
            <div className="space-y-6">
              {strategies.map((strategy: LeverageStrategy, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {strategy.currentInvestor.name}
                      <Badge variant="outline">{strategy.timeline}</Badge>
                    </CardTitle>
                    <CardDescription>
                      {strategy.currentInvestor.company} • {strategy.expectedOutcome}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <Target className="h-4 w-4 mr-2" />
                          Target Introductions ({strategy.targetIntroductions.length})
                        </h4>
                        <div className="grid gap-2 md:grid-cols-2">
                          {strategy.targetIntroductions.map((target: IntroductionTarget, targetIndex: number) => (
                            <div key={targetIndex} className="p-3 border rounded text-sm">
                              <div className="font-medium">{target.name}</div>
                              <div className="text-muted-foreground">{target.firm}</div>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="secondary" className="text-xs">{target.stage}</Badge>
                                <Badge variant="outline" className="text-xs">{target.checkSize}</Badge>
                                <Badge 
                                  variant={target.introductionLikelihood === 'high' ? 'default' : 'secondary'} 
                                  className="text-xs"
                                >
                                  {target.introductionLikelihood}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            Outreach Message
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(strategy.outreachMessage)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <Textarea
                          value={strategy.outreachMessage}
                          readOnly
                          className="min-h-[200px] text-sm"
                          data-testid={`outreach-message-${index}`}
                        />
                      </div>

                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Follow-up Plan
                        </h4>
                        <div className="space-y-1">
                          {strategy.followUpPlan.map((step: string, stepIndex: number) => (
                            <div key={stepIndex} className="flex items-start space-x-2 text-sm">
                              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                                <span className="text-xs font-medium">{stepIndex + 1}</span>
                              </div>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="targets" className="space-y-4">
          {targets && (
            <Card>
              <CardHeader>
                <CardTitle>High-Value Introduction Targets</CardTitle>
                <CardDescription>Prioritized investors for warm introductions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {targets.map((target: IntroductionTarget, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{target.name}</h4>
                          <p className="text-sm text-muted-foreground">{target.firm}</p>
                          <p className="text-sm mt-1">{target.focusArea}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge variant="outline">{target.stage}</Badge>
                          <div className="text-sm font-medium text-green-600">{target.checkSize}</div>
                        </div>
                      </div>
                      
                      <div className="grid gap-3 md:grid-cols-2 text-sm">
                        <div>
                          <span className="font-medium">Connection Path:</span>
                          <p className="text-muted-foreground">{target.connectionPath}</p>
                        </div>
                        <div>
                          <span className="font-medium">Timeline:</span>
                          <p className="text-muted-foreground">{target.timeline}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <span className="font-medium">Approach:</span>
                        <p className="text-sm text-muted-foreground">{target.approach}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <Badge 
                          variant={target.introductionLikelihood === 'high' ? 'default' : target.introductionLikelihood === 'medium' ? 'secondary' : 'outline'}
                        >
                          {target.introductionLikelihood} likelihood
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          {materials && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>One-Pager</CardTitle>
                      <CardDescription>Concise overview for sharing with investors</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(materials.onePager)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded border">
                    {materials.onePager}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Talking Points</CardTitle>
                      <CardDescription>Key discussion points for introductions</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(materials.talkingPoints)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded border">
                    {materials.talkingPoints}
                  </pre>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Wins</CardTitle>
                    <CardDescription>Latest achievements to highlight</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {materials.recentWins.map((win: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2 text-sm">
                          <Award className="h-4 w-4 text-green-600 mt-0.5" />
                          <span>{win}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Next Milestones</CardTitle>
                    <CardDescription>Upcoming goals and targets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {materials.nextMilestones.map((milestone: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2 text-sm">
                          <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                          <span>{milestone}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="action-plan" className="space-y-4">
          {actionPlan && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(actionPlan).filter(([key]) => key.startsWith('week')).map(([week, actions]: [string, any]) => (
                  <Card key={week}>
                    <CardHeader>
                      <CardTitle className="text-lg capitalize">{week.replace(/(\d)/, ' $1')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {actions.map((action: string, index: number) => (
                          <div key={index} className="flex items-start space-x-2 text-sm">
                            <div className="flex-shrink-0 w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                            </div>
                            <span>{action}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Success Metrics</CardTitle>
                  <CardDescription>Key performance indicators for leverage strategy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {actionPlan.successMetrics?.map((metric: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2 p-2 bg-green-50 rounded">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-sm">{metric}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}