import { NextRequest, NextResponse } from 'next/server';

// Proxy to Express server which connects to Neon database
const EXPRESS_SERVER_URL = process.env.EXPRESS_SERVER_URL || 'http://localhost:5000';

export async function GET(req: NextRequest) {
  try {
    // Try multiple methods to get lead count
    
    // Method 1: Try Express server dashboard stats
    try {
      const statsResponse = await fetch(`${EXPRESS_SERVER_URL}/api/dashboard/stats`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000),
      });
      
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        if (stats.totalLeads !== undefined && stats.totalLeads > 0) {
          return NextResponse.json({
            success: true,
            totalLeads: stats.totalLeads,
            dailyLeads: stats.dailyLeads || 0,
            conversionRate: stats.conversionRate || 0,
            weeklyRevenue: stats.weeklyRevenue || 0,
            source: 'dashboard_stats',
          });
        }
      }
    } catch (statsError: any) {
      console.warn('Dashboard stats not available:', statsError.message);
    }

    // Method 2: Try to get leads with high limit
    try {
      const leadsResponse = await fetch(`${EXPRESS_SERVER_URL}/api/leads?limit=50000`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000),
      });
      
      if (leadsResponse.ok) {
        const leads = await leadsResponse.json();
        const totalLeads = Array.isArray(leads) ? leads.length : 0;
        
        if (totalLeads > 0) {
          return NextResponse.json({
            success: true,
            totalLeads: totalLeads,
            leadsFromQuery: totalLeads,
            note: totalLeads >= 50000 ? 'Count may be higher - query limit reached' : 'Exact count',
            source: 'leads_query',
          });
        }
      }
    } catch (leadsError: any) {
      console.warn('Leads query not available:', leadsError.message);
    }

    // Method 3: Try pipeline stats (may have lead counts)
    try {
      const pipelineResponse = await fetch(`${EXPRESS_SERVER_URL}/api/leads/pipeline-stats`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000),
      });
      
      if (pipelineResponse.ok) {
        const pipeline = await pipelineResponse.json();
        if (pipeline.totalLeads !== undefined) {
          return NextResponse.json({
            success: true,
            totalLeads: pipeline.totalLeads || 0,
            source: 'pipeline_stats',
          });
        }
      }
    } catch (pipelineError: any) {
      console.warn('Pipeline stats not available:', pipelineError.message);
    }

    // Fallback: Express server not available
    return NextResponse.json({
      success: true,
      totalLeads: 0,
      message: 'Express server not available on port 5000. Please start the server with: npm run start',
      note: 'To get accurate lead count, ensure the Express server is running and connected to Neon database.',
    });
  } catch (error: any) {
    console.error('Get leads count error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get leads count' },
      { status: 500 }
    );
  }
}
