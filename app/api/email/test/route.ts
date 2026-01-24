import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { to } = await req.json();

    if (!to) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Check if email service is configured
    const hasGmail = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
    const hasSMTP = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);

    if (!hasGmail && !hasSMTP) {
      return NextResponse.json(
        { error: 'Email service is not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD or SMTP credentials.' },
        { status: 500 }
      );
    }

    let transporter;

    if (hasGmail) {
      // Use Gmail SMTP
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
    } else if (hasSMTP) {
      // Use custom SMTP
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    } else {
      return NextResponse.json(
        { error: 'No email service configured' },
        { status: 500 }
      );
    }

    // Send test email
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER || process.env.SMTP_USER || 'noreply@justiguide.com',
      to: to,
      subject: 'JustiGuide Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6B5FCF;">JustiGuide Email Service Test</h2>
          <p>This is a test email from JustiGuide to verify that your email service is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Service:</strong> ${hasGmail ? 'Gmail SMTP' : 'Custom SMTP'}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">If you received this email, your email service is configured correctly! ✅</p>
        </div>
      `,
      text: `JustiGuide Email Service Test\n\nThis is a test email from JustiGuide to verify that your email service is working correctly.\n\nTimestamp: ${new Date().toISOString()}\nService: ${hasGmail ? 'Gmail SMTP' : 'Custom SMTP'}\n\nIf you received this email, your email service is configured correctly! ✅`,
    });

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: info.messageId,
      to: to,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send test email' },
      { status: 500 }
    );
  }
}
