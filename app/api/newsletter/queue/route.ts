import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

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

// GET: Get queue status
export async function GET(req: NextRequest) {
  try {
    const queue = loadQueue();
    
    if (!queue) {
      return NextResponse.json({
        success: true,
        status: 'idle',
        message: 'No active queue'
      });
    }

    return NextResponse.json({
      success: true,
      queueId: queue.queueId,
      status: queue.status,
      totalRecipients: queue.totalRecipients,
      sent: queue.sent,
      failed: queue.failed,
      pending: queue.pending,
      emailsPerHour: queue.emailsPerHour,
      startedAt: queue.startedAt,
      lastSentAt: queue.lastSentAt,
      progress: queue.totalRecipients > 0 
        ? ((queue.sent + queue.failed) / queue.totalRecipients * 100).toFixed(1)
        : '0',
      estimatedHoursRemaining: queue.status === 'running' && queue.emailsPerHour > 0
        ? Math.ceil(queue.pending / queue.emailsPerHour)
        : 0,
    });
  } catch (error: any) {
    console.error('Get queue status error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get queue status' },
      { status: 500 }
    );
  }
}

// POST: Create and start queue
export async function POST(req: NextRequest) {
  try {
    const { html, subject, emailsPerHour = 10, limit } = await req.json();

    if (!html || !subject) {
      return NextResponse.json(
        { error: 'HTML content and subject are required' },
        { status: 400 }
      );
    }

    // Load contacts from database or local files
    let contacts: any[] = [];
    
    // Try database first
    try {
      const expressServerUrl = process.env.EXPRESS_SERVER_URL || 'http://localhost:5000';
      const dbResponse = await fetch(`${expressServerUrl}/api/email-captures?limit=20000`);
      
      if (dbResponse.ok) {
        const dbData = await dbResponse.json();
        if (dbData.success && dbData.captures && dbData.captures.length > 0) {
          contacts = dbData.captures
            .filter((capture: any) => {
              const metadata = capture.metadata || {};
              const sources = capture.sources || [];
              const group = metadata.group || '';
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
        }
      }
    } catch (dbError: any) {
      console.warn('Database load failed, trying local files:', dbError.message);
    }

    // Fallback to local files
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
        }
      }
    }

    // Filter valid emails
    const validContacts = contacts
      .filter((c: any) => c.email && c.email.includes('@'))
      .slice(0, limit || contacts.length);

    if (validContacts.length === 0) {
      return NextResponse.json(
        { error: 'No valid email addresses found.' },
        { status: 404 }
      );
    }

    // Create queue
    const queueId = `queue-${Date.now()}`;
    const queue: QueueState = {
      queueId,
      subject,
      html,
      totalRecipients: validContacts.length,
      sent: 0,
      failed: 0,
      pending: validContacts.length,
      status: 'idle',
      emailsPerHour: emailsPerHour,
      startedAt: new Date().toISOString(),
      queue: validContacts.map((c: any) => ({
        email: c.email,
        name: [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Guest',
        status: 'pending',
        attempts: 0,
      })),
    };

    saveQueue(queue);

    return NextResponse.json({
      success: true,
      queueId,
      message: `Queue created with ${validContacts.length} recipients`,
      totalRecipients: validContacts.length,
      emailsPerHour: emailsPerHour,
      estimatedHours: Math.ceil(validContacts.length / emailsPerHour),
      estimatedDays: Math.ceil(validContacts.length / emailsPerHour / 24),
    });
  } catch (error: any) {
    console.error('Create queue error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create queue' },
      { status: 500 }
    );
  }
}

// PUT: Update queue (start, pause, resume)
export async function PUT(req: NextRequest) {
  try {
    const { action } = await req.json();
    const queue = loadQueue();

    if (!queue) {
      return NextResponse.json(
        { error: 'No active queue found' },
        { status: 404 }
      );
    }

    if (action === 'start' || action === 'resume') {
      queue.status = 'running';
      if (!queue.startedAt) {
        queue.startedAt = new Date().toISOString();
      }
    } else if (action === 'pause') {
      queue.status = 'paused';
    } else if (action === 'stop') {
      queue.status = 'idle';
    }

    saveQueue(queue);

    return NextResponse.json({
      success: true,
      status: queue.status,
      message: `Queue ${action}ed successfully`,
    });
  } catch (error: any) {
    console.error('Update queue error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update queue' },
      { status: 500 }
    );
  }
}
