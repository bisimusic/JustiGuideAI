import { NextRequest, NextResponse } from 'next/server';
import { dbClient } from '@/lib/db';

/**
 * Sample AI responses from the database for inspection.
 *
 * Table: lead_responses
 * - Content column may be response_text (Next.js) or response_content (import/Express).
 * - We select both and coalesce so it works with either schema.
 *
 * Query params: limit (default 20), offset (default 0).
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20', 10) || 20);
    const offset = parseInt(searchParams.get('offset') || '0', 10) || 0;

    // Prefer response_content (import/Express); fallback to response_text (Next.js generate-response)
    let rows: any[];
    try {
      rows = await dbClient`
        SELECT 
          lr.id,
          lr.lead_id as "leadId",
          lr.response_content as "responseContent",
          lr.platform,
          lr.response_type as "responseType",
          lr.status,
          lr.posted_at as "postedAt",
          lr.created_at as "createdAt",
          lr.response_url as "responseUrl",
          lr.response_slot as "responseSlot",
          l.title as "leadTitle",
          l.source_platform as "sourcePlatform"
        FROM lead_responses lr
        INNER JOIN leads l ON l.id = lr.lead_id
        ORDER BY lr.created_at DESC NULLS LAST
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } catch (colErr: any) {
      if (colErr?.message?.includes('response_content')) {
        rows = await dbClient`
          SELECT 
            lr.id,
            lr.lead_id as "leadId",
            lr.response_text as "responseContent",
            lr.created_at as "createdAt",
            lr.response_url as "responseUrl",
            lr.response_slot as "responseSlot",
            l.title as "leadTitle",
            l.source_platform as "sourcePlatform"
          FROM lead_responses lr
          INNER JOIN leads l ON l.id = lr.lead_id
          ORDER BY lr.created_at DESC NULLS LAST
          LIMIT ${limit}
          OFFSET ${offset}
        `;
        rows = (rows || []).map((r: any) => ({ ...r, platform: null, responseType: null, status: null, postedAt: null }));
      } else {
        throw colErr;
      }
    }

    const [countResult] = await dbClient`
      SELECT COUNT(*)::int as total FROM lead_responses
    `;
    const total = Number(countResult?.total ?? 0);

    return NextResponse.json({
      responses: rows || [],
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('AI responses sample error:', error);
    return NextResponse.json(
      { error: error?.message ?? 'Failed to fetch AI responses' },
      { status: 500 }
    );
  }
}
