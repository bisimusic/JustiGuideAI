#!/usr/bin/env node

/**
 * Import event contacts from CSV files into "Sunday Service & Founder Events" group
 * Usage: node import-sunday-service-contacts.js
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const GROUP_NAME = 'Sunday Service & Founder Events';

const CSV_FILES = [
  '/Users/bisiobateru/Desktop/2025/Docs 25/Founder Beach Club_ Summer Of Rho 🌅 - Guests - 2025-07-31-16-27-05.csv',
  '/Users/bisiobateru/Desktop/2025/Docs 25/Founder Beach Club_ Summer Of Rho 🌅 - Guests - 2025-08-03-23-22-40.csv',
  '/Users/bisiobateru/Desktop/2025/Docs 25/Founder Beach Club_ Summer Of Rho 🌅 - Guests - 2025-08-04-16-52-29.csv',
  '/Users/bisiobateru/Desktop/2025/Docs 25/INDEPENDENCEDAYWHITEPARTY_7-04_guests.csv',
  '/Users/bisiobateru/Desktop/2025/Docs 25/INDEPENDENCEDAYWHITEPARTY_7-19_guests.csv',
  '/Users/bisiobateru/Desktop/2025/Docs 25/LoveFestSF 2025 - Guests - 2025-07-18-20-51-17.csv',
  '/Users/bisiobateru/Desktop/2025/Docs 25/LoveFestSF 2025 - Guests - 2025-07-22-20-49-08.csv',
  '/Users/bisiobateru/Desktop/2025/Docs 25/LoveFestSF 2025 - Guests - 2025-08-01-19-26-26.csv',
];

function parseName(fullName) {
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

function extractLinkedIn(linkedinUrl) {
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

function parseCSVFile(filePath) {
  console.log(`\n📄 Parsing: ${path.basename(filePath)}`);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filePath}`);
    return [];
  }
  
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  
  const contacts = [];
  const seenEmails = new Set();
  
  for (const record of records) {
    const email = record.email || record.Email || record['Email?'] || '';
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
    if (eventName.includes('Founder Beach Club')) {
      eventName = 'Founder Beach Club - Summer Of Rho';
    } else if (eventName.includes('INDEPENDENCEDAYWHITEPARTY')) {
      eventName = 'Independence Day White Party';
    } else if (eventName.includes('LoveFestSF')) {
      eventName = 'LoveFestSF 2025';
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
  
  console.log(`   ✅ Extracted ${contacts.length} contacts`);
  return contacts;
}

async function importContacts() {
  console.log('🚀 Starting contact import for "Sunday Service & Founder Events"\n');
  
  const allContacts = [];
  const emailMap = new Map();
  
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
      } else {
        emailMap.set(contact.email, { ...contact });
      }
    }
  }
  
  allContacts.push(...emailMap.values());
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total unique contacts: ${allContacts.length}`);
  console.log(`   With email: ${allContacts.filter(c => c.email).length}`);
  console.log(`   With company: ${allContacts.filter(c => c.company).length}`);
  console.log(`   With LinkedIn: ${allContacts.filter(c => c.linkedin).length}`);
  console.log(`   With phone: ${allContacts.filter(c => c.phone).length}`);
  
  // Save to JSON file
  const outputPath = path.join(__dirname, 'server/exports/sunday-service-founder-events-contacts.json');
  const outputDir = path.dirname(outputPath);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(allContacts, null, 2));
  console.log(`\n💾 Saved contacts to: ${outputPath}`);
  
  // Also create a CSV export
  const csvOutputPath = path.join(__dirname, 'server/exports/sunday-service-founder-events-contacts.csv');
  const csvHeader = 'First Name,Last Name,Email,Company,LinkedIn,Phone,Source,Notes\n';
  const csvRows = allContacts.map(c => {
    const escape = (val) => {
      if (!val) return '';
      return `"${String(val).replace(/"/g, '""')}"`;
    };
    return [
      escape(c.firstName),
      escape(c.lastName),
      escape(c.email),
      escape(c.company),
      escape(c.linkedin),
      escape(c.phone),
      escape(c.source),
      escape(c.notes),
    ].join(',');
  }).join('\n');
  
  fs.writeFileSync(csvOutputPath, csvHeader + csvRows);
  console.log(`💾 Saved CSV to: ${csvOutputPath}`);
  
  console.log(`\n✅ Import complete!`);
  console.log(`\n📧 Group: "${GROUP_NAME}"`);
  console.log(`📝 Total contacts: ${allContacts.length}`);
  console.log(`\nNext steps:`);
  console.log(`1. Review the contacts in: ${outputPath}`);
  console.log(`2. Use the API endpoint: POST /api/contacts/import-group to import into database`);
  
  return allContacts;
}

// Run
importContacts()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
