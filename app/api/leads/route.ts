import { NextRequest, NextResponse } from 'next/server'

// Proxy to Express server which connects to Neon database
const EXPRESS_SERVER_URL = process.env.EXPRESS_SERVER_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const platform = searchParams.get('platform');

    // Try to fetch from Express server (Neon database)
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });
      if (platform) params.append('platform', platform);

      const response = await fetch(`${EXPRESS_SERVER_URL}/api/leads?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (expressError: any) {
      console.warn('Express server not available, using fallback:', expressError.message);
    }

    // Fallback: Return empty array if Express server is not available
    return NextResponse.json([]);
  } catch (error: any) {
    console.error('Get leads error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
