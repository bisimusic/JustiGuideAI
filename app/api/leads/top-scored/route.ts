import { NextRequest, NextResponse } from 'next/server';
import { dbClient } from '@/lib/db';

/**
 * Top-scored leads for the "High-Quality Lead Scoring" card in Revenue Analytics.
 *
 * Data source: DATABASE (leads + lead_responses).
 * - Fetches leads with ai_score >= minScore, ordered by ai_score DESC.
 * - Adds hasResponse by checking lead_responses.
 * - Maps ai_score → score, infers priority and serviceType from score/title.
 *
 * Previously only on Express (server/routes.ts → databaseOptimizer.getTopScoredLeadsOptimized).
 * This route lets the dashboard work without Express.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20', 10) || 20);
    const minScore = parseFloat(searchParams.get('minScore') || '0') || 0;

    const rows = await dbClient`
      SELECT 
        l.id,
        l.title,
        l.ai_score,
        l.source_platform,
        EXISTS (
          SELECT 1 FROM lead_responses lr WHERE lr.lead_id = l.id
        ) as has_response
      FROM leads l
      WHERE l.ai_score IS NOT NULL
        AND CAST(l.ai_score AS FLOAT) >= ${minScore}
      ORDER BY CAST(l.ai_score AS FLOAT) DESC
      LIMIT ${limit}
    `;

    const leads = (rows || []).map((row: any) => {
      const score = Number(row.ai_score ?? 0);
      const priority = score >= 8 ? 'high' : score >= 6 ? 'medium' : 'low';
      let serviceType = 'immigration';
      const t = (row.title || '').toLowerCase();
      if (t.includes('n-400') || t.includes('n400') || (t.includes('citizenship') && !t.includes('eu'))) serviceType = 'n400';
      else if (t.includes('h-1b') || t.includes('h1b') || t.includes('o-1') || t.includes('o1')) serviceType = 'nonimmigrant_worker';
      else if (t.includes('eb-2') || t.includes('niw')) serviceType = 'eb2_niw';
      else if (t.includes('family') || t.includes('relative')) serviceType = 'alien_relative';

      return {
        id: row.id,
        title: row.title ?? '',
        score,
        sourcePlatform: row.source_platform ?? 'unknown',
        priority,
        hasResponse: Boolean(row.has_response),
        serviceType,
      };
    });

    return NextResponse.json(leads);
  } catch (error: any) {
    console.error('Top-scored leads error:', error);
    return NextResponse.json(
      { error: error?.message ?? 'Failed to fetch top scored leads' },
      { status: 500 }
    );
  }
}
