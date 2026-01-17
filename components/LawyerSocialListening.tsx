import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, UserCheck, Mail, Phone, MapPin, Briefcase, TrendingUp, ExternalLink, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface LawyerLead {
  id: string;
  lawyerName: string | null;
  firmName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  sourcePlatform: string;
  sourceUrl: string;
  authorUsername: string;
  postTitle: string;
  postContent: string;
  specializations: string[];
  yearsExperience: number | null;
  lookingForClients: boolean;
  serviceTypes: string[];
  priceRange: string | null;
  aiQualityScore: string;
  credibilityScore: string;
  urgency: string;
  fitScore: string;
  potentialValue: number;
  leadMatchCount: number;
  estimatedMonthlyRevenue: number;
  contacted: boolean;
  contactedAt: string | null;
  responseReceived: boolean | null;
  discoveredAt: string;
}

interface LawyerStats {
  total: number;
  byPlatform: Record<string, number>;
  contacted: number;
  avgFitScore: number;
  totalPotentialValue: number;
  totalEstimatedMonthlyRevenue: number;
  bySpecialization: Record<string, number>;
  highFitLeads: number;
}

export function LawyerSocialListening() {
  const { toast } = useToast();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/lawyer-listening/stats'],
  });

  const { data: leadsData, isLoading: leadsLoading, refetch } = useQuery({
    queryKey: ['/api/lawyer-listening/leads'],
  });

  const contactMutation = useMutation({
    mutationFn: async ({ id, contacted }: { id: string; contacted: boolean }) =>
      apiRequest('/api/lawyer-listening/leads/' + id + '/contact', {
        method: 'PATCH',
        body: JSON.stringify({ contacted }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lawyer-listening/leads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/lawyer-listening/stats'] });
      toast({
        title: 'Contact status updated',
        description: 'Lawyer contact status has been updated successfully',
      });
    },
  });

  const recruitMutation = useMutation({
    mutationFn: async (id: string) =>
      apiRequest('/api/lawyer-listening/leads/' + id + '/recruit', {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lawyer-listening/leads'] });
      toast({
        title: 'Added to recruitment',
        description: 'Lawyer has been added to the recruitment pipeline',
      });
    },
  });

  const stats: LawyerStats | undefined = statsData?.stats;
  const leads: LawyerLead[] = leadsData?.leads || [];

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400';
    if (score >= 6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      reddit: 'bg-orange-500',
      linkedin: 'bg-blue-600',
      twitter: 'bg-sky-500',
      facebook: 'bg-blue-500',
      instagram: 'bg-pink-500',
    };
    return colors[platform.toLowerCase()] || 'bg-gray-500';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const highFitLeads = leads.filter(l => parseFloat(l.fitScore) >= 7);
  const uncontactedLeads = leads.filter(l => !l.contacted);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : stats ? (
          <>
            <Card data-testid="card-lawyer-total">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Lawyers Found</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-lawyer-total">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.highFitLeads} high-fit (7.0+ score)
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-lawyer-contacted">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Contacted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-lawyer-contacted">{stats.contacted}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.total - stats.contacted} pending contact
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-lawyer-potential-value">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Potential Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-lawyer-potential-value">{formatCurrency(stats.totalPotentialValue)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total partnership value
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-lawyer-monthly-revenue">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Est. Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-lawyer-monthly-revenue">{formatCurrency(stats.totalEstimatedMonthlyRevenue)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  From referral fees (20%)
                </p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Lawyer Leads Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" data-testid="tab-all-lawyers">
            All Lawyers ({leads.length})
          </TabsTrigger>
          <TabsTrigger value="high-fit" data-testid="tab-high-fit-lawyers">
            High Fit ({highFitLeads.length})
          </TabsTrigger>
          <TabsTrigger value="uncontacted" data-testid="tab-uncontacted-lawyers">
            Uncontacted ({uncontactedLeads.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <LawyerLeadsList 
            leads={leads} 
            isLoading={leadsLoading}
            onContact={contactMutation.mutate}
            onRecruit={recruitMutation.mutate}
            getScoreColor={getScoreColor}
            getPlatformColor={getPlatformColor}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        </TabsContent>

        <TabsContent value="high-fit" className="mt-4">
          <LawyerLeadsList 
            leads={highFitLeads} 
            isLoading={leadsLoading}
            onContact={contactMutation.mutate}
            onRecruit={recruitMutation.mutate}
            getScoreColor={getScoreColor}
            getPlatformColor={getPlatformColor}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        </TabsContent>

        <TabsContent value="uncontacted" className="mt-4">
          <LawyerLeadsList 
            leads={uncontactedLeads} 
            isLoading={leadsLoading}
            onContact={contactMutation.mutate}
            onRecruit={recruitMutation.mutate}
            getScoreColor={getScoreColor}
            getPlatformColor={getPlatformColor}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface LawyerLeadsListProps {
  leads: LawyerLead[];
  isLoading: boolean;
  onContact: (params: { id: string; contacted: boolean }) => void;
  onRecruit: (id: string) => void;
  getScoreColor: (score: number) => string;
  getPlatformColor: (platform: string) => string;
  formatCurrency: (value: number) => string;
  formatDate: (date: string) => string;
}

function LawyerLeadsList({
  leads,
  isLoading,
  onContact,
  onRecruit,
  getScoreColor,
  getPlatformColor,
  formatCurrency,
  formatDate,
}: LawyerLeadsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No lawyer leads found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Lawyer social listening will discover attorneys seeking clients on social media
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-4 pr-4">
        {leads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-md transition-shadow" data-testid={`card-lawyer-${lead.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getPlatformColor(lead.sourcePlatform)}>
                      {lead.sourcePlatform}
                    </Badge>
                    {lead.contacted && (
                      <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Contacted
                      </Badge>
                    )}
                    {lead.lookingForClients && (
                      <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Seeking Clients
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg" data-testid={`text-lawyer-name-${lead.id}`}>
                    {lead.lawyerName || lead.authorUsername}
                  </CardTitle>
                  {lead.firmName && (
                    <CardDescription className="mt-1">
                      <Briefcase className="inline h-3 w-3 mr-1" />
                      {lead.firmName}
                    </CardDescription>
                  )}
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(parseFloat(lead.fitScore))}`}>
                    {parseFloat(lead.fitScore).toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">Fit Score</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {lead.email && (
                  <div className="flex items-center gap-1" data-testid={`text-lawyer-email-${lead.id}`}>
                    <Mail className="h-3 w-3" />
                    {lead.email}
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-1" data-testid={`text-lawyer-phone-${lead.id}`}>
                    <Phone className="h-3 w-3" />
                    {lead.phone}
                  </div>
                )}
                {lead.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {lead.location}
                  </div>
                )}
              </div>

              {/* Specializations */}
              {lead.specializations && lead.specializations.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Specializations:</p>
                  <div className="flex flex-wrap gap-2">
                    {lead.specializations.map((spec, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {spec.replace('_', ' ').toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Post Preview */}
              <div className="bg-muted/50 dark:bg-muted/20 p-3 rounded-md">
                <p className="text-xs font-medium mb-1">{lead.postTitle || 'Post'}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {lead.postContent}
                </p>
                <a 
                  href={lead.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-flex items-center gap-1"
                  data-testid={`link-lawyer-source-${lead.id}`}
                >
                  View original post
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Quality</p>
                  <p className="text-sm font-semibold">{parseFloat(lead.aiQualityScore).toFixed(1)}/10</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Experience</p>
                  <p className="text-sm font-semibold">{lead.yearsExperience || 'N/A'} years</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Matches</p>
                  <p className="text-sm font-semibold">{lead.leadMatchCount} leads</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Value</p>
                  <p className="text-sm font-semibold">{formatCurrency(lead.potentialValue)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {!lead.contacted ? (
                  <Button
                    onClick={() => onContact({ id: lead.id, contacted: true })}
                    size="sm"
                    variant="default"
                    data-testid={`button-contact-lawyer-${lead.id}`}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Mark as Contacted
                  </Button>
                ) : (
                  <Button
                    onClick={() => onContact({ id: lead.id, contacted: false })}
                    size="sm"
                    variant="outline"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Mark as Uncontacted
                  </Button>
                )}
                <Button
                  onClick={() => onRecruit(lead.id)}
                  size="sm"
                  variant="secondary"
                  data-testid={`button-recruit-lawyer-${lead.id}`}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Add to Recruitment
                </Button>
              </div>

              {/* Metadata */}
              <div className="text-xs text-muted-foreground pt-2 border-t">
                Discovered {formatDate(lead.discoveredAt)}
                {lead.contactedAt && ` • Contacted ${formatDate(lead.contactedAt)}`}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
