import { NextRequest, NextResponse } from 'next/server';

// Proxy to Express server for monitoring status
const EXPRESS_SERVER_URL = process.env.EXPRESS_SERVER_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${EXPRESS_SERVER_URL}/api/monitoring/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || 'Failed to get monitoring status' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      monitoring: data.monitoring || data,
    });
  } catch (error: any) {
    console.error('Monitoring status error:', error);
    // Return a default status if Express server is not available
    return NextResponse.json({
      success: false,
      monitoring: {
        isRunning: false,
        error: 'Express server not available',
      },
    });
  }
}
