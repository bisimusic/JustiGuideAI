import { NextResponse } from 'next/server';
import { dbClient, dbQueries } from '@/lib/db';

/**
 * Revenue analytics – all data from DATABASE (Neon/Postgres).
 *
 * Data flow:
 * - totalLeads, leadsWithResponses, totalResponses → lib/db.ts (leads, lead_responses)
 * - avgAiScore, platform breakdown → leads table (GROUP BY, AVG)
 * - serviceBreakdown → leads table (inferred service from title, then count + revenue estimate)
 * - conversionFunnel, revenueMetrics → derived from the above
 * - highValueLeads → sample of leads ordered by ai_score
 *
 * This route replaces the need to call the Express server for revenue analytics
 * when running Next.js only; both use the same DB (DATABASE_URL).
 */
export async function GET() {
  try {
    const [
      totalLeads,
      totalResponses,
      leadsWithResponses,
      avgAiScoreResult,
      platformRows,
      validatedResult,
      serviceCountsResult,
      highValueLeadsRows,
    ] = await Promise.all([
      dbQueries.getTotalLeads(),
      dbQueries.getTotalResponses(),
      dbQueries.getLeadsWithResponses(),
      dbClient`SELECT AVG(CAST(ai_score AS FLOAT))::float as avg FROM leads WHERE ai_score IS NOT NULL`,
      dbClient`
        SELECT COALESCE(source_platform, 'unknown') as platform, COUNT(*)::int as count
        FROM leads
        GROUP BY source_platform
        ORDER BY count DESC
      `,
      dbClient`
        SELECT
          COUNT(*) FILTER (WHERE is_validated = true)::int as validated,
          COUNT(*)::int as total
        FROM leads
      `,
      // Service-type counts (inferred from title) – map to JustiGuide services
      dbClient`
        SELECT
          CASE
            WHEN LOWER(title) LIKE '%n-400%' OR LOWER(title) LIKE '%n400%'
              OR (LOWER(title) LIKE '%citizenship%' AND LOWER(title) NOT LIKE '%eu%') THEN 'd2c_n400'
            WHEN LOWER(title) LIKE '%ead%' OR LOWER(title) LIKE '%work auth%' OR LOWER(title) LIKE '%employment auth%' THEN 'b2b_employment_auth'
            WHEN LOWER(title) LIKE '%h-1b%' OR LOWER(title) LIKE '%h1b%' OR LOWER(title) LIKE '%o-1%' OR LOWER(title) LIKE '%o1%' OR LOWER(title) LIKE '%l-1%' OR LOWER(title) LIKE '%l1%' THEN 'b2b_nonimmigrant_worker'
            WHEN LOWER(title) LIKE '%family%' OR LOWER(title) LIKE '%relative%' OR LOWER(title) LIKE '%i-130%' THEN 'b2b_alien_relative'
            WHEN LOWER(title) LIKE '%asylum%' OR LOWER(title) LIKE '%defense%' THEN 'b2b_asylum_defense'
            ELSE 'other'
          END as service,
          COUNT(*)::int as count
        FROM leads
        WHERE title IS NOT NULL AND title != ''
        GROUP BY service
      `,
      dbClient`
        SELECT id, title, ai_score, source_platform, discovered_at
        FROM leads
        WHERE ai_score IS NOT NULL
        ORDER BY CAST(ai_score AS FLOAT) DESC
        LIMIT 10
      `,
    ]);

    const avgAiScore = Number(avgAiScoreResult?.[0]?.avg ?? 0);
    const validatedCount = Number(validatedResult?.[0]?.validated ?? 0);
    const validatedTotal = Number(validatedResult?.[0]?.total ?? 1);

    const topPerformingPlatforms: Record<string, number> = {};
    for (const row of platformRows || []) {
      topPerformingPlatforms[row.platform] = Number(row.count ?? 0);
    }

    // Revenue estimates per service (align with dashboard expectations)
    const serviceRevenue: Record<string, { count: number; expectedRevenue: number; probability: number }> = {
      d2c_n400: { count: 0, expectedRevenue: 0, probability: 15 },
      b2b_employment_auth: { count: 0, expectedRevenue: 0, probability: 13 },
      b2b_nonimmigrant_worker: { count: 0, expectedRevenue: 0, probability: 10 },
      b2b_alien_relative: { count: 0, expectedRevenue: 0, probability: 12 },
      b2b_asylum_defense: { count: 0, expectedRevenue: 0, probability: 10 },
    };
    const revPerCase: Record<string, number> = {
      d2c_n400: 499,
      b2b_employment_auth: 198,
      b2b_nonimmigrant_worker: 139,
      b2b_alien_relative: 191,
      b2b_asylum_defense: 350,
    };
    for (const row of serviceCountsResult || []) {
      const service = String(row.service ?? 'other');
      const count = Number(row.count ?? 0);
      if (serviceRevenue[service]) {
        serviceRevenue[service].count = count;
        serviceRevenue[service].expectedRevenue = Math.round(count * (revPerCase[service] ?? 0) * 0.1); // 10% conversion
      }
    }

    const serviceBreakdown = Object.entries(serviceRevenue).map(([service, data]) => ({
      service,
      count: data.count,
      expectedRevenue: data.expectedRevenue,
      avgConversionProbability: data.probability,
    }));

    const totalExpectedRevenue = serviceBreakdown.reduce((s, x) => s + x.expectedRevenue, 0);
    const d2cRevenue = serviceBreakdown.find((s) => s.service === 'd2c_n400')?.expectedRevenue ?? 0;
    const b2bRevenue = serviceBreakdown
      .filter((s) => s.service.startsWith('b2b'))
      .reduce((s, x) => s + x.expectedRevenue, 0);
    const avgLeadValue = totalLeads > 0 ? Math.round(totalExpectedRevenue / totalLeads) : 0;
    const responseRate = totalLeads > 0 ? Math.round((leadsWithResponses / totalLeads) * 100) : 0;

    const highValueLeads = (highValueLeadsRows || []).map((lead: any) => ({
      leadId: lead.id,
      serviceType: 'immigration',
      expectedValue: Math.round(Number(lead.ai_score ?? 0) * 150),
      conversionProbability: Math.min(95, Math.round(Number(lead.ai_score ?? 0) * 10)),
      daysToClose: 18,
      platform: lead.source_platform,
      aiScore: lead.ai_score,
    }));

    const analytics = {
      success: true,
      totalLeads,
      totalResponses,
      responseRate,
      leadsWithResponses,
      averageAiScore: Math.round(avgAiScore * 10) / 10,
      totalExpectedRevenue,
      avgLeadValue,
      topPerformingPlatforms,
      conversionFunnel: {
        discovered: totalLeads,
        validated: validatedCount,
        responded: leadsWithResponses,
        consultations: Math.round(totalExpectedRevenue / 400),
        clients: Math.round(totalExpectedRevenue / 500),
      },
      revenueMetrics: {
        monthlyRecurring: Math.round(b2bRevenue * 0.05),
        annualProjected: Math.round(totalExpectedRevenue * 0.5),
        conversionValue: totalExpectedRevenue,
        d2cRevenue,
        b2bRevenue,
      },
      serviceBreakdown,
      highValueLeads,
      totalMonthlyRecurring: Math.round(b2bRevenue * 0.05),
    };

    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error('Revenue analytics (DB) error:', error);
    return NextResponse.json(
      { success: false, error: error?.message ?? 'Failed to fetch revenue analytics' },
      { status: 500 }
    );
  }
}
