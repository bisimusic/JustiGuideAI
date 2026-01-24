import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(req: NextRequest) {
  try {
    const newsletterDir = path.join(process.cwd(), 'data', 'newsletter');
    
    if (!fs.existsSync(newsletterDir)) {
      return NextResponse.json({
        success: true,
        totalSent: 0,
        sends: [],
        summary: {
          totalContacts: 0,
          totalSent: 0,
          totalFailed: 0,
        },
      });
    }

    // Find all newsletter send log files
    const files = fs.readdirSync(newsletterDir)
      .filter(f => f.startsWith('send-') && f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: path.join(newsletterDir, f),
        mtime: fs.statSync(path.join(newsletterDir, f)).mtime
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    const sends = [];
    let totalSent = 0;
    let totalFailed = 0;

    for (const file of files) {
      try {
        const data = JSON.parse(fs.readFileSync(file.path, 'utf-8'));
        sends.push({
          id: file.name,
          timestamp: data.timestamp || file.mtime.toISOString(),
          subject: data.subject || 'Sunday Swervice Newsletter',
          sent: data.sent || 0,
          failed: data.failed || 0,
          totalContacts: data.totalContacts || 0,
        });
        totalSent += data.sent || 0;
        totalFailed += data.failed || 0;
      } catch (e) {
        console.error(`Error reading ${file.name}:`, e);
      }
    }

    return NextResponse.json({
      success: true,
      totalSent,
      totalFailed,
      sends: sends.slice(0, 10), // Latest 10 sends
      summary: {
        totalSends: sends.length,
        totalSent,
        totalFailed,
        successRate: totalSent > 0 ? ((totalSent / (totalSent + totalFailed)) * 100).toFixed(1) : '0',
      },
    });
  } catch (error: any) {
    console.error('Get newsletter sends error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load newsletter sends' },
      { status: 500 }
    );
  }
}
