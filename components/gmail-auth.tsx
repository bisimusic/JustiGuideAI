import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Key, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export function GmailAuth() {
  const [authUrl, setAuthUrl] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const generateAuthUrl = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/gmail/auth/url");
      const data = await response.json();
      
      if (data.success) {
        setAuthUrl(data.authUrl);
        setStep(2);
        setSuccess("Authorization URL generated successfully");
      } else {
        setError(data.error || "Failed to generate auth URL");
      }
    } catch (error) {
      setError("Failed to generate authorization URL");
    } finally {
      setLoading(false);
    }
  };

  const exchangeCode = async () => {
    if (!authCode.trim()) {
      setError("Please enter the authorization code");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/gmail/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code: authCode.trim() })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRefreshToken(data.refreshToken);
        setStep(3);
        setSuccess(`Gmail authenticated successfully! Email: ${data.profile?.email}`);
      } else {
        setError(data.error || "Failed to exchange authorization code");
      }
    } catch (error) {
      setError("Failed to exchange authorization code");
    } finally {
      setLoading(false);
    }
  };

  const openAuthUrl = () => {
    if (authUrl) {
      window.open(authUrl, '_blank');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess("Copied to clipboard!");
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Gmail Authentication Setup
        </CardTitle>
        <CardDescription>
          Enable authentic data access from your Gmail account for contact extraction and persona analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Generate Auth URL */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">1</div>
              Generate Authorization URL
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              Start the OAuth flow to connect your Gmail account for authentic data access.
            </p>
            <Button 
              onClick={generateAuthUrl} 
              disabled={loading}
              className="ml-8"
            >
              {loading ? "Generating..." : "Generate Auth URL"}
            </Button>
          </div>
        )}

        {/* Step 2: Complete OAuth */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">2</div>
              Complete OAuth Authorization
            </div>
            
            <div className="ml-8 space-y-4">
              <div className="flex gap-2">
                <Button onClick={openAuthUrl} variant="outline" className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Open Gmail Authorization
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard(authUrl)}
                >
                  Copy URL
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>1. Click "Open Gmail Authorization" above</p>
                <p>2. Sign in with your Gmail account (bisi@justiguide.com)</p>
                <p>3. Grant permissions to access Gmail</p>
                <p>4. Copy the authorization code and paste it below</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Authorization Code:</label>
                <Input
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  placeholder="Paste the authorization code here..."
                  className="font-mono text-sm"
                />
              </div>

              <Button 
                onClick={exchangeCode} 
                disabled={loading || !authCode.trim()}
              >
                {loading ? "Exchanging..." : "Exchange Code for Token"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Update Secret */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">3</div>
              Update Refresh Token Secret
            </div>
            
            <div className="ml-8 space-y-4">
              <p className="text-sm text-muted-foreground">
                Copy this refresh token and update your GOOGLE_REFRESH_TOKEN secret in Replit:
              </p>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Refresh Token:</label>
                <Textarea
                  value={refreshToken}
                  readOnly
                  className="font-mono text-xs bg-muted"
                  rows={4}
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(refreshToken)}
                  className="flex items-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  Copy Refresh Token
                </Button>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Next Steps:</strong><br/>
                  1. Copy the refresh token above<br/>
                  2. Update GOOGLE_REFRESH_TOKEN in Replit Secrets<br/>
                  3. Restart the server<br/>
                  4. Gmail API will access your authentic email data
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}

        {step > 1 && (
          <div className="border-t pt-4">
            <Button 
              variant="ghost" 
              onClick={() => {
                setStep(1);
                setAuthUrl("");
                setAuthCode("");
                setRefreshToken("");
                setError("");
                setSuccess("");
              }}
            >
              Start Over
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}