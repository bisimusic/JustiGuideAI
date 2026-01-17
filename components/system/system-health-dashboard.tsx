"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Database, Server, Cpu } from "lucide-react";

export default function SystemHealthDashboard() {
  // Placeholder component - implement actual system health monitoring
  const systemStatus = {
    database: "healthy",
    server: "healthy",
    cpu: "normal",
    memory: "normal"
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">System Health Dashboard</h1>
        <p className="text-gray-600">Monitor system performance and status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={systemStatus.database === "healthy" ? "default" : "destructive"}>
              {systemStatus.database}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Server
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={systemStatus.server === "healthy" ? "default" : "destructive"}>
              {systemStatus.server}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              CPU
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={systemStatus.cpu === "normal" ? "default" : "destructive"}>
              {systemStatus.cpu}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Memory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={systemStatus.memory === "normal" ? "default" : "destructive"}>
              {systemStatus.memory}
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
