import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { queryClient } from "@/lib/queryClient";

interface AIResponse {
  greeting: string;
  acknowledgment: string;
  value: string;
  disclaimer: string;
  cta: string;
  fullResponse: string;
}

interface ComplianceValidation {
  isCompliant: boolean;
  issues: string[];
}

export function ComplianceDashboard() {
  const [selectedLead, setSelectedLead] = useState<string>('');
  const [responseType, setResponseType] = useState<string>('initial');
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [customResponse, setCustomResponse] = useState<string>('');
  const [generatedResponse, setGeneratedResponse] = useState<AIResponse | null>(null);
  const [validationResult, setValidationResult] = useState<ComplianceValidation | null>(null);
  
  // Fetch leads from database
  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: () => api.getLeads(),
  });

  // Generate AI response mutation
  const generateResponseMutation = useMutation({
    mutationFn: async ({ leadId, type }: { leadId: string, type: string }) => {
      const response = await fetch('/api/ai/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, responseType: type })
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setGeneratedResponse(data.response);
        setShowResponseDialog(true);
      }
    }
  });

  // Validate response mutation
  const validateResponseMutation = useMutation({
    mutationFn: async (responseText: string) => {
      const response = await fetch('/api/ai/validate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseText })
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setValidationResult(data.validation);
        setShowValidationDialog(true);
      }
    }
  });

  // Generate batch responses mutation
  const batchGenerateMutation = useMutation({
    mutationFn: async (leadIds: string[]) => {
      const response = await fetch('/api/ai/generate-batch-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds, responseType })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    }
  });

  const handleGenerateResponse = async () => {
    if (!selectedLead) return;
    
    try {
      await generateResponseMutation.mutateAsync({ leadId: selectedLead, type: responseType });
    } catch (error) {
      console.error('Response generation failed:', error);
    }
  };

  const handleValidateCustomResponse = async () => {
    if (!customResponse.trim()) return;
    
    try {
      await validateResponseMutation.mutateAsync(customResponse);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const getComplianceColor = (isCompliant: boolean) => {
    return isCompliant ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* AI Response Generation */}
      <Card>
        <CardHeader>
          <CardTitle>⚖️ Legally Compliant AI Response Generator</CardTitle>
          <CardDescription>
            Generate immigration-compliant responses with automatic legal disclaimers and outcome language restrictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Generation Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Lead ID</label>
                <div className="space-y-2">
                  <Select value={selectedLead} onValueChange={setSelectedLead}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lead from database" />
                    </SelectTrigger>
                    <SelectContent>
                      {leads?.slice(0, 50).map((lead) => (
                        <SelectItem key={lead.id} value={lead.id}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium text-sm">{lead.title.slice(0, 50)}...</span>
                            <span className="text-xs text-gray-500">
                              {lead.sourcePlatform} • {new Date(lead.discoveredAt).toLocaleDateString()}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Or enter lead ID manually"
                    value={selectedLead}
                    onChange={(e) => setSelectedLead(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Response Type</label>
                <Select value={responseType} onValueChange={setResponseType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select response type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Initial Response</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="consultation">Consultation Offer</SelectItem>
                    <SelectItem value="urgent">Urgent Response</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={handleGenerateResponse}
                  disabled={!selectedLead || generateResponseMutation.isPending}
                  className="w-full"
                >
                  {generateResponseMutation.isPending ? 'Generating...' : 'Generate Response'}
                </Button>
              </div>
            </div>

            {/* Compliance Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">📋 Compliance Features</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Automatic legal disclaimers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Outcome language restrictions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Visa-specific warnings (H1B cap, etc.)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Professional consultation recommendations</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">🚫 Prohibited Terms</h3>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {['guarantee', 'definitely', 'ensure', 'promise', 'certain', 'will get'].map(term => (
                      <Badge key={term} variant="destructive" className="text-xs">
                        {term}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    These terms are automatically replaced with compliant alternatives
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response Validation */}
      <Card>
        <CardHeader>
          <CardTitle>✅ Response Validation</CardTitle>
          <CardDescription>
            Validate custom responses for legal compliance before sending
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Response Text</label>
              <Textarea
                placeholder="Paste your response text here for compliance validation..."
                value={customResponse}
                onChange={(e) => setCustomResponse(e.target.value)}
                rows={6}
              />
            </div>
            
            <Button 
              onClick={handleValidateCustomResponse}
              disabled={!customResponse.trim() || validateResponseMutation.isPending}
            >
              {validateResponseMutation.isPending ? 'Validating...' : 'Validate Compliance'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Templates */}
      <Card>
        <CardHeader>
          <CardTitle>📄 Compliance Templates</CardTitle>
          <CardDescription>
            Pre-approved response templates for different immigration scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="h1b" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="h1b">H1B Responses</TabsTrigger>
              <TabsTrigger value="n400">N400 Citizenship</TabsTrigger>
              <TabsTrigger value="general">General Immigration</TabsTrigger>
              <TabsTrigger value="b2b">B2B Lawyers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="h1b" className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Standard H1B Response</h4>
                <p className="text-sm text-gray-600 mb-2">
                  "I understand H1B applications can be complex. Each case requires individual assessment, and approvals depend on USCIS discretion and annual cap availability..."
                </p>
                <Badge className="text-xs">Includes H1B cap disclaimer</Badge>
              </div>
            </TabsContent>
            
            <TabsContent value="n400" className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">N400 Citizenship Response</h4>
                <p className="text-sm text-gray-600 mb-2">
                  "Naturalization eligibility depends on multiple factors including continuous residence and background checks. Each application is reviewed individually..."
                </p>
                <Badge className="text-xs">Includes residency requirements</Badge>
              </div>
            </TabsContent>
            
            <TabsContent value="general" className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">General Immigration Response</h4>
                <p className="text-sm text-gray-600 mb-2">
                  "Immigration matters require personalized guidance. This information is for general educational purposes only and doesn't constitute legal advice..."
                </p>
                <Badge className="text-xs">Standard legal disclaimer</Badge>
              </div>
            </TabsContent>
            
            <TabsContent value="b2b" className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">B2B Lawyer Outreach</h4>
                <p className="text-sm text-gray-600 mb-2">
                  "I work with immigration law practices to develop efficient client management systems while maintaining the highest standards of legal compliance..."
                </p>
                <Badge className="text-xs">Professional services focus</Badge>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Generated Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Generated Compliant Response</DialogTitle>
            <DialogDescription>
              Review the AI-generated response with compliance validation
            </DialogDescription>
          </DialogHeader>
          
          {generatedResponse && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Full Response</h4>
                <div className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded">
                  {generatedResponse.fullResponse}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Response Components</h5>
                  <div className="text-xs space-y-1">
                    <div><strong>Greeting:</strong> {generatedResponse.greeting.substring(0, 50)}...</div>
                    <div><strong>Acknowledgment:</strong> {generatedResponse.acknowledgment.substring(0, 50)}...</div>
                    <div><strong>Value:</strong> {generatedResponse.value.substring(0, 50)}...</div>
                    <div><strong>CTA:</strong> {generatedResponse.cta.substring(0, 50)}...</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Compliance Status</h5>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Legal disclaimer included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Prohibited terms sanitized</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Visa-specific warnings added</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResponseDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              if (generatedResponse) {
                navigator.clipboard.writeText(generatedResponse.fullResponse);
              }
            }}>
              Copy Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Validation Result Dialog */}
      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compliance Validation Result</DialogTitle>
            <DialogDescription>
              Review compliance issues and recommendations
            </DialogDescription>
          </DialogHeader>
          
          {validationResult && (
            <div className="space-y-4">
              <div className={`p-4 border rounded-lg ${validationResult.isCompliant ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className={`font-medium ${getComplianceColor(validationResult.isCompliant)}`}>
                  {validationResult.isCompliant ? '✅ Response is compliant' : '❌ Compliance issues detected'}
                </div>
              </div>
              
              {validationResult.issues.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Issues to Address:</h4>
                  <ul className="space-y-1">
                    {validationResult.issues.map((issue, index) => (
                      <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                        <span>•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowValidationDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}