import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Investor {
  id: string;
  name: string;
  company: string;
  email: string;
  status: 'prospecting' | 'pitched' | 'due_diligence' | 'committed' | 'closed';
  amount?: number;
  lastContact: string;
  stage: string;
}

export function InvestorDashboard() {
  const [selectedView, setSelectedView] = useState('overview');
  
  const { data: contacts } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: async () => {
      const response = await fetch('/api/contacts');
      return response.json();
    },
  });

  // Fetch real-time investor metrics
  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/investor/metrics"],
    queryFn: async () => {
      const response = await fetch('/api/investor/metrics');
      const result = await response.json();
      return result.success ? result.metrics : null;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Mock investor data based on real contacts from Gmail
  const investors: Investor[] = [
    {
      id: '1',
      name: 'Brandon Hammerman',
      company: 'GreenBridge Capital',
      email: 'dse_NA4@docusign.net',
      status: 'committed',
      amount: 250000,
      lastContact: '2025-08-14',
      stage: 'Documentation'
    },
    {
      id: '2', 
      name: 'Nancy Mangold',
      company: 'East Bay SBDC',
      email: 'ebinfo@eastbaysbdc.org',
      status: 'due_diligence',
      amount: 150000,
      lastContact: '2025-08-13',
      stage: 'Term Sheet Review'
    },
    {
      id: '3',
      name: 'Dr. Paul Fangs',
      company: 'Bay Area Founders Club',
      email: 'bayareafoundersclub@substack.com',
      status: 'pitched',
      amount: 200000,
      lastContact: '2025-08-12',
      stage: 'Initial Interest'
    },
    {
      id: '5',
      name: 'Derrick',
      company: 'Afore VC',
      email: 'Derrick@afore.vc',
      status: 'prospecting',
      lastContact: '2025-08-11',
      stage: 'First Contact'
    }
  ];

  const fundingMetrics = {
    target: 5000000,
    raised: 700000,
    committed: 0,
    pipeline: 1800000,
    investors: {
      total: 27,
      committed: 4,
      pipeline: 11,
      meetings_this_week: 7
    },
    campaigns: {
      techcrunch_disrupt: {
        name: "TechCrunch Disrupt Startup Battlefield 200 - $5M Seed",
        status: "completed",
        investors_contacted: 67,
        campaign_date: "2025-09-24",
        subject: "Building Immigration Infrastructure at Internet Scale - Fresh Off TechCrunch Battlefield Selection",
        response_rate: 0, // To be tracked
        meetings_scheduled: 0, // To be tracked
        expected_meetings: "12-15"
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'committed': return 'bg-green-100 text-green-800';
      case 'due_diligence': return 'bg-blue-100 text-blue-800';
      case 'pitched': return 'bg-yellow-100 text-yellow-800';
      case 'prospecting': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const [pendingUpdate, setPendingUpdate] = useState<any>(null);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [sendingUpdate, setSendingUpdate] = useState(false);
  const [scanningSent, setScanningSent] = useState(false);
  const [sentScanResults, setSentScanResults] = useState<any>(null);
  const [contactingInvestor, setContactingInvestor] = useState<string | null>(null);

  const generateDailyUpdate = async () => {
    try {
      const response = await fetch('/api/investors/generate-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        setPendingUpdate(result.update);
        setShowVerificationDialog(true);
        console.log(`📧 Update generated for verification - ${result.update.recipients} investors`);
      } else {
        console.error('❌ Failed to generate update:', result.message);
      }
    } catch (error) {
      console.error('Error generating update:', error);
    }
  };

  const sendVerifiedUpdate = async () => {
    setSendingUpdate(true);
    try {
      const response = await fetch('/api/investors/send-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updateContent: pendingUpdate,
          verified: true
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Verified update sent to ${result.recipients} investors`);
        setShowVerificationDialog(false);
        setPendingUpdate(null);
      } else {
        console.error('❌ Failed to send verified update:', result.message);
      }
    } catch (error) {
      console.error('Error sending verified update:', error);
    } finally {
      setSendingUpdate(false);
    }
  };

  const scanSentEmails = async () => {
    setScanningSent(true);
    setSentScanResults(null);
    try {
      const response = await fetch('/api/gmail/extract-sent-investors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maxResults: 100 })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSentScanResults(result);
        console.log(`✅ Found ${result.totalFound} investors in sent emails, added ${result.newInvestorsAdded} new ones`);
      } else {
        console.error('❌ Failed to scan sent emails:', result.message);
      }
    } catch (error) {
      console.error('Error scanning sent emails:', error);
    } finally {
      setScanningSent(false);
    }
  };

  const contactInvestor = async (investor: Investor) => {
    setContactingInvestor(investor.id);
    try {
      // Generate personalized outreach message
      const response = await fetch('/api/investors/generate-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          investorId: investor.id,
          investorName: investor.name,
          company: investor.company,
          email: investor.email,
          currentStatus: investor.status,
          lastContact: investor.lastContact
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Open email client with pre-filled content
        const subject = encodeURIComponent(result.subject || `JustiGuide Update - Immigration Tech Opportunity`);
        const body = encodeURIComponent(result.emailContent || `Hi ${investor.name},\n\nI wanted to follow up on our previous conversation about JustiGuide...\n\nBest regards,\nJustiGuide Team`);
        
        const mailtoLink = `mailto:${investor.email}?subject=${subject}&body=${body}`;
        window.open(mailtoLink, '_blank');
        
        console.log(`📧 Opened email client for ${investor.name} at ${investor.company}`);
      } else {
        // Fallback to simple mailto if API fails
        const subject = encodeURIComponent(`JustiGuide Update - Immigration Tech Opportunity`);
        const body = encodeURIComponent(`Hi ${investor.name},\n\nI wanted to follow up on our previous conversation about JustiGuide's immigration technology platform.\n\nWe've been making significant progress and would love to share an update with you.\n\nBest regards,\nJustiGuide Team`);
        
        const mailtoLink = `mailto:${investor.email}?subject=${subject}&body=${body}`;
        window.open(mailtoLink, '_blank');
        
        console.log(`📧 Opened fallback email for ${investor.name}`);
      }
    } catch (error) {
      console.error('Error contacting investor:', error);
      // Fallback to simple mailto
      const subject = encodeURIComponent(`JustiGuide Update`);
      const body = encodeURIComponent(`Hi ${investor.name},\n\nI wanted to reach out regarding JustiGuide.\n\nBest regards,\nJustiGuide Team`);
      
      const mailtoLink = `mailto:${investor.email}?subject=${subject}&body=${body}`;
      window.open(mailtoLink, '_blank');
    } finally {
      setContactingInvestor(null);
    }
  };

  const progressPercentage = (fundingMetrics.raised / fundingMetrics.target) * 100;

  return (
    <div className="space-y-6">
      {/* Funding Overview */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Preseed Funding Round</CardTitle>
              <CardDescription className="text-blue-100">
                Series Seed • $5.0M Target • Immigration Tech
              </CardDescription>
            </div>
            <Button 
              onClick={generateDailyUpdate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              📧 Generate Update
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Raised</h3>
              <p className="text-3xl font-bold">${(fundingMetrics.raised / 1000000).toFixed(1)}M</p>
              <Progress value={progressPercentage} className="mt-2 bg-white/20" />
              <p className="text-sm mt-1 opacity-90">{progressPercentage.toFixed(1)}% of target</p>
            </div>
            
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Committed</h3>
              <p className="text-3xl font-bold">${(fundingMetrics.committed / 1000).toFixed(0)}K</p>
              <p className="text-sm opacity-90">Ready to close</p>
            </div>
            
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Pipeline</h3>
              <p className="text-3xl font-bold">${(fundingMetrics.pipeline / 1000000).toFixed(1)}M</p>
              <p className="text-sm opacity-90">In discussions</p>
            </div>
            
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Meetings</h3>
              <p className="text-3xl font-bold">{fundingMetrics.investors.meetings_this_week}</p>
              <p className="text-sm opacity-90">This week</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🚀</span>
            <span>TechCrunch Disrupt Campaign</span>
            <Badge variant="default" className="bg-green-600">
              {fundingMetrics.campaigns.techcrunch_disrupt.status.toUpperCase()}
            </Badge>
          </CardTitle>
          <CardDescription>
            Startup Battlefield 200 - $5M Seed Round Outreach Campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-1">Investors Contacted</h4>
              <p className="text-2xl font-bold text-blue-900">{fundingMetrics.campaigns.techcrunch_disrupt.investors_contacted}</p>
              <p className="text-sm text-blue-600">Campaign reach achieved</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-1">Campaign Date</h4>
              <p className="text-lg font-bold text-green-900">{fundingMetrics.campaigns.techcrunch_disrupt.campaign_date}</p>
              <p className="text-sm text-green-600">Launch date</p>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-1">Expected Meetings</h4>
              <p className="text-lg font-bold text-orange-900">{fundingMetrics.campaigns.techcrunch_disrupt.expected_meetings}</p>
              <p className="text-sm text-orange-600">Projected pipeline</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-1">Response Rate</h4>
              <p className="text-lg font-bold text-purple-900">Tracking</p>
              <p className="text-sm text-purple-600">In progress</p>
            </div>
          </div>
          
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h5 className="font-semibold mb-2 text-gray-800">Campaign Details:</h5>
            <div className="space-y-2 text-sm">
              <p><strong>Campaign:</strong> {fundingMetrics.campaigns.techcrunch_disrupt.name}</p>
              <p><strong>Subject Line:</strong> {fundingMetrics.campaigns.techcrunch_disrupt.subject}</p>
              <p><strong>Target Investors:</strong> Infrastructure-focused VCs aligned with "Stripe for human movement" thesis</p>
              <p><strong>Status:</strong> <span className="text-green-600 font-semibold">Successfully completed - All 67 emails sent</span></p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investor Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>👥</span>
            <span>Investor Pipeline</span>
          </CardTitle>
          <CardDescription>
            Track investor relationships and funding progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="active">Active ({investors.length})</TabsTrigger>
              <TabsTrigger value="committed">Committed (4)</TabsTrigger>
              <TabsTrigger value="pipeline">Pipeline ({fundingMetrics.investors.pipeline})</TabsTrigger>
              <TabsTrigger value="outreach">Outreach ({fundingMetrics.investors.total})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="space-y-4">
              <div className="space-y-3">
                {investors.map((investor) => (
                  <div key={investor.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{investor.name}</h4>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-600">{investor.company}</span>
                        <Badge className={getStatusColor(investor.status)}>
                          {investor.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{investor.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Last contact: {new Date(investor.lastContact).toLocaleDateString()} • {investor.stage}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {investor.amount && (
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            ${(investor.amount / 1000).toFixed(0)}K
                          </p>
                          <p className="text-xs text-gray-500">Target amount</p>
                        </div>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => contactInvestor(investor)}
                        disabled={contactingInvestor === investor.id}
                        data-testid={`button-contact-${investor.id}`}
                      >
                        {contactingInvestor === investor.id ? 'Opening...' : 'Contact'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="committed" className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg font-semibold">4 Current Investors</p>
                <p className="text-sm">Active investor contacts</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span>Brady (Union Green Partners)</span>
                    <span className="font-semibold">brady@uniongreen...</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Alex (JustiGuide Internal)</span>
                    <span className="font-semibold">alex@justiguide.com</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Carlos Contreras</span>
                    <span className="font-semibold">Carloscontreras415@...</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Marl5G Strategic Partner</span>
                    <span className="font-semibold">prakash@marlaccelerator.com</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="pipeline" className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <p>Pipeline management coming soon...</p>
                <p className="text-sm">Track prospects through each stage</p>
              </div>
            </TabsContent>
            
            <TabsContent value="outreach" className="space-y-4">
              <div className="space-y-4">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">📧 Extract Investors from Sent Emails</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Scan your Gmail sent folder to find investors you've pitched or reached out to
                  </p>
                  <Button 
                    onClick={scanSentEmails}
                    disabled={scanningSent}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {scanningSent ? 'Scanning...' : '🔍 Scan Sent Emails'}
                  </Button>
                  {sentScanResults && (
                    <div className="mt-4 p-4 bg-white rounded border">
                      <p className="text-sm">
                        <strong>Found:</strong> {sentScanResults.totalFound} investors in sent emails
                      </p>
                      <p className="text-sm">
                        <strong>Added:</strong> {sentScanResults.newInvestorsAdded} new investors to database
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Daily Update Preview */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Daily Investor Update Preview</CardTitle>
          <CardDescription>
            What gets sent to investors every day at 9 AM PST
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-gray-50 p-6 rounded-lg">
          <div className="font-mono text-sm space-y-3">
            <p className="font-bold">📈 JustiGuide Daily Update - {new Date().toLocaleDateString()}</p>
            <div className="space-y-2">
              <p>💰 <strong>Current Investors:</strong> Brady (Union Green Partners), Alex (JustiGuide), Carlos Contreras, Marl5G Strategic</p>
              <p>🎯 <strong>New Leads:</strong> {contacts?.total || 498} active prospects + 27 Gmail contacts analyzed</p>
              <p>📈 <strong>Growth:</strong> Reddit response tracking with 484 responses posted + automated follow-ups</p>
              <p>🤝 <strong>Conversions:</strong> Enhanced follow-up system with Loom video resources</p>
              <p>💵 <strong>Revenue Model:</strong> N400 citizenship service ($499) + H1B visa support ($299-699)</p>
              <p>🏆 <strong>Key Win:</strong> Enhanced persona cataloging with keyword-based AI analysis</p>
              <p>📅 <strong>Next:</strong> 7 investor meetings scheduled this week</p>
            </div>
            <p className="text-gray-600">Building rails for human mobility 🚀</p>
          </div>
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>📧 Verify Investor Update Before Sending</DialogTitle>
            <DialogDescription>
              Please review the update content before sending to {pendingUpdate?.recipients || 0} investors
            </DialogDescription>
          </DialogHeader>
          
          {pendingUpdate && (
            <div className="bg-gray-50 p-6 rounded-lg font-mono text-sm space-y-3 max-h-96 overflow-y-auto">
              <p className="font-bold">{pendingUpdate.subject}</p>
              <div className="space-y-2">
                {pendingUpdate.highlights.map((highlight: string, index: number) => (
                  <p key={index}>{highlight}</p>
                ))}
              </div>
              <p className="text-gray-600">{pendingUpdate.footer}</p>
              
              {pendingUpdate.recipientList && pendingUpdate.recipientList.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="font-bold mb-2">Recipients ({pendingUpdate.recipientList.length}):</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {pendingUpdate.recipientList.slice(0, 8).map((recipient: any, index: number) => (
                      <div key={index} className="bg-white p-2 rounded">
                        <div className="font-semibold">{recipient.company || 'Unknown'}</div>
                        <div className="text-gray-600">{recipient.email}</div>
                      </div>
                    ))}
                    {pendingUpdate.recipientList.length > 8 && (
                      <div className="col-span-2 text-center text-gray-500">
                        +{pendingUpdate.recipientList.length - 8} more recipients
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowVerificationDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={sendVerifiedUpdate}
              disabled={sendingUpdate}
              className="bg-green-600 hover:bg-green-700"
            >
              {sendingUpdate ? 'Sending...' : '✅ Verify & Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}