import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Clock, Zap } from "lucide-react";
import { useState } from "react";
import type { DashboardStats } from "@/types";
import { apiRequest } from "@/lib/queryClient";

interface MonitoringStatusProps {
  stats?: DashboardStats;
}

export default function MonitoringStatus({ stats }: MonitoringStatusProps) {
  const [testingPlatform, setTestingPlatform] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const platforms = [
    {
      platform: 'reddit',
      name: 'Reddit Monitoring',
      description: 'r/immigration, r/USCIS, r/h1b',
      icon: 'fab fa-reddit',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      platform: 'linkedin',
      name: 'LinkedIn Scanning',
      description: 'Immigration professionals network',
      icon: 'fab fa-linkedin',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      platform: 'facebook',
      name: 'Facebook Groups',
      description: 'Immigration discussion groups',
      icon: 'fab fa-facebook',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      platform: 'instagram',
      name: 'Instagram Posts',
      description: 'Immigration-related content',
      icon: 'fab fa-instagram',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      platform: 'tiktok',
      name: 'TikTok Videos',
      description: 'Immigration content & experiences',
      icon: 'fab fa-tiktok',
      color: 'text-black',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    {
      platform: 'twitter',
      name: 'Twitter Monitoring',
      description: 'Immigration hashtags & keywords',
      icon: 'fab fa-twitter',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    {
      platform: 'discord',
      name: 'Discord Servers',
      description: 'Immigration community servers',
      icon: 'fab fa-discord',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      platform: 'quora',
      name: 'Quora Questions',
      description: 'Immigration Q&A and expert answers',
      icon: 'fab fa-quora',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'limited':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-500 text-white',
      pending: 'bg-blue-500 text-white',
      limited: 'bg-yellow-500 text-white',
      inactive: 'bg-red-500 text-white'
    };

    const statusText = {
      active: 'Active',
      pending: 'Pending',
      limited: 'Limited',
      inactive: 'Inactive'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || variants.inactive}>
        {statusText[status as keyof typeof statusText] || 'Unknown'}
      </Badge>
    );
  };

  const triggerManualScan = async () => {
    setIsScanning(true);
    try {
      const result = await apiRequest('/api/monitoring/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('Manual scan result:', result);
      if (result.success) {
        alert(`Manual scan completed! ${result.leadsFound || 0} leads found. Check logs for details.`);
      } else {
        alert(`Scan failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error triggering manual scan:', error);
      alert(`Failed to trigger manual scan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsScanning(false);
    }
  };

  const testConnection = async (platform: string) => {
    if (platform !== 'facebook' && platform !== 'instagram') return;
    
    setTestingPlatform(platform);
    try {
      const response = await fetch(`/api/test/${platform}`);
      const result = await response.json();
      console.log(`${platform} test result:`, result);
    } catch (error) {
      console.error(`Error testing ${platform}:`, error);
    } finally {
      setTestingPlatform(null);
    }
  };

  const getMonitoringCard = (platformConfig: any) => {
    const platformStats = stats?.monitoring?.find(m => m.platform === platformConfig.platform);
    const newPosts = platformStats?.newPosts || 0;
    const status = platformStats?.status || 'active';
    
    return (
      <div key={platformConfig.platform} className={`${platformConfig.bgColor} p-4 rounded-lg border ${platformConfig.borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <i className={`${platformConfig.icon} ${platformConfig.color} text-xl`} />
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="text-sm font-medium text-gray-900">{platformConfig.name}</h4>
                {getStatusIcon(status)}
              </div>
              <p className="text-xs text-gray-600">{platformConfig.description}</p>
              <p className={`text-xs font-medium mt-1 ${
                status === 'active' ? 'text-green-600' : 
                status === 'limited' ? 'text-yellow-600' : 'text-gray-600'
              }`}>
                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                  status === 'active' ? 'bg-green-500' : 
                  status === 'limited' ? 'bg-yellow-500' : 'bg-gray-400'
                }`} />
                {status === 'active' ? `${newPosts} new posts in last hour` :
                 status === 'limited' ? 'Limited access' :
                 'Inactive monitoring'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            {getStatusBadge(status)}
            {(platformConfig.platform === 'facebook' || platformConfig.platform === 'instagram') && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => testConnection(platformConfig.platform)}
                disabled={testingPlatform === platformConfig.platform}
                className="text-xs px-2 py-1 h-6"
              >
                {testingPlatform === platformConfig.platform ? 'Testing...' : 'Test'}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Platform Monitoring Status</CardTitle>
          <div className="flex items-center space-x-4">
            <Button
              onClick={triggerManualScan}
              disabled={isScanning}
              size="sm"
              className="flex items-center space-x-2"
              data-testid="button-manual-scan"
            >
              <Zap className="h-4 w-4" />
              <span>{isScanning ? 'Scanning...' : 'Manual Scan'}</span>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-sm font-medium text-gray-700">Manual Control</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
          {platforms.map((platform) => getMonitoringCard(platform))}
        </div>
        
        {/* API Permissions Notice */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <Clock className="h-4 w-4 text-blue-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">API Permissions Update</p>
              <p className="text-blue-700">
                Facebook and Instagram permissions are being processed. Once approved, full monitoring and posting capabilities will be available.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
