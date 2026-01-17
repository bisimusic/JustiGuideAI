"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function InvestorUpdateManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Investor Update Manager
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">Investor update management functionality</p>
      </CardContent>
    </Card>
  );
}
