import { NextRequest, NextResponse } from 'next/server';

// Proxy to Express server for monitoring control
const EXPRESS_SERVER_URL = process.env.EXPRESS_SERVER_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${EXPRESS_SERVER_URL}/api/monitoring/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || 'Failed to stop monitoring' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || 'Monitoring stopped successfully',
    });
  } catch (error: any) {
    console.error('Monitoring stop error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to stop monitoring' },
      { status: 500 }
    );
  }
}
