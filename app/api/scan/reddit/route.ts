import { NextRequest, NextResponse } from 'next/server';

// Proxy to Express server for Reddit scanning
const EXPRESS_SERVER_URL = process.env.EXPRESS_SERVER_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${EXPRESS_SERVER_URL}/api/scan/reddit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || 'Failed to scan Reddit' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    console.error('Reddit scan error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to scan Reddit' },
      { status: 500 }
    );
  }
}
