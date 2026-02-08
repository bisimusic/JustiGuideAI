import { NextResponse } from 'next/server';
import { dbClient } from '@/lib/db';

export async function POST() {
  try {
    // Get unvalidated leads
    const unvalidatedLeads = await dbClient`
      SELECT id, source_url, source_platform
      FROM leads
      WHERE is_validated = false OR is_validated IS NULL
      LIMIT 100
    `;

    let validated = 0;
    let failed = 0;

    // Validate each lead's source URL
    for (const lead of unvalidatedLeads) {
      try {
        // Simple validation - check if URL is valid format
        const url = lead.source_url;
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
          // Mark as validated
          await dbClient`
            UPDATE leads
            SET is_validated = true,
                validation_status = 'validated',
                updated_at = NOW()
            WHERE id = ${lead.id}
          `;
          validated++;
        } else {
          await dbClient`
            UPDATE leads
            SET is_validated = false,
                validation_status = 'invalid',
                updated_at = NOW()
            WHERE id = ${lead.id}
          `;
          failed++;
        }
      } catch (error: any) {
        console.error(`Failed to validate lead ${lead.id}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Validated ${validated} leads, ${failed} failed`,
      validated,
      failed,
      total: unvalidatedLeads.length,
    });
  } catch (error: any) {
    console.error('❌ Validate sources error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate sources', message: error.message },
      { status: 500 }
    );
  }
}
