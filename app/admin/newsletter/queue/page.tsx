"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, RefreshCw, Send, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewsletterQueuePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [html, setHtml] = useState("");
  const [subject, setSubject] = useState("Sunday Service Newsletter");
  const [emailsPerHour, setEmailsPerHour] = useState(10);

  const { data: queueStatus, isLoading, refetch } = useQuery({
    queryKey: ["/api/newsletter/queue"],
    queryFn: async () => {
      const response = await fetch("/api/newsletter/queue");
      return response.json();
    },
    refetchInterval: 5000,
  });

  const createQueueMutation = useMutation({
    mutationFn: async (data: { html: string; subject: string; emailsPerHour: number }) => {
      const response = await fetch("/api/newsletter/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsletter/queue"] });
      toast({
        title: "Queue created",
        description: "Newsletter queue has been created successfully",
      });
    },
  });

  const controlQueueMutation = useMutation({
    mutationFn: async (action: 'start' | 'pause' | 'stop') => {
      const response = await fetch(`/api/newsletter/queue/${action}`, {
        method: "POST",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsletter/queue"] });
    },
  });

  return (
    <AdminLayout
      title="Newsletter Queue"
      subtitle="Manage newsletter sending queue and monitor progress"
      headerActions={
        <Button 
          onClick={() => refetch()}
          className="flex items-center gap-2 px-5 py-3 rounded-[10px] text-sm font-semibold bg-[#181b22] text-[#f5f5f7] border border-white/10 hover:bg-[#1a1d25] hover:border-white/15 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-6">
        {/* Queue Status */}
        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[#f5f5f7] mb-4">Queue Status</h3>
          {isLoading ? (
            <Skeleton className="h-32 w-full bg-[#181b22]" />
          ) : queueStatus ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8e919a]">Status</span>
                <Badge className={queueStatus.status === 'running' ? 'bg-[#00d4aa] text-[#0a0b0d]' : 'bg-[#181b22] text-[#8e919a] border-white/10'}>
                  {queueStatus.status || 'idle'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8e919a]">Sent</span>
                <span className="font-['JetBrains_Mono',monospace] text-[#f5f5f7]">{queueStatus.sent || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8e919a]">Remaining</span>
                <span className="font-['JetBrains_Mono',monospace] text-[#f5f5f7]">{queueStatus.remaining || 0}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => controlQueueMutation.mutate('start')}
                  disabled={queueStatus.status === 'running'}
                  className="flex-1 bg-gradient-to-br from-[#00d4aa] to-[#00b894] text-[#0a0b0d]"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </Button>
                <Button
                  onClick={() => controlQueueMutation.mutate('pause')}
                  disabled={queueStatus.status !== 'running'}
                  className="flex-1 bg-[#181b22] border-white/10 text-[#f5f5f7]"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
                <Button
                  onClick={() => controlQueueMutation.mutate('stop')}
                  className="flex-1 bg-[#181b22] border-white/10 text-[#f5f5f7]"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#8e919a]">No active queue</p>
          )}
        </div>

        {/* Create Queue */}
        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[#f5f5f7] mb-4">Create Queue</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-[#8e919a]">Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 bg-[#181b22] border-white/5 text-[#f5f5f7]"
                placeholder="Newsletter subject"
              />
            </div>
            <div>
              <Label className="text-[#8e919a]">Emails Per Hour</Label>
              <Input
                type="number"
                value={emailsPerHour}
                onChange={(e) => setEmailsPerHour(parseInt(e.target.value) || 10)}
                className="mt-1 bg-[#181b22] border-white/5 text-[#f5f5f7]"
              />
            </div>
            <div>
              <Label className="text-[#8e919a]">HTML Content</Label>
              <Textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                className="mt-1 bg-[#181b22] border-white/5 text-[#f5f5f7] min-h-[200px]"
                placeholder="Paste HTML content here..."
              />
            </div>
            <Button
              onClick={() => createQueueMutation.mutate({ html, subject, emailsPerHour })}
              disabled={!html || !subject}
              className="w-full bg-gradient-to-br from-[#00d4aa] to-[#00b894] text-[#0a0b0d]"
            >
              <Send className="w-4 h-4 mr-2" />
              Create Queue
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
