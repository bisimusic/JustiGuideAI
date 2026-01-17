import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users, MousePointerClick, Calendar, TrendingUp } from "lucide-react";

export function ConversionFunnel() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/conversion/funnel"],
    queryFn: async () => {
      const response = await fetch("/api/conversion/funnel");
      const result = await response.json();
      return result.success ? result.funnel : null;
    },
    refetchInterval: 60000 // Refresh every minute
  });

  if (isLoading) {
    return (
      <Card data-testid="card-conversion-funnel">
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">Loading funnel data...</div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const stages = [
    {
      icon: Users,
      label: "Total Leads",
      value: data.totalLeads,
      color: "bg-blue-500"
    },
    {
      icon: ArrowRight,
      label: "Responses Sent",
      value: data.leadsWithResponses,
      rate: data.responseRate,
      color: "bg-indigo-500"
    },
    {
      icon: MousePointerClick,
      label: "CTA Clicks",
      value: data.leadsWithClicks,
      rate: data.clickRate,
      color: "bg-purple-500"
    },
    {
      icon: Calendar,
      label: "Consultations",
      value: data.scheduledConsultations,
      rate: data.conversionRate,
      color: "bg-green-500"
    }
  ];

  return (
    <Card data-testid="card-conversion-funnel">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Conversion Funnel</span>
        </CardTitle>
        <p className="text-sm text-gray-500">
          Overall conversion rate: <span className="font-bold text-green-600">{data.overallConversionRate}%</span>
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={stage.label} className="relative">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stage.color} bg-opacity-10`}>
                    <stage.icon className={`h-5 w-5 ${stage.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">{stage.label}</div>
                    {stage.rate !== undefined && (
                      <div className="text-xs text-gray-500">{stage.rate}% conversion</div>
                    )}
                  </div>
                </div>
                <div className="text-2xl font-bold" data-testid={`text-${stage.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  {stage.value.toLocaleString()}
                </div>
              </div>
              {index < stages.length - 1 && (
                <div className="flex justify-center my-2">
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        {data.leadsWithClicks === 0 && data.leadsWithResponses > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg" data-testid="alert-no-clicks">
            <p className="text-sm text-yellow-800">
              <strong>Action needed:</strong> Responses have been sent, but no CTA clicks detected yet. 
              New tracked links are now active for all future responses!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
