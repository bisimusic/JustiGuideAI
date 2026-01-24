import { NextRequest, NextResponse } from 'next/server';

// Proxy to Express server for monitoring control
const EXPRESS_SERVER_URL = process.env.EXPRESS_SERVER_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${EXPRESS_SERVER_URL}/api/monitoring/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || 'Failed to start monitoring' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || 'Monitoring started successfully',
    });
  } catch (error: any) {
    console.error('Monitoring start error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to start monitoring' },
      { status: 500 }
    );
  }
}
