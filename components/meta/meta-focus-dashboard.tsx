import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Linkedin, Facebook, Instagram, Target, TrendingUp, Users, DollarSign } from 'lucide-react';

interface MetaFocusStats {
  linkedin: number;
  facebook: number;
  instagram: number;
  total: number;
  qualityScore: number;
  conversionRate: number;
}

export function MetaFocusDashboard() {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanResults, setLastScanResults] = useState<MetaFocusStats | null>(null);

  const handleMetaScan = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/scan/meta-focused', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxResults: 100,
          qualityThreshold: 5.5
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setLastScanResults({
          linkedin: result.stats?.linkedin || 0,
          facebook: result.stats?.facebook || 0,
          instagram: result.stats?.instagram || 0,
          total: result.totalProcessed || 0,
          qualityScore: result.qualityScore || 0,
          conversionRate: 78.5
        });
      }
    } catch (error) {
      console.error('Meta scan error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <Target className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Meta-Focused Lead Generation</h2>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            LinkedIn + Facebook + Instagram
          </Badge>
        </div>
        
        <p className="text-gray-600">
          Concentrated scanning of professional and social platforms for maximum lead quality and conversion rates.
        </p>
      </div>

      {/* Platform Focus Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center space-y-0 pb-3">
            <Linkedin className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <CardTitle className="text-lg">LinkedIn</CardTitle>
              <CardDescription>Professional Networks</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>H1B Discussions</span>
                <Badge variant="outline">High Value</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Corporate Immigration</span>
                <Badge variant="outline">$750 avg</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Professional Visa Help</span>
                <Badge variant="outline">85% qualified</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center space-y-0 pb-3">
            <Facebook className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <CardTitle className="text-lg">Facebook</CardTitle>
              <CardDescription>Community Groups</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Immigration Groups</span>
                <Badge variant="outline">Active Community</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Family Visa Posts</span>
                <Badge variant="outline">$300 avg</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Legal Questions</span>
                <Badge variant="outline">72% qualified</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center space-y-0 pb-3">
            <Instagram className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <CardTitle className="text-lg">Instagram</CardTitle>
              <CardDescription>Visual Content</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Immigration Stories</span>
                <Badge variant="outline">Personal Touch</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Success Posts</span>
                <Badge variant="outline">$499 N400</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Visa Updates</span>
                <Badge variant="outline">68% qualified</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scanning Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Meta Platform Scanning</span>
          </CardTitle>
          <CardDescription>
            Execute targeted scanning across LinkedIn, Facebook, and Instagram platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Button 
              onClick={handleMetaScan}
              disabled={isScanning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isScanning ? 'Scanning...' : 'Start Meta Scan'}
            </Button>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4" />
              <span>Targeting quality score 5.5+ leads</span>
            </div>
          </div>

          {isScanning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Scanning Meta platforms...</span>
                <span>Processing</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
          )}

          {lastScanResults && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-3">Latest Scan Results</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-blue-600 font-medium">LinkedIn</div>
                  <div className="text-xl font-bold">{lastScanResults.linkedin}</div>
                </div>
                <div>
                  <div className="text-blue-600 font-medium">Facebook</div>
                  <div className="text-xl font-bold">{lastScanResults.facebook}</div>
                </div>
                <div>
                  <div className="text-blue-600 font-medium">Instagram</div>
                  <div className="text-xl font-bold">{lastScanResults.instagram}</div>
                </div>
                <div>
                  <div className="text-blue-600 font-medium">Quality Score</div>
                  <div className="text-xl font-bold">{lastScanResults.qualityScore}%</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="targeting">Targeting Strategy</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Platform Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3 Platforms</div>
                <p className="text-xs text-gray-600">LinkedIn, Facebook, Instagram</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Quality Threshold</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5.5+</div>
                <p className="text-xs text-gray-600">AI scoring minimum</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78.5%</div>
                <p className="text-xs text-gray-600">Meta platforms average</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="targeting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Targeting Keywords</CardTitle>
              <CardDescription>Optimized search terms for Meta platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Professional (LinkedIn)</h4>
                  <div className="space-y-1 text-sm">
                    <Badge variant="outline">H1B visa</Badge>
                    <Badge variant="outline">Employment visa</Badge>
                    <Badge variant="outline">Corporate immigration</Badge>
                    <Badge variant="outline">Work permit</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Community (Facebook)</h4>
                  <div className="space-y-1 text-sm">
                    <Badge variant="outline">Immigration help</Badge>
                    <Badge variant="outline">Family visa</Badge>
                    <Badge variant="outline">Green card process</Badge>
                    <Badge variant="outline">Legal questions</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Visual (Instagram)</h4>
                  <div className="space-y-1 text-sm">
                    <Badge variant="outline">#immigration</Badge>
                    <Badge variant="outline">#visa</Badge>
                    <Badge variant="outline">#greencard</Badge>
                    <Badge variant="outline">#H1Bvisa</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Revenue by Platform</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="flex items-center space-x-2">
                    <Linkedin className="h-4 w-4" />
                    <span>LinkedIn</span>
                  </span>
                  <span className="font-bold">$750 avg</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center space-x-2">
                    <Facebook className="h-4 w-4" />
                    <span>Facebook</span>
                  </span>
                  <span className="font-bold">$300 avg</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center space-x-2">
                    <Instagram className="h-4 w-4" />
                    <span>Instagram</span>
                  </span>
                  <span className="font-bold">$499 avg</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Lead Quality Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Professional Immigration</span>
                  <Badge variant="secondary">85% qualified</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Family-based Cases</span>
                  <Badge variant="secondary">72% qualified</Badge>
                </div>
                <div className="flex justify-between">
                  <span>N400 Citizenship</span>
                  <Badge variant="secondary">68% qualified</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}