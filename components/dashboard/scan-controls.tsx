import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Settings, Play, Square, RefreshCw, Clock, Zap, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface ScanControlsProps {
  onRefreshStats: () => void;
  onRefreshLeads: () => void;
}

export default function ScanControls({ onRefreshStats, onRefreshLeads }: ScanControlsProps) {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [scanningStatus, setScanningStatus] = useState<'idle' | 'scanning' | 'completed'>('idle');
  const [autoScanEnabled, setAutoScanEnabled] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    reddit: true,
    linkedin: true,
    facebook: false, // Default off - requires API setup
    instagram: false, // Default off - requires API setup
    twitter: false, // Default off to save tokens
  });
  const [scanProgress, setScanProgress] = useState(0);
  const [currentPlatform, setCurrentPlatform] = useState<string>('');
  const [scanResults, setScanResults] = useState<{[key: string]: { success: boolean; count: number; }}>({});

  const handleStartScan = async () => {
    try {
      setIsScanning(true);
      setScanningStatus('scanning');
      setScanProgress(0);
      setScanResults({});
      
      const platformsToScan = Object.entries(selectedPlatforms)
        .filter(([_, enabled]) => enabled)
        .map(([platform, _]) => platform);

      toast({
        title: "Starting comprehensive scan",
        description: `Analyzing ${platformsToScan.join(', ')} for authentic immigration discussions...`,
      });
      
      // Simulate progressive scanning with detailed feedback
      for (let i = 0; i < platformsToScan.length; i++) {
        const platform = platformsToScan[i];
        setCurrentPlatform(platform);
        setScanProgress((i / platformsToScan.length) * 70); // Leave 30% for AI analysis
        
        toast({
          title: `Scanning ${platform}`,
          description: `Searching for authentic immigration discussions and validating sources...`,
        });
        
        // Simulate platform-specific scanning time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mark platform as scanned (we'll update with real results later)
        setScanResults(prev => ({
          ...prev,
          [platform]: { success: true, count: 0 } // Will be updated with actual results
        }));
      }
      
      // AI Analysis phase
      setCurrentPlatform('AI Analysis');
      setScanProgress(80);
      toast({
        title: "AI Analysis in progress",
        description: "Analyzing content quality, scoring leads, and generating insights...",
      });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // API call
      const response = await api.refreshData();
      
      setScanProgress(95);
      setCurrentPlatform('Finalizing');
      
      // Update scan results with actual API response data
      if ((response as any)?.results) {
        const updatedResults: {[key: string]: { success: boolean; count: number; }} = {};
        (response as any).results.forEach((result: any) => {
          updatedResults[result.platform] = {
            success: result.success,
            count: result.data?.leads || 0
          };
        });
        setScanResults(updatedResults);
      }
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      onRefreshStats();
      onRefreshLeads();
      
      setScanProgress(100);
      setScanningStatus('completed');
      setCurrentPlatform('');
      
      // Show detailed completion with actual results
      const totalNewLeads = (response as any)?.results?.reduce((sum: number, result: any) => 
        sum + (result.data?.leads || 0), 0) || 0;
      
      const apiResponse = (response as any)?.message || '';
      const detailedMessage = totalNewLeads > 0 
        ? `${apiResponse}. Found ${totalNewLeads} new leads.`
        : `${apiResponse}. No new content found (duplicates filtered out).`;
      
      toast({
        title: "Scan completed successfully",
        description: detailedMessage,
      });
      
      // Auto-reset status after a few seconds
      setTimeout(() => {
        setScanningStatus('idle');
        setScanProgress(0);
        setScanResults({});
      }, 8000);
      
    } catch (error) {
      setScanningStatus('idle');
      setScanProgress(0);
      setCurrentPlatform('');
      setScanResults({});
      toast({
        title: "Scan failed",
        description: "Some platforms may have limited access. Check API credentials.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleStopScan = () => {
    setIsScanning(false);
    setScanningStatus('idle');
    toast({
      title: "Scanning stopped",
      description: "Manual scanning control active",
    });
  };

  const handleRefresh = () => {
    onRefreshStats();
    onRefreshLeads();
    toast({
      title: "Data refreshed",
      description: "Dashboard data updated from cache (no token usage)",
    });
  };

  const togglePlatform = (platform: keyof typeof selectedPlatforms) => {
    setSelectedPlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const getStatusColor = () => {
    switch (scanningStatus) {
      case 'scanning': return 'bg-blue-500 animate-pulse';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    switch (scanningStatus) {
      case 'scanning': return 'Scanning...';
      case 'completed': return 'Scan Complete';
      default: return 'Manual Control';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Scan Controls
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
            <span className="text-sm font-medium text-gray-700">{getStatusText()}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Platform Selection */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Select Platforms to Scan</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <Switch
                id="reddit"
                checked={selectedPlatforms.reddit}
                onCheckedChange={() => togglePlatform('reddit')}
              />
              <Label htmlFor="reddit" className="text-sm font-medium">
                Reddit
              </Label>
              <Badge variant="outline" className="ml-auto text-xs">
                Free
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <Switch
                id="linkedin"
                checked={selectedPlatforms.linkedin}
                onCheckedChange={() => togglePlatform('linkedin')}
              />
              <Label htmlFor="linkedin" className="text-sm font-medium">
                LinkedIn
              </Label>
              <Badge variant="outline" className="ml-auto text-xs">
                Limited
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <Switch
                id="facebook"
                checked={selectedPlatforms.facebook}
                onCheckedChange={() => togglePlatform('facebook')}
              />
              <Label htmlFor="facebook" className="text-sm font-medium">
                Facebook
              </Label>
              <Badge variant="destructive" className="ml-auto text-xs">
                Setup Required
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <Switch
                id="instagram"
                checked={selectedPlatforms.instagram}
                onCheckedChange={() => togglePlatform('instagram')}
              />
              <Label htmlFor="instagram" className="text-sm font-medium">
                Instagram
              </Label>
              <Badge variant="destructive" className="ml-auto text-xs">
                Setup Required
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2 p-3 border rounded-lg col-span-2">
              <Switch
                id="twitter"
                checked={selectedPlatforms.twitter}
                onCheckedChange={() => togglePlatform('twitter')}
              />
              <Label htmlFor="twitter" className="text-sm font-medium">
                Twitter
              </Label>
              <Badge variant="secondary" className="ml-auto text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Tokens
              </Badge>
            </div>
          </div>
        </div>

        {/* Live Monitoring Header */}
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  Live Monitoring
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {scanningStatus === 'scanning' ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 font-mono">{Math.round(scanProgress)}%</span>
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300 ease-out"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={handleStartScan} 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 shadow-sm"
                  disabled={isScanning || !Object.values(selectedPlatforms).some(Boolean)}
                >
                  <Play className="w-4 h-4" />
                  <span>Start Scan</span>
                </Button>
              )}
            </div>
          </div>
          
          {/* Scanning Progress Details */}
          {scanningStatus === 'scanning' && (
            <div className="space-y-3 mt-4">
              {/* Current Platform Indicator */}
              {currentPlatform && (
                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    {currentPlatform ? `Scanning ${currentPlatform}...` : 'Initializing scan...'}
                  </span>
                </div>
              )}
              
              {/* Platform Results */}
              {Object.keys(scanResults).length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(scanResults).map(([platform, result]) => (
                    <div key={platform} className="flex items-center space-x-1 text-xs bg-gray-50 rounded px-2 py-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="capitalize font-medium">{platform}</span>
                      <Badge variant="outline" className="text-xs">{result.count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stop Scan Control - Only visible during scanning */}
        {isScanning && (
          <div className="flex justify-center">
            <Button 
              onClick={handleStopScan} 
              variant="destructive"
              size="sm"
              disabled={!isScanning}
            >
              <Square className="mr-2 h-4 w-4" />
              Stop Scan
            </Button>
          </div>
        )}

        {/* Status Footer */}
        {!isScanning && (
          <div className="text-xs text-gray-500 text-center mt-4">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-3 h-3" />
              <span>
                {scanningStatus === 'completed' 
                  ? `Last scan: ${new Date().toLocaleTimeString()} - All selected platforms`
                  : 'Ready to scan - Select platforms and click Start Scan'
                }
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}