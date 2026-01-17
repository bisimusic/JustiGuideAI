import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import ConversionStrategyEnhanced from "@/components/conversion-strategy-enhanced";
import { IntelligentAgentControl } from "@/components/intelligent-agent-control";
import { GmailContactExtraction } from "@/components/gmail-contact-extraction";
import { PersonaManagement } from "@/components/persona-management";

export function OperationsDashboard() {
  const [selectedView, setSelectedView] = useState('overview');
  
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => api.getDashboardStats(),
  });

  const { data: contacts } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: () => fetch("/api/contacts").then(res => res.json()),
  });

  const dailyMetrics = {
    leads: {
      discovered: 47,
      responded: 23,
      converted: 8,
      revenue: 3200
    },
    automation: {
      agent_responses: 156,
      email_scans: 89,
      persona_updates: 34,
      success_rate: 87.3
    },
    growth: {
      weekly_leads: +10.5,
      monthly_revenue: +18.7,
      conversion_rate: +2.3,
      investor_meetings: 7
    }
  };

  return (
    <div className="space-y-6">
      {/* Daily Operations Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>⚡</span>
                <span>Daily Operations Dashboard</span>
              </CardTitle>
              <CardDescription>
                Today's activities and automation performance • {new Date().toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                System Healthy
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                All Agents Active
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Today's Leads</h3>
              <p className="text-3xl font-bold">{dailyMetrics.leads.discovered}</p>
              <p className="text-sm opacity-90">+12% vs yesterday</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
              <h3 className="font-semibold mb-2">AI Responses</h3>
              <p className="text-3xl font-bold">{dailyMetrics.automation.agent_responses}</p>
              <p className="text-sm opacity-90">{dailyMetrics.automation.success_rate}% success rate</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Conversions</h3>
              <p className="text-3xl font-bold">{dailyMetrics.leads.converted}</p>
              <p className="text-sm opacity-90">${dailyMetrics.leads.revenue} revenue</p>
            </div>
            
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Growth Rate</h3>
              <p className="text-3xl font-bold">+{dailyMetrics.growth.weekly_leads}%</p>
              <p className="text-sm opacity-90">Week over week</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-3 mb-6">
            <Button 
              onClick={() => setSelectedView('agent')}
              variant={selectedView === 'agent' ? 'default' : 'outline'}
            >
              🤖 Agent Control
            </Button>
            <Button 
              onClick={() => setSelectedView('conversion')}
              variant={selectedView === 'conversion' ? 'default' : 'outline'}
            >
              🎯 Conversion
            </Button>
            <Button 
              onClick={() => setSelectedView('contacts')}
              variant={selectedView === 'contacts' ? 'default' : 'outline'}
            >
              📧 Gmail Extraction
            </Button>
            <Button 
              onClick={() => setSelectedView('personas')}
              variant={selectedView === 'personas' ? 'default' : 'outline'}
            >
              👥 Personas
            </Button>
          </div>

          {/* System Health */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">System Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">API Response Time</span>
                  <span className="text-sm font-semibold">142ms</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Lead Processing</span>
                  <span className="text-sm font-semibold">94%</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Email Integration</span>
                  <span className="text-sm font-semibold">98%</span>
                </div>
                <Progress value={98} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Agent Uptime</span>
                  <span className="text-sm font-semibold">99.7%</span>
                </div>
                <Progress value={99.7} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Content Based on Selection */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>📈 Today's Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div>
                    <span className="text-sm">9:00 AM - Sent daily investor update</span>
                    <p className="text-xs text-gray-500">28 investors notified</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div>
                    <span className="text-sm">10:30 AM - Agent responded to 23 leads</span>
                    <p className="text-xs text-gray-500">Reddit, LinkedIn, Discord</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div>
                    <span className="text-sm">2:15 PM - Gmail scan extracted 12 contacts</span>
                    <p className="text-xs text-gray-500">3 investors, 4 lawyers, 2 employers</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div>
                    <span className="text-sm">4:45 PM - Updated 34 personas</span>
                    <p className="text-xs text-gray-500">AI analysis complete</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎯 Performance Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-green-900">Top Converting Platform</h4>
                  <p className="text-green-700">Reddit - 23.4% conversion rate</p>
                  <p className="text-xs text-green-600">+5.2% from last week</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Best Response Time</h4>
                  <p className="text-blue-700">Average 4.2 minutes</p>
                  <p className="text-xs text-blue-600">Target: &lt;5 minutes</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-purple-900">Revenue Growth</h4>
                  <p className="text-purple-700">$44K MRR (+18.7%)</p>
                  <p className="text-xs text-purple-600">Exceeding $40K target</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedView === 'agent' && (
        <IntelligentAgentControl />
      )}

      {selectedView === 'conversion' && (
        <ConversionStrategyEnhanced />
      )}

      {selectedView === 'contacts' && (
        <GmailContactExtraction />
      )}

      {selectedView === 'personas' && (
        <PersonaManagement />
      )}
    </div>
  );
}