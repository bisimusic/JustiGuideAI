import { NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import { dbClient } from '@/lib/db';

const db = drizzle(dbClient);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await db.execute(sql`
      SELECT 
        id,
        title,
        content,
        source_url as "sourceUrl",
        source_platform as "sourcePlatform",
        subreddit,
        ai_score as "aiScore",
        priority,
        is_validated as "isValidated",
        validation_status as "validationStatus",
        ai_analysis as "aiAnalysis",
        engagement,
        author_id as "authorId",
        author_username as "authorUsername",
        posted_at as "postedAt",
        discovered_at as "discoveredAt",
        updated_at as "updatedAt"
      FROM leads
      WHERE id = ${id}
      LIMIT 1
    `);

    const leads = Array.isArray(result) ? result : (result as any).rows || [];
    const lead = leads[0];

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(lead);
  } catch (error: any) {
    console.error('❌ Get lead error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead', message: error.message },
      { status: 500 }
    );
  }
}
