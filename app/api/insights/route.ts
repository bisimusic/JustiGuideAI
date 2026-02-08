import { NextResponse } from 'next/server';
import { dbClient } from '@/lib/db';

export async function GET() {
  try {
    // Get AI insights from database
    const [
      topLeadsResult,
      platformDistributionResult,
      avgScoreResult,
      responseRateResult
    ] = await Promise.all([
      // Top leads by AI score
      dbClient`
        SELECT 
          id,
          title,
          ai_score,
          source_platform,
          discovered_at
        FROM leads
        WHERE ai_score IS NOT NULL
        ORDER BY ai_score DESC
        LIMIT 10
      `,
      // Platform distribution
      dbClient`
        SELECT 
          source_platform as platform,
          COUNT(*)::int as count,
          AVG(CAST(ai_score AS FLOAT)) as avg_score
        FROM leads
        WHERE source_platform IS NOT NULL
        GROUP BY source_platform
        ORDER BY count DESC
      `,
      // Average AI score
      dbClient`
        SELECT AVG(CAST(ai_score AS FLOAT)) as avg_score
        FROM leads
        WHERE ai_score IS NOT NULL
      `,
      // Response rate
      dbClient`
        SELECT 
          (SELECT COUNT(DISTINCT lead_id)::int FROM lead_responses)::float as responded,
          (SELECT COUNT(*)::int FROM leads)::float as total
      `,
    ]);

    const topLeads = topLeadsResult || [];
    const platformDistribution = platformDistributionResult || [];
    const avgScore = Number(avgScoreResult[0]?.avg_score || 0);
    const responded = Number(responseRateResult[0]?.responded || 0);
    const total = Number(responseRateResult[0]?.total || 0);
    const responseRate = total > 0 ? (responded / total) * 100 : 0;

    const insights = {
      topLeads: topLeads.map((lead: any) => ({
        id: lead.id,
        title: lead.title,
        aiScore: Number(lead.ai_score || 0),
        platform: lead.source_platform,
        discoveredAt: lead.discovered_at,
      })),
      platformDistribution: platformDistribution.map((p: any) => ({
        platform: p.platform,
        count: Number(p.count || 0),
        avgScore: Number(p.avg_score || 0),
      })),
      overallStats: {
        avgAiScore: Math.round(avgScore * 100) / 100,
        responseRate: Math.round(responseRate * 100) / 100,
        totalLeads: total,
        leadsWithResponses: responded,
      },
      recommendations: [
        avgScore < 7 ? 'Consider improving lead quality filters' : 'Lead quality is good',
        responseRate < 30 ? 'Increase response generation rate' : 'Response rate is healthy',
        platformDistribution.length < 3 ? 'Diversify lead sources' : 'Good platform diversity',
      ],
    };

    return NextResponse.json(insights);
  } catch (error: any) {
    console.error('❌ Get insights error:', error);
    return NextResponse.json(
      {
        topLeads: [],
        platformDistribution: [],
        overallStats: {
          avgAiScore: 0,
          responseRate: 0,
          totalLeads: 0,
          leadsWithResponses: 0,
        },
        recommendations: ['Failed to load insights'],
      },
      { status: 200 }
    );
  }
}
