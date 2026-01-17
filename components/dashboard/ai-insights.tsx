import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Lightbulb, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function AIInsights() {
  const { data: insights, isLoading } = useQuery({
    queryKey: ["/api/insights"],
    queryFn: () => api.getInsights(),
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Skeleton className="w-8 h-8" />
            <Skeleton className="w-32 h-6" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Brain className="text-purple-600 w-4 h-4" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900">AI Insights</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {insights?.trends && insights.trends.length > 0 ? (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <Lightbulb className="text-blue-600 mt-1 w-4 h-4" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Peak Activity Detected</h4>
                <p className="text-xs text-blue-700 mt-1">
                  {insights.trends[0]} discussions are trending higher than usual this week.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <Lightbulb className="text-blue-600 mt-1 w-4 h-4" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Monitoring Active</h4>
                <p className="text-xs text-blue-700 mt-1">
                  AI analysis is running on all new leads to identify high-value opportunities.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-start space-x-3">
            <TrendingUp className="text-green-600 mt-1 w-4 h-4" />
            <div>
              <h4 className="text-sm font-medium text-green-900">Quality Improvement</h4>
              <p className="text-xs text-green-700 mt-1">
                {insights?.qualityMetrics?.averageScore 
                  ? `Average lead quality score: ${insights.qualityMetrics.averageScore.toFixed(1)}/10`
                  : "Lead quality scores are being tracked for continuous improvement."
                }
              </p>
            </div>
          </div>
        </div>

        {insights?.recommendations && insights.recommendations.length > 0 && (
          <div className="mt-4">
            <h5 className="text-sm font-medium text-gray-900 mb-2">Recommendations:</h5>
            <ul className="text-xs text-gray-600 space-y-1">
              {insights.recommendations.slice(0, 3).map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
