"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Send, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewsletterSendStatusPage() {
  const { data: sendsData, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/newsletter/sends"],
    queryFn: async () => {
      const response = await fetch("/api/admin/newsletter/sends");
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: statsData } = useQuery({
    queryKey: ["/api/admin/newsletter/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/newsletter/stats");
      return response.json();
    },
  });

  const sends = sendsData?.sends || [];
  const summary = sendsData?.summary || {};
  const stats = statsData?.stats || {};

  const latestSend = sends[0];
  const totalContacts = stats.totalContacts || 0;
  const totalSent = sendsData?.totalSent || 0;
  const remaining = totalContacts - totalSent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Newsletter Send Status
          </h1>
          <p className="text-slate-600 text-lg">
            Track newsletter delivery progress
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Total Contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {isLoading ? <Skeleton className="h-8 w-20" /> : totalContacts.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Sent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <div className="text-3xl font-bold text-slate-900">
                  {isLoading ? <Skeleton className="h-8 w-20" /> : totalSent.toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Remaining
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <div className="text-3xl font-bold text-slate-900">
                  {isLoading ? <Skeleton className="h-8 w-20" /> : remaining.toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Success Rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {isLoading ? <Skeleton className="h-8 w-20" /> : `${summary.successRate || '0'}%`}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        {totalContacts > 0 && (
          <Card className="mb-6 border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Send Progress</CardTitle>
              <CardDescription>
                {totalSent.toLocaleString()} of {totalContacts.toLocaleString()} contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-slate-200 rounded-full h-4 mb-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${(totalSent / totalContacts) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>{((totalSent / totalContacts) * 100).toFixed(1)}% Complete</span>
                <span>~{Math.ceil(remaining / 10 * 2 / 60)} minutes remaining</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Sends */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Send History</CardTitle>
                <CardDescription>Recent newsletter sends</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : sends.length === 0 ? (
              <div className="text-center py-12">
                <Send className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">No sends recorded yet</p>
                <p className="text-slate-500 text-sm mt-1">
                  Newsletter sends will appear here once started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sends.map((send: any) => (
                  <div
                    key={send.id}
                    className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Send className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{send.subject}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(send.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span className="font-semibold text-slate-900">
                              {send.sent?.toLocaleString() || 0}
                            </span>
                          </div>
                          {send.failed > 0 && (
                            <div className="flex items-center gap-2 mt-1">
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="text-sm text-slate-600">{send.failed}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
