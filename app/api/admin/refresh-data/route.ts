import { NextRequest, NextResponse } from 'next/server';

// Proxy to Express server to refresh all dashboard data
const EXPRESS_SERVER_URL = process.env.EXPRESS_SERVER_URL || 'http://localhost:5000';

export async function POST(req: NextRequest) {
  try {
    // Trigger data refresh on Express server
    const endpoints = [
      '/api/dashboard/stats',
      '/api/leads',
      '/api/email-captures/stats',
      '/api/monitoring',
    ];

    const results = await Promise.allSettled(
      endpoints.map(async (endpoint) => {
        try {
          const response = await fetch(`${EXPRESS_SERVER_URL}${endpoint}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          return {
            endpoint,
            success: response.ok,
            status: response.status,
          };
        } catch (error: any) {
          return {
            endpoint,
            success: false,
            error: error.message,
          };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    return NextResponse.json({
      success: true,
      message: `Refreshed ${successful} endpoints, ${failed} failed`,
      results: results.map((r, i) => {
        if (r.status === 'fulfilled') {
          const { endpoint: _, ...rest } = r.value;
          return {
            endpoint: endpoints[i],
            ...rest,
          };
        } else {
          return {
            endpoint: endpoints[i],
            success: false,
            error: 'Request failed',
          };
        }
      }),
    });
  } catch (error: any) {
    console.error('Refresh data error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to refresh data' },
      { status: 500 }
    );
  }
}
