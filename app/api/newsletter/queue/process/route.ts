import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import nodemailer from 'nodemailer';

interface QueueItem {
  email: string;
  name: string;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  lastAttempt?: string;
  error?: string;
}

interface QueueState {
  queueId: string;
  subject: string;
  html: string;
  totalRecipients: number;
  sent: number;
  failed: number;
  pending: number;
  status: 'idle' | 'running' | 'paused' | 'completed';
  emailsPerHour: number;
  startedAt?: string;
  lastSentAt?: string;
  queue: QueueItem[];
}

const QUEUE_FILE = path.join(process.cwd(), 'data', 'newsletter', 'queue.json');

function loadQueue(): QueueState | null {
  try {
    if (fs.existsSync(QUEUE_FILE)) {
      const data = fs.readFileSync(QUEUE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading queue:', error);
  }
  return null;
}

function saveQueue(queue: QueueState): void {
  try {
    const queueDir = path.dirname(QUEUE_FILE);
    if (!fs.existsSync(queueDir)) {
      fs.mkdirSync(queueDir, { recursive: true });
    }
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving queue:', error);
  }
}

// POST: Process one batch of emails (called by cron/scheduler)
export async function POST(req: NextRequest) {
  try {
    const queue = loadQueue();

    if (!queue) {
      return NextResponse.json({
        success: false,
        error: 'No active queue found'
      }, { status: 404 });
    }

    if (queue.status !== 'running') {
      return NextResponse.json({
        success: false,
        message: `Queue is ${queue.status}, not processing`,
        status: queue.status,
      });
    }

    if (queue.pending === 0) {
      queue.status = 'completed';
      saveQueue(queue);
      return NextResponse.json({
        success: true,
        message: 'Queue completed',
        sent: queue.sent,
        failed: queue.failed,
      });
    }

    // Setup email transporter
    const hasSMTP = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
    const hasGmail = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);

    if (!hasGmail && !hasSMTP) {
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 500 }
      );
    }

    let transporter: nodemailer.Transporter;
    if (hasSMTP) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    } else if (hasGmail) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
    } else {
      // This should never happen due to the check above, but TypeScript needs it
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 500 }
      );
    }

    // Get pending items for this hour (up to emailsPerHour)
    const pendingItems = queue.queue
      .filter(item => item.status === 'pending')
      .slice(0, queue.emailsPerHour);

    if (pendingItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending items to process',
        sent: queue.sent,
        failed: queue.failed,
        pending: queue.pending,
      });
    }

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Send emails sequentially
    for (const item of pendingItems) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER || process.env.GMAIL_USER || 'noreply@justiguide.com',
          to: item.email,
          subject: queue.subject,
          html: queue.html,
          text: queue.html
            .replace(/<style[^>]*>.*?<\/style>/gis, '')
            .replace(/<script[^>]*>.*?<\/script>/gis, '')
            .replace(/<[^>]+>/g, '')
            .replace(/\s+/g, ' ')
            .trim(),
        });

        item.status = 'sent';
        item.lastAttempt = new Date().toISOString();
        queue.sent++;
        queue.pending--;
        results.sent++;

        console.log(`✅ Sent to ${item.name} <${item.email}>`);
      } catch (error: any) {
        item.status = 'failed';
        item.attempts++;
        item.lastAttempt = new Date().toISOString();
        item.error = error.message;
        queue.failed++;
        queue.pending--;
        results.failed++;
        results.errors.push(`${item.email}: ${error.message}`);

        console.error(`❌ Failed to send to ${item.email}:`, error.message);

        // If Gmail block detected, pause queue
        if (error.message.includes('Too many login attempts') || error.message.includes('454-4.7.0')) {
          queue.status = 'paused';
          saveQueue(queue);
          return NextResponse.json({
            success: false,
            error: 'Gmail has blocked the account. Queue paused.',
            sent: queue.sent,
            failed: queue.failed,
            pending: queue.pending,
          }, { status: 429 });
        }
      }
    }

    queue.lastSentAt = new Date().toISOString();
    saveQueue(queue);

    // Save tracking
    const newsletterDir = path.join(process.cwd(), 'data', 'newsletter');
    if (!fs.existsSync(newsletterDir)) {
      fs.mkdirSync(newsletterDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const trackingFile = path.join(newsletterDir, `send-${timestamp}.json`);
    fs.writeFileSync(trackingFile, JSON.stringify({
      queueId: queue.queueId,
      batch: {
        sent: results.sent,
        failed: results.failed,
        timestamp: new Date().toISOString(),
      },
      queue: {
        total: queue.totalRecipients,
        sent: queue.sent,
        failed: queue.failed,
        pending: queue.pending,
      },
    }, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: `Processed batch: ${results.sent} sent, ${results.failed} failed`,
      batch: {
        sent: results.sent,
        failed: results.failed,
      },
      queue: {
        total: queue.totalRecipients,
        sent: queue.sent,
        failed: queue.failed,
        pending: queue.pending,
        progress: ((queue.sent + queue.failed) / queue.totalRecipients * 100).toFixed(1),
      },
      errors: results.errors.slice(0, 5), // First 5 errors
    });
  } catch (error: any) {
    console.error('Process queue error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process queue' },
      { status: 500 }
    );
  }
}
