import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

/*
<important_code_snippet_instructions>
The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229". 
If the user doesn't specify a model, always prefer using "claude-sonnet-4-20250514" as it is the latest model.
</important_code_snippet_instructions>
*/

// <important_do_not_delete>
const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";
// </important_do_not_delete>

interface NewsletterData {
  template: string;
  title: string;
  subtitle?: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
  useAI?: boolean;
  aiMode?: 'enhance' | 'generate' | 'rewrite';
  topic?: string;
}

async function generateWithAI(
  data: NewsletterData,
  anthropic: Anthropic
): Promise<{ title: string; subtitle: string; content: string }> {
  const systemPrompt = `You are an expert newsletter writer specializing in immigration law, visa services, and professional development. Create engaging, professional, and conversion-focused newsletter content.

Guidelines:
- Write in a warm, professional, and helpful tone
- Focus on value and actionable insights
- Use clear, concise language
- Include compelling calls-to-action
- Structure content with clear paragraphs
- Make it engaging and shareable
- Target audience: professionals seeking immigration solutions`;

  let userPrompt = '';

  if (data.aiMode === 'generate' && data.topic) {
    userPrompt = `Generate a complete newsletter about: "${data.topic}"

Requirements:
- Create an engaging title (max 60 characters)
- Write a compelling subtitle (max 120 characters)
- Write newsletter content (3-5 paragraphs, engaging and informative)
- Focus on immigration law, visa services, or professional development
- Make it valuable and actionable for readers

Format your response as JSON:
{
  "title": "Newsletter Title",
  "subtitle": "Compelling subtitle here",
  "content": "First paragraph...\n\nSecond paragraph...\n\nThird paragraph..."
}`;
  } else if (data.aiMode === 'enhance') {
    userPrompt = `Enhance this newsletter content to make it more engaging, professional, and conversion-focused:

Title: ${data.title}
Subtitle: ${data.subtitle || 'None'}
Content: ${data.content}

Requirements:
- Improve the title to be more compelling (keep it under 60 characters)
- Enhance or create a subtitle that hooks readers (max 120 characters)
- Rewrite the content to be more engaging, clear, and valuable
- Maintain the original message and intent
- Add more personality and engagement
- Structure with clear paragraphs

Format your response as JSON:
{
  "title": "Enhanced Title",
  "subtitle": "Enhanced subtitle",
  "content": "Enhanced content with paragraphs separated by \\n\\n"
}`;
  } else if (data.aiMode === 'rewrite') {
    userPrompt = `Rewrite this newsletter content with a fresh perspective while keeping the core message:

Title: ${data.title}
Subtitle: ${data.subtitle || 'None'}
Content: ${data.content}

Requirements:
- Create a new compelling title (max 60 characters)
- Write a fresh subtitle (max 120 characters)
- Completely rewrite the content with new phrasing and structure
- Keep the same core message and value proposition
- Make it more engaging and modern

Format your response as JSON:
{
  "title": "Rewritten Title",
  "subtitle": "New subtitle",
  "content": "Rewritten content with paragraphs separated by \\n\\n"
}`;
  } else {
    // Default: enhance
    userPrompt = `Enhance this newsletter to make it more engaging and professional:

Title: ${data.title}
Subtitle: ${data.subtitle || 'None'}
Content: ${data.content}

Improve the title, subtitle, and content while maintaining the original intent. Format as JSON with title, subtitle, and content fields.`;
  }

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Try to parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || data.title,
        subtitle: parsed.subtitle || data.subtitle || '',
        content: parsed.content || data.content,
      };
    }

    // Fallback: extract content from markdown or plain text
    return {
      title: data.title,
      subtitle: data.subtitle || '',
      content: responseText,
    };
  } catch (error: any) {
    console.error('Anthropic API error:', error);
    // Fallback to original content if AI fails
    return {
      title: data.title,
      subtitle: data.subtitle || '',
      content: data.content,
    };
  }
}

function generateNewsletterHTML(data: NewsletterData): string {
  const { template, title, subtitle, content, ctaText, ctaUrl } = data;

  // Convert content to HTML paragraphs
  const contentParagraphs = content
    .split('\n\n')
    .filter(p => p.trim())
    .map(p => `<p style="margin: 0 0 16px 0; line-height: 1.7; color: #1e293b;">${p.trim()}</p>`)
    .join('');

  // Template-specific styles
  const templateStyles: Record<string, { header: string; body: string; cta: string }> = {
    'modern-minimal': {
      header: `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 60px 40px;
        text-align: center;
      `,
      body: `
        background: #ffffff;
        color: #1e293b;
        padding: 40px;
      `,
      cta: `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 14px 32px;
        border-radius: 8px;
        text-decoration: none;
        display: inline-block;
        font-weight: 600;
        margin-top: 24px;
      `
    },
    'bold-gradient': {
      header: `
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%);
        color: white;
        padding: 60px 40px;
        text-align: center;
      `,
      body: `
        background: #ffffff;
        color: #1e293b;
        padding: 40px;
      `,
      cta: `
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%);
        color: white;
        padding: 14px 32px;
        border-radius: 8px;
        text-decoration: none;
        display: inline-block;
        font-weight: 600;
        margin-top: 24px;
      `
    },
    'newsletter-classic': {
      header: `
        background: #0f172a;
        color: white;
        padding: 50px 40px;
        text-align: center;
        border-bottom: 4px solid #00d4aa;
      `,
      body: `
        background: #ffffff;
        color: #1e293b;
        padding: 40px;
      `,
      cta: `
        background: #00d4aa;
        color: #0a0b0d;
        padding: 14px 32px;
        border-radius: 8px;
        text-decoration: none;
        display: inline-block;
        font-weight: 600;
        margin-top: 24px;
      `
    },
    'tech-focused': {
      header: `
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        color: #00d4aa;
        padding: 60px 40px;
        text-align: center;
        border-left: 4px solid #00d4aa;
      `,
      body: `
        background: #f8fafc;
        color: #1e293b;
        padding: 40px;
        font-family: 'JetBrains Mono', monospace;
      `,
      cta: `
        background: #00d4aa;
        color: #0a0b0d;
        padding: 14px 32px;
        border-radius: 4px;
        text-decoration: none;
        display: inline-block;
        font-weight: 600;
        margin-top: 24px;
        font-family: 'JetBrains Mono', monospace;
      `
    }
  };

  const styles = templateStyles[template] || templateStyles['modern-minimal'];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f1f5f9;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      ${styles.header}
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
      font-weight: 700;
    }
    .header p {
      margin: 0;
      font-size: 18px;
      opacity: 0.9;
    }
    .body {
      ${styles.body}
    }
    .cta-button {
      ${styles.cta}
    }
    .footer {
      background: #f8fafc;
      padding: 30px 40px;
      text-align: center;
      color: #64748b;
      font-size: 14px;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }
      .header, .body, .footer {
        padding: 30px 20px !important;
      }
      .header h1 {
        font-size: 24px !important;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>${title}</h1>
      ${subtitle ? `<p>${subtitle}</p>` : ''}
    </div>
    <div class="body">
      ${contentParagraphs}
      ${ctaUrl && ctaText ? `
        <div style="text-align: center;">
          <a href="${ctaUrl}" class="cta-button">${ctaText}</a>
        </div>
      ` : ''}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} JustiGuide AI. All rights reserved.</p>
      <p style="margin-top: 8px; font-size: 12px;">
        <a href="https://justiguide.com" style="color: #00d4aa; text-decoration: none;">Visit JustiGuide</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export async function POST(req: NextRequest) {
  try {
    const data: NewsletterData = await req.json();

    // Check if AI should be used
    const useAI = data.useAI && process.env.ANTHROPIC_API_KEY;
    let finalData = { ...data };

    if (useAI) {
      try {
        const anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });

        const aiGenerated = await generateWithAI(data, anthropic);
        finalData = {
          ...data,
          title: aiGenerated.title,
          subtitle: aiGenerated.subtitle,
          content: aiGenerated.content,
        };
      } catch (error: any) {
        console.error('AI generation error:', error);
        // Continue with original data if AI fails
        if (!data.title || !data.content) {
          return NextResponse.json(
            { error: 'AI generation failed and required fields are missing' },
            { status: 500 }
          );
        }
      }
    }

    if (!finalData.title || !finalData.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const html = generateNewsletterHTML(finalData);

    return NextResponse.json({
      success: true,
      html,
      message: useAI ? 'Newsletter generated with AI enhancement' : 'Newsletter generated successfully',
      aiEnhanced: useAI,
    });
  } catch (error: any) {
    console.error('Newsletter generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate newsletter' },
      { status: 500 }
    );
  }
}
