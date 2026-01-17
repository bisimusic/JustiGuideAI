import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Send, 
  CheckCircle, 
  XCircle, 
  Settings,
  Calendar,
  Bell,
  FileText,
  AlertCircle
} from 'lucide-react';
import { apiRequest } from '../lib/queryClient';

interface EmailStatus {
  configured: boolean;
  connected: boolean;
  service: string;
  user: string | null;
  methods?: {
    smtp: {
      configured: boolean;
      service: string;
      user: string | null;
    };
    gmailApi: {
      initialized: boolean;
      authenticated: boolean;
      hasCredentials: boolean;
    };
  };
}

export default function EmailIntegration() {
  const [emailStatus, setEmailStatus] = useState<EmailStatus>({
    configured: false,
    connected: false,
    service: 'Not configured',
    user: null
  });
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const [authenticatingGoogle, setAuthenticatingGoogle] = useState(false);
  const [testingScopes, setTestingScopes] = useState(false);
  const [scanningGmail, setScanningGmail] = useState(false);
  const [gmailLeads, setGmailLeads] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchEmailStatus = async () => {
    try {
      const response = await fetch('/api/email/status');
      const data = await response.json();
      setEmailStatus({
        configured: data.configured || false,
        connected: data.status === 'connected', // Map API status to connected boolean
        service: data.service || 'Not configured',
        user: data.user || null
      });
    } catch (error) {
      console.error('Failed to fetch email status:', error);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to send the test email",
        variant: "destructive"
      });
      return;
    }

    setTesting(true);
    try {
      await apiRequest('/api/email/test', {
        method: 'POST',
        body: JSON.stringify({ to: testEmail }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      toast({
        title: "Test Email Sent",
        description: `Test email sent successfully to ${testEmail}`
      });
    } catch (error) {
      toast({
        title: "Test Email Failed", 
        description: "Failed to send test email. Please check your email configuration.",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const sendWeeklyReport = async () => {
    setSendingReport(true);
    try {
      await apiRequest('/api/email/weekly-report', {
        method: 'POST'
      });
      
      toast({
        title: "Weekly Report Sent",
        description: "Weekly performance report sent successfully"
      });
    } catch (error) {
      toast({
        title: "Report Failed",
        description: "Failed to send weekly report. Please check your email configuration.",
        variant: "destructive"
      });
    } finally {
      setSendingReport(false);
    }
  };

  const authenticateWithGoogle = async () => {
    setAuthenticatingGoogle(true);
    try {
      const response = await fetch('/api/google/auth-url');
      const data = await response.json();
      
      if (data.authUrl) {
        // Open Google OAuth in new window
        const authWindow = window.open(data.authUrl, 'google-auth', 'width=500,height=600');
        
        // Listen for the authorization code
        const checkClosed = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkClosed);
            // Refresh email status
            fetchEmailStatus();
            toast({
              title: "Authentication Complete",
              description: "Google authentication completed. Please check the status."
            });
          }
        }, 1000);
      }
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Failed to start Google authentication process.",
        variant: "destructive"
      });
    } finally {
      setAuthenticatingGoogle(false);
    }
  };

  const testGoogleScopes = async () => {
    setTestingScopes(true);
    try {
      const response = await apiRequest('/api/google/test-scopes', {
        method: 'POST'
      });
      
      toast({
        title: "Scopes Test Successful",
        description: `All Gmail API permissions verified: ${Object.keys(response.scopeTests).length} scopes tested`
      });
      
      console.log('Gmail API Scope Test Results:', response.scopeTests);
    } catch (error: any) {
      toast({
        title: "Scopes Test Failed",
        description: error?.authenticated === false ? 
          "Please authenticate with Google first" : 
          "Some Gmail API permissions may be missing or restricted",
        variant: "destructive"
      });
    } finally {
      setTestingScopes(false);
    }
  };

  const scanGmailForLeads = async () => {
    setScanningGmail(true);
    try {
      const response = await apiRequest('/api/gmail/scan-leads', {
        method: 'POST',
        body: JSON.stringify({ maxResults: 100 })
      });
      
      setGmailLeads(response.leads);
      
      toast({
        title: "Gmail Scan Complete",
        description: `Found ${response.leads.length} potential investor/customer conversations`
      });
      
      console.log('Gmail Lead Scan Results:', response.leads);
    } catch (error: any) {
      toast({
        title: "Gmail Scan Failed",
        description: error?.authenticated === false ? 
          "Please authenticate with Google first" : 
          "Failed to scan Gmail. Check your authentication.",
        variant: "destructive"
      });
    } finally {
      setScanningGmail(false);
    }
  };

  useEffect(() => {
    fetchEmailStatus();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Email Integration</h1>
            <p className="text-blue-100 text-lg">
              Configure automated notifications and reports for your lead generation system
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <Mail className="w-6 h-6" />
              <span className="text-xl font-semibold">JustiGuide Mail</span>
            </div>
            <Badge variant={emailStatus.connected ? "default" : "destructive"} className="text-sm">
              {emailStatus.connected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Email Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Email Service Status
          </CardTitle>
          <CardDescription>Current email configuration and connection status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              {emailStatus.configured ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
              <div>
                <p className="font-medium">Configuration</p>
                <p className="text-sm text-gray-600">
                  {emailStatus.configured ? "Configured" : "Not configured"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {emailStatus.connected ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
              <div>
                <p className="font-medium">Connection</p>
                <p className="text-sm text-gray-600">
                  {emailStatus.connected ? "Connected" : "Disconnected"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail className="w-6 h-6 text-blue-500" />
              <div>
                <p className="font-medium">Service</p>
                <p className="text-sm text-gray-600">{emailStatus.service}</p>
                {emailStatus.user && (
                  <p className="text-xs text-gray-500">{emailStatus.user}</p>
                )}
                {emailStatus.methods?.gmailApi.authenticated && (
                  <Badge variant="default" className="text-xs mt-1">Gmail API</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Instructions */}
      {!emailStatus.configured && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertCircle className="w-5 h-5 mr-2" />
              Email Setup Required
            </CardTitle>
            <CardDescription className="text-orange-700">
              Configure your email service to enable automated notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="text-orange-800">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Gmail API Setup (Recommended)</h4>
                <div className="bg-white p-4 rounded-lg space-y-3">
                  <p className="text-sm">✅ Google OAuth credentials detected</p>
                  <div className="bg-blue-50 p-3 rounded text-xs">
                    <p className="font-semibold mb-1">Required Permissions:</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Send emails on your behalf</li>
                      <li>• Read, compose, and modify emails</li>
                      <li>• Access email metadata and labels</li>
                      <li>• Create automated responses</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <Button 
                      onClick={authenticateWithGoogle}
                      disabled={authenticatingGoogle}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {authenticatingGoogle ? "Authenticating..." : "Authenticate with Google"}
                    </Button>
                    {emailStatus.methods?.gmailApi.authenticated && (
                      <Button 
                        onClick={testGoogleScopes}
                        disabled={testingScopes}
                        variant="outline"
                        className="w-full"
                      >
                        {testingScopes ? "Testing Scopes..." : "Test All Permissions"}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">
                    {emailStatus.methods?.gmailApi.authenticated ? 
                      "Authentication complete. Test all permissions to verify scope access." :
                      "This will open Google OAuth to grant comprehensive email permissions"
                    }
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Gmail App Password Setup (SMTP Backup)</h4>
                <div className="bg-white p-4 rounded-lg space-y-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Step-by-Step App Password Creation:</p>
                    <ol className="text-xs space-y-1 list-decimal list-inside text-gray-700">
                      <li>Go to <span className="font-mono bg-gray-100 px-1 rounded">myaccount.google.com</span></li>
                      <li>Navigate to "Security" → "2-Step Verification"</li>
                      <li>Enable 2-Step Verification if not already enabled</li>
                      <li>Scroll down and click "App passwords"</li>
                      <li>Select "Mail" as the app type</li>
                      <li>Click "Generate" to create a 16-character password</li>
                      <li>Copy the generated password (format: xxxx xxxx xxxx xxxx)</li>
                    </ol>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Environment Variables to Set:</p>
                    <div className="bg-gray-100 p-3 rounded text-xs font-mono space-y-1">
                      <div className="text-green-700"># Your Gmail address</div>
                      <div>GMAIL_USER=your-email@gmail.com</div>
                      <div className="text-green-700"># The 16-character app password (no spaces)</div>
                      <div>GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx</div>
                      <div className="text-green-700"># Where to send notifications</div>
                      <div>NOTIFICATION_EMAIL=your-notification-email@gmail.com</div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-xs text-blue-800">
                      💡 <strong>Tip:</strong> App passwords provide SMTP backup when Gmail API is unavailable. 
                      The system automatically uses Gmail API when authenticated, with SMTP as fallback.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Custom SMTP Setup</h4>
                <div className="bg-white p-4 rounded-lg space-y-2">
                  <p className="text-sm">Set these environment variables:</p>
                  <div className="bg-gray-100 p-3 rounded text-xs font-mono space-y-1">
                    <div>SMTP_HOST=your-smtp-server.com</div>
                    <div>SMTP_PORT=587</div>
                    <div>SMTP_USER=your-email@domain.com</div>
                    <div>SMTP_PASSWORD=your-password</div>
                    <div>SMTP_SECURE=false</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Testing */}
      {emailStatus.configured && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="w-5 h-5 mr-2" />
              Test Email Integration
            </CardTitle>
            <CardDescription>Send a test email to verify your configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="testEmail">Test Email Address</Label>
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="Enter email address to send test email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              <Button 
                onClick={sendTestEmail} 
                disabled={testing || !emailStatus.connected}
                className="w-full md:w-auto"
              >
                <Send className="w-4 h-4 mr-2" />
                {testing ? "Sending..." : "Send Test Email"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Features */}
      {emailStatus.configured && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lead Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Lead Notifications
              </CardTitle>
              <CardDescription>
                Automatic email alerts when high-priority leads are discovered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-800">Real-time Alerts</p>
                    <p className="text-sm text-green-600">Get notified instantly for high-scoring leads</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-800">AI Response Tracking</p>
                    <p className="text-sm text-blue-600">Email notifications when AI responds to leads</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Weekly Reports
              </CardTitle>
              <CardDescription>
                Automated performance summaries and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="font-medium text-purple-800 mb-1">Performance Analytics</p>
                  <p className="text-sm text-purple-600">Lead conversion rates, response times, and platform performance</p>
                </div>
                <Button 
                  onClick={sendWeeklyReport} 
                  disabled={sendingReport || !emailStatus.connected}
                  variant="outline"
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {sendingReport ? "Sending..." : "Send Weekly Report Now"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Current Settings Summary */}
      {emailStatus.configured && (
        <Card>
          <CardHeader>
            <CardTitle>Current Configuration</CardTitle>
            <CardDescription>Active email integration settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Email Service:</span>
                <div className="flex gap-2">
                  <Badge variant="outline">{emailStatus.service}</Badge>
                  {emailStatus.methods?.gmailApi.authenticated && (
                    <Badge variant="default">API Authenticated</Badge>
                  )}
                </div>
              </div>
              {emailStatus.user && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Email Account:</span>
                  <span className="text-sm text-gray-600">{emailStatus.user}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Connection Status:</span>
                <Badge variant={emailStatus.connected ? "default" : "destructive"}>
                  {emailStatus.connected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              <Separator />
              <div className="pt-2">
                <p className="text-sm text-gray-600">
                  Email notifications are automatically sent for high-priority leads (AI score ≥ 8) and conversion activities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}