import { NextRequest, NextResponse } from 'next/server';
import { dbClient } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [result] = await dbClient`
      SELECT COUNT(*)::int as count
      FROM lead_responses
      WHERE lead_id = ${id}
    `;

    const hasResponses = Number(result?.count || 0) > 0;

    return NextResponse.json({ hasResponses, count: Number(result?.count || 0) });
  } catch (error: any) {
    console.error('❌ Check lead responses error:', error);
    return NextResponse.json(
      { hasResponses: false, error: 'Failed to check responses', message: error.message },
      { status: 500 }
    );
  }
}
