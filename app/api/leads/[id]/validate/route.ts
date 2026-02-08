import { NextRequest, NextResponse } from 'next/server';
import { dbClient } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Update lead validation status
    await dbClient`
      UPDATE leads
      SET is_validated = true,
          validation_status = 'validated',
          updated_at = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Lead validated successfully' 
    });
  } catch (error: any) {
    console.error('❌ Validate lead error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate lead', message: error.message },
      { status: 500 }
    );
  }
}
