import { NextRequest, NextResponse } from 'next/server';

// Proxy to Express server for monitoring scan
const EXPRESS_SERVER_URL = process.env.EXPRESS_SERVER_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    // Try to trigger a scan via the Express server
    // This will scan all platforms configured in the monitoring scheduler
    const response = await fetch(`${EXPRESS_SERVER_URL}/api/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || 'Failed to trigger scan' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || 'Scan triggered successfully',
      leadsFound: data.leadsFound || data.newLeads || 0,
      ...data,
    });
  } catch (error: any) {
    console.error('Monitoring scan error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to trigger scan. Make sure the Express server is running on port 5000.',
        message: 'Express server may not be running. Please start the server with: npm run server (or similar)'
      },
      { status: 500 }
    );
  }
}
