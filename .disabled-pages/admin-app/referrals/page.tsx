"use client";
import { useState, useEffect } from "react";
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, DollarSign, Users, TrendingUp, Mail, ExternalLink, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUTMTracking } from "@/hooks/useUTMTracking";
import { PaymentCallToAction } from "@/components/PaymentCallToAction";

interface Referral {
  id: string;
  referrerEmail: string;
  referredEmail: string;
  status: 'pending' | 'completed' | 'cancelled';
  creditsAwarded: number;
  createdAt: string;
  referralCode?: string;
  signupDate?: string;
  referralUrl?: string;
}

interface UserCredits {
  total: number;
  used: number;
  available: number;
  balance: number;
}

export default function ReferralsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'credits' | 'links'>('overview');

  return (
    <AdminLayout
      title="Referral Program"
      subtitle="Manage referrals, credits, and referral links"
      headerActions={
        <Button 
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
          <TabsTrigger value="referrals" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">Referrals</TabsTrigger>
          <TabsTrigger value="credits" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">Credits</TabsTrigger>
          <TabsTrigger value="links" className="data-[state=active]:bg-[#14161c] data-[state=active]:text-[#00d4aa]">Links</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] text-[#8e919a] font-medium">Total Referrals</span>
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(0,212,170,0.15)] text-[#00d4aa] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
                0
              </div>
            </div>
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] text-[#8e919a] font-medium">Total Credits</span>
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(96,165,250,0.15)] text-[#60a5fa] flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
                0
              </div>
            </div>
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] text-[#8e919a] font-medium">Active Links</span>
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(167,139,250,0.15)] text-[#a78bfa] flex items-center justify-center">
                  <ExternalLink className="w-5 h-5" />
                </div>
              </div>
              <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
                0
              </div>
            </div>
            <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[13px] text-[#8e919a] font-medium">Conversion Rate</span>
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(251,146,60,0.15)] text-[#fb923c] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
                0%
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6">
          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f5f5f7] mb-4">Referral Management</h3>
            <p className="text-sm text-[#8e919a]">Referral list and management tools...</p>
          </div>
        </TabsContent>

        <TabsContent value="credits" className="space-y-6">
          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f5f5f7] mb-4">Credit Management</h3>
            <p className="text-sm text-[#8e919a]">Credit tracking and management...</p>
          </div>
        </TabsContent>

        <TabsContent value="links" className="space-y-6">
          <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f5f5f7] mb-4">Referral Links</h3>
            <p className="text-sm text-[#8e919a]">Generate and manage referral links...</p>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
