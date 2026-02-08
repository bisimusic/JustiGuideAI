import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { html, subject, limit, dryRun = false } = await req.json();

    if (!html) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      );
    }

    // Check if email service is configured
    // Prefer SMTP over Gmail to avoid Gmail rate limits
    const hasSMTP = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
    const hasGmail = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);

    if (!hasGmail && !hasSMTP) {
      return NextResponse.json(
        { error: 'Email service is not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD or SMTP credentials.' },
        { status: 500 }
      );
    }

    // Load contacts from Neon database (preferred) or fallback to local JSON files
    let contacts: any[] = [];
    let contactsSource = 'database';
    
    try {
      // Try to load from Neon database via Express server
      const expressServerUrl = process.env.EXPRESS_SERVER_URL || 'http://localhost:5000';
      // Get all contacts, we'll filter by source in the response
      const dbResponse = await fetch(`${expressServerUrl}/api/email-captures?limit=20000`);
      
      if (dbResponse.ok) {
        const dbData = await dbResponse.json();
        if (dbData.success && dbData.captures && dbData.captures.length > 0) {
          // Transform database records to contact format
          // Filter for "Sunday Service & Founder Events" group contacts
          contacts = dbData.captures
            .filter((capture: any) => {
              const metadata = capture.metadata || {};
              const sources = capture.sources || [];
              const group = metadata.group || '';
              // Include if group matches or source contains "Sunday Service"
              return group.includes('Sunday Service') || 
                     sources.some((s: string) => s.includes('Sunday Service') || s.includes('Founder Events'));
            })
            .map((capture: any) => {
              const metadata = capture.metadata || {};
              return {
                firstName: metadata.firstName || null,
                lastName: metadata.lastName || null,
                email: capture.email,
                company: metadata.company || null,
                linkedin: metadata.linkedin || null,
                phone: metadata.phone || null,
                source: capture.sources?.[0] || 'Sunday Service & Founder Events',
                notes: metadata.notes || null,
              };
            });
          console.log(`✅ Loaded ${contacts.length} contacts from Neon database`);
        }
      }
    } catch (dbError: any) {
      console.warn('⚠️ Could not load from database, falling back to local files:', dbError.message);
      contactsSource = 'local';
    }
    
    // Fallback to local JSON files if database is not available
    if (contacts.length === 0) {
      const contactsDir = path.join(process.cwd(), 'data', 'contacts');
      if (fs.existsSync(contactsDir)) {
        const files = fs.readdirSync(contactsDir)
          .filter(f => f.startsWith('sunday-service-contacts-') && f.endsWith('.json'))
          .map(f => ({
            name: f,
            path: path.join(contactsDir, f),
            mtime: fs.statSync(path.join(contactsDir, f)).mtime
          }))
          .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

        if (files.length > 0) {
          const latestFile = files[0];
          const contactsData = JSON.parse(fs.readFileSync(latestFile.path, 'utf-8'));
          contacts = contactsData.contacts || [];
          console.log(`✅ Loaded ${contacts.length} contacts from local file: ${latestFile.name}`);
        }
      }
    }

    if (contacts.length === 0) {
      return NextResponse.json(
        { error: 'No contacts found in the file.' },
        { status: 404 }
      );
    }

    // Filter contacts with valid emails
    const validContacts = contacts
      .filter((c: any) => c.email && c.email.includes('@'))
      .slice(0, limit || contacts.length);

    if (validContacts.length === 0) {
      return NextResponse.json(
        { error: 'No valid email addresses found.' },
        { status: 404 }
      );
    }

    // If dry run, just return the list
    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        totalContacts: contacts.length,
        validContacts: validContacts.length,
        contactsSource: contactsSource,
        recipients: validContacts.map((c: any) => ({
          email: c.email,
          name: [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Guest'
        })),
        message: `Would send to ${validContacts.length} contacts from ${contactsSource}`
      });
    }

    // Setup email transporter
    // Prefer SMTP over Gmail to avoid Gmail rate limits and blocks
    let transporter: nodemailer.Transporter;

    if (hasSMTP) {
      // Use SMTP first (preferred for bulk sending)
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
      console.log(`📧 Using SMTP service: ${process.env.SMTP_HOST}`);
    } else if (hasGmail) {
      // Fallback to Gmail if SMTP not available
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
      console.log(`📧 Using Gmail service (may have rate limits)`);
    } else {
      // This should never happen due to the check above, but TypeScript needs it
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 500 }
      );
    }

    // Send emails in batches to avoid rate limiting
    // Use SMTP-optimized settings (faster) or Gmail-optimized settings (slower, more cautious)
    const batchSize = hasSMTP ? 10 : 5; // Larger batches for SMTP, smaller for Gmail
    const delayBetweenBatches = hasSMTP ? 2000 : 5000; // 2 seconds for SMTP, 5 seconds for Gmail
    const emailSubject = subject || 'Sunday Swervice Newsletter';
    const sentEmails: string[] = [];
    const failedEmails: Array<{ email: string; error: string }> = [];
    
    // Create newsletter tracking directory
    const newsletterDir = path.join(process.cwd(), 'data', 'newsletter');
    if (!fs.existsSync(newsletterDir)) {
      fs.mkdirSync(newsletterDir, { recursive: true });
    }

    // Verify transporter connection before starting
    try {
      await transporter.verify();
      console.log('✅ Email service connection verified');
    } catch (verifyError: any) {
      console.error('❌ Email service connection failed:', verifyError.message);
      return NextResponse.json({
        success: false,
        error: `Email service connection failed: ${verifyError.message}. ${verifyError.message.includes('Too many login attempts') ? 'Gmail has temporarily blocked the account. Please wait 24 hours or use a different email service (SMTP).' : 'Please check your email service configuration.'}`,
        totalContacts: contacts.length,
        validContacts: validContacts.length,
      }, { status: 500 });
    }

    for (let i = 0; i < validContacts.length; i += batchSize) {
      const batch = validContacts.slice(i, i + batchSize);
      
      // Send emails sequentially within batch to avoid overwhelming Gmail
      for (const contact of batch) {
        try {
          const name = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'Guest';
          
          // Personalize HTML if needed (you can add {{name}} replacement here)
          let personalizedHtml = html;
          
            await transporter.sendMail({
              from: process.env.SMTP_USER || process.env.GMAIL_USER || 'noreply@justiguide.com',
            to: contact.email,
            subject: emailSubject,
            html: personalizedHtml,
            text: personalizedHtml
              .replace(/<style[^>]*>.*?<\/style>/gis, '')
              .replace(/<script[^>]*>.*?<\/script>/gis, '')
              .replace(/<[^>]+>/g, '')
              .replace(/\s+/g, ' ')
              .trim(),
          });

          sentEmails.push(`${name} (${contact.email})`);
          console.log(`✅ [${i + 1}/${validContacts.length}] Sent to ${name} <${contact.email}>`);
          
          // Small delay between individual emails only for Gmail (SMTP can handle faster)
          if (!hasSMTP && hasGmail && i + 1 < validContacts.length) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second between emails for Gmail
          }
        } catch (error: any) {
          const errorMsg = error.message || 'Unknown error';
          failedEmails.push({ email: contact.email, error: errorMsg });
          console.error(`❌ Failed to send to ${contact.email}:`, errorMsg);
          
          // If we hit Gmail's "too many login attempts" error, stop sending
          if (errorMsg.includes('Too many login attempts') || errorMsg.includes('454-4.7.0')) {
            console.error('🛑 Gmail has blocked the account. Stopping send process.');
            return NextResponse.json({
              success: false,
              error: 'Gmail has temporarily blocked the account due to too many login attempts. Please wait 24 hours before trying again, or configure SMTP credentials for a different email service.',
              totalContacts: contacts.length,
              validContacts: validContacts.length,
              sent: sentEmails.length,
              failed: failedEmails.length,
              stoppedAt: i + 1,
            }, { status: 429 });
          }
        }
      }

      // Wait between batches to avoid rate limiting
      if (i + batchSize < validContacts.length) {
        console.log(`⏳ Waiting ${delayBetweenBatches/1000} seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    const sendResult = {
      success: true,
      totalContacts: contacts.length,
      validContacts: validContacts.length,
      sent: sentEmails.length,
      failed: failedEmails.length,
      sentEmails: sentEmails.slice(0, 20), // First 20 for preview
      failedEmails: failedEmails.slice(0, 10), // First 10 errors
      contactsSource: contactsSource,
      timestamp: new Date().toISOString(),
      subject: emailSubject,
    };

    // Save send tracking to file
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const trackingFile = path.join(newsletterDir, `send-${timestamp}.json`);
      fs.writeFileSync(trackingFile, JSON.stringify(sendResult, null, 2), 'utf-8');
      console.log(`✅ Newsletter send tracking saved to ${trackingFile}`);
    } catch (trackingError: any) {
      console.error('Failed to save newsletter tracking:', trackingError);
    }

    return NextResponse.json(sendResult);
  } catch (error: any) {
    console.error('Newsletter send error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send newsletter' },
      { status: 500 }
    );
  }
}
