"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

export default function ExtendedInvestorDatabase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Extended Investor Database
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">Extended investor database functionality</p>
      </CardContent>
    </Card>
  );
}
