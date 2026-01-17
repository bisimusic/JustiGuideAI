import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Shield, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Zap } from "lucide-react";
import type { AuditResult } from "@/types";

export function SourceValidation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDetails, setShowDetails] = useState(false);

  // Fetch audit data
  const { data: auditData, isLoading, error } = useQuery<AuditResult>({
    queryKey: ["audit", "integrity"],
    queryFn: api.getIntegrityAudit,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Validate all sources mutation
  const validateSourcesMutation = useMutation({
    mutationFn: api.validateAllSources,
    onSuccess: (data: any) => {
      toast({
        title: "Source Validation Complete",
        description: `${data.validated} leads validated, ${data.failed} failed`,
        variant: data.failed > 0 ? "destructive" : "default",
      });
      queryClient.invalidateQueries({ queryKey: ["audit"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => {
      toast({
        title: "Validation Failed",
        description: "Unable to validate sources. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Source Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading validation data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Source Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Unable to load validation data. Please refresh the page.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!auditData) return null;

  // Calculate validation rate from actual API response
  const totalLeads = auditData.totalLeads || 0;
  const leadsWithValidation = auditData.leadsWithValidation || 0;
  const validationRate = totalLeads > 0 ? (leadsWithValidation / totalLeads) * 100 : 0;
  const validSources = leadsWithValidation;
  const invalidSources = totalLeads - leadsWithValidation;
  const dataIntegrity = auditData.dataIntegrity || 'Unknown';
  const lastAudit = auditData.lastAudit;
  
  // Mock issues and recommendations based on data integrity
  const issues = invalidSources > 0 ? [{
    severity: 'medium',
    leadId: 'sample-lead-id',
    issue: `${invalidSources} leads require source validation`
  }] : [];
  const recommendations = validationRate < 100 ? [
    'Run source validation on unvalidated leads',
    'Set up automated validation for new leads'
  ] : [];
  const highSeverityIssues = issues.filter(issue => issue.severity === 'high').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Source Validation System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Data Integrity</span>
            <Badge 
              variant={validationRate >= 95 ? "default" : validationRate >= 90 ? "secondary" : "destructive"}
              className="flex items-center gap-1"
            >
              {validationRate >= 95 ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : validationRate >= 90 ? (
                <AlertTriangle className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              {validationRate.toFixed(1)}% Validated
            </Badge>
          </div>
          
          <Progress value={validationRate} className="h-2" />
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-green-600 dark:text-green-400">
                {validSources}
              </div>
              <div className="text-muted-foreground">Valid Sources</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-red-600 dark:text-red-400">
                {invalidSources}
              </div>
              <div className="text-muted-foreground">Invalid Sources</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-orange-600 dark:text-orange-400">
                {issues.length}
              </div>
              <div className="text-muted-foreground">Issues Found</div>
            </div>
          </div>
        </div>

        {/* Data Quality Status */}
        <div className="space-y-3">
          <Separator />
          <h4 className="text-sm font-medium">Data Quality Status</h4>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <div className="font-medium">Overall Data Integrity</div>
              <div className="text-sm text-muted-foreground">System assessment of data quality</div>
            </div>
            <Badge 
              variant={dataIntegrity === 'Good' ? 'default' : dataIntegrity === 'Fair' ? 'secondary' : 'destructive'}
              className="capitalize"
            >
              {dataIntegrity}
            </Badge>
          </div>
        </div>

        {/* Issues & Recommendations */}
        {(highSeverityIssues > 0 || recommendations.length > 0) && (
          <div className="space-y-3">
            <Separator />
            
            {highSeverityIssues > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {highSeverityIssues} high-priority data integrity issue{highSeverityIssues > 1 ? 's' : ''} detected
                </AlertDescription>
              </Alert>
            )}

            {recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Recommendations</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">Validation Actions</div>
              <div className="text-xs text-muted-foreground">
                Last audit: {lastAudit ? new Date(lastAudit).toLocaleString() : 'Never'}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide' : 'Show'} Details
              </Button>
              
              <Button
                size="sm"
                onClick={() => validateSourcesMutation.mutate()}
                disabled={validateSourcesMutation.isPending}
                className="flex items-center gap-2"
              >
                {validateSourcesMutation.isPending ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Zap className="h-3 w-3" />
                )}
                Validate All
              </Button>
            </div>
          </div>
        </div>

        {/* Detailed Issues */}
        {showDetails && issues.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <h4 className="text-sm font-medium">Detailed Issues</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {issues.map((issue, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-muted/50 rounded-md">
                  <Badge 
                    variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'secondary' : 'outline'}
                    className="text-xs mt-0.5"
                  >
                    {issue.severity}
                  </Badge>
                  <div className="flex-1 space-y-1">
                    <div className="text-xs font-mono text-muted-foreground">
                      {issue.leadId.substring(0, 8)}...
                    </div>
                    <div className="text-sm">{issue.issue}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}