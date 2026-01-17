"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Wifi, WifiOff } from "lucide-react";

export function WebSocketStatus() {
  // Placeholder component - implement actual WebSocket status checking
  const isConnected = false;
  const lastMessage = new Date().toISOString();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            WebSocket Connection Status
          </CardTitle>
          <CardDescription>Real-time connection monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isConnected ? (
                <Wifi className="w-6 h-6 text-green-500" />
              ) : (
                <WifiOff className="w-6 h-6 text-red-500" />
              )}
              <div>
                <p className="font-medium">Status: {isConnected ? "Connected" : "Disconnected"}</p>
                <p className="text-sm text-gray-500">Last message: {lastMessage}</p>
              </div>
            </div>
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
