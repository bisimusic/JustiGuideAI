import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mail, 
  Users, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Building2,
  Phone,
  Tag,
  Calendar
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Contact {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  company?: string;
  source: string;
  sourceId?: string;
  leadType?: 'investor' | 'customer' | 'consultation';
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface ExtractionResult {
  success: boolean;
  message: string;
  data?: {
    totalContactsFound: number;
    newContactsAdded: number;
    contacts: Contact[];
  };
  error?: string;
}

interface ContactsResponse {
  contacts: Contact[];
  total?: number;
}

export function GmailContactExtraction() {
  const [maxResults, setMaxResults] = useState(20);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const queryClient = useQueryClient();

  // Fetch all contacts
  const { data: contactsData, isLoading: contactsLoading } = useQuery<ContactsResponse>({
    queryKey: ['/api/contacts'],
    staleTime: 30000
  });

  // Fetch contacts by source
  const { data: sourceContactsData, isLoading: sourceLoading } = useQuery<ContactsResponse>({
    queryKey: ['/api/contacts', selectedSource],
    enabled: selectedSource !== 'all',
    staleTime: 30000
  });

  // Extract contacts mutation
  const extractContactsMutation = useMutation({
    mutationFn: async (params: { maxResults: number }) => {
      const response = await apiRequest('/api/gmail/extract-contacts', {
        method: 'POST',
        body: JSON.stringify(params)
      });
      return response as ExtractionResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
    }
  });

  const handleExtractContacts = () => {
    extractContactsMutation.mutate({ maxResults });
  };

  const contacts = selectedSource === 'all' 
    ? contactsData?.contacts || []
    : sourceContactsData?.contacts || [];

  const isLoading = contactsLoading || sourceLoading;
  const isExtracting = extractContactsMutation.isPending;

  const getLeadTypeColor = (leadType?: string) => {
    switch (leadType) {
      case 'investor':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'customer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'consultation':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="w-6 h-6 mr-2" />
            Gmail Contact Extraction
          </CardTitle>
          <CardDescription>
            Scan your Gmail for immigration-related conversations and automatically extract contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="maxResults">Max Results</Label>
              <Input
                id="maxResults"
                type="number"
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                min={5}
                max={100}
                disabled={isExtracting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="source">Filter by Source</Label>
              <select
                id="source"
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Sources</option>
                <option value="gmail">Gmail</option>
                <option value="social-media">Social Media</option>
                <option value="upload">File Upload</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleExtractContacts}
                disabled={isExtracting}
                className="w-full"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Extract Contacts
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Extraction Results */}
          {extractContactsMutation.data && (
            <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              {extractContactsMutation.data.success ? (
                <div className="flex items-center text-green-700 dark:text-green-300">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <div>
                    <p className="font-medium">{extractContactsMutation.data.message}</p>
                    {extractContactsMutation.data.data && (
                      <p className="text-sm">
                        Found {extractContactsMutation.data.data.totalContactsFound} contacts, 
                        added {extractContactsMutation.data.data.newContactsAdded} new ones
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center text-red-700 dark:text-red-300">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <div>
                    <p className="font-medium">Extraction Failed</p>
                    <p className="text-sm">{extractContactsMutation.data.error}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{contacts.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Contacts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {contacts.filter(c => c.source === 'gmail').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">From Gmail</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Building2 className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {contacts.filter(c => c.leadType === 'investor').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Investors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {contacts.filter(c => c.leadType === 'customer').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Extracted Contacts ({contacts.length})
          </CardTitle>
          <CardDescription>
            Contact information extracted from Gmail and other sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Loading contacts...</span>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No contacts found. Try extracting from Gmail first.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg">
                          {contact.firstName && contact.lastName 
                            ? `${contact.firstName} ${contact.lastName}`
                            : contact.email}
                        </h3>
                        {contact.leadType && (
                          <Badge className={getLeadTypeColor(contact.leadType)}>
                            {contact.leadType}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {contact.source}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="w-4 h-4 mr-1" />
                            {contact.email}
                          </div>
                          {contact.phone && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Phone className="w-4 h-4 mr-1" />
                              {contact.phone}
                            </div>
                          )}
                          {contact.company && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Building2 className="w-4 h-4 mr-1" />
                              {contact.company}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(contact.createdAt)}
                          </div>
                          {contact.tags && contact.tags.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <Tag className="w-4 h-4 text-gray-400" />
                              <div className="flex flex-wrap gap-1">
                                {contact.tags.slice(0, 3).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {contact.tags.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{contact.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {contact.notes && (
                        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                          <p className="text-gray-700 dark:text-gray-300">
                            {contact.notes.length > 200 
                              ? `${contact.notes.substring(0, 200)}...` 
                              : contact.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}