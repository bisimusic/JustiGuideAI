import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

interface Contact {
  firstName?: string;
  lastName?: string;
  email: string;
  company?: string;
  linkedin?: string;
  phone?: string;
  source: string;
  notes?: string;
}

const GROUP_NAME = 'Sunday Service & Founder Events';

function parseName(fullName: string): { firstName?: string; lastName?: string } {
  if (!fullName || !fullName.trim()) {
    return {};
  }
  
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0] };
  }
  
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

function extractLinkedIn(linkedinUrl: string | undefined): string | undefined {
  if (!linkedinUrl) return undefined;
  
  const match = linkedinUrl.match(/linkedin\.com\/in\/([^\/\?]+)/i);
  if (match) {
    return `https://linkedin.com/in/${match[1]}`;
  }
  
  if (linkedinUrl.includes('linkedin.com')) {
    return linkedinUrl;
  }
  
  return undefined;
}

function parseCSVFile(filePath: string): Contact[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];
  
  const contacts: Contact[] = [];
  const seenEmails = new Set<string>();
  
  for (const record of records) {
    // Try multiple email column name variations
    const email = record.email || 
                  record.Email || 
                  record['Email?'] || 
                  record["What's your email?"] ||
                  record['What\'s your email?'] ||
                  '';
    if (!email || !email.includes('@')) {
      continue;
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    if (seenEmails.has(normalizedEmail)) {
      continue;
    }
    seenEmails.add(normalizedEmail);
    
    let firstName = record.first_name || record['First Name'] || record.FirstName || '';
    let lastName = record.last_name || record['Last Name'] || record.LastName || '';
    const fullName = record.name || record.Name || '';
    
    if (!firstName && !lastName && fullName) {
      const parsed = parseName(fullName);
      firstName = parsed.firstName || '';
      lastName = parsed.lastName || '';
    }
    
    const company = record['What company do you work for?'] || 
                   record.company || 
                   record.Company || 
                   record['Company'] || '';
    
    const linkedin = extractLinkedIn(
      record['What is your LinkedIn profile?'] || 
      record.linkedin || 
      record.LinkedIn || 
      record['LinkedIn Profile'] || ''
    );
    
    const phone = record.phone_number || record.phone || record.Phone || '';
    
    let eventName = path.basename(filePath, '.csv');
    // Clean up event names
    if (eventName.includes('Founder Beach Club')) {
      eventName = 'Founder Beach Club - Summer Of Rho';
    } else if (eventName.includes('INDEPENDENCEDAYWHITEPARTY')) {
      eventName = 'Independence Day White Party';
    } else if (eventName.includes('LoveFestSF')) {
      eventName = 'LoveFestSF 2025';
    } else if (eventName.includes('SundaySwervice') || eventName.includes('Sunday Swervice')) {
      if (eventName.includes('Gunther') || eventName.includes('Birthday')) {
        eventName = "Sunday Service - Gunther's Birthday Afterparty";
      } else if (eventName.includes('Brunch') || eventName.includes('Ditas')) {
        eventName = "Sunday Service Brunch at Dita's";
      } else {
        eventName = 'Sunday Service';
      }
    } else if (eventName.includes('Roaring2025') || eventName.includes('NeoGatsby')) {
      eventName = "Roaring 2025 Neo Gatsby (New Year's Eve)";
    }
    
    contacts.push({
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      email: normalizedEmail,
      company: company || undefined,
      linkedin: linkedin,
      phone: phone || undefined,
      source: `${GROUP_NAME} - ${eventName}`,
      notes: `Attended: ${eventName}`,
    });
  }
  
  return contacts;
}

async function parsePDFFile(filePath: string): Promise<Contact[]> {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  
  try {
    // Dynamic import to avoid Next.js SSR issues
    const pdf = (await import('pdf-parse')).default;
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    const text = data.text;
    
    const contacts: Contact[] = [];
    const seenEmails = new Set<string>();
    
    // Parse the PDF text - looking for table rows with guest information
    // The PDF has columns: #, Guest Name, Party Size, Payment Status, Email
    const lines = text.split('\n').filter(line => line.trim());
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for email pattern in the line
      const emailMatch = line.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i);
      if (emailMatch) {
        const email = emailMatch[0].toLowerCase().trim();
        
        // Skip if it's a header or invalid email
        if (email.includes('example.com') || seenEmails.has(email)) {
          continue;
        }
        seenEmails.add(email);
        
        // Try to extract name from the line (before the email)
        const emailIndex = line.indexOf(emailMatch[0]);
        const beforeEmail = line.substring(0, emailIndex).trim();
        
        // Split by common delimiters (tabs, pipes, multiple spaces) to get columns
        // Format: # | Name | Party Size | Payment Status | Email
        const parts = beforeEmail.split(/\s{2,}|\t|\|/).map(p => p.trim()).filter(p => p);
        
        // Find the name part (usually after the number)
        let name = '';
        for (const part of parts) {
          // Skip if it's just a number or status
          if (/^\d+$/.test(part) || /^(PAID|UNPAID|Going|Maybe|Invited|Error)$/i.test(part)) {
            continue;
          }
          // If it looks like a name (has letters), use it
          if (/[A-Za-z]/.test(part) && part.length > 1) {
            name = part;
            break;
          }
        }
        
        // If no name found in parts, try the whole beforeEmail string
        if (!name) {
          name = beforeEmail.replace(/^\d+\s*/, '').replace(/\s*(PAID|UNPAID|Going|Maybe|Invited|Error).*$/i, '').trim();
        }
        
        // Clean up name (remove quotes, extra spaces)
        name = name.replace(/^["']|["']$/g, '').replace(/\s+/g, ' ').trim();
        
        if (name && email) {
          const parsed = parseName(name);
          
          contacts.push({
            firstName: parsed.firstName || undefined,
            lastName: parsed.lastName || undefined,
            email: email,
            source: `${GROUP_NAME} - Sunday Service`,
            notes: 'Attended: Sunday Service',
          });
        }
      }
    }
    
    return contacts;
  } catch (error: any) {
    console.error(`Error parsing PDF ${filePath}:`, error);
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const CSV_FILES = [
      '/Users/bisiobateru/Desktop/2025/Docs 25/Founder Beach Club_ Summer Of Rho 🌅 - Guests - 2025-07-31-16-27-05.csv',
      '/Users/bisiobateru/Desktop/2025/Docs 25/Founder Beach Club_ Summer Of Rho 🌅 - Guests - 2025-08-03-23-22-40.csv',
      '/Users/bisiobateru/Desktop/2025/Docs 25/Founder Beach Club_ Summer Of Rho 🌅 - Guests - 2025-08-04-16-52-29.csv',
      '/Users/bisiobateru/Desktop/2025/Docs 25/INDEPENDENCEDAYWHITEPARTY_7-04_guests.csv',
      '/Users/bisiobateru/Desktop/2025/Docs 25/INDEPENDENCEDAYWHITEPARTY_7-19_guests.csv',
      '/Users/bisiobateru/Desktop/2025/Docs 25/LoveFestSF 2025 - Guests - 2025-07-18-20-51-17.csv',
      '/Users/bisiobateru/Desktop/2025/Docs 25/LoveFestSF 2025 - Guests - 2025-07-22-20-49-08.csv',
      '/Users/bisiobateru/Desktop/2025/Docs 25/LoveFestSF 2025 - Guests - 2025-08-01-19-26-26.csv',
      // New CSV files from Downloads
      '/Users/bisiobateru/Downloads/68SundaySwerviceGunthersBirthdayAfterparty_7-19_guests.csv',
      '/Users/bisiobateru/Downloads/BrunchSundaySwerviceDitas_3-23_guests.csv',
      '/Users/bisiobateru/Downloads/INDEPENDENCEDAYWHITEPARTY_7-04_guests.csv',
      '/Users/bisiobateru/Downloads/INDEPENDENCEDAYWHITEPARTY_7-19_guests.csv',
      '/Users/bisiobateru/Downloads/Roaring2025NeoGatsby_12-31_guests (1).csv',
      '/Users/bisiobateru/Downloads/Roaring2025NeoGatsby_12-31_guests (2).csv',
      '/Users/bisiobateru/Downloads/Roaring2025NeoGatsby_12-31_guests (3).csv',
    ];

    const PDF_FILES = [
      '/Users/bisiobateru/Downloads/Sunday Swervice - Sheet7.pdf',
    ];

    const allContacts: Contact[] = [];
    const emailMap = new Map<string, Contact>();

    // Parse CSV files
    for (const csvFile of CSV_FILES) {
      const contacts = parseCSVFile(csvFile);
      
      for (const contact of contacts) {
        const existing = emailMap.get(contact.email);
        if (existing) {
          if (!existing.company && contact.company) {
            existing.company = contact.company;
          }
          if (!existing.linkedin && contact.linkedin) {
            existing.linkedin = contact.linkedin;
          }
          if (!existing.phone && contact.phone) {
            existing.phone = contact.phone;
          }
          if (contact.notes && !existing.notes?.includes(contact.notes)) {
            existing.notes = existing.notes 
              ? `${existing.notes}; ${contact.notes}`
              : contact.notes;
          }
          // Merge sources
          if (contact.source && !existing.source.includes(contact.source)) {
            existing.source = `${existing.source}; ${contact.source}`;
          }
        } else {
          emailMap.set(contact.email, { ...contact });
        }
      }
    }

    // Parse PDF files (with error handling)
    for (const pdfFile of PDF_FILES) {
      try {
        const contacts = await parsePDFFile(pdfFile);
        
        for (const contact of contacts) {
          const existing = emailMap.get(contact.email);
          if (existing) {
            if (!existing.firstName && contact.firstName) {
              existing.firstName = contact.firstName;
            }
            if (!existing.lastName && contact.lastName) {
              existing.lastName = contact.lastName;
            }
            if (contact.notes && !existing.notes?.includes(contact.notes)) {
              existing.notes = existing.notes 
                ? `${existing.notes}; ${contact.notes}`
                : contact.notes;
            }
            // Merge sources
            if (contact.source && !existing.source.includes(contact.source)) {
              existing.source = `${existing.source}; ${contact.source}`;
            }
          } else {
            emailMap.set(contact.email, { ...contact });
          }
        }
      } catch (pdfError: any) {
        console.error(`Failed to parse PDF ${pdfFile}:`, pdfError.message);
        // Continue with other files even if PDF parsing fails
      }
    }

    allContacts.push(...emailMap.values());

    // Save contacts to local JSON file
    try {
      const outputDir = path.join(process.cwd(), 'data', 'contacts');
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputFile = path.join(outputDir, `sunday-service-contacts-${timestamp}.json`);
      
      const outputData = {
        groupName: GROUP_NAME,
        exportedAt: new Date().toISOString(),
        totalContacts: allContacts.length,
        contacts: allContacts,
        summary: {
          withEmail: allContacts.filter(c => c.email).length,
          withCompany: allContacts.filter(c => c.company).length,
          withLinkedIn: allContacts.filter(c => c.linkedin).length,
          withPhone: allContacts.filter(c => c.phone).length,
        },
      };
      
      fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2), 'utf-8');
      
      console.log(`✅ Saved ${allContacts.length} contacts to ${outputFile}`);
      
      return NextResponse.json({
        success: true,
        groupName: GROUP_NAME,
        totalContacts: allContacts.length,
        savedTo: outputFile,
        summary: {
          withEmail: allContacts.filter(c => c.email).length,
          withCompany: allContacts.filter(c => c.company).length,
          withLinkedIn: allContacts.filter(c => c.linkedin).length,
          withPhone: allContacts.filter(c => c.phone).length,
        },
        sampleContacts: allContacts.slice(0, 10), // Return first 10 as sample
      });
    } catch (saveError: any) {
      console.error('Failed to save contacts to local file:', saveError);
      return NextResponse.json({
        success: true,
        groupName: GROUP_NAME,
        totalContacts: allContacts.length,
        warning: 'Contacts parsed but not saved to file.',
        error: saveError.message,
        contacts: allContacts.slice(0, 10), // Return first 10 as sample
        summary: {
          withEmail: allContacts.filter(c => c.email).length,
          withCompany: allContacts.filter(c => c.company).length,
          withLinkedIn: allContacts.filter(c => c.linkedin).length,
          withPhone: allContacts.filter(c => c.phone).length,
        },
      });
    }
  } catch (error: any) {
    console.error('Import contacts error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to import contacts' },
      { status: 500 }
    );
  }
}
