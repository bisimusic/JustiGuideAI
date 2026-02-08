import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import { dbClient } from '@/lib/db';

const db = drizzle(dbClient);

export async function GET() {
  try {
    // Get leads that have at least one response
    const result = await db.execute(sql`
      SELECT DISTINCT
        l.id,
        l.title,
        l.content,
        l.source_url as "sourceUrl",
        l.source_platform as "sourcePlatform",
        l.ai_score as "aiScore",
        l.discovered_at as "discoveredAt"
      FROM leads l
      INNER JOIN lead_responses lr ON l.id = lr.lead_id
      ORDER BY l.discovered_at DESC
      LIMIT 1000
    `);

    const leads = Array.isArray(result) ? result : (result as any).rows || [];
    return NextResponse.json(leads);
  } catch (error: any) {
    console.error('❌ Get leads with responses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads with responses', message: error.message },
      { status: 500 }
    );
  }
}
