import { NextResponse } from 'next/server';
import { dbClient, dbQueries } from '@/lib/db';

/**
 * Full breakdown of all leads (e.g. 47,159) for composition reporting.
 * Use this to answer: visa mix, AI score distribution, platform, conversion.
 * Future: add nationality and tenure when we have that data.
 */
export async function GET() {
  try {
    const [
      totalResult,
      withResponsesResult,
      byAiScoreResult,
      byPlatformResult,
      byVisaCategoryResult,
      validatedResult,
    ] = await Promise.all([
      dbQueries.getTotalLeads(),
      dbQueries.getLeadsWithResponses(),
      // AI score buckets (aligned with how we use score in priority/quality)
      dbClient`
        SELECT 
          CASE 
            WHEN ai_score IS NULL THEN 'no_score'
            WHEN CAST(ai_score AS FLOAT) < 4 THEN '0-3'
            WHEN CAST(ai_score AS FLOAT) < 6 THEN '4-5'
            WHEN CAST(ai_score AS FLOAT) < 8 THEN '6-7'
            WHEN CAST(ai_score AS FLOAT) < 10 THEN '8-9'
            ELSE '9-10'
          END as bucket,
          COUNT(*)::int as count
        FROM leads
        GROUP BY bucket
        ORDER BY 
          CASE bucket 
            WHEN 'no_score' THEN 0 
            WHEN '0-3' THEN 1 
            WHEN '4-5' THEN 2 
            WHEN '6-7' THEN 3 
            WHEN '8-9' THEN 4 
            WHEN '9-10' THEN 5 
            ELSE 6 
          END
      `,
      dbClient`
        SELECT 
          COALESCE(source_platform, 'unknown') as platform,
          COUNT(*)::int as count
        FROM leads
        GROUP BY source_platform
        ORDER BY count DESC
      `,
      // Inferred visa category from title (same logic as lead-segmentation)
      dbClient`
        SELECT 
          CASE 
            WHEN LOWER(title) LIKE '%o-1%' OR LOWER(title) LIKE '%o1%' OR LOWER(title) LIKE '%extraordinary%' THEN 'O-1A / EB-1A'
            WHEN LOWER(title) LIKE '%eb-2%' OR LOWER(title) LIKE '%eb2%' OR LOWER(title) LIKE '%niw%' THEN 'EB-2 NIW'
            WHEN LOWER(title) LIKE '%h-1b%' OR LOWER(title) LIKE '%h1b%' OR LOWER(title) LIKE '%h1-b%' THEN 'H-1B / L-1'
            WHEN title IS NULL OR title = '' THEN 'no_title'
            ELSE 'Other Visa Categories'
          END as visa_category,
          COUNT(*)::int as count,
          AVG(CAST(ai_score AS FLOAT)) as avg_ai_score
        FROM leads
        GROUP BY visa_category
        ORDER BY count DESC
      `,
      dbClient`
        SELECT 
          COUNT(*) FILTER (WHERE is_validated = true)::int as validated,
          COUNT(*)::int as total
        FROM leads
      `,
    ]);

    const totalLeads = typeof totalResult === 'number' ? totalResult : Number((totalResult as any)?.[0]?.count ?? 0);
    const leadsWithResponses = typeof withResponsesResult === 'number'
      ? withResponsesResult
      : Number((withResponsesResult as any)?.[0]?.count ?? 0);
    const validatedCount = Number((validatedResult as any[])?.[0]?.validated ?? 0);
    const validatedTotal = Number((validatedResult as any[])?.[0]?.total ?? 0);

    const byAiScore = (byAiScoreResult || []).map((row: any) => ({
      bucket: row.bucket,
      count: Number(row.count ?? 0),
      percentage: totalLeads > 0 ? Math.round((Number(row.count ?? 0) / totalLeads) * 1000) / 10 : 0,
    }));

    const byPlatform = (byPlatformResult || []).map((row: any) => ({
      platform: row.platform,
      count: Number(row.count ?? 0),
      percentage: totalLeads > 0 ? Math.round((Number(row.count ?? 0) / totalLeads) * 1000) / 10 : 0,
    }));

    const byVisaCategory = (byVisaCategoryResult || []).map((row: any) => ({
      visaCategory: row.visa_category,
      count: Number(row.count ?? 0),
      avgAiScore: row.avg_ai_score != null ? Math.round(Number(row.avg_ai_score) * 100) / 100 : null,
      percentage: totalLeads > 0 ? Math.round((Number(row.count ?? 0) / totalLeads) * 1000) / 10 : 0,
    }));

    const conversionRate = totalLeads > 0 ? Math.round((leadsWithResponses / totalLeads) * 10000) / 100 : 0;
    const validatedPercentage = validatedTotal > 0 ? Math.round((validatedCount / validatedTotal) * 1000) / 10 : 0;

    const composition = {
      totalLeads,
      leadsWithResponses,
      leadsWithoutResponses: totalLeads - leadsWithResponses,
      conversionRate,
      validatedCount,
      validatedPercentage,
      byAiScore,
      byPlatform,
      byVisaCategory,
      // Future: populate when we have nationality/tenure (survey, inferred, or backfill)
      byNationality: null as { country: string; count: number; percentage: number }[] | null,
      byTenureInUs: null as { bucket: string; count: number; percentage: number }[] | null,
    };

    return NextResponse.json(composition);
  } catch (error: any) {
    console.error('❌ Lead composition error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch lead composition',
        totalLeads: 0,
        leadsWithResponses: 0,
        byAiScore: [],
        byPlatform: [],
        byVisaCategory: [],
      },
      { status: 500 }
    );
  }
}
