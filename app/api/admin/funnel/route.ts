import { NextResponse } from 'next/server';
import { dbClient, dbQueries } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') || 'all';
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const useAllTime = range === 'all';
    let actualStartDate: Date;
    
    if (useAllTime) {
      // Use a very old date to get all leads
      actualStartDate = new Date('2020-01-01');
    } else {
      const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
      actualStartDate = new Date();
      actualStartDate.setDate(actualStartDate.getDate() - days);
    }

    // Define funnel stages
    const stages = [
      { name: 'Lead Discovered', order: 1 },
      { name: 'AI Response Sent', order: 2 },
      { name: 'Response Opened', order: 3 },
      { name: 'Link Clicked', order: 4 },
      { name: 'Form Submitted', order: 5 },
      { name: 'Consultation Booked', order: 6 },
    ];

    // Get total leads and leads with responses using consolidated queries
    const [totalLeads, leadsWithResponses] = await Promise.all([
      dbQueries.getTotalLeads({
        platform: platform === 'all' ? undefined : platform,
        startDate: actualStartDate,
      }),
      dbQueries.getLeadsWithResponses({
        platform: platform === 'all' ? undefined : platform,
        startDate: actualStartDate,
      }),
    ]);

    // For now, we'll use mock data for stages 3-6 since we don't have tracking tables
    // In a real implementation, you'd query from conversion_events or similar tables
    const responseRate = totalLeads > 0 ? (leadsWithResponses / totalLeads) * 100 : 0;
    
    // Build funnel data - build sequentially so we can reference previous stages
    const funnel: any[] = [];
    
    for (let index = 0; index < stages.length; index++) {
      const stage = stages[index];
      let uniqueLeads = 0;
      let conversionRate = 0;
      let dropoffRate = 0;
      let dropoffCount = 0;
      let totalValue = 0;
      let avgValuePerLead = 0;
      let previousLeads = 0;

      if (index === 0) {
        // Stage 1: Lead Discovered
        uniqueLeads = totalLeads;
        conversionRate = 100; // 100% at the top
        dropoffRate = 0;
        dropoffCount = 0;
        totalValue = totalLeads * 100; // Mock value
        avgValuePerLead = 100;
        previousLeads = totalLeads;
      } else if (index === 1) {
        // Stage 2: AI Response Sent
        previousLeads = funnel[0].uniqueLeads;
        uniqueLeads = leadsWithResponses;
        conversionRate = previousLeads > 0 ? (uniqueLeads / previousLeads) * 100 : 0;
        dropoffRate = 100 - conversionRate;
        dropoffCount = previousLeads - uniqueLeads;
        totalValue = uniqueLeads * 500; // Mock value
        avgValuePerLead = uniqueLeads > 0 ? totalValue / uniqueLeads : 0;
      } else {
        // Stages 3-6: Mock data (would come from conversion_events table in real implementation)
        previousLeads = funnel[index - 1].uniqueLeads;
        const stageConversionRate = 100 - (index * 12); // Decreasing conversion rate
        uniqueLeads = Math.floor(previousLeads * (stageConversionRate / 100));
        conversionRate = previousLeads > 0 ? (uniqueLeads / previousLeads) * 100 : 0;
        dropoffRate = 100 - conversionRate;
        dropoffCount = previousLeads - uniqueLeads;
        totalValue = uniqueLeads * (1000 + index * 500); // Mock increasing value
        avgValuePerLead = uniqueLeads > 0 ? totalValue / uniqueLeads : 0;
      }

      funnel.push({
        stage: stage.name,
        uniqueLeads,
        totalEvents: uniqueLeads, // Same as uniqueLeads for now
        totalValue,
        avgValuePerLead,
        conversionRate: Math.round(conversionRate * 100) / 100,
        dropoffRate: Math.round(dropoffRate * 100) / 100,
        dropoffCount,
      });
    }

    return NextResponse.json({
      funnel,
      summary: {
        totalLeads,
        totalValue: funnel.reduce((sum, stage) => sum + stage.totalValue, 0),
        overallConversionRate: totalLeads > 0 
          ? (funnel[funnel.length - 1].uniqueLeads / totalLeads) * 100 
          : 0,
      },
    });
  } catch (error: any) {
    console.error('Funnel API error:', error);
    return NextResponse.json(
      {
        funnel: [],
        summary: {
          totalLeads: 0,
          totalValue: 0,
          overallConversionRate: 0,
        },
      },
      { status: 200 } // Return 200 with empty data instead of error
    );
  }
}
