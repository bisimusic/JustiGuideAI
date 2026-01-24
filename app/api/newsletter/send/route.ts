import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { to, html, subject, isTest = false } = await req.json();

    if (!to || !html) {
      return NextResponse.json(
        { error: 'Email address and HTML content are required' },
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

    // Default subject if not provided
    const emailSubject = subject || 'Sunday Swervice Newsletter';

    // Send newsletter email
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER || process.env.SMTP_USER || 'noreply@justiguide.com',
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: emailSubject,
      html: html,
      // Generate plain text version from HTML (basic conversion)
      text: html
        .replace(/<style[^>]*>.*?<\/style>/gis, '')
        .replace(/<script[^>]*>.*?<\/script>/gis, '')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    });

    return NextResponse.json({
      success: true,
      message: isTest ? 'Test newsletter sent successfully' : 'Newsletter sent successfully',
      messageId: info.messageId,
      to: Array.isArray(to) ? to : [to],
      recipientCount: Array.isArray(to) ? to.length : 1,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Newsletter send error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send newsletter' },
      { status: 500 }
    );
  }
}
