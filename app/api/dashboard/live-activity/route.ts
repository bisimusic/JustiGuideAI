import { NextResponse } from 'next/server';
import { dbClient } from '@/lib/db';

export async function GET() {
  try {
    // Get recent activity (new leads, responses, conversions)
    const [recentLeads, recentResponses] = await Promise.all([
      // Recent leads
      dbClient`
        SELECT 
          id,
          title,
          source_platform,
          discovered_at
        FROM leads
        ORDER BY discovered_at DESC
        LIMIT 10
      `,
      // Recent responses
      dbClient`
        SELECT 
          lr.id,
          lr.lead_id,
          lr.created_at,
          l.title,
          l.source_platform
        FROM lead_responses lr
        INNER JOIN leads l ON l.id = lr.lead_id
        ORDER BY lr.created_at DESC
        LIMIT 10
      `,
    ]);

    // Combine and format activities
    const activities: any[] = [];

    // Add recent leads
    recentLeads.slice(0, 2).forEach((lead: any) => {
      const leadTime = new Date(lead.discovered_at).getTime();
      const now = Date.now();
      const minutesAgo = Math.floor((now - leadTime) / (1000 * 60));
      const hoursAgo = Math.floor(minutesAgo / 60);
      const daysAgo = Math.floor(hoursAgo / 24);
      
      let timeAgo = '';
      if (minutesAgo < 0) {
        timeAgo = 'Just now';
      } else if (minutesAgo < 60) {
        timeAgo = `${minutesAgo} minutes ago`;
      } else if (hoursAgo < 24) {
        timeAgo = `${hoursAgo} hours ago`;
      } else {
        timeAgo = `${daysAgo} days ago`;
      }
      
      let platform = 'Platform';
      if (lead.source_platform === 'reddit') platform = 'Reddit';
      else if (lead.source_platform === 'linkedin') platform = 'LinkedIn';
      else if (lead.source_platform === 'twitter') platform = 'Twitter';

      activities.push({
        type: 'new-lead',
        text: `New ${lead.title?.substring(0, 50) || 'lead'} from ${platform}`,
        time: timeAgo,
        timestamp: new Date(lead.discovered_at).getTime(),
      });
    });

    // Add recent responses
    recentResponses.slice(0, 2).forEach((response: any) => {
      const responseTime = new Date(response.created_at).getTime();
      const now = Date.now();
      const minutesAgo = Math.floor((now - responseTime) / (1000 * 60));
      const hoursAgo = Math.floor(minutesAgo / 60);
      const daysAgo = Math.floor(hoursAgo / 24);
      
      let timeAgo = '';
      if (minutesAgo < 0) {
        timeAgo = 'Just now';
      } else if (minutesAgo < 60) {
        timeAgo = `${minutesAgo} minutes ago`;
      } else if (hoursAgo < 24) {
        timeAgo = `${hoursAgo} hours ago`;
      } else {
        timeAgo = `${daysAgo} days ago`;
      }

      activities.push({
        type: 'response',
        text: `AI response sent to ${response.title?.substring(0, 40) || 'lead'}`,
        time: timeAgo,
        timestamp: new Date(response.created_at).getTime(),
      });
    });

    // Sort by timestamp (most recent first) and limit to 4
    activities.sort((a, b) => b.timestamp - a.timestamp);
    const finalActivities = activities.slice(0, 4);

    return NextResponse.json({ activities: finalActivities });
  } catch (error: any) {
    console.error('❌ Get live activity error:', error);
    return NextResponse.json(
      { activities: [] },
      { status: 200 }
    );
  }
}
