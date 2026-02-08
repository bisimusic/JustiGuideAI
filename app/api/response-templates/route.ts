import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return response templates
    const templates = [
      {
        id: 'default',
        name: 'Default Response',
        template: 'Hi! I saw your post about {{title}}. JustiGuide can help you with expert immigration guidance. Check out our services at https://justi.guide/get_started/',
        variables: ['title'],
      },
      {
        id: 'high-score',
        name: 'High Score Lead',
        template: 'Hello! Based on your question about {{title}}, you might be a great candidate for {{visaType}}. JustiGuide specializes in this area. Learn more: https://justi.guide/get_started/',
        variables: ['title', 'visaType'],
      },
      {
        id: 'urgent',
        name: 'Urgent Response',
        template: 'Hi there! Your post caught my attention. For urgent immigration matters, JustiGuide offers fast-track services. Visit us at https://justi.guide/get_started/',
        variables: [],
      },
      {
        id: 'platform-specific-reddit',
        name: 'Reddit Response',
        template: 'Hey! Saw your post on r/{{subreddit}} about {{title}}. JustiGuide can help with immigration questions. Check us out: https://justi.guide/get_started/',
        variables: ['subreddit', 'title'],
      },
      {
        id: 'platform-specific-linkedin',
        name: 'LinkedIn Response',
        template: 'Hi {{author}}! Your post about {{title}} is interesting. JustiGuide offers professional immigration services. Connect with us: https://justi.guide/get_started/',
        variables: ['author', 'title'],
      },
    ];

    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error('❌ Get response templates error:', error);
    return NextResponse.json(
      { templates: [] },
      { status: 200 }
    );
  }
}
