import { NextResponse } from 'next/server'

// Proxy to Express server which connects to Neon database
const EXPRESS_SERVER_URL = process.env.EXPRESS_SERVER_URL || 'http://localhost:5000';

export async function GET() {
  try {
    // Try to fetch from Express server (Neon database)
    try {
      const response = await fetch(`${EXPRESS_SERVER_URL}/api/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to avoid hanging
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Dashboard stats from Express server:', data);
        return NextResponse.json(data);
      }
    } catch (expressError: any) {
      console.warn('⚠️ Express server not available, using fallback:', expressError.message);
    }

    // Fallback: Try to get basic stats from email captures
    try {
      const emailResponse = await fetch(`${EXPRESS_SERVER_URL}/api/email-captures/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });
      
      if (emailResponse.ok) {
        const emailData = await emailResponse.json();
        console.log('✅ Email captures stats:', emailData);
        
        // Also try to get leads count
        let leadsCount = 0;
        try {
          const leadsResponse = await fetch(`${EXPRESS_SERVER_URL}/api/leads?limit=10000`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(5000),
          });
          if (leadsResponse.ok) {
            const leads = await leadsResponse.json();
            leadsCount = Array.isArray(leads) ? leads.length : 0;
          }
        } catch (leadsError) {
          console.warn('Could not fetch leads count:', leadsError);
        }

        const stats = {
          totalLeads: leadsCount || emailData.totalEmails || 0,
          dailyLeads: emailData.recentEmails || 0,
          conversionRate: 0,
          weeklyRevenue: 0,
          totalContacts: emailData.totalEmails || 0,
          recentContacts: emailData.recentEmails || 0,
        };
        return NextResponse.json(stats);
      }
    } catch (dbError: any) {
      console.warn('⚠️ Database query failed:', dbError.message);
    }

    // Final fallback - return zeros but log the issue
    console.warn('⚠️ Using fallback stats - Express server may not be running on port 5000');
    const stats = {
      totalLeads: 0,
      dailyLeads: 0,
      conversionRate: 0,
      weeklyRevenue: 0,
      totalContacts: 0,
      recentContacts: 0,
      message: 'Express server not available. Please ensure the server is running on port 5000.',
    };
    
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('❌ Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats', message: error.message },
      { status: 500 }
    );
  }
}
