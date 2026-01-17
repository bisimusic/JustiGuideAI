"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, DollarSign, Users, TrendingUp, Mail, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUTMTracking } from "@/hooks/useUTMTracking";
import { PaymentCallToAction } from "@/components/PaymentCallToAction";
// Types for referral system
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
  totalEarned: number;
}

interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earned' | 'used' | 'expired';
  description: string;
  createdAt: string;
  status?: string;
  balanceAfter?: number;
}

interface ReferralDashboardData {
  credits: UserCredits;
  referrals: Referral[];
  transactions: CreditTransaction[];
}

interface ReferralStats {
  totalReferrals: number;
  confirmedReferrals: number;
  totalCreditsEarned: string;
}

export default function ReferralsPage() {
  const [dashboardData, setDashboardData] = useState<ReferralDashboardData | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [newReferralEmail, setNewReferralEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  const { utmData, getTrackingParameters, appendUTMToUrl } = useUTMTracking();

  useEffect(() => {
    loadDashboardData();
    loadReferralStats();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetch("/api/referrals/dashboard");
      const data = await response.json();
      if (data.success) {
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      toast({
        title: "Error",
        description: "Failed to load referral dashboard",
        variant: "destructive",
      });
    }
  };

  const loadReferralStats = async () => {
    try {
      const response = await fetch("/api/referrals/stats");
      const data = await response.json();
      if (data.success) {
        setReferralStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const createReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReferralEmail.trim()) return;

    setCreating(true);
    try {
      // Get comprehensive UTM tracking data
      const trackingParams = getTrackingParameters();
      
      const response = await fetch("/api/referrals/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referredEmail: newReferralEmail.trim(),
          source: "dashboard",
          // Include all UTM parameters for proper attribution
          ...trackingParams,
          sessionId: utmData?.session_id,
          landingPage: utmData?.landing_page || window.location.pathname,
          referrerUrl: utmData?.referrer,
          metadata: {
            createdFrom: "referral_dashboard",
            timestamp: new Date().toISOString(),
            userAgent: utmData?.user_agent,
            isReturningVisitor: utmData?.is_returning_visitor
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Referral Created!",
          description: data.message,
        });
        setNewReferralEmail("");
        await loadDashboardData();
        await loadReferralStats();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Failed to create referral:", error);
      toast({
        title: "Error",
        description: "Failed to create referral",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const copyReferralUrl = (url: string) => {
    // Enhance referral URL with current UTM parameters for attribution
    const enhancedUrl = appendUTMToUrl(url);
    navigator.clipboard.writeText(enhancedUrl);
    toast({
      title: "Copied!",
      description: "Referral URL copied to clipboard with tracking parameters",
    });
  };

  const formatCurrency = (amount: string) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="default" className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-primary">Referral Program</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Referral Program</h1>
            <p className="text-muted-foreground mt-2">
              Earn $100 credit for each friend who signs up for JustiGuide
            </p>
          </div>
          <Button 
            onClick={() => window.open('https://www.justi.guide/get_started/', '_blank')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Visit JustiGuide
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(String(dashboardData?.credits?.balance || 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                Available for use
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {referralStats?.totalReferrals || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {referralStats?.confirmedReferrals || 0} confirmed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(String(dashboardData?.credits?.totalEarned || 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                Lifetime earnings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Call to Action */}
        <PaymentCallToAction />

        {/* Main Content */}
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create Referral</TabsTrigger>
            <TabsTrigger value="referrals">My Referrals</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Refer a Friend</CardTitle>
                <CardDescription>
                  Share JustiGuide with your friends and earn $100 credit when they sign up
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={createReferral} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Friend's Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="friend@example.com"
                      value={newReferralEmail}
                      onChange={(e) => setNewReferralEmail(e.target.value)}
                      required
                      data-testid="input-referral-email"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={creating}
                    className="w-full"
                    data-testid="button-create-referral"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {creating ? "Creating..." : "Create Referral"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Referrals</CardTitle>
                <CardDescription>
                  Track the status of your referrals and their referral links
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.referrals?.length ? (
                  <div className="space-y-4">
                    {dashboardData.referrals.map((referral) => (
                      <div 
                        key={referral.id} 
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{referral.referredEmail}</div>
                          <div className="text-sm text-muted-foreground">
                            Code: {referral.referralCode} • 
                            Created: {new Date(referral.createdAt).toLocaleDateString()}
                          </div>
                          {referral.signupDate && (
                            <div className="text-sm text-green-600">
                              Signed up: {new Date(referral.signupDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(referral.status)}
                          {referral.creditsAwarded && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              $100 Earned
                            </Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyReferralUrl(referral.referralUrl || "")}
                            data-testid={`button-copy-${referral.id}`}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No referrals yet. Create your first referral to get started!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Credit Transactions</CardTitle>
                <CardDescription>
                  History of your credit earnings and usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.transactions?.length ? (
                  <div className="space-y-4">
                    {dashboardData.transactions.map((transaction) => (
                      <div 
                        key={transaction.id} 
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleDateString()} • 
                            Type: {transaction.type.replace('_', ' ')} • 
                            Status: {transaction.status}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}
                            {formatCurrency(String(transaction.amount))}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Balance: {formatCurrency(String(transaction.balanceAfter || 0))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions yet. Your first credit will appear here!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}