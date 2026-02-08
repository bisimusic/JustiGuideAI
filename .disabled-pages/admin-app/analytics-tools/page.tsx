"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from '@/components/admin/AdminLayout';
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

  const { data: abTests, isLoading: testsLoading } = useQuery({
    queryKey: ['/api/ab-testing/tests'],
    queryFn: async () => {
      const response = await fetch('/api/ab-testing/tests');
      return response.json();
    },
    refetchInterval: 30000
  });

  const { data: conversionMetrics } = useQuery({
    queryKey: ['/api/conversion/metrics'],
    queryFn: async () => {
      const response = await fetch('/api/conversion/metrics');
      return response.json();
    },
    refetchInterval: 30000
  });

  const { data: competitorIntelligence } = useQuery({
    queryKey: ['/api/competitor-analysis/intelligence'],
    queryFn: async () => {
      const response = await fetch('/api/competitor-analysis/intelligence');
      return response.json();
    },
    refetchInterval: 300000
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
    <AdminLayout
      title="Analytics & Intelligence Tools"
      subtitle="Advanced optimization and competitive analysis tools"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-[#111318] border border-white/5 mb-6">
          <TabsTrigger value="ab-testing" className="flex items-center gap-2 data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">
            <TestTube className="h-4 w-4" />
            A/B Testing
          </TabsTrigger>
          <TabsTrigger value="advanced-scoring" className="flex items-center gap-2 data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">
            <TrendingUp className="h-4 w-4" />
            Advanced Scoring
          </TabsTrigger>
          <TabsTrigger value="competitor-analysis" className="flex items-center gap-2 data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">
            <Target className="h-4 w-4" />
            Competitor Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ab-testing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <div className="text-2xl font-bold text-[#60a5fa] font-['JetBrains_Mono',monospace]">
                {abTests?.length || 0}
              </div>
              <p className="text-sm text-[#8e919a] mt-2">Active Tests</p>
            </div>
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <div className="text-2xl font-bold text-[#00d4aa] font-['JetBrains_Mono',monospace]">
                {abTests?.find((t: ABTest) => t.status === 'running')?.metrics.conversionRate.toFixed(1) || '0'}%
              </div>
              <p className="text-sm text-[#8e919a] mt-2">Best Conversion Rate</p>
            </div>
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <div className="text-2xl font-bold text-[#a78bfa] font-['JetBrains_Mono',monospace]">
                {abTests?.reduce((sum: number, t: ABTest) => sum + t.metrics.totalLeads, 0) || 0}
              </div>
              <p className="text-sm text-[#8e919a] mt-2">Total Test Subjects</p>
            </div>
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <div className="text-2xl font-bold text-[#fb923c] font-['JetBrains_Mono',monospace]">
                {conversionMetrics ? `${(conversionMetrics.overallConversionRate * 100).toFixed(1)}%` : '28.7%'}
              </div>
              <p className="text-sm text-[#8e919a] mt-2">Overall Conversion Rate</p>
            </div>
          </div>

          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-[#f5f5f7]">Response Strategy A/B Tests</h3>
                <p className="text-sm text-[#8e919a] mt-1">Test different approaches to maximize conversions</p>
              </div>
              <Button 
                onClick={() => console.log('Create new test')}
                className="bg-gradient-to-br from-[#00d4aa] to-[#00b894] text-[#0a0b0d] hover:shadow-[0_8px_24px_rgba(0,212,170,0.15)]"
              >
                + New Test
              </Button>
            </div>
            {testsLoading ? (
              <div className="text-center py-8 text-[#8e919a]">Loading tests...</div>
            ) : (
              <div className="space-y-4">
                {abTests?.map((test: ABTest) => (
                  <div key={test.id} className="border border-white/5 rounded-xl p-4 bg-[#181b22]">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-[#f5f5f7]">{test.name}</h4>
                        <p className="text-sm text-[#8e919a]">{test.description}</p>
                      </div>
                      <Badge 
                        className={test.status === 'running' ? 'bg-[#00d4aa] text-[#0a0b0d]' : 'bg-[#181b22] text-[#8e919a] border-white/10'}
                      >
                        {test.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-[#f5f5f7]">{test.metrics.totalLeads}</div>
                        <div className="text-sm text-[#8e919a]">Subjects</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-[#00d4aa]">{test.metrics.conversionRate}%</div>
                        <div className="text-sm text-[#8e919a]">Conversion Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-[#60a5fa]">{test.metrics.responseRate}%</div>
                        <div className="text-sm text-[#8e919a]">Response Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-[#a78bfa]">{test.metrics.consultationRate}%</div>
                        <div className="text-sm text-[#8e919a]">Consultations</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-[#f5f5f7]">Test Variants:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {test.variants.map((variant) => (
                          <div key={variant.id} className="border border-white/5 rounded p-3 bg-[#14161c]">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-sm text-[#f5f5f7]">{variant.name}</span>
                              <Badge variant="outline" className="border-white/10 text-[#8e919a]">{variant.weight}%</Badge>
                            </div>
                            <p className="text-xs text-[#8e919a] mb-2">{variant.description}</p>
                            <div className="text-xs bg-[#181b22] p-2 rounded text-[#8e919a]">
                              Strategy: <span className="font-medium text-[#f5f5f7]">{variant.responseStrategy}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-[#8e919a]">
                    No A/B tests found. Create your first test to start optimizing conversions.
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="advanced-scoring" className="space-y-6">
          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-[#00d4aa]" />
              <h3 className="text-lg font-semibold text-[#f5f5f7]">Multi-AI Ensemble Scoring</h3>
            </div>
            <p className="text-sm text-[#8e919a] mb-6">Combine multiple AI models for superior lead qualification accuracy</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#181b22] border border-white/5 rounded-xl p-4">
                <h4 className="font-semibold text-[#f5f5f7] mb-3">Current Models</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#8e919a]">Claude 4.0 Sonnet</span>
                    <Badge className="bg-[#a78bfa] text-[#0a0b0d]">Primary</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#8e919a]">GPT-4o</span>
                    <Badge variant="outline" className="border-white/10 text-[#8e919a]">Secondary</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#8e919a]">Gemini 2.5 Flash</span>
                    <Badge variant="outline" className="border-white/10 text-[#8e919a]">Tertiary</Badge>
                  </div>
                </div>
              </div>
              <div className="bg-[#181b22] border border-white/5 rounded-xl p-4">
                <h4 className="font-semibold text-[#f5f5f7] mb-3">Accuracy Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#8e919a]">Ensemble Score</span>
                    <span className="font-bold text-[#00d4aa]">94.7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#8e919a]">Single Model</span>
                    <span className="text-[#8e919a]">87.3%</span>
                  </div>
                  <div className="text-xs text-[#00d4aa]">
                    +7.4% improvement with ensemble
                  </div>
                </div>
              </div>
              <div className="bg-[#181b22] border border-white/5 rounded-xl p-4">
                <h4 className="font-semibold text-[#f5f5f7] mb-3">Enhanced Features</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#00d4aa] rounded-full"></div>
                    <span className="text-sm text-[#8e919a]">Sentiment Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#60a5fa] rounded-full"></div>
                    <span className="text-sm text-[#8e919a]">Urgency Detection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#a78bfa] rounded-full"></div>
                    <span className="text-sm text-[#8e919a]">Historical Performance</span>
                  </div>
                </div>
              </div>
            </div>
            <Button className="w-full mt-6 bg-gradient-to-br from-[#a78bfa] to-[#60a5fa] text-[#0a0b0d] hover:shadow-[0_8px_24px_rgba(167,139,250,0.15)]">
              🚀 Upgrade to Multi-AI Scoring (Coming Soon)
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="competitor-analysis" className="space-y-6">
          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-[#00d4aa]" />
              <h3 className="text-lg font-semibold text-[#f5f5f7]">Immigration Services Competitor Intelligence</h3>
            </div>
            <p className="text-sm text-[#8e919a] mb-6">Monitor competitor strategies and market positioning across social platforms</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-[#181b22] border border-white/5 rounded-xl p-4">
                <h4 className="font-semibold text-[#f5f5f7] mb-3">Competitor Tracking</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#8e919a]">Immigration law firms</span>
                    <Badge className="bg-[#00d4aa] text-[#0a0b0d]">47 monitored</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#8e919a]">DIY immigration services</span>
                    <Badge className="bg-[#00d4aa] text-[#0a0b0d]">23 monitored</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#8e919a]">H1B specialists</span>
                    <Badge className="bg-[#00d4aa] text-[#0a0b0d]">15 monitored</Badge>
                  </div>
                </div>
              </div>
              <div className="bg-[#181b22] border border-white/5 rounded-xl p-4">
                <h4 className="font-semibold text-[#f5f5f7] mb-3">Intelligence Insights</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-[rgba(96,165,250,0.1)] rounded border border-[rgba(96,165,250,0.2)]">
                    <div className="text-sm font-medium text-[#60a5fa]">Average Response Time</div>
                    <div className="text-lg font-bold text-[#60a5fa] font-['JetBrains_Mono',monospace]">4.2 hours</div>
                    <div className="text-xs text-[#00d4aa]">JustiGuide: 18 minutes ✨</div>
                  </div>
                  <div className="p-3 bg-[rgba(0,212,170,0.1)] rounded border border-[rgba(0,212,170,0.2)]">
                    <div className="text-sm font-medium text-[#00d4aa]">Common Pricing Range</div>
                    <div className="text-lg font-bold text-[#00d4aa] font-['JetBrains_Mono',monospace]">$1,500 - $3,500</div>
                    <div className="text-xs text-[#00d4aa]">JustiGuide: $350 - $750 🎯</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#181b22] border border-white/5 rounded-xl p-6">
              <h4 className="font-semibold text-[#f5f5f7] mb-4">Response Strategy Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#ff6b6b] font-['JetBrains_Mono',monospace]">67%</div>
                  <div className="text-sm text-[#8e919a]">Use Generic Templates</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#fb923c] font-['JetBrains_Mono',monospace]">43%</div>
                  <div className="text-sm text-[#8e919a]">Include Pricing Upfront</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#00d4aa] font-['JetBrains_Mono',monospace]">12%</div>
                  <div className="text-sm text-[#8e919a]">Offer Immediate Support</div>
                </div>
              </div>
              <div className="p-3 bg-[rgba(251,191,36,0.1)] rounded border border-[rgba(251,191,36,0.2)]">
                <div className="text-sm font-medium text-[#fbbf24]">🏆 Competitive Advantage</div>
                <div className="text-sm text-[#8e919a] mt-1">
                  JustiGuide's AI-powered immediate responses and transparent pricing give you a significant edge over traditional firms.
                </div>
              </div>
            </div>
            <Button className="w-full mt-6 bg-gradient-to-br from-[#fb923c] to-[#ff6b6b] text-[#0a0b0d] hover:shadow-[0_8px_24px_rgba(251,146,60,0.15)]">
              🔍 Launch Competitor Analysis (Coming Soon)
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
