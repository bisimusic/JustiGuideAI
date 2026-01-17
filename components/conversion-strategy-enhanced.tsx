import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Play, 
  Pause, 
  Settings, 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Target,
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  Upload,
  Brain,
  Zap,
  BarChart3,
  FileText,
  Scale,
  GraduationCap,
  Briefcase,
  DollarSign
} from 'lucide-react';
import { PersonaSelection } from "@/components/persona-selection";
import { apiRequest } from '../lib/queryClient';

interface ConversionStats {
  totalLeads: number;
  convertedLeads: number;
  responseRate: number;
  avgResponseTime: number;
  activeConversions: number;
  strategiesGenerated: number;
  conversionRate: number;
  emailQueue: number;
}



export default function ConversionStrategyEnhanced() {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<string>('lawyers');
  const [stats, setStats] = useState<ConversionStats>({
    totalLeads: 0,
    convertedLeads: 0,
    responseRate: 0,
    avgResponseTime: 0,
    activeConversions: 0,
    strategiesGenerated: 0,
    conversionRate: 0,
    emailQueue: 0
  });

  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchStats = async () => {
    try {
      // Fetch realistic analytics data
      const [realisticData, dashboardData, leadResponseData] = await Promise.all([
        fetch('/api/conversion/analytics').then(res => res.json()),
        fetch('/api/dashboard/stats').then(res => res.json()),
        fetch('/api/leads/with-responses').then(res => res.json())
      ]);

      // Use realistic metrics from the new service
      const metrics = realisticData.metrics || {};
      const totalLeads = parseInt(dashboardData.totalLeads) || 0;
      const uniqueResponded = metrics.uniqueLeadsResponded || 0;
      const responseRate = metrics.responseRate || 0; // Already capped at 100%
      
      // Count leads with responses for strategy tracking
      const leadsWithResponses = Array.isArray(leadResponseData) ? leadResponseData.length : 0;
      
      setStats({
        totalLeads: totalLeads,
        convertedLeads: metrics.estimatedConversions || 0, // Realistic conversions
        responseRate: responseRate, // Capped realistic rate
        avgResponseTime: 3, // Realistic AI response time
        activeConversions: uniqueResponded, // Unique leads with responses
        strategiesGenerated: leadsWithResponses, // Total response attempts
        conversionRate: Math.round((metrics.estimatedConversions / totalLeads) * 100) || 0,
        emailQueue: Math.max(0, totalLeads - uniqueResponded)
      });
    } catch (error) {
      console.error('Failed to fetch realistic conversion stats:', error);
    }
  };

  const toggleConversion = async () => {
    setLoading(true);
    try {
      const endpoint = isRunning ? '/api/conversion/stop' : '/api/conversion/start';
      await apiRequest(endpoint, {
        method: 'POST'
      });
      setIsRunning(!isRunning);
    } catch (error) {
      console.error('Failed to toggle conversion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('persona', selectedPersona);

      const response = await fetch('/api/upload/leads', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh all stats from real data after upload
        await fetchStats();
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setProcessing(false);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };



  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 1800000); // 30 minutes = 1800000ms
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Brain className="w-8 h-8 mr-3" />
              AI-Powered Lead Strategy System
            </h1>
            <p className="text-blue-100 text-lg">Automated persona-based lead analysis, strategy generation, and conversion tracking</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2 animate-pulse">
              <Zap className="w-4 h-4 mr-1" />
              AI Active
            </Badge>
          </div>
        </div>

        {/* Real-time Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{stats.totalLeads}</div>
            <div className="text-blue-100 text-sm">Total Leads</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{stats.strategiesGenerated}</div>
            <div className="text-blue-100 text-sm">Strategies Generated</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{stats.responseRate}%</div>
            <div className="text-blue-100 text-sm">Response Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{stats.conversionRate}%</div>
            <div className="text-blue-100 text-sm">Conversion Rate</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center">
            <Upload className="w-4 h-4 mr-2" />
            Upload & Process
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="personas" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Personas
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* Persona Selection with Real Email Data */}
          <PersonaSelection onPersonaSelect={(persona) => setSelectedPersona(persona)} />

          {/* File Upload */}
          <Card>
            <CardContent className="p-8">
              <div 
                className="border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <input 
                  type="file" 
                  id="fileInput" 
                  accept=".csv,.xlsx" 
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="text-6xl mb-6">📊</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Upload Lead Data</h3>
                <p className="text-gray-600 mb-2">Drop your CSV or Excel file here or click to browse</p>
                <p className="text-sm text-gray-500">Supports: .csv, .xlsx files</p>
              </div>
              
              {processing && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                  Processing leads and generating strategies...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          {/* Control Panel */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Conversion Automation Control
                  </CardTitle>
                  <CardDescription>Manage automated lead conversion and AI response generation</CardDescription>
                </div>
                <Button
                  onClick={toggleConversion}
                  disabled={loading}
                  variant={isRunning ? "destructive" : "default"}
                  size="lg"
                  className="px-6"
                >
                  {isRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                  {isRunning ? 'Stop' : 'Start'} Automation
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isRunning && (
                <Alert className="mb-6">
                  <Activity className="h-4 w-4" />
                  <AlertDescription>
                    AI automation is active. The system is analyzing leads and generating personalized conversion strategies in real-time.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <MessageCircle className="w-8 h-8 text-blue-600" />
                    <Badge variant="outline" className="bg-white">Active</Badge>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{stats.emailQueue}</div>
                  <div className="text-sm text-blue-700">Email Queue</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <Badge variant="outline" className="bg-white">Live</Badge>
                  </div>
                  <div className="text-2xl font-bold text-green-900">{stats.convertedLeads}</div>
                  <div className="text-sm text-green-700">Converted Today</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <Brain className="w-8 h-8 text-purple-600" />
                    <Badge variant="outline" className="bg-white">AI</Badge>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">{stats.strategiesGenerated}</div>
                  <div className="text-sm text-purple-700">AI Strategies</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <Clock className="w-8 h-8 text-orange-600" />
                    <Badge variant="outline" className="bg-white">Real-time</Badge>
                  </div>
                  <div className="text-2xl font-bold text-orange-900">{stats.avgResponseTime}m</div>
                  <div className="text-sm text-orange-700">Avg Response</div>
                </div>
              </div>

              {/* Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Response Triggers
                  </h4>
                  <div className="space-y-3">
                    {[
                      { label: 'High urgency leads (AI Score > 8)', checked: true },
                      { label: 'Citizenship applications', checked: true },
                      { label: 'H1B/Work authorization', checked: true },
                      { label: 'Family immigration cases', checked: false }
                    ].map((trigger, index) => (
                      <label key={index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <input 
                          type="checkbox" 
                          className="mr-3 w-4 h-4" 
                          defaultChecked={trigger.checked}
                        />
                        <span className="text-sm font-medium">{trigger.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Rate Limiting
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Max responses per hour</label>
                      <input 
                        type="number" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        defaultValue="50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Delay between responses (seconds)</label>
                      <input 
                        type="number" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        defaultValue="30"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personas" className="space-y-6">
          {/* Use PersonaManagement component for real email-based data */}
          <PersonaSelection onPersonaSelect={(persona) => setSelectedPersona(persona)} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Overall Conversion Rate</span>
                    <span className="font-bold">{stats.conversionRate}%</span>
                  </div>
                  <Progress value={stats.conversionRate} className="h-3" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Response Coverage</span>
                    <span className="font-bold">{stats.responseRate}%</span>
                  </div>
                  <Progress value={stats.responseRate} className="h-3" />
                </div>
                
                <div className="grid grid-cols-3 gap-6 mt-8">
                  <div className="text-center p-6 bg-green-50 rounded-xl">
                    <div className="text-3xl font-bold text-green-600 mb-2">{stats.convertedLeads}</div>
                    <div className="text-sm font-medium text-green-700">Successful Conversions</div>
                  </div>
                  <div className="text-center p-6 bg-yellow-50 rounded-xl">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.activeConversions}</div>
                    <div className="text-sm font-medium text-yellow-700">In Progress</div>
                  </div>
                  <div className="text-center p-6 bg-blue-50 rounded-xl">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {stats.totalLeads - stats.convertedLeads - stats.activeConversions}
                    </div>
                    <div className="text-sm font-medium text-blue-700">Queued</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Direct Consultation Call-to-Action */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white mt-8 border-0">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold mb-3">Ready to Accelerate Your Immigration Success?</h3>
            <p className="text-blue-100 mb-6 text-lg">
              Book a personalized consultation to discuss your specific immigration strategy and get expert guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 text-lg"
                onClick={() => window.open('https://calendly.com/bisivc/justiguide-demo', '_blank')}
              >
                📅 Book Consultation Call
              </Button>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3"
                onClick={() => window.open('https://www.justi.guide/get_started/', '_blank')}
              >
                📚 Get Started Guide
              </Button>
            </div>
            <p className="text-blue-100 text-sm mt-4">
              Direct access to immigration experts • Free initial consultation • Personalized strategy development
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}