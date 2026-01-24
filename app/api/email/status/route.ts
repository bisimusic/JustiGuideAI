import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Check if email service is configured
    const isConfigured = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) || 
                        !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
    
    const service = process.env.GMAIL_USER ? 'gmail' : process.env.SMTP_HOST ? 'smtp' : 'none';
    
    return NextResponse.json({ 
      configured: isConfigured,
      service: service,
      status: isConfigured ? 'connected' : 'not_configured',
      user: process.env.GMAIL_USER || process.env.SMTP_USER || null,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Email status error:", error);
    return NextResponse.json(
      { error: "Failed to check email status", configured: false },
      { status: 500 }
    );
  }
}
