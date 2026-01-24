import { NextRequest, NextResponse } from 'next/server';

// Proxy to Express server for monitoring stats
const EXPRESS_SERVER_URL = process.env.EXPRESS_SERVER_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${EXPRESS_SERVER_URL}/api/monitoring`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || 'Failed to get monitoring data' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    console.error('Monitoring stats error:', error);
    // Return default stats if Express server is not available
    return NextResponse.json({
      success: false,
      stats: [],
      error: 'Express server not available',
    });
  }
}
