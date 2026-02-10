"use client";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Send, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function NewsletterSendStatusPage() {
  const { data: sendsData, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/newsletter/sends"],
    queryFn: async () => {
      const response = await fetch("/api/admin/newsletter/sends");
      return response.json();
    },
    refetchInterval: 5000,
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

  return (
    <AdminLayout
      title="Newsletter Send Status"
      subtitle="Monitor newsletter sending progress and delivery status"
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
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] text-[#8e919a] font-medium">Total Sends</span>
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(0,212,170,0.15)] text-[#00d4aa] flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
            {summary.total || 0}
          </div>
        </div>
        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] text-[#8e919a] font-medium">Successful</span>
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(16,185,129,0.15)] text-[#10b981] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
            {summary.successful || 0}
          </div>
        </div>
        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] text-[#8e919a] font-medium">Failed</span>
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(255,107,107,0.15)] text-[#ff6b6b] flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
            {summary.failed || 0}
          </div>
        </div>
        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] text-[#8e919a] font-medium">Pending</span>
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(251,146,60,0.15)] text-[#fb923c] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
            {summary.pending || 0}
          </div>
        </div>
      </div>

      {/* Send History */}
      <div className="bg-[#14161c] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-semibold text-[#f5f5f7]">Send History</h3>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-[#181b22]" />
              ))}
            </div>
          ) : sends.length === 0 ? (
            <p className="text-center py-12 text-[#8e919a]">No send history available</p>
          ) : (
            <div className="rounded-lg border border-white/5 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#181b22]">
                    <TableHead className="font-semibold text-[#8e919a]">Date</TableHead>
                    <TableHead className="font-semibold text-[#8e919a]">Subject</TableHead>
                    <TableHead className="font-semibold text-[#8e919a]">Recipients</TableHead>
                    <TableHead className="font-semibold text-[#8e919a]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sends.map((send: any, index: number) => (
                    <TableRow key={index} className="hover:bg-[#181b22] border-white/5">
                      <TableCell className="text-[#f5f5f7]">
                        {new Date(send.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-[#f5f5f7]">{send.subject || 'N/A'}</TableCell>
                      <TableCell className="text-[#f5f5f7] font-['JetBrains_Mono',monospace]">
                        {send.recipientCount || 0}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          send.status === 'completed' ? 'bg-[#00d4aa] text-[#0a0b0d]' :
                          send.status === 'failed' ? 'bg-[#ff6b6b] text-[#0a0b0d]' :
                          'bg-[#fb923c] text-[#0a0b0d]'
                        }>
                          {send.status || 'unknown'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
