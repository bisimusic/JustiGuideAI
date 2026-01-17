import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Mail, Users, Send, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EmailCampaignResult {
  success: boolean;
  emailsSent: number;
  errors: string[];
}

export function AvvoEmailMarketing() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPreviewMode, setIsPreviewMode] = useState(true);

  // Get leads data to show Avvo lead count
  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: () => api.getLeads(),
  });

  // Count Avvo leads
  const avvoLeads = leads?.filter(lead => 
    lead.sourcePlatform === 'directory' && 
    lead.sourceUrl.includes('avvo.com')
  ) || [];

  const sendEmailsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/avvo/send-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send emails');
      }
      
      return response.json() as Promise<{ success: boolean; data: EmailCampaignResult; message: string }>;
    },
    onSuccess: (data) => {
      toast({
        title: "Email Campaign Completed",
        description: `Successfully sent ${data.data.emailsSent} JustiGuide emails to Avvo leads`,
      });
      
      // Refresh any relevant data
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Email Campaign Failed",
        description: error.message,
      });
    }
  });

  const handleSendEmails = () => {
    if (avvoLeads.length === 0) {
      toast({
        variant: "destructive",
        title: "No Avvo Leads Found",
        description: "There are no Avvo leads in your database to email.",
      });
      return;
    }

    sendEmailsMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <CardTitle>Avvo Lead Email Marketing</CardTitle>
          </div>
          <CardDescription>
            Send JustiGuide partnership and service emails to immigration lawyers found on Avvo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Avvo Leads</span>
              </div>
              {leadsLoading ? (
                <p className="text-2xl font-bold text-blue-600 mt-2">Loading...</p>
              ) : (
                <p className="text-2xl font-bold text-blue-600 mt-2">{avvoLeads.length}</p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400">Immigration lawyers identified</p>
            </div>

            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-green-600" />
                <span className="font-medium">Email Type</span>
              </div>
              <p className="text-lg font-bold text-green-600 mt-2">Partnership</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">B2B lawyer referral program</p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Send className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Services Promoted</span>
              </div>
              <p className="text-lg font-bold text-purple-600 mt-2">All Services</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">N400, H1B, Green Card, DACA</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Content Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Email Campaign Content</CardTitle>
          <CardDescription>
            Preview of the JustiGuide partnership email that will be sent to Avvo leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">📧 Subject Line</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Transform Your Immigration Law Practice with JustiGuide
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">🎯 Key Value Propositions</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                <li><strong>D2C N400 Applications:</strong> $499 flat fee citizenship service</li>
                <li><strong>B2B Partnership:</strong> $50-$750 per case referral fees</li>
                <li><strong>Enterprise Solutions:</strong> $15K-$20K annual volume pricing</li>
                <li><strong>AI Lead Generation:</strong> Automated client acquisition</li>
                <li><strong>Compliance Tools:</strong> Built-in legal compliance tracking</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">🔗 Call-to-Action Links</h3>
              <div className="space-y-2 text-sm">
                <Badge variant="outline">Partner with JustiGuide</Badge>
                <Badge variant="outline">View Our Services</Badge>
                <Badge variant="outline">Request Free Demo</Badge>
                <Badge variant="outline">View Pricing</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Actions</CardTitle>
          <CardDescription>
            Send personalized JustiGuide partnership emails to identified Avvo immigration lawyers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {avvoLeads.length === 0 && !leadsLoading && (
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <p className="text-yellow-800 dark:text-yellow-200">
                    No Avvo leads found. Run the Apify directory scraping service first to discover immigration lawyers.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Send Email Campaign</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This will send personalized emails to all {avvoLeads.length} Avvo leads
                </p>
              </div>
              
              <Button
                onClick={handleSendEmails}
                disabled={sendEmailsMutation.isPending || avvoLeads.length === 0}
                className="min-w-[120px]"
              >
                {sendEmailsMutation.isPending ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Emails
                  </>
                )}
              </Button>
            </div>

            {sendEmailsMutation.isSuccess && (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-green-800 dark:text-green-200">
                    Campaign completed! Check your email service logs for delivery details.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Email Configuration Notice */}
      <Card>
        <CardHeader>
          <CardTitle>Email Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Note:</strong> This feature requires email service configuration (Gmail API or SMTP). 
              Emails will be sent using your configured email service with JustiGuide branding and tracking links.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}