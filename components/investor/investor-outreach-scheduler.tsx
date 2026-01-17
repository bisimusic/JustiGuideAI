"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users } from "lucide-react";

export default function InvestorOutreachScheduler() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Investor Outreach Scheduler
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">Investor outreach scheduling functionality</p>
      </CardContent>
    </Card>
  );
}
