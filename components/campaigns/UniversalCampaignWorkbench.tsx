"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, DollarSign, Clock, Target, Send, Sparkles, Loader2, Users } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Recipient {
  id: string;
  email: string;
  name: string;
  company?: string;
  type: 'investor' | 'lawyer' | 'lead' | 'client';
  additionalData?: any;
}

export default function UniversalCampaignWorkbench() {
  const { toast } = useToast();
  const [campaignType, setCampaignType] = useState<string>('investor');
  const [audienceType, setAudienceType] = useState<string>('investors');
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [subject, setSubject] = useState<string>('');
  const [template, setTemplate] = useState<string>('');
  const [personalizedMessage, setPersonalizedMessage] = useState<string>('');
  const [aiScore, setAiScore] = useState<number>(0);
  const [estimatedValue, setEstimatedValue] = useState<number>(0);

  const audienceOptions = [
    { value: 'investors', label: 'Investors', icon: '💰' },
    { value: 'lawyers', label: 'Lawyers', icon: '⚖️' },
    { value: 'leads', label: 'High-Value Leads', icon: '🎯' },
    { value: 'clients', label: 'Active Clients', icon: '👥' },
  ];

  const campaignTypeOptions = [
    { value: 'investor', label: 'Investor Outreach', description: 'SAFE rounds, VC pitches, fundraising' },
    { value: 'lawyer', label: 'Lawyer Recruitment', description: 'Partnership invites, case referrals' },
    { value: 'client', label: 'Client Engagement', description: 'Follow-ups, upsells, renewals' },
    { value: 'employee', label: 'Employee Recruitment', description: 'Hiring outreach, talent acquisition' },
  ];

  const { data: recipients, isLoading: recipientsLoading } = useQuery({
    queryKey: ['/api/campaigns/recipients', audienceType],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/recipients/${audienceType}`);
      if (!response.ok) throw new Error('Failed to fetch recipients');
      return response.json();
    },
    enabled: !!audienceType,
  });

  const personalizeMutation = useMutation({
    mutationFn: async (data: { template: string; recipient: Recipient; campaignType: string }) => {
      return apiRequest('/api/campaigns/personalize', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data: any) => {
      setPersonalizedMessage(data.personalizedMessage);
      setAiScore(data.score);
      setEstimatedValue(data.estimatedValue);
      toast({
        title: "Message Personalized",
        description: `AI Score: ${data.score}/10 • Est. Value: $${data.estimatedValue.toLocaleString()}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Personalization Failed",
        description: error.message || "Could not personalize message",
        variant: "destructive",
      });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (data: { 
      recipientId: string; 
      subject: string; 
      message: string; 
      campaignType: string;
      aiScore: number;
      estimatedValue: number;
    }) => {
      return apiRequest('/api/campaigns/send-message', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: `Message sent to ${selectedRecipient?.name}`,
      });
      // Reset form
      setPersonalizedMessage('');
      setAiScore(0);
      setEstimatedValue(0);
    },
    onError: (error: any) => {
      toast({
        title: "Send Failed",
        description: error.message || "Could not send email",
        variant: "destructive",
      });
    },
  });

  const handlePersonalize = async () => {
    if (!selectedRecipient || !template) return;

    personalizeMutation.mutate({
      template,
      recipient: selectedRecipient,
      campaignType,
    });
  };

  const handleSend = async () => {
    if (!selectedRecipient || !personalizedMessage) return;

    sendMutation.mutate({
      recipientId: selectedRecipient.id,
      subject,
      message: personalizedMessage,
      campaignType,
      aiScore,
      estimatedValue,
    });
  };

  const recipientsList = recipients?.recipients || [];
  const totalRevenue = recipientsList.length * estimatedValue;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Campaign Workbench
          </CardTitle>
          <CardDescription>
            AI-powered email personalization for all business operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-700">{recipientsList.length}</div>
              <p className="text-sm text-blue-600">Available Recipients</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">
                {aiScore > 0 ? `${aiScore}/10` : '-'}
              </div>
              <p className="text-sm text-blue-600">AI Score</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">
                ${estimatedValue > 0 ? estimatedValue.toLocaleString() : '-'}
              </div>
              <p className="text-sm text-blue-600">Est. Value</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings & Recipients */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Campaign Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Campaign Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Campaign Type</label>
              <Select value={campaignType} onValueChange={setCampaignType}>
                <SelectTrigger data-testid="select-campaign-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {campaignTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Audience */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Audience</label>
              <Select value={audienceType} onValueChange={setAudienceType}>
                <SelectTrigger data-testid="select-audience">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {audienceOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Recipients List */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipients ({recipientsList.length})</label>
              <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                {recipientsLoading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : recipientsList.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No recipients found
                  </div>
                ) : (
                  recipientsList.map((recipient: Recipient) => (
                    <div
                      key={recipient.id}
                      className={`p-3 border-b last:border-b-0 cursor-pointer transition-colors ${
                        selectedRecipient?.id === recipient.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedRecipient(recipient)}
                      data-testid={`recipient-${recipient.id}`}
                    >
                      <div className="font-medium text-sm">{recipient.name}</div>
                      {recipient.company && (
                        <div className="text-xs text-muted-foreground">{recipient.company}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message Builder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Message Builder</span>
              {selectedRecipient && (
                <Badge variant="outline">
                  {selectedRecipient.name}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subject */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject..."
                className="w-full px-3 py-2 border rounded-lg"
                data-testid="input-subject"
              />
            </div>

            {/* Template */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Template</label>
              <Textarea
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                placeholder="Hi {{name}},&#10;&#10;I wanted to reach out about {{topic}}...&#10;&#10;Use variables: {{name}}, {{company}}, {{firstName}}"
                className="min-h-[150px] font-mono text-sm"
                data-testid="input-template"
              />
            </div>

            {/* AI Personalize Button */}
            <Button
              onClick={handlePersonalize}
              disabled={!selectedRecipient || !template || personalizeMutation.isPending}
              className="w-full"
              data-testid="button-personalize"
            >
              {personalizeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Personalizing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Personalize with AI
                </>
              )}
            </Button>

            {/* Personalized Message */}
            {personalizedMessage && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Personalized Message</label>
                    <Button
                      onClick={() => navigator.clipboard.writeText(personalizedMessage)}
                      size="sm"
                      variant="outline"
                      data-testid="button-copy"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={personalizedMessage}
                    onChange={(e) => setPersonalizedMessage(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                    data-testid="message-preview"
                  />
                </div>

                {/* AI Scoring */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span>AI Score: <strong>{aiScore}/10</strong></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span>Est. Value: <strong>${estimatedValue.toLocaleString()}</strong></span>
                    </div>
                  </div>
                  <Button
                    onClick={handleSend}
                    disabled={sendMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="button-send"
                  >
                    {sendMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Email
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
