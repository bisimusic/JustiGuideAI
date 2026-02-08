import { NextRequest, NextResponse } from 'next/server';
import { dbClient } from '@/lib/db';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// Simple in-memory store (in production, use database)
let chatHistory: ChatMessage[] = [];

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Add user message to history
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    };
    chatHistory.push(userMessage);

    // Generate AI response based on message content
    const response = await generateResponse(message.trim());

    // Add assistant response to history
    const assistantMessage: ChatMessage = {
      id: `msg-${Date.now()}-assistant`,
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };
    chatHistory.push(assistantMessage);

    // Keep only last 50 messages
    if (chatHistory.length > 50) {
      chatHistory = chatHistory.slice(-50);
    }

    return NextResponse.json({
      success: true,
      id: assistantMessage.id,
      response: assistantMessage.content,
      timestamp: assistantMessage.timestamp.toISOString(),
    });
  } catch (error: any) {
    console.error('Chat message error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process message' },
      { status: 500 }
    );
  }
}

async function generateResponse(message: string): Promise<string> {
  const lowerMessage = message.toLowerCase();

  // Check for dashboard/analytics queries
  if (lowerMessage.includes('lead') || lowerMessage.includes('conversion') || lowerMessage.includes('analytics')) {
    try {
      // Fetch real data from database
      const [totalLeadsResult, conversionResult] = await Promise.all([
        dbClient`SELECT COUNT(*)::int as count FROM leads`,
        dbClient`
          SELECT 
            (SELECT COUNT(*)::int FROM leads) as total_leads,
            (SELECT COUNT(DISTINCT lead_id)::int FROM lead_responses) as leads_with_responses
        `,
      ]);

      const totalLeads = Number(totalLeadsResult[0]?.count || 0);
      const totalLeadsForConversion = Number(conversionResult[0]?.total_leads || 0);
      const leadsWithResponses = Number(conversionResult[0]?.leads_with_responses || 0);
      const conversionRate = totalLeadsForConversion > 0 
        ? ((leadsWithResponses / totalLeadsForConversion) * 100).toFixed(1)
        : '0';

      if (lowerMessage.includes('conversion')) {
        return `Your current conversion rate is **${conversionRate}%**. You have ${leadsWithResponses.toLocaleString()} leads with responses out of ${totalLeadsForConversion.toLocaleString()} total leads.`;
      }

      if (lowerMessage.includes('lead')) {
        return `You currently have **${totalLeads.toLocaleString()}** total leads in your system. ${leadsWithResponses > 0 ? `Of these, ${leadsWithResponses.toLocaleString()} have received responses.` : ''}`;
      }

      return `Here's your analytics overview:\n\n• **Total Leads:** ${totalLeads.toLocaleString()}\n• **Leads with Responses:** ${leadsWithResponses.toLocaleString()}\n• **Conversion Rate:** ${conversionRate}%\n\nWould you like more detailed analytics?`;
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }

  // Check for platform/source queries
  if (lowerMessage.includes('platform') || lowerMessage.includes('source') || lowerMessage.includes('reddit') || lowerMessage.includes('linkedin')) {
    try {
      const platformStats = await dbClient`
        SELECT 
          source_platform as platform,
          COUNT(*)::int as count
        FROM leads
        GROUP BY source_platform
        ORDER BY count DESC
        LIMIT 5
      `;

      if (platformStats.length > 0) {
        const platforms = platformStats.map((p: any) => 
          `• **${p.platform || 'Unknown'}:** ${Number(p.count || 0).toLocaleString()} leads`
        ).join('\n');

        return `Here are your top lead sources:\n\n${platforms}\n\nWould you like to see more details about any specific platform?`;
      }
    } catch (error) {
      console.error('Error fetching platform stats:', error);
    }
  }

  // Check for recent activity
  if (lowerMessage.includes('recent') || lowerMessage.includes('latest')) {
    try {
      const recentLeads = await dbClient`
        SELECT title, source_platform, discovered_at
        FROM leads
        ORDER BY discovered_at DESC
        LIMIT 5
      `;

      if (recentLeads.length > 0) {
        const leadsList = recentLeads.map((lead: any, i: number) => 
          `${i + 1}. ${lead.title?.substring(0, 50) || 'Untitled'} (${lead.source_platform || 'unknown'})`
        ).join('\n');

        return `Here are your 5 most recent leads:\n\n${leadsList}\n\nWould you like to see more details?`;
      }
    } catch (error) {
      console.error('Error fetching recent leads:', error);
    }
  }

  // Default responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `Hello! I'm your AI assistant. I can help you with:\n\n• **Analytics** - Ask about leads, conversion rates, and performance\n• **Platform Stats** - Get insights about your lead sources\n• **Recent Activity** - See your latest leads and responses\n• **Reports** - Generate summaries of your data\n\nWhat would you like to know?`;
  }

  if (lowerMessage.includes('help')) {
    return `I can help you with:\n\n• **"Show me recent leads"** - Get your latest leads\n• **"What's my conversion rate?"** - See conversion statistics\n• **"Analyze my top performing sources"** - Platform breakdown\n• **"Generate a report"** - Get a summary report\n\nYou can also ask natural language questions about your data!`;
  }

  // Generic response
  return `I understand you're asking about "${message}". I can help you with:\n\n• Lead analytics and statistics\n• Conversion rates and performance\n• Platform and source breakdowns\n• Recent activity and trends\n\nTry asking something like "Show me recent leads" or "What's my conversion rate?"`;
}
