import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { html, title, subtitle } = await req.json();

    if (!html || !title) {
      return NextResponse.json(
        { error: 'HTML content and title are required' },
        { status: 400 }
      );
    }

    // Substack API credentials - these should be in environment variables
    const substackApiKey = process.env.SUBSTACK_API_KEY;
    const substackPublicationId = process.env.SUBSTACK_PUBLICATION_ID;

    if (!substackApiKey || !substackPublicationId) {
      return NextResponse.json(
        { 
          error: 'Substack API credentials not configured',
          message: 'Please set SUBSTACK_API_KEY and SUBSTACK_PUBLICATION_ID environment variables'
        },
        { status: 500 }
      );
    }

    // Convert HTML to plain text for Substack (they prefer markdown/plain text)
    // For now, we'll return a success response with instructions
    // In production, you would use the Substack API to publish
    
    // Note: Substack doesn't have a direct HTML publishing API
    // You would need to:
    // 1. Convert HTML to markdown
    // 2. Use Substack's API to create a draft post
    // 3. Or provide instructions for manual copy-paste

    return NextResponse.json({
      success: true,
      message: 'Newsletter ready for Substack',
      instructions: [
        '1. Copy the generated HTML',
        '2. Go to your Substack publication',
        '3. Create a new post',
        '4. Switch to HTML mode',
        '5. Paste the HTML content',
        '6. Publish your newsletter'
      ],
      // In a real implementation, you would:
      // - Convert HTML to markdown
      // - Use Substack API to create draft
      // - Return draft URL for review
      draftUrl: `https://${substackPublicationId}.substack.com/publish`,
      html, // Return HTML for manual copy
    });
  } catch (error: any) {
    console.error('Substack publish error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to prepare for Substack publishing' },
      { status: 500 }
    );
  }
}
