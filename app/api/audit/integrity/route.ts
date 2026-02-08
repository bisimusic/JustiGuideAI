import { NextResponse } from 'next/server';
import { dbClient } from '@/lib/db';

export async function GET() {
  try {
    // Perform integrity audit
    const [
      totalLeadsResult,
      validatedLeadsResult,
      leadsWithResponsesResult,
      duplicateUrlsResult,
      missingFieldsResult
    ] = await Promise.all([
      dbClient`SELECT COUNT(*)::int as count FROM leads`,
      dbClient`SELECT COUNT(*)::int as count FROM leads WHERE is_validated = true`,
      dbClient`SELECT COUNT(DISTINCT lead_id)::int as count FROM lead_responses`,
      dbClient`
        SELECT source_url, COUNT(*)::int as count
        FROM leads
        WHERE source_url IS NOT NULL
        GROUP BY source_url
        HAVING COUNT(*) > 1
        LIMIT 10
      `,
      dbClient`
        SELECT COUNT(*)::int as count
        FROM leads
        WHERE title IS NULL OR content IS NULL OR source_platform IS NULL
      `,
    ]);

    const totalLeads = Number(totalLeadsResult[0]?.count || 0);
    const validatedLeads = Number(validatedLeadsResult[0]?.count || 0);
    const leadsWithResponses = Number(leadsWithResponsesResult[0]?.count || 0);
    const duplicateUrls = duplicateUrlsResult || [];
    const missingFields = Number(missingFieldsResult[0]?.count || 0);

    const validationRate = totalLeads > 0 ? (validatedLeads / totalLeads) * 100 : 0;
    const responseRate = totalLeads > 0 ? (leadsWithResponses / totalLeads) * 100 : 0;
    const dataQuality = totalLeads > 0 ? ((totalLeads - missingFields) / totalLeads) * 100 : 0;

    const issues = [];
    if (duplicateUrls.length > 0) {
      issues.push({
        type: 'duplicate_urls',
        severity: 'medium',
        count: duplicateUrls.length,
        message: `Found ${duplicateUrls.length} duplicate source URLs`,
      });
    }
    if (missingFields > 0) {
      issues.push({
        type: 'missing_fields',
        severity: 'low',
        count: missingFields,
        message: `${missingFields} leads have missing required fields`,
      });
    }
    if (validationRate < 50) {
      issues.push({
        type: 'low_validation',
        severity: 'medium',
        rate: validationRate,
        message: `Only ${validationRate.toFixed(1)}% of leads are validated`,
      });
    }

    const audit = {
      timestamp: new Date().toISOString(),
      summary: {
        totalLeads,
        validatedLeads,
        validationRate: Math.round(validationRate * 100) / 100,
        leadsWithResponses,
        responseRate: Math.round(responseRate * 100) / 100,
        dataQuality: Math.round(dataQuality * 100) / 100,
        duplicateUrls: duplicateUrls.length,
        missingFields,
      },
      issues,
      health: {
        status: issues.length === 0 ? 'healthy' : issues.length <= 2 ? 'warning' : 'critical',
        score: Math.max(0, 100 - (issues.length * 10) - (missingFields / totalLeads * 100)),
      },
    };

    return NextResponse.json(audit);
  } catch (error: any) {
    console.error('❌ Integrity audit error:', error);
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        summary: {
          totalLeads: 0,
          validatedLeads: 0,
          validationRate: 0,
          leadsWithResponses: 0,
          responseRate: 0,
          dataQuality: 0,
          duplicateUrls: 0,
          missingFields: 0,
        },
        issues: [{ type: 'error', severity: 'critical', message: error.message }],
        health: { status: 'error', score: 0 },
      },
      { status: 200 }
    );
  }
}
