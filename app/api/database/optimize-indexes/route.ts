import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import { dbClient } from '@/lib/db';

const db = drizzle(dbClient);

export async function POST() {
  try {
    // Run ANALYZE to update statistics (safe operation)
    await dbClient`ANALYZE leads`;
    await dbClient`ANALYZE lead_responses`;

    return NextResponse.json({
      success: true,
      message: 'Database indexes optimized successfully',
    });
  } catch (error: any) {
    console.error('Optimize indexes error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to optimize indexes',
      },
      { status: 500 }
    );
  }
}
