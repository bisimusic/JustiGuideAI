"use client";
import { useState, useEffect } from "react";
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
import { Loader2, Mail, Users, DollarSign, TrendingUp, FileText, Send, Database, Upload, Radio } from "lucide-react";
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
  specialization?: string;
  location?: string;
  leadOpportunities: number;
  potentialRevenue: number;
  personalizedMessage: string;
}

interface MarketOpportunity {
  serviceType: string;
  location: string;
  count: number;
  avgValue: number;
  totalValue: number;
}

export default function LawyerRecruitment() {
  const [lawyerContacts, setLawyerContacts] = useState<LawyerContact[]>([]);
  const [newContact, setNewContact] = useState<LawyerContact>({
    email: '',
    firstName: '',
    lastName: '',
    firm: '',
    specialization: '',
    location: ''
  });
  const [campaignEmails, setCampaignEmails] = useState<RecruitmentEmail[]>([]);
  const [sendingProgress, setSendingProgress] = useState(0);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Market Analysis Query
  const { data: marketAnalysis, isLoading: marketLoading } = useQuery({
    queryKey: ['/api/lawyer-recruitment/market-analysis'],
    queryFn: async () => {
      const response = await apiRequest('/api/lawyer-recruitment/market-analysis');
      return response.opportunities as MarketOpportunity[];
    }
  });

  // Campaign Stats Query  
  const { data: campaignStats } = useQuery({
    queryKey: ['/api/lawyer-recruitment/campaign-stats'],
    queryFn: async () => {
      const response = await apiRequest('/api/lawyer-recruitment/campaign-stats');
      return response.stats;
    }
  });

  // Database Import Stats Query
  const { data: importStats } = useQuery({
    queryKey: ['/api/lawyer-database/import-stats'],
    queryFn: async () => {
      const response = await apiRequest('/api/lawyer-database/import-stats');
      return response.stats;
    }
  });

  // Generate Campaign Mutation
  const generateCampaignMutation = useMutation({
    mutationFn: async (contacts: LawyerContact[]) => {
      const response = await apiRequest('/api/lawyer-recruitment/generate-campaign', {
        method: 'POST',
        body: JSON.stringify({ lawyerContacts: contacts }),
        headers: { 'Content-Type': 'application/json' }
      });
      return response.campaignEmails as RecruitmentEmail[];
    },
    onSuccess: (emails) => {
      setCampaignEmails(emails);
      toast({
        title: "Campaign Generated",
        description: `Generated ${emails.length} personalized recruitment emails`,
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate recruitment campaign",
        variant: "destructive",
      });
    }
  });

  // Send Campaign Mutation
  const sendCampaignMutation = useMutation({
    mutationFn: async (emails: RecruitmentEmail[]) => {
      const response = await apiRequest('/api/lawyer-recruitment/send-campaign', {
        method: 'POST',
        body: JSON.stringify({ campaignEmails: emails }),
        headers: { 'Content-Type': 'application/json' }
      });
      return response.results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['/api/lawyer-recruitment/campaign-stats'] });
      toast({
        title: "Campaign Sent",
        description: `${results.sent} emails sent successfully, ${results.failed} failed`,
      });
      setSendingProgress(100);
    },
    onError: () => {
      toast({
        title: "Send Failed",
        description: "Failed to send recruitment campaign",
        variant: "destructive",
      });
    }
  });

  // Database Import Mutation
  const importDatabaseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/lawyer-database/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/lawyer-database/import-stats'] });
      toast({
        title: "Database Import Successful",
        description: `Imported ${data.imported} lawyer contacts from database`,
      });
    },
    onError: () => {
      toast({
        title: "Import Failed",
        description: "Failed to import lawyer database",
        variant: "destructive",
      });
    }
  });

  // Generate Database Campaign Mutation
  const generateDatabaseCampaignMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/lawyer-database/generate-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response;
    },
    onSuccess: (data) => {
      setCampaignEmails(data.campaignEmails);
      setLawyerContacts(data.lawyerContacts);
      toast({
        title: "Database Campaign Generated",
        description: `Generated campaign for ${data.totalLawyers} lawyers from database`,
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate campaign from database",
        variant: "destructive",
      });
    }
  });

  const addContact = () => {
    if (!newContact.email || !newContact.firstName || !newContact.lastName) {
      toast({
        title: "Missing Information",
        description: "Please fill in email, first name, and last name",
        variant: "destructive",
      });
      return;
    }

    setLawyerContacts([...lawyerContacts, newContact]);
    setNewContact({
      email: '',
      firstName: '',
      lastName: '',
      firm: '',
      specialization: '',
      location: ''
    });

    toast({
      title: "Contact Added",
      description: `Added ${newContact.firstName} ${newContact.lastName} to recruitment list`,
    });
  };

  const removeContact = (index: number) => {
    setLawyerContacts(lawyerContacts.filter((_, i) => i !== index));
  };

  const generateCampaign = () => {
    if (lawyerContacts.length === 0) {
      toast({
        title: "No Contacts",
        description: "Please add lawyer contacts first",
        variant: "destructive",
      });
      return;
    }
    generateCampaignMutation.mutate(lawyerContacts);
  };

  const sendCampaign = () => {
    if (campaignEmails.length === 0) {
      toast({
        title: "No Campaign",
        description: "Please generate a campaign first",
        variant: "destructive",
      });
      return;
    }
    setSendingProgress(0);
    sendCampaignMutation.mutate(campaignEmails);
  };

  const bulkImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const contacts: LawyerContact[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length >= headers.length) {
            const contact: LawyerContact = {
              email: values[headers.indexOf('email')] || '',
              firstName: values[headers.indexOf('firstname')] || values[headers.indexOf('first_name')] || '',
              lastName: values[headers.indexOf('lastname')] || values[headers.indexOf('last_name')] || '',
              firm: values[headers.indexOf('firm')] || values[headers.indexOf('company')] || '',
              specialization: values[headers.indexOf('specialization')] || values[headers.indexOf('practice_area')] || '',
              location: values[headers.indexOf('location')] || values[headers.indexOf('city')] || ''
            };
            if (contact.email && contact.firstName && contact.lastName) {
              contacts.push(contact);
            }
          }
        }
        
        setLawyerContacts([...lawyerContacts, ...contacts]);
        toast({
          title: "Import Successful",
          description: `Imported ${contacts.length} lawyer contacts from CSV`,
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to parse CSV file",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="container mx-auto py-8 space-y-8" data-testid="lawyer-recruitment-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lawyer Recruitment</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Generate targeted recruitment campaigns to grow the JustiGuide lawyer network
          </p>
        </div>
        <Button 
          onClick={() => window.open('https://www.justi.guide/get_started/', '_blank')}
          className="bg-blue-600 hover:bg-blue-700"
          data-testid="button-view-signup"
        >
          View Signup Page
        </Button>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card data-testid="card-market-opportunities">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Opportunities</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-opportunities">
              {marketAnalysis?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active service categories
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-potential-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-potential-revenue">
              ${campaignStats?.totalPotentialRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for lawyer partnerships
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-avg-lead-value">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Lead Value</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-lead-value">
              ${campaignStats?.averageLeadValue || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Per qualified lead
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="database" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="database" data-testid="tab-database">Database Import</TabsTrigger>
          <TabsTrigger value="social-listening" data-testid="tab-social-listening">
            <Radio className="h-4 w-4 mr-2" />
            Social Listening
          </TabsTrigger>
          <TabsTrigger value="contacts" data-testid="tab-contacts">Manage Contacts</TabsTrigger>
          <TabsTrigger value="market" data-testid="tab-market">Market Analysis</TabsTrigger>
          <TabsTrigger value="campaign" data-testid="tab-campaign">Campaign Preview</TabsTrigger>
          <TabsTrigger value="stats" data-testid="tab-stats">Campaign Stats</TabsTrigger>
        </TabsList>

        {/* Database Import */}
        <TabsContent value="database" className="space-y-6">
          <Card data-testid="card-database-import">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Lawyer Database Import
              </CardTitle>
              <CardDescription>
                Import law firms and contacts from our curated database of immigration attorneys
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Database Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600" data-testid="text-total-firms">
                    {importStats?.totalFirms || 0}
                  </div>
                  <div className="text-sm text-blue-600">Law Firms Available</div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600" data-testid="text-avg-experience">
                    {importStats?.experienceRange?.avg || 0} years
                  </div>
                  <div className="text-sm text-green-600">Average Experience</div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600" data-testid="text-specializations">
                    {Object.keys(importStats?.specializations || {}).length}
                  </div>
                  <div className="text-sm text-purple-600">Specializations</div>
                </div>
              </div>

              {/* Specialization Breakdown */}
              {importStats?.specializations && (
                <div>
                  <h4 className="font-medium mb-3">Specialization Breakdown</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(importStats.specializations).map(([spec, count]) => (
                      <div key={spec} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-sm">{spec}</span>
                        <Badge variant="secondary">{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Import Actions */}
              <div className="flex gap-4">
                <Button 
                  onClick={() => importDatabaseMutation.mutate()}
                  disabled={importDatabaseMutation.isPending}
                  data-testid="button-import-database"
                >
                  {importDatabaseMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Upload className="mr-2 h-4 w-4" />
                  Import Lawyer Database
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => generateDatabaseCampaignMutation.mutate()}
                  disabled={generateDatabaseCampaignMutation.isPending}
                  data-testid="button-generate-db-campaign"
                >
                  {generateDatabaseCampaignMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Mail className="mr-2 h-4 w-4" />
                  Generate Campaign from Database
                </Button>
              </div>

              {/* Law Firms Database Preview */}
              <div>
                <h4 className="font-medium mb-3">Law Firms in Database</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  <div className="border rounded-lg p-3">
                    <div className="font-medium">Law Office of Amie D. Miller</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Amie D. Miller • 25 years experience</div>
                    <div className="text-xs text-gray-500">Family immigration, LGBT immigration, citizenship, waivers, asylum</div>
                    <div className="text-xs text-blue-600 mt-1">369 Pine St, Suite 725, San Francisco, CA 94104 • (415) 362-8602</div>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <div className="font-medium">Corner Stone Law Group</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Harry G. Lewis • 31 years experience</div>
                    <div className="text-xs text-gray-500">Employment, immigration, and business law</div>
                    <div className="text-xs text-blue-600 mt-1">351 California St, #600, San Francisco, CA 94104</div>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <div className="font-medium">Warren Law Firm</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Angela D. Warren • 29 years experience</div>
                    <div className="text-xs text-gray-500">Asylum, citizenship, deportation defense, work visas, individual & family visas</div>
                    <div className="text-xs text-blue-600 mt-1">601 Montgomery St, Suite 665, San Francisco, CA 94111 • (415) 993-4476</div>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <div className="font-medium">K & G Law Firm, LLP</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Liliana Gallelli • 15 years experience</div>
                    <div className="text-xs text-gray-500">Business visas (L1s, E2s, H1Bs), family petitions, removal proceedings, asylum, U visas</div>
                    <div className="text-xs text-blue-600 mt-1">465 California St, Suite 607, San Francisco, CA 94104 • (650) 718-1800</div>
                  </div>

                  <div className="border rounded-lg p-3">
                    <div className="font-medium">Law Offices of Sweta Khandelwal</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Sweta Khandelwal • 20 years experience</div>
                    <div className="text-xs text-gray-500">Visas, green cards, citizenship for 50+ nationalities - comprehensive immigration solutions</div>
                    <div className="text-xs text-blue-600 mt-1">San Francisco, San Jose, Palo Alto • SF: (408) 317-4662</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contacts Management */}
        <TabsContent value="contacts" className="space-y-6">
          <Card data-testid="card-add-contacts">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Add Lawyer Contacts
              </CardTitle>
              <CardDescription>
                Add immigration lawyers to recruit for the JustiGuide platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                  data-testid="input-email"
                />
                <Input
                  placeholder="First Name"
                  value={newContact.firstName}
                  onChange={(e) => setNewContact({...newContact, firstName: e.target.value})}
                  data-testid="input-first-name"
                />
                <Input
                  placeholder="Last Name"
                  value={newContact.lastName}
                  onChange={(e) => setNewContact({...newContact, lastName: e.target.value})}
                  data-testid="input-last-name"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Law Firm (optional)"
                  value={newContact.firm}
                  onChange={(e) => setNewContact({...newContact, firm: e.target.value})}
                  data-testid="input-firm"
                />
                <Input
                  placeholder="Specialization (optional)"
                  value={newContact.specialization}
                  onChange={(e) => setNewContact({...newContact, specialization: e.target.value})}
                  data-testid="input-specialization"
                />
                <Input
                  placeholder="Location (optional)"
                  value={newContact.location}
                  onChange={(e) => setNewContact({...newContact, location: e.target.value})}
                  data-testid="input-location"
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={addContact} data-testid="button-add-contact">
                  Add Contact
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={bulkImportCSV}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    data-testid="input-csv-import"
                  />
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Import CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contacts List */}
          {lawyerContacts.length > 0 && (
            <Card data-testid="card-contacts-list">
              <CardHeader>
                <CardTitle>Lawyer Contacts ({lawyerContacts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {lawyerContacts.map((contact, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg" data-testid={`contact-${index}`}>
                      <div className="flex-1">
                        <div className="font-medium">{contact.firstName} {contact.lastName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{contact.email}</div>
                        {contact.firm && <div className="text-xs text-gray-500">{contact.firm}</div>}
                        {contact.specialization && (
                          <Badge variant="secondary" className="text-xs mt-1">{contact.specialization}</Badge>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeContact(index)}
                        data-testid={`button-remove-${index}`}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-4">
                  <Button 
                    onClick={generateCampaign}
                    disabled={generateCampaignMutation.isPending}
                    data-testid="button-generate-campaign"
                  >
                    {generateCampaignMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Campaign
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Market Analysis */}
        <TabsContent value="market">
          <Card data-testid="card-market-analysis">
            <CardHeader>
              <CardTitle>Market Analysis</CardTitle>
              <CardDescription>
                Current opportunities available for lawyer recruitment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {marketLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {marketAnalysis?.slice(0, 10).map((opportunity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`opportunity-${index}`}>
                      <div>
                        <div className="font-medium">{opportunity.serviceType || 'General Immigration'}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {opportunity.count} leads • Avg value: ${Math.round(Number(opportunity.avgValue))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">${Math.round(Number(opportunity.totalValue)).toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Total value</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaign Preview */}
        <TabsContent value="campaign">
          <Card data-testid="card-campaign-preview">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Campaign Preview ({campaignEmails.length} emails)
              </CardTitle>
              <CardDescription>
                Review personalized recruitment emails before sending
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaignEmails.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    Generate a campaign first to preview the personalized recruitment emails.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-6">
                  {sendCampaignMutation.isPending && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Sending campaign...</span>
                        <span>{sendingProgress}%</span>
                      </div>
                      <Progress value={sendingProgress} className="w-full" />
                    </div>
                  )}

                  <Button 
                    onClick={sendCampaign}
                    disabled={sendCampaignMutation.isPending}
                    className="mb-4"
                    data-testid="button-send-campaign"
                  >
                    {sendCampaignMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Send className="mr-2 h-4 w-4" />
                    Send Campaign
                  </Button>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {campaignEmails.slice(0, 3).map((email, index) => (
                      <div key={index} className="border rounded-lg p-4" data-testid={`email-preview-${index}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{email.firstName} {email.lastName}</div>
                            <div className="text-sm text-gray-600">{email.email}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-green-600">
                              {email.leadOpportunities} leads
                            </div>
                            <div className="text-xs text-gray-500">
                              ${email.potentialRevenue.toLocaleString()} potential
                            </div>
                          </div>
                        </div>
                        <Textarea
                          value={email.personalizedMessage.substring(0, 300) + '...'}
                          readOnly
                          className="text-xs bg-gray-50 dark:bg-gray-900"
                          rows={4}
                        />
                      </div>
                    ))}
                    {campaignEmails.length > 3 && (
                      <div className="text-center py-4 text-gray-500">
                        ... and {campaignEmails.length - 3} more personalized emails
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Listening - Find lawyers on social media */}
        <TabsContent value="social-listening">
          <Card data-testid="card-social-listening">
            <CardHeader>
              <CardTitle>Lawyer Social Listening</CardTitle>
              <CardDescription>
                Discover lawyers actively seeking clients on Reddit, LinkedIn, Twitter, and other platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LawyerSocialListening />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaign Stats */}
        <TabsContent value="stats">
          <Card data-testid="card-campaign-stats">
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>
                Track recruitment campaign effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaignStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Response Rate:</span>
                      <span className="font-bold">{(campaignStats.responseRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Signup Rate:</span>
                      <span className="font-bold">{(campaignStats.signupRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Lead Value:</span>
                      <span className="font-bold">${campaignStats.averageLeadValue}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Top Specializations</h4>
                    {campaignStats.topSpecializations?.map((spec: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{spec.type}:</span>
                        <span>{spec.count} leads (${spec.avgValue})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}