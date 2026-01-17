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
import { 
  Users, Target, Calendar, Mail, Phone, LinkedinIcon, 
  TrendingUp, Clock, CheckCircle, AlertCircle, 
  Zap, Award, DollarSign, ArrowRight 
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface InvestorSegment {
  id: string;
  name: string;
  count: number;
  description: string;
  strategy: string;
  priority: 'high' | 'medium' | 'low';
  expectedCheckSize: { min: number; max: number };
  timeline: string;
  touchpoints: string[];
}

interface EngagementCampaign {
  id: string;
  name: string;
  segment: string;
  type: string;
  timeline: string;
  touchpoints: Array<{
    channel: string;
    timing: string;
    message: string;
    cta: string;
  }>;
  expectedOutcome: string;
  successMetrics: string[];
}

export default function StrategicEngagementDashboard() {
  const { toast } = useToast();
  const [selectedInvestor, setSelectedInvestor] = useState({ name: '', company: '', type: '' });

  const { data: pipelineData, isLoading: pipelineLoading } = useQuery({
    queryKey: ['/api/investor/pipeline-analysis'],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ['/api/investor/engagement-campaigns'],
  });

  const { data: actionPlanData, isLoading: actionPlanLoading } = useQuery({
    queryKey: ['/api/investor/action-plan'],
  });

  const generateMessagesMutation = useMutation({
    mutationFn: async (investorData: any) => {
      return apiRequest('POST', '/api/investor/personalized-messages', investorData);
    },
    onSuccess: () => {
      toast({
        title: "Messages Generated",
        description: "Personalized outreach messages have been created",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Unable to generate personalized messages",
        variant: "destructive",
      });
    },
  });

  const handleGenerateMessages = () => {
    if (!selectedInvestor.name || !selectedInvestor.company) {
      toast({
        title: "Investor Details Required",
        description: "Please enter investor name and company",
        variant: "destructive",
      });
      return;
    }

    generateMessagesMutation.mutate({
      investorType: selectedInvestor.type || 'general',
      investorName: selectedInvestor.name,
      company: selectedInvestor.company
    });
  };

  if (pipelineLoading || campaignsLoading || actionPlanLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        <span className="ml-2">Analyzing investor engagement strategy...</span>
      </div>
    );
  }

  const pipeline = pipelineData?.analysis;
  const campaigns = campaignsData?.campaigns;
  const actionPlan = actionPlanData?.actionPlan;

  return (
    <div className="space-y-6" data-testid="strategic-engagement-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Strategic Investor Engagement</h2>
          <p className="text-muted-foreground">61-investor pipeline management and conversion strategy</p>
        </div>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/investor/pipeline-analysis'] })}>
          Refresh Analysis
        </Button>
      </div>

      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pipeline">Pipeline Analysis</TabsTrigger>
          <TabsTrigger value="campaigns">Engagement Campaigns</TabsTrigger>
          <TabsTrigger value="action-plan">Action Plan</TabsTrigger>
          <TabsTrigger value="messages">Message Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card data-testid="card-total-pipeline">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pipeline?.totalInvestors || 61}</div>
                <p className="text-xs text-muted-foreground">
                  Active investors
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-ready-close">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ready to Close</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{pipeline?.readyForClose || 0}</div>
                <p className="text-xs text-muted-foreground">
                  High conversion probability
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-needs-nurturing">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Needs Nurturing</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pipeline?.needsNurturing || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Relationship building
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-cold-outreach">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cold Outreach</CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{pipeline?.coldOutreach || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Initial contact needed
                </p>
              </CardContent>
            </Card>
          </div>

          {pipeline?.segments && (
            <Card>
              <CardHeader>
                <CardTitle>Investor Segments</CardTitle>
                <CardDescription>Strategic segmentation and engagement approach</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pipeline.segments.map((segment: InvestorSegment) => (
                    <div key={segment.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium flex items-center">
                            {segment.name}
                            <Badge 
                              variant={segment.priority === 'high' ? 'default' : segment.priority === 'medium' ? 'secondary' : 'outline'}
                              className="ml-2"
                            >
                              {segment.priority} priority
                            </Badge>
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">{segment.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{segment.count}</div>
                          <div className="text-xs text-muted-foreground">investors</div>
                        </div>
                      </div>
                      
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium mb-1">Strategy:</p>
                          <p className="text-sm text-muted-foreground">{segment.strategy}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Check Size:</p>
                          <p className="text-sm font-medium text-green-600">
                            ${segment.expectedCheckSize.min.toLocaleString()} - ${segment.expectedCheckSize.max.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-1">Timeline: {segment.timeline}</p>
                        <div className="flex flex-wrap gap-1">
                          {segment.touchpoints.map((touchpoint, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {touchpoint}
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

          {pipeline?.insights && (
            <Card>
              <CardHeader>
                <CardTitle>Strategic Insights</CardTitle>
                <CardDescription>Key observations and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pipeline.insights.map((insight: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 rounded">
                      <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span className="text-sm">{insight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          {campaigns && (
            <div className="grid gap-6">
              {campaigns.map((campaign: EngagementCampaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          {campaign.name}
                          <Badge variant="secondary" className="ml-2">
                            {campaign.type}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{campaign.timeline}</CardDescription>
                      </div>
                      <Badge variant="outline">{campaign.segment}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Touchpoint Sequence:</h4>
                        <div className="space-y-3">
                          {campaign.touchpoints.map((touchpoint, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 border rounded">
                              <div className="flex-shrink-0">
                                {touchpoint.channel === 'email' && <Mail className="h-4 w-4 text-blue-600" />}
                                {touchpoint.channel === 'call' && <Phone className="h-4 w-4 text-green-600" />}
                                {touchpoint.channel === 'linkedin' && <LinkedinIcon className="h-4 w-4 text-blue-700" />}
                                {touchpoint.channel === 'demo' && <Zap className="h-4 w-4 text-purple-600" />}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium capitalize">{touchpoint.channel}</span>
                                  <span className="text-xs text-muted-foreground">{touchpoint.timing}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{touchpoint.message}</p>
                                <Badge variant="outline" className="text-xs">
                                  <ArrowRight className="h-3 w-3 mr-1" />
                                  {touchpoint.cta}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <h4 className="font-medium mb-1">Expected Outcome:</h4>
                          <p className="text-sm text-muted-foreground">{campaign.expectedOutcome}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Success Metrics:</h4>
                          <div className="flex flex-wrap gap-1">
                            {campaign.successMetrics.map((metric, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {metric}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="action-plan" className="space-y-4">
          {actionPlan && (
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                            <span>{action.replace(/^[📧🤝📊🎯📱📞📄🔍📋💼🎥]/g, '').trim()}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Ongoing Activities</CardTitle>
                    <CardDescription>Continuous engagement tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {actionPlan.ongoing?.map((activity: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2 p-2 bg-green-50 rounded">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <span className="text-sm">{activity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Key Metrics</CardTitle>
                    <CardDescription>Success measurement targets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {actionPlan.keyMetrics?.map((metric: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 rounded">
                          <Award className="h-4 w-4 text-blue-600 mt-0.5" />
                          <span className="text-sm">{metric}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Message Generator</CardTitle>
              <CardDescription>Generate AI-powered outreach messages for specific investors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="investor-name">Investor Name</Label>
                    <Input
                      id="investor-name"
                      placeholder="John Smith"
                      value={selectedInvestor.name}
                      onChange={(e) => setSelectedInvestor({...selectedInvestor, name: e.target.value})}
                      data-testid="input-investor-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="investor-company">Company/Fund</Label>
                    <Input
                      id="investor-company"
                      placeholder="Acme Ventures"
                      value={selectedInvestor.company}
                      onChange={(e) => setSelectedInvestor({...selectedInvestor, company: e.target.value})}
                      data-testid="input-investor-company"
                    />
                  </div>
                  <div>
                    <Label htmlFor="investor-type">Investor Type</Label>
                    <Select value={selectedInvestor.type} onValueChange={(value) => setSelectedInvestor({...selectedInvestor, type: value})}>
                      <SelectTrigger data-testid="select-investor-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seed">Seed Stage</SelectItem>
                        <SelectItem value="series-a">Series A</SelectItem>
                        <SelectItem value="immigration-focused">Immigration Tech</SelectItem>
                        <SelectItem value="b2b-saas">B2B SaaS</SelectItem>
                        <SelectItem value="strategic">Strategic/Corporate</SelectItem>
                        <SelectItem value="angel">Angel Investor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button 
                  onClick={handleGenerateMessages}
                  disabled={generateMessagesMutation.isPending}
                  className="w-full"
                  data-testid="button-generate-messages"
                >
                  {generateMessagesMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Generating Messages...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Personalized Messages
                    </>
                  )}
                </Button>

                {generateMessagesMutation.data && (
                  <div className="mt-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Email Subject</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm font-medium">{generateMessagesMutation.data.messages.subject}</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">LinkedIn Message</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{generateMessagesMutation.data.messages.linkedin}</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Email Content</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-sm whitespace-pre-wrap">{generateMessagesMutation.data.messages.email}</pre>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Follow-up Email</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-sm whitespace-pre-wrap">{generateMessagesMutation.data.messages.followUp}</pre>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}