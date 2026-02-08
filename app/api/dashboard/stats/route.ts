import { NextResponse } from 'next/server'
import { drizzle } from 'drizzle-orm/postgres-js';
import { count, sql } from 'drizzle-orm';
import { dbClient, dbQueries } from '@/lib/db';

const db = drizzle(dbClient);

export async function GET() {
  try {
    // Query database directly for dashboard stats - use consolidated queries where possible
    const [
      totalLeadsCount,
      totalResponsesCount,
      leadsWithResponsesCount,
      dailyLeadsResult,
      avgAiScoreResult,
      validatedSourcesResult,
      platformStatsResult
    ] = await Promise.all([
      // Total leads count - use consolidated query
      dbQueries.getTotalLeads(),
      
      // Total responses count
      dbQueries.getTotalResponses(),
      
      // Leads with responses count - use consolidated query
      dbQueries.getLeadsWithResponses(),
      
      // Daily leads (last 24 hours)
      dbClient`SELECT COUNT(*)::int as count FROM leads WHERE discovered_at >= NOW() - INTERVAL '24 hours'`,
      
      // Average AI score
      dbClient`SELECT AVG(CAST(ai_score AS FLOAT)) as avg FROM leads WHERE ai_score IS NOT NULL`,
      
      // Validated sources percentage
      dbClient`
        SELECT 
          COUNT(*) FILTER (WHERE is_validated = true)::int as validated,
          COUNT(*)::int as total
        FROM leads
      `,
      
      // Platform breakdown
      dbClient`
        SELECT 
          source_platform as platform,
          COUNT(*)::int as count
        FROM leads
        GROUP BY source_platform
        ORDER BY count DESC
        LIMIT 10
      `
    ]);
    const dailyLeads = Number(dailyLeadsResult[0]?.count || 0);
    const avgAiScore = Number(avgAiScoreResult[0]?.avg || 0);
    const validatedCount = Number(validatedSourcesResult[0]?.validated || 0);
    const totalLeadsForValidation = Number(validatedSourcesResult[0]?.total || 0);
    const validatedSourcesPercentage = totalLeadsForValidation > 0 
      ? (validatedCount / totalLeadsForValidation) * 100 
      : 0;

    // Calculate conversion rate
    const conversionRate = totalLeadsCount > 0 
      ? (leadsWithResponsesCount / totalLeadsCount) * 100 
      : 0;

    // Platform breakdown - postgres-js returns arrays directly
    const platformBreakdown = (platformStatsResult || []).reduce((acc: any, row: any) => {
      acc[row.platform] = Number(row.count) || 0;
      return acc;
    }, {});

    const stats = {
      totalLeads: totalLeadsCount,
      dailyLeads,
      totalResponses: totalResponsesCount,
      leadsWithResponses: leadsWithResponsesCount,
      conversionRate: Math.round(conversionRate * 100) / 100,
      avgAiScore: Math.round(avgAiScore * 100) / 100,
      validatedSourcesPercentage: Math.round(validatedSourcesPercentage * 100) / 100,
      platformBreakdown,
      weeklyRevenue: 0, // TODO: Calculate from actual revenue data
      totalContacts: 0, // TODO: Calculate from contacts table
      recentContacts: 0, // TODO: Calculate from contacts table
    };

    console.log('✅ Dashboard stats from database:', stats);
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('❌ Dashboard stats error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard stats', 
        message: error.message,
        totalLeads: 0,
        dailyLeads: 0,
        totalResponses: 0,
        leadsWithResponses: 0,
        conversionRate: 0,
        avgAiScore: 0,
        validatedSourcesPercentage: 0,
        platformBreakdown: {},
      },
      { status: 500 }
    );
  }
}
