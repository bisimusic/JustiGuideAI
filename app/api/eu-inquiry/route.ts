import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone } = await req.json();

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

    // Prepare email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6B5FCF;">New EU Residency Inquiry</h2>
        <p>A new inquiry has been submitted for the Highly Qualified Talent Residency in Europe program.</p>
        
        <div style="background-color: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0F172A; margin-top: 0;">Contact Information</h3>
          <p><strong>Name:</strong> ${name || 'Not provided'}</p>
          <p><strong>Email:</strong> ${email || 'Not provided'}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        </div>

        <div style="background-color: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0F172A; margin-top: 0;">Program Details</h3>
          <ul>
            <li>Faster than most EU residency/citizenship paths</li>
            <li>Supporting University backs your application</li>
            <li>Residency granted in 4-6 months</li>
          </ul>
        </div>

        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          <strong>Submitted:</strong> ${new Date().toLocaleString()}
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This inquiry was submitted through the JustiGuide EU Residency page.</p>
      </div>
    `;

    const emailText = `
New EU Residency Inquiry

A new inquiry has been submitted for the Highly Qualified Talent Residency in Europe program.

Contact Information:
Name: ${name || 'Not provided'}
Email: ${email || 'Not provided'}
${phone ? `Phone: ${phone}` : ''}

Program Details:
- Faster than most EU residency/citizenship paths
- Supporting University backs your application
- Residency granted in 4-6 months

Submitted: ${new Date().toLocaleString()}

This inquiry was submitted through the JustiGuide EU Residency page.
    `;

    // Send email to jonrlittman@gmail.com with CC to bisi@justiguide.com
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER || process.env.SMTP_USER || 'noreply@justiguide.com',
      to: 'jonrlittman@gmail.com',
      cc: 'bisi@justiguide.com',
      subject: 'New EU Residency Inquiry - Highly Qualified Talent Residency',
      html: emailHtml,
      text: emailText,
    });

    return NextResponse.json({
      success: true,
      message: 'Inquiry submitted successfully',
      messageId: info.messageId,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('EU inquiry email error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}
