import { NextRequest, NextResponse } from 'next/server';
import { dbClient } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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

    // Generate multiple response variations
    const responseTemplates = [
      `Hi! I saw your post about ${lead.title || 'immigration'}. JustiGuide can help you with expert immigration guidance. Check out our services at https://justi.guide/get_started/`,
      `Hello! Based on your question about ${lead.title || 'immigration'}, JustiGuide offers personalized immigration solutions. Learn more: https://justi.guide/get_started/`,
      `Hi there! Your post caught my attention. JustiGuide specializes in immigration services and can help. Visit us at https://justi.guide/get_started/`,
    ];

    const responses = [];
    for (let i = 0; i < responseTemplates.length; i++) {
      const [response] = await dbClient`
        INSERT INTO lead_responses (lead_id, response_text, response_url, response_slot)
        VALUES (${id}, ${responseTemplates[i]}, 'https://justi.guide/get_started/', 
                COALESCE((SELECT MAX(response_slot) FROM lead_responses WHERE lead_id = ${id}), 0) + ${i + 1})
        RETURNING id, lead_id, response_text, response_url, response_slot, created_at
      `;
      responses.push({
        id: response.id,
        leadId: response.lead_id,
        responseText: response.response_text,
        responseUrl: response.response_url,
        responseSlot: response.response_slot,
        createdAt: response.created_at,
      });
    }

    return NextResponse.json({
      success: true,
      responses,
      count: responses.length,
    });
  } catch (error: any) {
    console.error('❌ Generate multiple responses error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate responses', message: error.message },
      { status: 500 }
    );
  }
}
