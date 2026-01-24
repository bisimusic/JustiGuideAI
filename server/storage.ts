/**
 * Storage Service
 * Provides database access layer using Drizzle ORM
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, desc, asc, count, sum, sql, and, gte, lte, or, inArray } from 'drizzle-orm';

// Dynamic import for schema (may be in @shared package or local)
let leads: any;
let leadResponses: any;
let emailCaptures: any;
let userCredits: any;
let referrals: any;
let creditTransactions: any;
let monitoringStats: any;
let contacts: any;
let lawyers: any;

// Initialize schema imports
async function initSchema() {
  try {
    const schema = await import('@shared/schema');
    leads = schema.leads;
    leadResponses = schema.leadResponses || schema.lead_responses;
    emailCaptures = schema.emailCaptures || schema.email_captures;
    userCredits = schema.userCredits || schema.user_credits;
    referrals = schema.referrals;
    creditTransactions = schema.creditTransactions || schema.credit_transactions;
    monitoringStats = schema.monitoringStats || schema.monitoring_stats;
    contacts = schema.contacts;
    lawyers = schema.lawyers;
  } catch (error) {
    console.warn('⚠️ Could not import @shared/schema, using direct table references');
    // Fallback: try to use table names directly
  }
}

// Initialize database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create postgres client
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create Drizzle database instance
const db = drizzle(client);

// Initialize schema on module load
initSchema().catch(err => {
  console.error('❌ Failed to initialize schema:', err);
});

/**
 * Storage Service Class
 */
class StorageService {
  public db = db;

  /**
   * Get leads with pagination
   */
  async getLeads(limit: number = 50, offset: number = 0): Promise<any[]> {
    try {
      await initSchema();
      if (!leads) {
        // Fallback: query using raw SQL
        const result = await db.execute(sql`
          SELECT * FROM leads 
          ORDER BY discovered_at DESC 
          LIMIT ${limit} OFFSET ${offset}
        `);
        return result.rows || [];
      }

      const result = await db.select()
        .from(leads)
        .orderBy(desc(leads.discoveredAt))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error: any) {
      console.error('Error getting leads:', error);
      // Fallback to raw SQL
      try {
        const result = await db.execute(sql`
          SELECT * FROM leads 
          ORDER BY discovered_at DESC 
          LIMIT ${limit} OFFSET ${offset}
        `);
        return result.rows || [];
      } catch (sqlError) {
        console.error('SQL fallback error:', sqlError);
        return [];
      }
    }
  }

  /**
   * Get leads by platform
   */
  async getLeadsByPlatform(platform: string, limit: number = 50): Promise<any[]> {
    try {
      await initSchema();
      if (!leads) {
        const result = await db.execute(sql`
          SELECT * FROM leads 
          WHERE source_platform = ${platform}
          ORDER BY discovered_at DESC 
          LIMIT ${limit}
        `);
        return result.rows || [];
      }

      const result = await db.select()
        .from(leads)
        .where(eq(leads.sourcePlatform, platform))
        .orderBy(desc(leads.discoveredAt))
        .limit(limit);

      return result;
    } catch (error: any) {
      console.error('Error getting leads by platform:', error);
      try {
        const result = await db.execute(sql`
          SELECT * FROM leads 
          WHERE source_platform = ${platform}
          ORDER BY discovered_at DESC 
          LIMIT ${limit}
        `);
        return result.rows || [];
      } catch (sqlError) {
        return [];
      }
    }
  }

  /**
   * Get lead by ID
   */
  async getLeadById(id: string): Promise<any | null> {
    try {
      await initSchema();
      if (!leads) {
        const result = await db.execute(sql`
          SELECT * FROM leads WHERE id = ${id} LIMIT 1
        `);
        return result.rows?.[0] || null;
      }

      const result = await db.select()
        .from(leads)
        .where(eq(leads.id, id))
        .limit(1);

      return result[0] || null;
    } catch (error: any) {
      console.error('Error getting lead by ID:', error);
      return null;
    }
  }

  /**
   * Get lead (alias for getLeadById)
   */
  async getLead(id: string): Promise<any | null> {
    return this.getLeadById(id);
  }

  /**
   * Create a new lead
   */
  async createLead(data: any): Promise<any> {
    try {
      await initSchema();
      if (!leads) {
        // Fallback: use raw SQL insert
        const result = await db.execute(sql`
          INSERT INTO leads (id, title, content, source_url, source_platform, discovered_at, updated_at)
          VALUES (${data.id}, ${data.title}, ${data.content}, ${data.sourceUrl}, ${data.sourcePlatform}, NOW(), NOW())
          RETURNING *
        `);
        return result.rows?.[0] || data;
      }

      const [result] = await db.insert(leads)
        .values({
          ...data,
          discoveredAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return result;
    } catch (error: any) {
      console.error('Error creating lead:', error);
      throw error;
    }
  }

  /**
   * Update lead validation status
   */
  async updateLeadValidation(id: string, isValidated: boolean, status: string): Promise<void> {
    try {
      await initSchema();
      if (!leads) {
        await db.execute(sql`
          UPDATE leads 
          SET is_validated = ${isValidated}, validation_status = ${status}, updated_at = NOW()
          WHERE id = ${id}
        `);
        return;
      }

      await db.update(leads)
        .set({
          isValidated,
          validationStatus: status,
          updatedAt: new Date(),
        })
        .where(eq(leads.id, id));
    } catch (error: any) {
      console.error('Error updating lead validation:', error);
      throw error;
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<any> {
    try {
      await initSchema();
      
      // Get total leads count
      let totalLeads = 0;
      try {
        if (leads) {
          const [result] = await db.select({ count: count() }).from(leads);
          totalLeads = Number(result.count) || 0;
        } else {
          const result = await db.execute(sql`SELECT COUNT(*) as count FROM leads`);
          totalLeads = Number(result.rows?.[0]?.count) || 0;
        }
      } catch (e) {
        console.warn('Error counting leads:', e);
      }

      // Get average AI score
      let avgAiScore = 0;
      try {
        if (leads) {
          const [result] = await db.select({ avg: sql<number>`AVG(CAST(${leads.aiScore} AS FLOAT))` }).from(leads);
          avgAiScore = Number(result.avg) || 0;
        } else {
          const result = await db.execute(sql`SELECT AVG(CAST(ai_score AS FLOAT)) as avg FROM leads WHERE ai_score IS NOT NULL`);
          avgAiScore = Number(result.rows?.[0]?.avg) || 0;
        }
      } catch (e) {
        console.warn('Error calculating avg score:', e);
      }

      // Get validated sources percentage
      let validatedSourcesPercentage = 0;
      try {
        if (leads) {
          const [validated] = await db.select({ count: count() })
            .from(leads)
            .where(eq(leads.isValidated, true));
          const validatedCount = Number(validated.count) || 0;
          validatedSourcesPercentage = totalLeads > 0 ? (validatedCount / totalLeads) * 100 : 0;
        } else {
          const result = await db.execute(sql`
            SELECT 
              COUNT(*) FILTER (WHERE is_validated = true) as validated,
              COUNT(*) as total
            FROM leads
          `);
          const row = result.rows?.[0];
          if (row) {
            validatedSourcesPercentage = Number(row.total) > 0 
              ? (Number(row.validated) / Number(row.total)) * 100 
              : 0;
          }
        }
      } catch (e) {
        console.warn('Error calculating validated percentage:', e);
      }

      // Get daily leads (last 24 hours)
      let dailyLeads = 0;
      try {
        if (leads) {
          const [result] = await db.select({ count: count() })
            .from(leads)
            .where(gte(leads.discoveredAt, sql`NOW() - INTERVAL '24 hours'`));
          dailyLeads = Number(result.count) || 0;
        } else {
          const result = await db.execute(sql`
            SELECT COUNT(*) as count FROM leads 
            WHERE discovered_at >= NOW() - INTERVAL '24 hours'
          `);
          dailyLeads = Number(result.rows?.[0]?.count) || 0;
        }
      } catch (e) {
        console.warn('Error counting daily leads:', e);
      }

      // Calculate conversion rate and revenue (simplified)
      const conversionRate = 0; // TODO: Calculate from responses
      const weeklyRevenue = 0; // TODO: Calculate from conversions

      return {
        totalLeads,
        dailyLeads,
        conversionRate,
        weeklyRevenue,
        avgAiScore: Math.round(avgAiScore * 100) / 100,
        validatedSourcesPercentage: Math.round(validatedSourcesPercentage * 100) / 100,
      };
    } catch (error: any) {
      console.error('Error getting dashboard stats:', error);
      return {
        totalLeads: 0,
        dailyLeads: 0,
        conversionRate: 0,
        weeklyRevenue: 0,
        avgAiScore: 0,
        validatedSourcesPercentage: 0,
      };
    }
  }

  /**
   * Get all lead responses
   */
  async getAllLeadResponses(): Promise<any[]> {
    try {
      await initSchema();
      if (!leadResponses) {
        const result = await db.execute(sql`
          SELECT * FROM lead_responses ORDER BY posted_at DESC
        `);
        return result.rows || [];
      }

      const result = await db.select()
        .from(leadResponses)
        .orderBy(desc(leadResponses.postedAt));

      return result;
    } catch (error: any) {
      console.error('Error getting all lead responses:', error);
      try {
        const result = await db.execute(sql`SELECT * FROM lead_responses ORDER BY posted_at DESC`);
        return result.rows || [];
      } catch (sqlError) {
        return [];
      }
    }
  }

  /**
   * Get responses for a specific lead
   */
  async getLeadResponses(leadId: string): Promise<any[]> {
    try {
      await initSchema();
      if (!leadResponses) {
        const result = await db.execute(sql`
          SELECT * FROM lead_responses 
          WHERE lead_id = ${leadId} 
          ORDER BY posted_at DESC
        `);
        return result.rows || [];
      }

      const result = await db.select()
        .from(leadResponses)
        .where(eq(leadResponses.leadId, leadId))
        .orderBy(desc(leadResponses.postedAt));

      return result;
    } catch (error: any) {
      console.error('Error getting lead responses:', error);
      return [];
    }
  }

  /**
   * Get response count for a lead
   */
  async getResponseCount(leadId: string): Promise<number> {
    try {
      await initSchema();
      if (!leadResponses) {
        const result = await db.execute(sql`
          SELECT COUNT(*) as count FROM lead_responses WHERE lead_id = ${leadId}
        `);
        return Number(result.rows?.[0]?.count) || 0;
      }

      const [result] = await db.select({ count: count() })
        .from(leadResponses)
        .where(eq(leadResponses.leadId, leadId));

      return Number(result.count) || 0;
    } catch (error: any) {
      console.error('Error getting response count:', error);
      return 0;
    }
  }

  /**
   * Create lead response atomically (with limit check)
   */
  async createLeadResponseAtomic(data: any): Promise<any> {
    try {
      await initSchema();
      
      // Get MAX_RESPONSES_PER_LEAD constant
      let maxResponses = 10;
      try {
        const constants = await import('./config/constants');
        maxResponses = constants.MAX_RESPONSES_PER_LEAD || 10;
      } catch (e) {
        // Use default
      }
      
      // Check current response count
      const currentCount = await this.getResponseCount(data.leadId);
      if (currentCount >= maxResponses) {
        throw new Error(`Response limit reached. Maximum ${maxResponses} responses per lead.`);
      }

      if (!leadResponses) {
        const result = await db.execute(sql`
          INSERT INTO lead_responses (id, lead_id, response_content, platform, response_type, status, posted_at)
          VALUES (${data.id}, ${data.leadId}, ${data.responseContent}, ${data.platform}, ${data.responseType}, ${data.status}, NOW())
          RETURNING *
        `);
        return result.rows?.[0] || data;
      }

      const [result] = await db.insert(leadResponses)
        .values({
          ...data,
          postedAt: new Date(),
        })
        .returning();

      return result;
    } catch (error: any) {
      console.error('Error creating lead response:', error);
      throw error;
    }
  }

  /**
   * Get leads with responses
   */
  async getLeadsWithResponses(): Promise<any[]> {
    try {
      const allLeads = await this.getLeads(10000);
      const allResponses = await this.getAllLeadResponses();

      // Group responses by lead ID
      const responsesByLead = new Map<string, any[]>();
      for (const response of allResponses) {
        const leadId = response.leadId || response.lead_id;
        if (!responsesByLead.has(leadId)) {
          responsesByLead.set(leadId, []);
        }
        responsesByLead.get(leadId)!.push(response);
      }

      // Attach responses to leads
      return allLeads.map(lead => ({
        ...lead,
        responses: responsesByLead.get(lead.id) || [],
        responseCount: (responsesByLead.get(lead.id) || []).length,
      }));
    } catch (error: any) {
      console.error('Error getting leads with responses:', error);
      return [];
    }
  }

  /**
   * Get leads with response details
   */
  async getLeadsWithResponseDetails(): Promise<any[]> {
    return this.getLeadsWithResponses();
  }

  /**
   * Get top scored lead
   */
  async getTopScoredLead(): Promise<any | null> {
    try {
      await initSchema();
      if (!leads) {
        const result = await db.execute(sql`
          SELECT * FROM leads 
          WHERE ai_score IS NOT NULL 
          ORDER BY CAST(ai_score AS FLOAT) DESC 
          LIMIT 1
        `);
        return result.rows?.[0] || null;
      }

      const result = await db.select()
        .from(leads)
        .where(sql`${leads.aiScore} IS NOT NULL`)
        .orderBy(desc(sql`CAST(${leads.aiScore} AS FLOAT)`))
        .limit(1);

      return result[0] || null;
    } catch (error: any) {
      console.error('Error getting top scored lead:', error);
      return null;
    }
  }

  /**
   * Get high priority leads
   */
  async getHighPriorityLeads(limit: number = 20): Promise<any[]> {
    try {
      await initSchema();
      if (!leads) {
        const result = await db.execute(sql`
          SELECT * FROM leads 
          WHERE CAST(ai_score AS FLOAT) >= 7.0 
          ORDER BY CAST(ai_score AS FLOAT) DESC 
          LIMIT ${limit}
        `);
        return result.rows || [];
      }

      const result = await db.select()
        .from(leads)
        .where(gte(sql`CAST(${leads.aiScore} AS FLOAT)`, 7.0))
        .orderBy(desc(sql`CAST(${leads.aiScore} AS FLOAT)`))
        .limit(limit);

      return result;
    } catch (error: any) {
      console.error('Error getting high priority leads:', error);
      return [];
    }
  }

  /**
   * Get monitoring stats
   */
  async getMonitoringStats(): Promise<any> {
    try {
      await initSchema();
      if (!monitoringStats) {
        // Return default stats if table doesn't exist
        return {
          reddit: { active: true, lastScan: null },
          linkedin: { active: true, lastScan: null },
          twitter: { active: true, lastScan: null },
        };
      }

      const result = await db.select().from(monitoringStats);
      return result.reduce((acc: any, stat: any) => {
        acc[stat.platform] = stat;
        return acc;
      }, {});
    } catch (error: any) {
      console.error('Error getting monitoring stats:', error);
      return {};
    }
  }

  /**
   * Update monitoring stats
   */
  async updateMonitoringStats(platform: string, data: any): Promise<void> {
    try {
      await initSchema();
      if (!monitoringStats) {
        // Table doesn't exist, skip update
        return;
      }

      await db.update(monitoringStats)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(monitoringStats.platform, platform));
    } catch (error: any) {
      console.error('Error updating monitoring stats:', error);
    }
  }

  /**
   * Get lead pipeline stats
   */
  async getLeadPipelineStats(): Promise<any> {
    try {
      const allLeads = await this.getLeads(10000);
      
      return {
        totalLeads: allLeads.length,
        leadsWithPipeline: allLeads.filter((l: any) => l.pipelineValue || l.pipeline_value).length,
        totalPipelineValue: allLeads.reduce((sum: number, l: any) => {
          return sum + (Number(l.pipelineValue || l.pipeline_value) || 0);
        }, 0),
      };
    } catch (error: any) {
      console.error('Error getting pipeline stats:', error);
      return {
        totalLeads: 0,
        leadsWithPipeline: 0,
        totalPipelineValue: 0,
      };
    }
  }

  /**
   * Get response totals
   */
  async getResponseTotals(): Promise<any> {
    try {
      const allResponses = await this.getAllLeadResponses();
      return {
        total: allResponses.length,
        byPlatform: allResponses.reduce((acc: any, r: any) => {
          const platform = r.platform || 'unknown';
          acc[platform] = (acc[platform] || 0) + 1;
          return acc;
        }, {}),
      };
    } catch (error: any) {
      console.error('Error getting response totals:', error);
      return { total: 0, byPlatform: {} };
    }
  }

  /**
   * Get revenue aggregates
   */
  async getRevenueAggregates(): Promise<any> {
    try {
      const allLeads = await this.getLeads(10000);
      const allResponses = await this.getAllLeadResponses();

      const totalRevenue = allLeads.reduce((sum: number, lead: any) => {
        return sum + (Number(lead.estimatedValue || lead.estimated_value) || 0);
      }, 0);

      return {
        totalLeads: allLeads.length,
        totalResponses: allResponses.length,
        estimatedRevenue: totalRevenue,
        avgAiScore: allLeads.length > 0
          ? allLeads.reduce((sum: number, l: any) => sum + (Number(l.aiScore || l.ai_score) || 0), 0) / allLeads.length
          : 0,
      };
    } catch (error: any) {
      console.error('Error getting revenue aggregates:', error);
      return {
        totalLeads: 0,
        totalResponses: 0,
        estimatedRevenue: 0,
        avgAiScore: 0,
      };
    }
  }

  /**
   * Get all contacts
   */
  async getAllContacts(): Promise<any[]> {
    try {
      await initSchema();
      if (!emailCaptures) {
        const result = await db.execute(sql`SELECT * FROM email_captures ORDER BY capture_date DESC`);
        return result.rows || [];
      }

      const result = await db.select()
        .from(emailCaptures)
        .orderBy(desc(emailCaptures.captureDate));

      return result;
    } catch (error: any) {
      console.error('Error getting all contacts:', error);
      return [];
    }
  }

  /**
   * Get contacts by source
   */
  async getContactsBySource(source: string): Promise<any[]> {
    try {
      await initSchema();
      if (!emailCaptures) {
        const result = await db.execute(sql`
          SELECT * FROM email_captures 
          WHERE ${source} = ANY(sources)
          ORDER BY capture_date DESC
        `);
        return result.rows || [];
      }

      const result = await db.select()
        .from(emailCaptures)
        .where(sql`${source} = ANY(${emailCaptures.sources})`)
        .orderBy(desc(emailCaptures.captureDate));

      return result;
    } catch (error: any) {
      console.error('Error getting contacts by source:', error);
      return [];
    }
  }

  /**
   * Get investor contacts
   */
  async getInvestorContacts(): Promise<any[]> {
    try {
      // Filter contacts that are investors
      const allContacts = await this.getAllContacts();
      return allContacts.filter((contact: any) => {
        const metadata = contact.metadata || {};
        const sources = contact.sources || [];
        return metadata.type === 'investor' || 
               sources.some((s: string) => s.toLowerCase().includes('investor'));
      });
    } catch (error: any) {
      console.error('Error getting investor contacts:', error);
      return [];
    }
  }

  /**
   * Get extracted contacts
   */
  async getExtractedContacts(): Promise<any[]> {
    try {
      // Get contacts that were extracted (not manually entered)
      const allContacts = await this.getAllContacts();
      return allContacts.filter((contact: any) => {
        const metadata = contact.metadata || {};
        return metadata.extracted === true || metadata.source === 'extraction';
      });
    } catch (error: any) {
      console.error('Error getting extracted contacts:', error);
      return [];
    }
  }

  /**
   * Get lawyers
   */
  async getLawyers(): Promise<any[]> {
    try {
      await initSchema();
      if (!lawyers) {
        // Try to get from a lawyers table or return empty
        try {
          const result = await db.execute(sql`SELECT * FROM lawyers ORDER BY name`);
          return result.rows || [];
        } catch (e) {
          return [];
        }
      }

      const result = await db.select().from(lawyers);
      return result;
    } catch (error: any) {
      console.error('Error getting lawyers:', error);
      return [];
    }
  }
}

// Export singleton instance
export const storage = new StorageService();

