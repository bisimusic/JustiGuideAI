import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// Proxy to Express server which connects to Neon database
const EXPRESS_SERVER_URL = process.env.EXPRESS_SERVER_URL || 'http://localhost:5000';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const group = searchParams.get('group') || '';

    // Try to fetch from Express server (Neon database) first
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append('search', search);
      if (group) params.append('source', group);

      const response = await fetch(`${EXPRESS_SERVER_URL}/api/email-captures?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Transform database records to contact format
        const contacts = (data.captures || []).map((capture: any) => {
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
            group: metadata.group || capture.sources?.[0] || 'Sunday Service & Founder Events',
          };
        });

        // Filter by group if specified
        let filteredContacts = contacts;
        if (group) {
          filteredContacts = contacts.filter((c: any) => 
            c.group?.includes(group) || c.source?.includes(group)
          );
        }

        // Filter by search if specified
        if (search) {
          filteredContacts = filteredContacts.filter((c: any) => 
            c.email?.toLowerCase().includes(search.toLowerCase()) ||
            c.firstName?.toLowerCase().includes(search.toLowerCase()) ||
            c.lastName?.toLowerCase().includes(search.toLowerCase()) ||
            c.company?.toLowerCase().includes(search.toLowerCase())
          );
        }

        // Get unique groups
        const uniqueGroups = Array.from(
          new Set(
            contacts
              .map((c: any) => c.group || c.source)
              .filter(Boolean)
          )
        );

        return NextResponse.json({
          success: true,
          contacts: filteredContacts,
          pagination: {
            page,
            limit,
            total: filteredContacts.length,
            pages: Math.ceil(filteredContacts.length / limit),
          },
          stats: {
            totalContacts: data.pagination?.total || filteredContacts.length,
            withEmail: filteredContacts.filter((c: any) => c.email).length,
            withCompany: filteredContacts.filter((c: any) => c.company).length,
            withLinkedIn: filteredContacts.filter((c: any) => c.linkedin).length,
          },
          groups: uniqueGroups,
        });
      }
    } catch (expressError: any) {
      console.warn('Express server not available, using local files:', expressError.message);
    }

    // Fallback to local JSON files
    const contactsDir = path.join(process.cwd(), 'data', 'contacts');
    if (!fs.existsSync(contactsDir)) {
      return NextResponse.json({
        success: true,
        contacts: [],
        pagination: { page: 1, limit: 50, total: 0, pages: 0 },
        stats: { totalContacts: 0, withEmail: 0, withCompany: 0, withLinkedIn: 0 },
        groups: [],
      });
    }

    const files = fs.readdirSync(contactsDir)
      .filter(f => f.startsWith('sunday-service-contacts-') && f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: path.join(contactsDir, f),
        mtime: fs.statSync(path.join(contactsDir, f)).mtime
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    if (files.length === 0) {
      return NextResponse.json({
        success: true,
        contacts: [],
        pagination: { page: 1, limit: 50, total: 0, pages: 0 },
        stats: { totalContacts: 0, withEmail: 0, withCompany: 0, withLinkedIn: 0 },
        groups: [],
      });
    }

    const latestFile = files[0];
    const contactsData = JSON.parse(fs.readFileSync(latestFile.path, 'utf-8'));
    let contacts = contactsData.contacts || [];

    // Filter by group
    if (group) {
      contacts = contacts.filter((c: any) => 
        c.source?.includes(group)
      );
    }

    // Filter by search
    if (search) {
      contacts = contacts.filter((c: any) => 
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        c.lastName?.toLowerCase().includes(search.toLowerCase()) ||
        c.company?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Paginate
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedContacts = contacts.slice(start, end);

    // Get unique groups
    const uniqueGroups = Array.from(
      new Set(
        contacts
          .map((c: any) => c.source?.split(' - ')[0])
          .filter(Boolean)
      )
    );

    return NextResponse.json({
      success: true,
      contacts: paginatedContacts,
      pagination: {
        page,
        limit,
        total: contacts.length,
        pages: Math.ceil(contacts.length / limit),
      },
      stats: {
        totalContacts: contacts.length,
        withEmail: contacts.filter((c: any) => c.email).length,
        withCompany: contacts.filter((c: any) => c.company).length,
        withLinkedIn: contacts.filter((c: any) => c.linkedin).length,
      },
      groups: uniqueGroups,
    });
  } catch (error: any) {
    console.error('Get contacts error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}
