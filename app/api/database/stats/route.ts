import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import { dbClient } from '@/lib/db';

const db = drizzle(dbClient);

export async function GET() {
  try {
    // Get basic database stats
    const [cacheStats] = await dbClient`
      SELECT 
        COUNT(*)::int as cache_size,
        0::int as cache_hits,
        0::int as cache_misses,
        0::int as total_queries
      FROM leads
      LIMIT 1
    `;

    // Get query performance stats (simplified)
    const [queryStats] = await dbClient`
      SELECT 
        COUNT(*)::int as total_queries,
        0::float as average_query_time,
        0::float as query_time
      FROM leads
      LIMIT 1
    `;

    // Calculate cache efficiency (mock for now)
    const totalQueries = Number(queryStats?.total_queries || 0);
    const cacheHits = Number(cacheStats?.cache_hits || 0);
    const cacheMisses = Number(cacheStats?.cache_misses || 0);
    const cacheEfficiency = totalQueries > 0 
      ? (cacheHits / totalQueries) * 100 
      : 0;

    const stats = {
      cacheSize: Number(cacheStats?.cache_size || 0),
      stats: {
        cacheHits,
        cacheMisses,
        totalQueries,
        cacheEfficiency: Math.round(cacheEfficiency * 100) / 100,
        averageQueryTime: Number(queryStats?.average_query_time || 0),
        queryTime: Number(queryStats?.query_time || 0),
      },
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Database stats error:', error);
    return NextResponse.json(
      {
        cacheSize: 0,
        stats: {
          cacheHits: 0,
          cacheMisses: 0,
          totalQueries: 0,
          cacheEfficiency: 0,
          averageQueryTime: 0,
          queryTime: 0,
        },
      },
      { status: 200 } // Return 200 with default values instead of error
    );
  }
}
