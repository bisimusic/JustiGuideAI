import { Card, CardContent } from "@/components/ui/card";
import { Users, Shield, Brain, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@/types";

interface StatsGridProps {
  stats?: DashboardStats;
  isLoading: boolean;
}

export default function StatsGrid({ stats, isLoading }: StatsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Leads",
      value: stats?.totalLeads?.toLocaleString() || "0",
      icon: Users,
      bgColor: "bg-blue-100",
      iconColor: "text-primary",
      change: "+126%",
      changeLabel: "week-over-week"
    },
    {
      title: "Validated Sources",
      value: stats?.validatedSourcesPercentage 
        ? `${parseFloat(String(stats.validatedSourcesPercentage).replace('%', '')).toFixed(1)}%`
        : "99.1%",
      icon: Shield,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      change: "99.2%",
      changeLabel: "validation accuracy"
    },
    {
      title: "AI Score",
      value: stats?.avgAiScore 
        ? parseFloat(String(stats.avgAiScore)).toFixed(1)
        : "6.3",
      icon: Brain,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      change: "6.2/10",
      changeLabel: "average lead quality"
    },
    {
      title: "Active Monitoring",
      value: "24/7",
      icon: Clock,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
      change: "878K",
      changeLabel: "AI responses generated"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 truncate max-w-full">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`${stat.iconColor} text-xl`} />
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <span className="text-green-600 text-sm font-medium">↗ {stat.change}</span>
              <span className="text-gray-500 text-sm">{stat.changeLabel}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
