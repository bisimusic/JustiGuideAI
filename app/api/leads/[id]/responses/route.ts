import { NextRequest, NextResponse } from 'next/server';
import { dbClient } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const responses = await dbClient`
      SELECT 
        id,
        lead_id as "leadId",
        response_text as "responseText",
        response_url as "responseUrl",
        response_slot as "responseSlot",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM lead_responses
      WHERE lead_id = ${id}
      ORDER BY created_at DESC
    `;

    return NextResponse.json(responses);
  } catch (error: any) {
    console.error('❌ Get lead responses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead responses', message: error.message },
      { status: 500 }
    );
  }
}
