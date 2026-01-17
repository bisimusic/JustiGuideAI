import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, Mail, Copy, CheckCircle, Star, Target, 
  TrendingUp, Calendar, ArrowRight, Award
} from "lucide-react";
import GmailScheduler from "./gmail-scheduler";
import InvestorOutreachScheduler from './investor-outreach-scheduler';
import ExtendedInvestorDatabase from './extended-investor-database';
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CurrentInvestorProfile {
  name: string;
  email: string;
  company: string;
  role: string;
  relationship: string;
  networkStrength: string;
  focusAreas: string[];
  introductionCapacity: number;
  bestApproach: string;
  targetConnections: string[];
}

interface PersonalizedOutreach {
  investor: CurrentInvestorProfile;
  subject: string;
  emailContent: string;
  followUpMessage: string;
  specificTargets: string[];
  keyTalkingPoints: string[];
}

export default function CurrentInvestorOutreach() {
  const { toast } = useToast();

  const { data: outreachData, isLoading: outreachLoading } = useQuery({
    queryKey: ['/api/investor/current-outreach'],
    refetchInterval: 300000,
  });

  const { data: profilesData, isLoading: profilesLoading } = useQuery({
    queryKey: ['/api/investor/current-profiles'],
  });

  const { data: actionPlanData, isLoading: actionPlanLoading } = useQuery({
    queryKey: ['/api/investor/immediate-action-plan'],
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Content has been copied successfully",
    });
  };

  if (outreachLoading || profilesLoading || actionPlanLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        <span className="ml-2">Generating personalized outreach for current investors...</span>
      </div>
    );
  }

  const outreach = (outreachData as any)?.outreach;
  const profiles = (profilesData as any)?.profiles;
  const actionPlan = (actionPlanData as any)?.actionPlan;

  return (
    <div className="space-y-6" data-testid="current-investor-outreach">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Current Investor Leverage</h2>
          <p className="text-muted-foreground">Personalized outreach to your 4 active investors for warm introductions</p>
        </div>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/investor/current-outreach'] })}>
          Refresh Outreach
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="outreach">Outreach Messages</TabsTrigger>
          <TabsTrigger value="action-plan">Action Plan</TabsTrigger>
          <TabsTrigger value="tracking">Follow-up Tracking</TabsTrigger>
          <TabsTrigger value="gmail">Gmail Scheduler</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card data-testid="card-active-investors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Investors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">
                  Ready to leverage
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-introduction-capacity">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Introduction Capacity</CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {profiles?.reduce((sum: number, p: CurrentInvestorProfile) => sum + p.introductionCapacity, 0) || 12}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total possible introductions
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-high-network">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Network Strength</CardTitle>
                <Star className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {profiles?.filter((p: CurrentInvestorProfile) => p.networkStrength === 'high').length || 2}
                </div>
                <p className="text-xs text-muted-foreground">
                  Premium connections
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-expected-intros">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expected Success</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">6-9</div>
                <p className="text-xs text-muted-foreground">
                  Successful introductions
                </p>
              </CardContent>
            </Card>
          </div>

          {profiles && (
            <Card>
              <CardHeader>
                <CardTitle>Your Current Investor Portfolio</CardTitle>
                <CardDescription>Detailed profiles and leverage potential</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profiles.map((investor: CurrentInvestorProfile, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{investor.name}</h4>
                          <p className="text-sm text-muted-foreground">{investor.company}</p>
                          <p className="text-sm text-muted-foreground">{investor.role}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant={investor.networkStrength === 'high' ? 'default' : 'secondary'}>
                              {investor.networkStrength} network
                            </Badge>
                            <Badge variant="outline">
                              {investor.introductionCapacity} introductions
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{investor.email}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Focus Areas:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {investor.focusAreas.map((area, areaIndex) => (
                              <Badge key={areaIndex} variant="secondary" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium">Best Approach:</span>
                          <p className="text-sm text-muted-foreground">{investor.bestApproach}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="outreach" className="space-y-4">
          {outreach && (
            <div className="space-y-6">
              {outreach.map((message: PersonalizedOutreach, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{message.investor.name}</CardTitle>
                        <CardDescription>{message.investor.company} • {message.investor.relationship}</CardDescription>
                      </div>
                      <Badge variant={message.investor.networkStrength === 'high' ? 'default' : 'secondary'}>
                        {message.investor.networkStrength} network
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Email Subject</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(message.subject)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <p className="text-sm font-medium bg-gray-50 p-2 rounded border">
                          {message.subject}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Email Content</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(message.emailContent)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <Textarea
                          value={message.emailContent}
                          readOnly
                          className="min-h-[200px] text-sm"
                          data-testid={`email-content-${index}`}
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="font-medium mb-2">Specific Target Introductions</h4>
                          <div className="space-y-1">
                            {message.specificTargets.map((target: string, targetIndex: number) => (
                              <div key={targetIndex} className="flex items-start space-x-2 text-sm">
                                <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                                <span>{target}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Key Talking Points</h4>
                          <div className="space-y-1">
                            {message.keyTalkingPoints.map((point: string, pointIndex: number) => (
                              <div key={pointIndex} className="flex items-start space-x-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                <span>{point}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Follow-up Message (if no response)</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(message.followUpMessage)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <Textarea
                          value={message.followUpMessage}
                          readOnly
                          className="min-h-[100px] text-sm"
                          data-testid={`followup-message-${index}`}
                        />
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
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Week 1 Priority Actions</CardTitle>
                  <CardDescription>Immediate steps to maximize introductions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {actionPlan.week1Actions.map((action: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 rounded">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center mt-0.5">
                          <span className="text-xs font-medium">{index + 1}</span>
                        </div>
                        <span className="text-sm">{action}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Priority Order</CardTitle>
                    <CardDescription>Strategic sequencing for maximum impact</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {actionPlan.priorityOrder.map((priority: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2 text-sm">
                          <ArrowRight className="h-4 w-4 text-green-600 mt-0.5" />
                          <span>{priority}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Expected Outcomes</CardTitle>
                    <CardDescription>Projected results by investor</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(actionPlan.expectedOutcomes).map(([investor, outcome]: [string, any], index: number) => (
                        <div key={index} className="p-2 border rounded">
                          <div className="font-medium text-sm">{investor}</div>
                          <div className="text-sm text-muted-foreground">{outcome}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Success Metrics</CardTitle>
                  <CardDescription>Key performance indicators for leverage strategy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {actionPlan.successMetrics.map((metric: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2 p-2 bg-green-50 rounded">
                        <Award className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-sm">{metric}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Follow-up Tracking Template</CardTitle>
              <CardDescription>Track introduction requests and responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profiles?.map((investor: CurrentInvestorProfile, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{investor.name} ({investor.company})</h4>
                      <Badge variant="outline">
                        {investor.introductionCapacity} intros capacity
                      </Badge>
                    </div>
                    
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>Initial outreach sent</span>
                        <input type="date" className="ml-auto px-2 py-1 border rounded text-xs" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>Response received</span>
                        <input type="date" className="ml-auto px-2 py-1 border rounded text-xs" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>Follow-up call scheduled</span>
                        <input type="date" className="ml-auto px-2 py-1 border rounded text-xs" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>Introductions completed</span>
                        <input type="number" placeholder="0" className="ml-auto px-2 py-1 border rounded text-xs w-16" />
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <label className="text-sm font-medium">Notes:</label>
                      <textarea 
                        placeholder="Track specific connections, follow-up actions, etc..."
                        className="w-full mt-1 px-2 py-1 border rounded text-xs"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gmail" className="space-y-4">
          <GmailScheduler />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <InvestorOutreachScheduler />
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <ExtendedInvestorDatabase />
        </TabsContent>
      </Tabs>
    </div>
  );
}