"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, RefreshCw, Send, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewsletterQueuePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [html, setHtml] = useState("");
  const [subject, setSubject] = useState("Sunday Swervice Newsletter");
  const [emailsPerHour, setEmailsPerHour] = useState(10);

  const { data: queueStatus, isLoading, refetch } = useQuery({
    queryKey: ["/api/newsletter/queue"],
    queryFn: async () => {
      const response = await fetch("/api/newsletter/queue");
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const createQueueMutation = useMutation({
    mutationFn: async (data: { html: string; subject: string; emailsPerHour: number }) => {
      const response = await fetch("/api/newsletter/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create queue");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Queue created successfully", description: "Queue is ready to start" });
      queryClient.invalidateQueries({ queryKey: ["/api/newsletter/queue"] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create queue", description: error.message, variant: "destructive" });
    },
  });

  const updateQueueMutation = useMutation({
    mutationFn: async (action: string) => {
      const response = await fetch("/api/newsletter/queue", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) throw new Error("Failed to update queue");
      return response.json();
    },
    onSuccess: (data, action) => {
      toast({ title: `Queue ${action}ed successfully` });
      queryClient.invalidateQueries({ queryKey: ["/api/newsletter/queue"] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update queue", description: error.message, variant: "destructive" });
    },
  });

  const processQueueMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/newsletter/queue/process", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to process queue");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Batch processed",
        description: `${data.batch?.sent || 0} sent, ${data.batch?.failed || 0} failed`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/newsletter/queue"] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to process queue", description: error.message, variant: "destructive" });
    },
  });

  // Load newsletter HTML from file
  useEffect(() => {
    fetch("/newsletter-html.html")
      .then((res) => res.text())
      .then((text) => setHtml(text))
      .catch(() => {
        // If file doesn't exist, use default
        setHtml("<p>Newsletter content</p>");
      });
  }, []);

  const status = queueStatus?.status || "idle";
  const hasQueue = queueStatus && queueStatus.status !== "idle";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Newsletter Queue</h1>
          <p className="text-slate-600 text-lg">Rate-limited email sending system</p>
        </div>

        {/* Queue Status */}
        {hasQueue && (
          <Card className="mb-6 border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Queue Status</CardTitle>
                  <CardDescription>Current newsletter sending progress</CardDescription>
                </div>
                <Badge
                  variant={
                    status === "running"
                      ? "default"
                      : status === "completed"
                      ? "default"
                      : status === "paused"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Total Recipients</p>
                      <p className="text-2xl font-bold">{queueStatus?.totalRecipients || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Sent</p>
                      <p className="text-2xl font-bold text-green-600">{queueStatus?.sent || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Failed</p>
                      <p className="text-2xl font-bold text-red-600">{queueStatus?.failed || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Pending</p>
                      <p className="text-2xl font-bold text-blue-600">{queueStatus?.pending || 0}</p>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                      style={{
                        width: `${queueStatus?.progress || 0}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>{queueStatus?.progress || 0}% Complete</span>
                    <span>
                      ~{queueStatus?.estimatedHoursRemaining || 0} hours remaining at{" "}
                      {queueStatus?.emailsPerHour || 0}/hour
                    </span>
                  </div>

                  <div className="flex gap-2 pt-4">
                    {status === "running" ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => updateQueueMutation.mutate("pause")}
                          disabled={updateQueueMutation.isPending}
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => processQueueMutation.mutate()}
                          disabled={processQueueMutation.isPending}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Process Now
                        </Button>
                      </>
                    ) : status === "paused" ? (
                      <Button
                        onClick={() => updateQueueMutation.mutate("resume")}
                        disabled={updateQueueMutation.isPending}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </Button>
                    ) : status === "idle" ? (
                      <Button
                        onClick={() => updateQueueMutation.mutate("start")}
                        disabled={updateQueueMutation.isPending}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Queue
                      </Button>
                    ) : null}
                    <Button variant="outline" onClick={() => refetch()}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Create Queue */}
        {!hasQueue && (
          <Card className="mb-6 border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Create Newsletter Queue</CardTitle>
              <CardDescription>Set up a rate-limited email queue for your newsletter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Sunday Swervice Newsletter"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Emails Per Hour</label>
                  <input
                    type="number"
                    value={emailsPerHour}
                    onChange={(e) => setEmailsPerHour(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 border rounded-lg"
                    min="1"
                    max="100"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Recommended: 10/hour (240/day) to stay within Google Workspace limits
                  </p>
                </div>
                <Button
                  onClick={() =>
                    createQueueMutation.mutate({
                      html,
                      subject,
                      emailsPerHour,
                    })
                  }
                  disabled={createQueueMutation.isPending || !html || !subject}
                  className="w-full"
                >
                  {createQueueMutation.isPending ? "Creating..." : "Create Queue"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 text-sm space-y-2">
            <p>
              <strong>1. Create Queue:</strong> Set up your newsletter with rate limits (e.g., 10 emails/hour)
            </p>
            <p>
              <strong>2. Start Queue:</strong> Begin processing emails at the configured rate
            </p>
            <p>
              <strong>3. Process Hourly:</strong> Run the processor script every hour (or set up a cron job)
            </p>
            <p>
              <strong>4. Monitor Progress:</strong> Track sent, failed, and pending emails in real-time
            </p>
            <p className="pt-2">
              <strong>💡 Tip:</strong> At 10 emails/hour, 10,900 contacts will take ~45 days. Adjust the rate based on
              your email service limits.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
