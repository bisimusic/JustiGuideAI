import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(req: NextRequest) {
  try {
    const contactsDir = path.join(process.cwd(), 'data', 'contacts');
    
    let totalContacts = 0;
    let contactsWithEmail = 0;
    let contactsWithCompany = 0;
    let contactsWithLinkedIn = 0;
    let uniqueGroups = new Set<string>();
    let latestExportDate: string | null = null;

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
        
        totalContacts = contactsData.totalContacts || 0;
        contactsWithEmail = contactsData.summary?.withEmail || 0;
        contactsWithCompany = contactsData.summary?.withCompany || 0;
        contactsWithLinkedIn = contactsData.summary?.withLinkedIn || 0;
        latestExportDate = contactsData.exportedAt || null;

        // Extract unique groups
        const contacts = contactsData.contacts || [];
        contacts.forEach((c: any) => {
          if (c.source) {
            const group = c.source.split(' - ')[0];
            if (group) uniqueGroups.add(group);
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalContacts,
        contactsWithEmail,
        contactsWithCompany,
        contactsWithLinkedIn,
        uniqueGroups: Array.from(uniqueGroups),
        latestExportDate,
      },
    });
  } catch (error: any) {
    console.error('Newsletter stats error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load newsletter stats' },
      { status: 500 }
    );
  }
}
