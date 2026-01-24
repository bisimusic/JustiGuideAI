#!/usr/bin/env ts-node

/**
 * Store contacts from JSON file to database
 * Usage: ts-node server/scripts/store-contacts-to-db.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { storage } from '../storage';
import { emailCaptures } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

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

async function storeContacts() {
  console.log('🚀 Storing contacts to database...\n');

  // Load contacts from JSON file
  const jsonPath = path.join(__dirname, '../exports/sunday-service-founder-events-contacts.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Contacts file not found: ${jsonPath}`);
    console.log('Please run: node import-sunday-service-contacts.js first');
    process.exit(1);
  }

  const contacts: Contact[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`📄 Loaded ${contacts.length} contacts from JSON file\n`);

  let imported = 0;
  let updated = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  // Process in batches to avoid overwhelming the database
  const batchSize = 100;
  for (let i = 0; i < contacts.length; i += batchSize) {
    const batch = contacts.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(contacts.length / batchSize)} (${batch.length} contacts)...`);

    for (const contact of batch) {
      try {
        const email = contact.email.toLowerCase().trim();
        
        // Check if contact already exists
        const existing = await storage.db.select()
          .from(emailCaptures)
          .where(eq(emailCaptures.email, email))
          .limit(1);

        const contactMetadata = {
          firstName: contact.firstName || null,
          lastName: contact.lastName || null,
          phone: contact.phone || null,
          company: contact.company || null,
          linkedin: contact.linkedin || null,
          group: GROUP_NAME,
          source: contact.source || GROUP_NAME,
          notes: contact.notes || null,
          importedAt: new Date().toISOString(),
        };

        if (existing.length > 0) {
          // Update existing contact
          await storage.db.update(emailCaptures)
            .set({
              sources: sql`array_append(COALESCE(sources, ARRAY[]::text[]), ${contact.source || GROUP_NAME})`,
              metadata: {
                ...(existing[0].metadata as any || {}),
                ...contactMetadata,
              },
              captureDate: new Date(),
            })
            .where(eq(emailCaptures.email, email));
          updated++;
        } else {
          // Insert new contact
          await storage.db.insert(emailCaptures).values({
            email: email,
            sources: [contact.source || GROUP_NAME],
            status: 'active',
            captureDate: new Date(),
            metadata: contactMetadata,
          });
          imported++;
        }
      } catch (error: any) {
        errors++;
        errorDetails.push(`${contact.email}: ${error.message}`);
        console.error(`Error importing contact ${contact.email}:`, error.message);
      }
    }

    console.log(`  ✅ Batch complete: ${imported} imported, ${updated} updated, ${errors} errors\n`);
  }

  console.log(`\n📊 Final Summary:`);
  console.log(`   ✅ Imported: ${imported} new contacts`);
  console.log(`   🔄 Updated: ${updated} existing contacts`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📧 Total processed: ${contacts.length}`);

  if (errors > 0 && errorDetails.length > 0) {
    console.log(`\n⚠️  First 10 errors:`);
    errorDetails.slice(0, 10).forEach(err => console.log(`   - ${err}`));
  }

  console.log(`\n✅ Contacts stored in database!`);
  console.log(`   Group: "${GROUP_NAME}"`);
  console.log(`   Table: email_captures`);
}

// Run
storeContacts()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
