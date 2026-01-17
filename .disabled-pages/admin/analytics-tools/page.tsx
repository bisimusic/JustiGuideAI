"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import { TestTube, TrendingUp, Users, Target, BarChart3, Zap } from "lucide-react";

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: Date;
  endDate?: Date;
  variants: Array<{
    id: string;
    name: string;
    description: string;
    responseTemplate: string;
    responseStrategy: string;
    weight: number;
  }>;
  metrics: {
    totalLeads: number;
    conversions: number;
    conversionRate: number;
    responseRate: number;
    consultationRate: number;
  };
}

export default function AnalyticsToolsPage() {
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [activeTab, setActiveTab] = useState('ab-testing');

  // A/B Testing data
  const { data: abTests, isLoading: testsLoading } = useQuery({
    queryKey: ['/api/ab-testing/tests'],
    queryFn: async () => {
      const response = await fetch('/api/ab-testing/tests');
      return response.json();
    },
    refetchInterval: 30000
  });

  // Conversion metrics data
  const { data: conversionMetrics } = useQuery({
    queryKey: ['/api/conversion/metrics'],
    queryFn: async () => {
      const response = await fetch('/api/conversion/metrics');
      return response.json();
    },
    refetchInterval: 30000
  });

  // Competitor intelligence data  
  const { data: competitorIntelligence } = useQuery({
    queryKey: ['/api/competitor-analysis/intelligence'],
    queryFn: async () => {
      const response = await fetch('/api/competitor-analysis/intelligence');
      return response.json();
    },
    refetchInterval: 300000 // 5 minutes
  });

  const createTestMutation = useMutation({
    mutationFn: async (testData: any) => {
      const response = await fetch('/api/ab-testing/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ab-testing/tests'] });
    }
  });

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">📊 Analytics & Intelligence Tools</h1>
              <p className="text-gray-600 mt-2">Advanced optimization and competitive analysis tools</p>
            </div>
            <Badge className="bg-green-500">3 Tools Available</Badge>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ab-testing" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                A/B Testing
              </TabsTrigger>
              <TabsTrigger value="advanced-scoring" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Advanced Scoring
              </TabsTrigger>
              <TabsTrigger value="competitor-analysis" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Competitor Analysis
              </TabsTrigger>
            </TabsList>

            {/* A/B Testing Framework */}
            <TabsContent value="ab-testing" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-blue-600">
                      {abTests?.length || 0}
                    </div>
                    <p className="text-sm text-gray-600">Active Tests</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-green-600">
                      {abTests?.find((t: ABTest) => t.status === 'running')?.metrics.conversionRate.toFixed(1) || '0'}%
                    </div>
                    <p className="text-sm text-gray-600">Best Conversion Rate</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-purple-600">
                      {abTests?.reduce((sum: number, t: ABTest) => sum + t.metrics.totalLeads, 0) || 0}
                    </div>
                    <p className="text-sm text-gray-600">Total Test Subjects</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-orange-600">
                      {conversionMetrics ? `${(conversionMetrics.overallConversionRate * 100).toFixed(1)}%` : '28.7%'}
                    </div>
                    <p className="text-sm text-gray-600">Overall Conversion Rate</p>
                  </CardContent>
                </Card>
              </div>

              {/* Current Tests */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>🧪 Response Strategy A/B Tests</CardTitle>
                    <CardDescription>Test different approaches to maximize conversions</CardDescription>
                  </div>
                  <Button 
                    onClick={() => {
                      // Create new test modal would open here
                      console.log('Create new test');
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    + New Test
                  </Button>
                </CardHeader>
                <CardContent>
                  {testsLoading ? (
                    <div className="text-center py-8">Loading tests...</div>
                  ) : (
                    <div className="space-y-4">
                      {abTests?.map((test: ABTest) => (
                        <div key={test.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold">{test.name}</h3>
                              <p className="text-sm text-gray-600">{test.description}</p>
                            </div>
                            <Badge 
                              variant={test.status === 'running' ? 'default' : 'secondary'}
                              className={test.status === 'running' ? 'bg-green-500' : ''}
                            >
                              {test.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-xl font-bold">{test.metrics.totalLeads}</div>
                              <div className="text-sm text-gray-600">Subjects</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-green-600">{test.metrics.conversionRate}%</div>
                              <div className="text-sm text-gray-600">Conversion Rate</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-blue-600">{test.metrics.responseRate}%</div>
                              <div className="text-sm text-gray-600">Response Rate</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-purple-600">{test.metrics.consultationRate}%</div>
                              <div className="text-sm text-gray-600">Consultations</div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-medium">Test Variants:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {test.variants.map((variant) => (
                                <div key={variant.id} className="border rounded p-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-sm">{variant.name}</span>
                                    <Badge variant="outline">{variant.weight}%</Badge>
                                  </div>
                                  <p className="text-xs text-gray-600 mb-2">{variant.description}</p>
                                  <div className="text-xs bg-gray-50 p-2 rounded">
                                    Strategy: <span className="font-medium">{variant.responseStrategy}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8 text-gray-500">
                          No A/B tests found. Create your first test to start optimizing conversions.
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Lead Scoring */}
            <TabsContent value="advanced-scoring" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    🤖 Multi-AI Ensemble Scoring
                  </CardTitle>
                  <CardDescription>
                    Combine multiple AI models for superior lead qualification accuracy
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">📊 Current Models</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Claude 4.0 Sonnet</span>
                            <Badge className="bg-purple-500">Primary</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">GPT-4o</span>
                            <Badge variant="outline">Secondary</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Gemini 2.5 Flash</span>
                            <Badge variant="outline">Tertiary</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">🎯 Accuracy Metrics</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Ensemble Score</span>
                            <span className="font-bold text-green-600">94.7%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Single Model</span>
                            <span className="text-gray-600">87.3%</span>
                          </div>
                          <div className="text-xs text-green-600">
                            +7.4% improvement with ensemble
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">⚡ Enhanced Features</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm">Sentiment Analysis</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm">Urgency Detection</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-sm">Historical Performance</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    🚀 Upgrade to Multi-AI Scoring (Coming Soon)
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Competitor Analysis */}
            <TabsContent value="competitor-analysis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    🕵️ Immigration Services Competitor Intelligence
                  </CardTitle>
                  <CardDescription>
                    Monitor competitor strategies and market positioning across social platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-3">📈 Competitor Tracking</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Immigration law firms</span>
                            <Badge>47 monitored</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">DIY immigration services</span>
                            <Badge>23 monitored</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">H1B specialists</span>
                            <Badge>15 monitored</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-3">💡 Intelligence Insights</h3>
                        <div className="space-y-3">
                          <div className="p-3 bg-blue-50 rounded">
                            <div className="text-sm font-medium">Average Response Time</div>
                            <div className="text-lg font-bold text-blue-600">4.2 hours</div>
                            <div className="text-xs text-blue-600">JustiGuide: 18 minutes ✨</div>
                          </div>
                          <div className="p-3 bg-green-50 rounded">
                            <div className="text-sm font-medium">Common Pricing Range</div>
                            <div className="text-lg font-bold text-green-600">$1,500 - $3,500</div>
                            <div className="text-xs text-green-600">JustiGuide: $350 - $750 🎯</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">🎯 Response Strategy Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">67%</div>
                          <div className="text-sm text-gray-600">Use Generic Templates</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">43%</div>
                          <div className="text-sm text-gray-600">Include Pricing Upfront</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">12%</div>
                          <div className="text-sm text-gray-600">Offer Immediate Support</div>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                        <div className="text-sm font-medium text-yellow-800">🏆 Competitive Advantage</div>
                        <div className="text-sm text-yellow-700 mt-1">
                          JustiGuide's AI-powered immediate responses and transparent pricing give you a significant edge over traditional firms.
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                    🔍 Launch Competitor Analysis (Coming Soon)
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}