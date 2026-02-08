import { NextResponse } from 'next/server';
import { dbClient } from '@/lib/db';

export async function GET() {
  try {
    // Get top priority leads (high AI score, recent, with responses) - distinct leads
    const priorityLeads = await dbClient`
      SELECT 
        l.id,
        l.title,
        l.ai_score,
        l.source_platform,
        l.discovered_at,
        l.author_username,
        MAX(lr.created_at) as response_created_at,
        CASE 
          WHEN l.ai_score >= 8 THEN 'high'
          WHEN l.ai_score >= 6 THEN 'medium'
          ELSE 'low'
        END as priority
      FROM leads l
      INNER JOIN lead_responses lr ON l.id = lr.lead_id
      WHERE l.ai_score IS NOT NULL
      GROUP BY l.id, l.title, l.ai_score, l.source_platform, l.discovered_at, l.author_username
      ORDER BY l.ai_score DESC, MAX(lr.created_at) DESC
      LIMIT 5
    `;

    // Format the data for the dashboard
    const actions = priorityLeads.map((lead: any, index: number) => {
      const hoursAgo = lead.response_created_at 
        ? Math.floor((Date.now() - new Date(lead.response_created_at).getTime()) / (1000 * 60 * 60))
        : 0;
      const timeAgo = hoursAgo < 24 
        ? `${hoursAgo}h ago` 
        : `${Math.floor(hoursAgo / 24)}d ago`;
      
      // Estimate revenue based on AI score and visa type
      const baseAmount = lead.ai_score >= 8 ? 12000 : lead.ai_score >= 6 ? 8000 : 5000;
      const prob = Math.min(95, Math.max(60, Math.round(lead.ai_score * 10)));

      // Extract visa type from title if possible
      let visaType = 'Immigration';
      if (lead.title) {
        if (lead.title.toLowerCase().includes('o-1') || lead.title.toLowerCase().includes('o1')) {
          visaType = 'O-1A';
        } else if (lead.title.toLowerCase().includes('eb-1') || lead.title.toLowerCase().includes('eb1')) {
          visaType = 'EB-1A';
        } else if (lead.title.toLowerCase().includes('eb-2') || lead.title.toLowerCase().includes('eb2') || lead.title.toLowerCase().includes('niw')) {
          visaType = 'EB-2 NIW';
        } else if (lead.title.toLowerCase().includes('h-1b') || lead.title.toLowerCase().includes('h1b')) {
          visaType = 'H-1B';
        } else if (lead.title.toLowerCase().includes('l-1') || lead.title.toLowerCase().includes('l1')) {
          visaType = 'L-1A';
        }
      }

      const urgency = lead.priority === 'high' ? 'High urgency' : lead.priority === 'medium' ? 'Medium urgency' : 'Normal priority';
      const location = lead.author_username || 'Unknown';

      return {
        id: lead.id,
        priority: lead.priority,
        title: `${visaType} Candidate — ${lead.title?.substring(0, 40) || 'Immigration Inquiry'}`,
        meta: `${urgency} • Responded ${timeAgo} • ${location}`,
        amount: `$${baseAmount.toLocaleString()}`,
        prob: `${prob}%`,
      };
    });

    return NextResponse.json({ actions });
  } catch (error: any) {
    console.error('❌ Get priority actions error:', error);
    return NextResponse.json(
      { actions: [] },
      { status: 200 }
    );
  }
}
