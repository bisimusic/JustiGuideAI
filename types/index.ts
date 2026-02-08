export interface Lead {
  id: string;
  title: string;
  content: string;
  sourceUrl: string;
  sourcePlatform: string;
  subreddit?: string;
  aiScore?: string;
  priority: string;
  isValidated: boolean;
  validationStatus: string;
  aiAnalysis?: {
    score: number;
    urgency: string;
    priority: string;
    legalAreas: string[];
    potentialValue: string;
    needsAttorneyAssistance: boolean;
    summary: string;
    recommendations: string[];
    confidence: number;
  };
  engagement?: {
    comments?: number;
    score?: number;
  };
  authorId?: string;
  authorUsername?: string;
  postedAt?: string;
  discoveredAt: string;
  updatedAt: string;
  hasResponses?: boolean;
  responseCount?: number;
  lastResponseAt?: string;
}

export interface LeadResponse {
  id: string;
  leadId: string;
  responseContent: string;
  platform: string;
  responseType: string;
  postId?: string;
  status: string;
  postedAt: string;
  createdAt: string;
}

export interface DashboardStats {
  totalLeads: number;
  dailyLeads?: number;
  totalResponses?: number;
  leadsWithResponses?: number;
  conversionRate?: number;
  validatedSourcesPercentage: number;
  avgAiScore: number;
  platformBreakdown?: Record<string, number>;
  weeklyRevenue?: number;
  totalContacts?: number;
  recentContacts?: number;
  monitoring?: MonitoringStats[];
}

export interface MonitoringStats {
  id: string;
  platform: string;
  newPosts: number;
  lastScanned: string;
  status: string;
  errorMessage?: string;
}

export interface AIInsights {
  trends: string[];
  recommendations: string[];
  qualityMetrics: {
    averageScore: number;
    topLegalAreas: string[];
    platformPerformance: Record<string, number>;
  };
}

export interface AuditResult {
  totalLeads: number;
  validSources: number;
  invalidSources: number;
  validationRate: number;
  issues: Array<{
    leadId: string;
    issue: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  platformBreakdown?: Record<string, { total: number; valid: number; invalid: number }>;
  lastAuditTime?: string;
  recommendations?: string[];
}
