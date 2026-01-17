import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, Users, Target, Clock, DollarSign, Mail, Calendar, BarChart3 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface InvestorProfile {
  id: string;
  name: string;
  email: string;
  company: string;
  investmentStage: string;
  focusAreas: string[];
  checkSize: { min: number; max: number };
  engagementScore: number;
  responseRate: number;
  lastContact: Date | null;
}

export default function EnhancedOutreachDashboard() {
  const { toast } = useToast();
  const [selectedCampaignType, setSelectedCampaignType] = useState<'initial' | 'followup' | 'update' | 'ask'>('initial');
  const [campaignName, setCampaignName] = useState('');

  const { data: analysisData, isLoading: analysisLoading } = useQuery({
    queryKey: ['/api/investor/analysis'],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const { data: timingData } = useQuery({
    queryKey: ['/api/investor/outreach/timing'],
  });

  const { data: competitiveData } = useQuery({
    queryKey: ['/api/investor/competitive-intelligence'],
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      return apiRequest('POST', '/api/investor/outreach/campaign', campaignData);
    },
    onSuccess: () => {
      toast({
        title: "Campaign Created",
        description: "Investor outreach campaign has been generated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/investor/analysis'] });
    },
    onError: () => {
      toast({
        title: "Campaign Failed",
        description: "Unable to create investor outreach campaign",
        variant: "destructive",
      });
    },
  });

  const handleCreateCampaign = () => {
    if (!campaignName.trim()) {
      toast({
        title: "Campaign Name Required",
        description: "Please enter a name for your outreach campaign",
        variant: "destructive",
      });
      return;
    }

    createCampaignMutation.mutate({
      name: campaignName,
      targetCriteria: {
        engagementScoreMin: 50
      },
      campaignType: selectedCampaignType
    });
  };

  if (analysisLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        <span className="ml-2">Analyzing investor portfolio...</span>
      </div>
    );
  }

  const analysis = analysisData?.analysis;
  const timing = timingData?.timing;
  const competitive = competitiveData?.intelligence;

  return (
    <div className="space-y-6" data-testid="enhanced-outreach-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Enhanced Investor Outreach</h2>
          <p className="text-muted-foreground">Data-driven investor engagement and campaign management</p>
        </div>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/investor/analysis'] })}>
          Refresh Analysis
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="timing">Timing</TabsTrigger>
          <TabsTrigger value="competitive">Intelligence</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card data-testid="card-total-investors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis?.profiles?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active portfolio
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-top-performers">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis?.insights?.topPerformers?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  High engagement (70%+)
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-under-engaged">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Re-engagement</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis?.insights?.underEngaged?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Need attention
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-opportunity-gaps">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis?.insights?.opportunityGaps?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Growth areas
                </p>
              </CardContent>
            </Card>
          </div>

          {analysis?.insights?.topPerformers && (
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Investors</CardTitle>
                <CardDescription>Highest engagement scores and response rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.insights.topPerformers.slice(0, 5).map((investor: InvestorProfile) => (
                    <div key={investor.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium">{investor.name}</p>
                          <p className="text-sm text-muted-foreground">{investor.company}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {investor.focusAreas.slice(0, 2).map((area) => (
                              <Badge key={area} variant="secondary" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <div>
                            <p className="text-sm font-medium">{investor.engagementScore}/100</p>
                            <Progress value={investor.engagementScore} className="w-16 h-2" />
                          </div>
                          <Badge variant="default">
                            ${investor.checkSize.min.toLocaleString()}-${investor.checkSize.max.toLocaleString()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {analysis?.insights?.recommendedActions && (
            <Card>
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
                <CardDescription>AI-generated optimization suggestions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.insights.recommendedActions.map((action: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{action}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          {analysis?.profiles && (
            <Card>
              <CardHeader>
                <CardTitle>Investor Portfolio</CardTitle>
                <CardDescription>Complete investor profile analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.profiles.map((investor: InvestorProfile) => (
                    <div key={investor.id} className="flex items-center justify-between p-4 border rounded">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{investor.name}</h4>
                            <p className="text-sm text-muted-foreground">{investor.company}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline">{investor.investmentStage}</Badge>
                              <Badge variant="secondary">
                                ${investor.checkSize.min.toLocaleString()}-${investor.checkSize.max.toLocaleString()}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-muted-foreground">Engagement:</span>
                                <span className="text-sm font-medium">{investor.engagementScore}/100</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-muted-foreground">Response Rate:</span>
                                <span className="text-sm font-medium">{investor.responseRate.toFixed(1)}%</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-muted-foreground">Last Contact:</span>
                                <span className="text-sm">
                                  {investor.lastContact ? new Date(investor.lastContact).toLocaleDateString() : 'Never'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {investor.focusAreas.map((area) => (
                            <Badge key={area} variant="secondary" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Outreach Campaign</CardTitle>
              <CardDescription>Generate personalized investor outreach messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="campaign-name">Campaign Name</Label>
                    <Input
                      id="campaign-name"
                      placeholder="Q4 Series A Outreach"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      data-testid="input-campaign-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="campaign-type">Campaign Type</Label>
                    <Select value={selectedCampaignType} onValueChange={setSelectedCampaignType}>
                      <SelectTrigger data-testid="select-campaign-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="initial">Initial Outreach</SelectItem>
                        <SelectItem value="followup">Follow-up</SelectItem>
                        <SelectItem value="update">Progress Update</SelectItem>
                        <SelectItem value="ask">Funding Ask</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={handleCreateCampaign}
                  disabled={createCampaignMutation.isPending}
                  className="w-full"
                  data-testid="button-create-campaign"
                >
                  {createCampaignMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Generating Campaign...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Generate Campaign
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing" className="space-y-4">
          {timing && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Optimal Outreach Timing</CardTitle>
                  <CardDescription>Best days and times for investor engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Best Days
                      </h4>
                      <div className="space-y-1">
                        {timing.bestDays.map((day: string) => (
                          <Badge key={day} variant="default" className="mr-2">
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Best Times
                      </h4>
                      <div className="space-y-1">
                        {timing.bestTimes.map((time: string) => (
                          <Badge key={time} variant="secondary" className="mr-2">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Timing Insights</CardTitle>
                  <CardDescription>Data-driven recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {timing.insights.map((insight: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2 p-2 bg-green-50 rounded">
                        <BarChart3 className="w-4 h-4 text-green-600 mt-0.5" />
                        <span className="text-sm">{insight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="competitive" className="space-y-4">
          {competitive && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Market Position</CardTitle>
                  <CardDescription>JustiGuide's competitive advantages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded">
                      <h4 className="font-medium text-blue-900">Market Position</h4>
                      <p className="text-sm text-blue-700">{competitive.marketPosition}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Key Advantages</h4>
                      <div className="space-y-1">
                        {competitive.advantages.map((advantage: string, index: number) => (
                          <div key={index} className="flex items-start space-x-2 p-2 border rounded">
                            <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                            <span className="text-sm">{advantage}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Competitive Landscape</CardTitle>
                  <CardDescription>Key competitors and differentiation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {competitive.competitors.map((competitor: any, index: number) => (
                      <div key={index} className="p-3 border rounded">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{competitor.name}</h4>
                            <p className="text-sm text-muted-foreground">{competitor.stage} • {competitor.funding}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {competitor.differentiators.map((diff: string) => (
                            <Badge key={diff} variant="outline" className="text-xs">
                              {diff}
                            </Badge>
                          ))}
                        </div>
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