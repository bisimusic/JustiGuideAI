import { NextRequest, NextResponse } from 'next/server';
import { dbClient } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { responseType, customInstructions } = body;

    // Get the lead
    const [lead] = await dbClient`
      SELECT id, title, content, ai_score, source_platform
      FROM leads
      WHERE id = ${id}
      LIMIT 1
    `;

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Generate response using AI (simplified - in production, use Anthropic/OpenAI)
    const aiApiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!aiApiKey) {
      // Return a template response if no AI key is configured
      const templateResponse = `Hi! I saw your post about ${lead.title || 'immigration'}. JustiGuide can help you with expert immigration guidance. Check out our services at https://justi.guide/get_started/`;
      
      // Save response to database
      const [response] = await dbClient`
        INSERT INTO lead_responses (lead_id, response_text, response_url, response_slot)
        VALUES (${id}, ${templateResponse}, 'https://justi.guide/get_started/', 
                COALESCE((SELECT MAX(response_slot) FROM lead_responses WHERE lead_id = ${id}), 0) + 1)
        RETURNING id, lead_id, response_text, response_url, response_slot, created_at
      `;

      return NextResponse.json({
        success: true,
        response: {
          id: response.id,
          leadId: response.lead_id,
          responseText: response.response_text,
          responseUrl: response.response_url,
          responseSlot: response.response_slot,
          createdAt: response.created_at,
        },
        note: 'Template response generated (AI API key not configured)',
      });
    }

    // TODO: Implement actual AI response generation using Anthropic/OpenAI
    // For now, return template response
    const templateResponse = `Hi! I saw your post about ${lead.title || 'immigration'}. JustiGuide can help you with expert immigration guidance. Check out our services at https://justi.guide/get_started/`;
    
    const [response] = await dbClient`
      INSERT INTO lead_responses (lead_id, response_text, response_url, response_slot)
      VALUES (${id}, ${templateResponse}, 'https://justi.guide/get_started/', 
              COALESCE((SELECT MAX(response_slot) FROM lead_responses WHERE lead_id = ${id}), 0) + 1)
      RETURNING id, lead_id, response_text, response_url, response_slot, created_at
    `;

    return NextResponse.json({
      success: true,
      response: {
        id: response.id,
        leadId: response.lead_id,
        responseText: response.response_text,
        responseUrl: response.response_url,
        responseSlot: response.response_slot,
        createdAt: response.created_at,
      },
    });
  } catch (error: any) {
    console.error('❌ Generate response error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate response', message: error.message },
      { status: 500 }
    );
  }
}
