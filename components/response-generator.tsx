"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Lead } from "@/types";

interface ResponseGeneratorProps {
  lead: Lead;
}

export default function ResponseGenerator({ lead }: ResponseGeneratorProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-gray-600">Response generator for lead: {lead.id}</p>
        <Textarea placeholder="Generate response..." className="mt-2" />
        <Button className="mt-2">Generate Response</Button>
      </CardContent>
    </Card>
  );
}
