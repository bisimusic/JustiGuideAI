"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export default function GmailScheduler() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Gmail Scheduler
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">Gmail scheduling functionality</p>
      </CardContent>
    </Card>
  );
}
