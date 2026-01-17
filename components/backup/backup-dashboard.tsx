import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Database, GitBranch, Settings, AlertCircle, CheckCircle2, Shield, RefreshCw } from "lucide-react";

interface BackupStatus {
  lastBackup?: string;
  totalBackups: number;
  backupHealth: 'good' | 'warning' | 'error';
  recentBackups: Array<{
    backupId: string;
    timestamp: string;
    success: boolean;
    results: {
      database: boolean;
      code: boolean;
      configs: boolean;
    };
  }>;
  schedule: {
    dailyBackupActive: boolean;
    weeklyBackupActive: boolean;
    nextRun: {
      daily?: string;
      weekly?: string;
    };
  };
}

export function BackupDashboard() {
  const { data: backupStatus, refetch, isLoading } = useQuery<BackupStatus>({
    queryKey: ["/api/backup/status"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const triggerManualBackup = async () => {
    try {
      const response = await fetch('/api/backup/manual', { method: 'POST' });
      const result = await response.json();
      console.log('Manual backup result:', result);
      refetch(); // Refresh status
    } catch (error) {
      console.error('Manual backup failed:', error);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'good': return <CheckCircle2 className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading backup status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <span>Backup Management</span>
          </h1>
          <p className="text-gray-600 mt-1">Automated data protection and recovery system</p>
        </div>
        <Button onClick={triggerManualBackup} className="flex items-center space-x-2">
          <Database className="h-4 w-4" />
          <span>Manual Backup</span>
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Backup Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {backupStatus && getHealthIcon(backupStatus.backupHealth)}
              <Badge className={`${backupStatus ? getHealthColor(backupStatus.backupHealth) : ''}`}>
                {backupStatus?.backupHealth.toUpperCase() || 'UNKNOWN'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Backups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backupStatus?.totalBackups || 0}</div>
            <p className="text-xs text-gray-500">Backup snapshots created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Last Backup</CardTitle>
          </CardHeader>
          <CardContent>
            {backupStatus?.lastBackup ? (
              <div>
                <div className="text-sm font-medium">{formatDate(backupStatus.lastBackup)}</div>
                <p className="text-xs text-gray-500">
                  {Math.round((Date.now() - new Date(backupStatus.lastBackup).getTime()) / (1000 * 60 * 60))} hours ago
                </p>
              </div>
            ) : (
              <span className="text-gray-400">No backups yet</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Schedule Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Backup Schedule</span>
          </CardTitle>
          <CardDescription>Automated backup timing and configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <p className="font-medium">Daily Backups</p>
                <p className="text-sm text-gray-500">{backupStatus?.schedule.nextRun.daily || 'Not scheduled'}</p>
              </div>
            </div>
            <Badge variant={backupStatus?.schedule.dailyBackupActive ? "default" : "secondary"}>
              {backupStatus?.schedule.dailyBackupActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GitBranch className="h-4 w-4 text-green-500" />
              <div>
                <p className="font-medium">Weekly Comprehensive</p>
                <p className="text-sm text-gray-500">{backupStatus?.schedule.nextRun.weekly || 'Not scheduled'}</p>
              </div>
            </div>
            <Badge variant={backupStatus?.schedule.weeklyBackupActive ? "default" : "secondary"}>
              {backupStatus?.schedule.weeklyBackupActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recent Backups */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Backup History</CardTitle>
          <CardDescription>Last 10 backup attempts with component status</CardDescription>
        </CardHeader>
        <CardContent>
          {backupStatus?.recentBackups && backupStatus.recentBackups.length > 0 ? (
            <div className="space-y-3">
              {backupStatus.recentBackups.slice(0, 10).map((backup, index) => (
                <div key={backup.backupId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{backup.backupId}</p>
                    <p className="text-xs text-gray-500">{formatDate(backup.timestamp)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      className={`text-xs ${backup.results.database ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      DB
                    </Badge>
                    <Badge 
                      className={`text-xs ${backup.results.code ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      Code
                    </Badge>
                    <Badge 
                      className={`text-xs ${backup.results.configs ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      Config
                    </Badge>
                    <Badge variant={backup.success ? "default" : "destructive"} className="ml-2">
                      {backup.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No backup history available</p>
              <p className="text-sm">Trigger a manual backup to start the protection system</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}