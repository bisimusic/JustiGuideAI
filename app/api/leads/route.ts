import { NextRequest, NextResponse } from 'next/server'
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import { dbClient } from '@/lib/db';

const db = drizzle(dbClient);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const platform = searchParams.get('platform');

    // Query database directly
    let result;
    if (platform) {
      result = await db.execute(sql`
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
        WHERE source_platform = ${platform}
        ORDER BY discovered_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `);
    } else {
      result = await db.execute(sql`
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
        ORDER BY discovered_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `);
    }

    // postgres-js returns arrays directly
    const leads = Array.isArray(result) ? result : (result as any).rows || [];
    console.log(`✅ Fetched ${leads.length} leads from database (limit: ${limit}, offset: ${offset}${platform ? `, platform: ${platform}` : ''})`);
    return NextResponse.json(leads);
  } catch (error: any) {
    console.error('❌ Get leads error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads', message: error.message },
      { status: 500 }
    );
  }
}
