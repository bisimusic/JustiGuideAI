"use client";
import { useState, useEffect } from "react";
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Mail, Users, DollarSign, TrendingUp, FileText, Send, Database, Upload, Radio, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LawyerSocialListening } from "@/components/LawyerSocialListening";

interface LawyerContact {
  email: string;
  firstName: string;
  lastName: string;
  firm?: string;
  specialization?: string;
  location?: string;
}

interface RecruitmentEmail {
  email: string;
  firstName: string;
  lastName: string;
  firm?: string;
  status: 'draft' | 'sent' | 'opened' | 'clicked' | 'responded';
  sentAt?: string;
  openedAt?: string;
  clickedAt?: string;
  respondedAt?: string;
}

export default function LawyerRecruitmentPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'emails' | 'listening'>('overview');

  const { data: contacts, isLoading: contactsLoading, refetch: refetchContacts } = useQuery({
    queryKey: ['/api/lawyer/contacts'],
    queryFn: async () => {
      const response = await fetch('/api/lawyer/contacts');
      return response.json();
    },
  });

  const { data: emails, isLoading: emailsLoading, refetch: refetchEmails } = useQuery({
    queryKey: ['/api/lawyer/emails'],
    queryFn: async () => {
      const response = await fetch('/api/lawyer/emails');
      return response.json();
    },
  });

  return (
    <AdminLayout
      title="Lawyer Recruitment"
      subtitle="Recruit immigration lawyers to expand your network"
      headerActions={
        <Button 
          onClick={() => {
            refetchContacts();
            refetchEmails();
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-[10px] text-sm font-semibold bg-[#181b22] text-[#f5f5f7] border border-white/10 hover:bg-[#1a1d25] hover:border-white/15 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      }
    >
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#111318] border border-white/5 mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">Overview</TabsTrigger>
          <TabsTrigger value="contacts" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">Contacts</TabsTrigger>
          <TabsTrigger value="emails" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">Emails</TabsTrigger>
          <TabsTrigger value="listening" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">Social Listening</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] text-[#8e919a] font-medium">Total Contacts</span>
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(0,212,170,0.15)] text-[#00d4aa] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
                {contacts?.length || 0}
              </div>
            </div>
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] text-[#8e919a] font-medium">Emails Sent</span>
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(96,165,250,0.15)] text-[#60a5fa] flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
              </div>
              <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
                {emails?.filter((e: RecruitmentEmail) => e.status === 'sent').length || 0}
              </div>
            </div>
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] text-[#8e919a] font-medium">Responses</span>
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(167,139,250,0.15)] text-[#a78bfa] flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
              </div>
              <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
                {emails?.filter((e: RecruitmentEmail) => e.status === 'responded').length || 0}
              </div>
            </div>
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] text-[#8e919a] font-medium">Response Rate</span>
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(251,146,60,0.15)] text-[#fb923c] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
                {emails?.length > 0 
                  ? `${((emails.filter((e: RecruitmentEmail) => e.status === 'responded').length / emails.length) * 100).toFixed(1)}%`
                  : "0%"}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f5f5f7] mb-4">Lawyer Contacts</h3>
            {contactsLoading ? (
              <p className="text-sm text-[#8e919a]">Loading contacts...</p>
            ) : (
              <p className="text-sm text-[#8e919a]">Contact management interface...</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="emails" className="space-y-6">
          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f5f5f7] mb-4">Email Campaigns</h3>
            {emailsLoading ? (
              <p className="text-sm text-[#8e919a]">Loading emails...</p>
            ) : (
              <p className="text-sm text-[#8e919a]">Email campaign management...</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="listening" className="space-y-6">
          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <LawyerSocialListening />
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
