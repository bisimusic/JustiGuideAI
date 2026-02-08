import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import { dbClient, dbQueries } from '@/lib/db';

const db = drizzle(dbClient);

export async function GET() {
  try {
    // Run queries in parallel for better performance - use consolidated queries
    const [leadsByType, totalLeads, leadsWithResponses] = await Promise.all([
      // Get leads data grouped by visa type (simplified)
      dbClient`
        SELECT 
          source_platform as visa_type,
          COUNT(*)::int as total_leads,
          AVG(CAST(ai_score AS FLOAT)) as avg_ai_score
        FROM leads
        WHERE ai_score IS NOT NULL
        GROUP BY source_platform
        ORDER BY total_leads DESC
        LIMIT 10
      `,
      // Use consolidated query for total leads
      dbQueries.getTotalLeads(),
      // Use consolidated query for leads with responses
      dbQueries.getLeadsWithResponses(),
    ]);

    const totalLeadsCount = typeof totalLeads === 'number' ? totalLeads : Number(totalLeads[0]?.count || 0);
    const leadsWithResponsesCount = typeof leadsWithResponses === 'number' ? leadsWithResponses : Number(leadsWithResponses[0]?.count || 0);
    const averageConversionRate = totalLeadsCount > 0 
      ? (leadsWithResponsesCount / totalLeadsCount) * 100 
      : 0;

    // Build visa path performance data
    const visaPathPerformance = leadsByType.map((row: any) => ({
      visaType: row.visa_type || 'unknown',
      serviceType: 'immigration',
      totalLeads: Number(row.total_leads || 0),
      clickThroughRate: Math.random() * 20 + 10, // Mock data
      conversionRate: averageConversionRate + (Math.random() * 10 - 5), // Mock data
      avgResponseTime: Math.random() * 1000 + 500, // Mock data
      avgAiScore: Number(row.avg_ai_score || 0),
      topPerformingTemplates: ['Template A', 'Template B'],
      currentStrategy: 'Standard',
      recommendedOptimizations: [
        'Optimize response timing',
        'Improve template messaging',
      ],
    }));

    // Get top performing paths
    const topPerformingPaths = [...visaPathPerformance]
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 5);

    // Get optimization opportunities (paths with lower conversion rates)
    const optimizationOpportunities = [...visaPathPerformance]
      .filter(path => path.conversionRate < averageConversionRate)
      .sort((a, b) => a.conversionRate - b.conversionRate)
      .slice(0, 5);

    const dashboardData = {
      visaPathPerformance,
      activeOptimizationTests: 0,
      totalLeadsOptimized: totalLeadsCount,
      averageConversionRate: Math.round(averageConversionRate * 100) / 100,
      topPerformingPaths,
      optimizationOpportunities,
    };

    return NextResponse.json(dashboardData);
  } catch (error: any) {
    console.error('Optimization dashboard error:', error);
    return NextResponse.json(
      {
        visaPathPerformance: [],
        activeOptimizationTests: 0,
        totalLeadsOptimized: 0,
        averageConversionRate: 0,
        topPerformingPaths: [],
        optimizationOpportunities: [],
      },
      { status: 200 } // Return 200 with default values instead of error
    );
  }
}
