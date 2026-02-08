import { NextResponse } from 'next/server';

interface SubstackPost {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  publishedAt: string;
  slug: string;
  url: string;
  excerpt: string;
  readingTime: number;
  categories: string[];
}

export async function GET() {
  try {
    // Substack RSS feed URL - update this with your actual Substack publication URL
    const substackUrl = process.env.SUBSTACK_URL || 'https://immigrationnavigator.substack.com';
    const rssUrl = `${substackUrl}/feed`;

    // Fetch RSS feed
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsletterBot/1.0)',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Substack feed: ${response.status}`);
    }

    const xmlText = await response.text();
    
    // Parse RSS XML (simplified parser)
    const posts: SubstackPost[] = [];
    const itemMatches = xmlText.matchAll(/<item>([\s\S]*?)<\/item>/g);

    for (const match of itemMatches) {
      const itemContent = match[1];
      const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
      const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
      const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);
      const descriptionMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);
      const guidMatch = itemContent.match(/<guid isPermaLink="true">(.*?)<\/guid>/);

      if (titleMatch && linkMatch) {
        const title = titleMatch[1];
        const url = linkMatch[1];
        const slug = url.split('/').pop() || '';
        const excerpt = descriptionMatch ? descriptionMatch[1].replace(/<[^>]*>/g, '').substring(0, 200) : '';
        const publishedAt = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();
        
        // Estimate reading time (average 200 words per minute)
        const wordCount = excerpt.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200);

        posts.push({
          id: guidMatch ? guidMatch[1] : slug,
          title,
          subtitle: undefined,
          content: descriptionMatch ? descriptionMatch[1] : '',
          publishedAt,
          slug,
          url,
          excerpt,
          readingTime,
          categories: [],
        });
      }
    }

    return NextResponse.json({
      success: true,
      posts: posts.slice(0, 20), // Return latest 20 posts
      total: posts.length,
    });
  } catch (error: any) {
    console.error('Substack posts fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        posts: [],
        total: 0,
        error: error.message || 'Failed to fetch Substack posts',
      },
      { status: 200 } // Return 200 with empty array instead of error
    );
  }
}
