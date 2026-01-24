#!/usr/bin/env node

/**
 * Store contacts from JSON file to database
 * Usage: node store-contacts-to-db.js
 */

const fs = require('fs');
const path = require('path');

// Load the JSON file
const jsonPath = path.join(__dirname, 'server/exports/sunday-service-founder-events-contacts.json');

if (!fs.existsSync(jsonPath)) {
  console.error(`❌ Contacts file not found: ${jsonPath}`);
  console.log('Please run: node import-sunday-service-contacts.js first');
  process.exit(1);
}

const contacts = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
console.log(`📄 Loaded ${contacts.length} contacts from JSON file\n`);

// Import storage and database
async function storeContacts() {
  try {
    // Dynamic import of storage service
    const { storage } = await import('./server/storage.js');
    const { emailCaptures } = await import('./shared/schema.js');
    const { eq, sql } = await import('drizzle-orm');

    const GROUP_NAME = 'Sunday Service & Founder Events';

    let imported = 0;
    let updated = 0;
    let errors = 0;
    const errorDetails = [];

    // Process in batches
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
                  ...(existing[0].metadata || {}),
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
        } catch (error) {
          errors++;
          errorDetails.push(`${contact.email}: ${error.message}`);
          if (errors <= 5) {
            console.error(`   Error with ${contact.email}: ${error.message}`);
          }
        }
      }

      console.log(`  ✅ Batch complete: ${imported} imported, ${updated} updated, ${errors} errors\n`);
    }

    console.log(`\n📊 Final Summary:`);
    console.log(`   ✅ Imported: ${imported} new contacts`);
    console.log(`   🔄 Updated: ${updated} existing contacts`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📧 Total processed: ${contacts.length}`);
    console.log(`\n✅ Contacts stored in database!`);
    console.log(`   Group: "${GROUP_NAME}"`);
    console.log(`   Table: email_captures`);

  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n💡 Alternative: Start Express server and use API endpoint');
    console.log('   POST http://localhost:5000/api/contacts/import-group');
    process.exit(1);
  }
}

storeContacts()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
