#!/usr/bin/env node

/**
 * Import lead_responses from CSV using PostgreSQL COPY command
 * This is much faster than INSERT statements
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const postgres = require('postgres');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const CSV_FILE = path.join(__dirname, '../../data/lead_responses.csv');

async function importFromCsv() {
  console.log('\n📥 IMPORTING RESPONSES FROM CSV');
  console.log('='.repeat(60));
  console.log('');

  // Check CSV file
  if (!fs.existsSync(CSV_FILE)) {
    console.error(`❌ CSV file not found: ${CSV_FILE}`);
    console.error('   Run: node server/scripts/convert-responses-to-csv.js first');
    process.exit(1);
  }

  const fileSize = fs.statSync(CSV_FILE).size / (1024 * 1024);
  console.log(`✅ CSV file found: ${path.basename(CSV_FILE)}`);
  console.log(`   Size: ${fileSize.toFixed(1)} MB\n`);

  // Check database connection
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in .env');
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL;
  const sql = postgres(dbUrl, { max: 1 });

  try {
    await sql`SELECT 1`;
    console.log('✅ Database connection successful\n');
  } catch (error) {
    console.error(`❌ Database connection failed: ${error.message}`);
    await sql.end();
    process.exit(1);
  }

  // Check current count
  console.log('📊 Checking current data...');
  const [current] = await sql`SELECT COUNT(*) as count FROM lead_responses`;
  const currentCount = Number(current.count);
  console.log(`   Current responses: ${currentCount.toLocaleString()}\n`);

  // Use COPY command for fast import
  console.log('🚀 Starting CSV import using COPY command...');
  console.log('   This is much faster than INSERT statements\n');

  const startTime = Date.now();

  try {
    // Read CSV file and import in batches to handle large files
    const csvContent = fs.readFileSync(CSV_FILE, 'utf8');
    const lines = csvContent.split('\n');
    const header = lines[0];
    const dataLines = lines.slice(1).filter(line => line.trim());

    console.log(`   Total rows to import: ${dataLines.length.toLocaleString()}`);
    console.log(`   Processing in batches of 10,000...\n`);

    // Parse CSV and insert in batches
    const batchSize = 10000;
    let imported = 0;
    let errors = 0;

    for (let i = 0; i < dataLines.length; i += batchSize) {
      const batch = dataLines.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(dataLines.length / batchSize);

      try {
        // Parse CSV rows
        const rows = batch.map(line => {
          const values = [];
          let current = '';
          let inQuotes = false;
          let quoteChar = '';

          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if ((char === '"' || char === "'") && (j === 0 || line[j - 1] !== '\\')) {
              if (!inQuotes) {
                inQuotes = true;
                quoteChar = char;
              } else if (char === quoteChar) {
                inQuotes = false;
                quoteChar = '';
              } else {
                current += char;
              }
            } else if (char === ',' && !inQuotes) {
              values.push(current);
              current = '';
            } else {
              current += char;
            }
          }
          if (current || values.length > 0) {
            values.push(current);
          }
          return values;
        });

        // Insert batch using ON CONFLICT
        for (const row of rows) {
          if (row.length < 11) continue; // Skip incomplete rows

          try {
            // Handle NULL values
            const id = row[0] || null;
            const leadId = row[1] || null;
            const responseContent = row[2] || null;
            const platform = row[3] || null;
            const responseType = row[4] || null;
            const postId = row[5] === '' ? null : row[5];
            const status = row[6] || 'posted';
            const postedAt = row[7] === '' || row[7] === 'NULL' ? null : row[7];
            const createdAt = row[8] === '' || row[8] === 'NULL' ? null : row[8];
            const responseUrl = row[9] === '' ? null : row[9];
            const responseSlot = row[10] === '' || row[10] === 'NULL' ? 0 : parseInt(row[10]) || 0;

            if (!id || !leadId || !responseContent || !platform || !responseType) {
              errors++;
              continue;
            }

            await sql`
              INSERT INTO lead_responses (
                id, lead_id, response_content, platform, response_type, 
                post_id, status, posted_at, created_at, response_url, response_slot
              ) VALUES (
                ${id}, ${leadId}, ${responseContent}, ${platform}, ${responseType},
                ${postId}, ${status}, ${postedAt ? new Date(postedAt) : null}, 
                ${createdAt ? new Date(createdAt) : null}, ${responseUrl}, ${responseSlot}
              )
              ON CONFLICT (lead_id, response_slot) DO NOTHING
            `;

            imported++;
          } catch (error) {
            errors++;
            if (errors <= 10) {
              console.log(`   ⚠️  Row error: ${error.message.substring(0, 60)}`);
            }
          }
        }

        if (batchNum % 10 === 0 || batchNum === totalBatches) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
          const percent = ((i + batch.length) / dataLines.length * 100).toFixed(1);
          console.log(`   Batch ${batchNum}/${totalBatches}: ${imported.toLocaleString()} imported, ${errors} errors (${percent}%, ${elapsed}s)`);
        }
      } catch (error) {
        console.error(`   ❌ Batch ${batchNum} error: ${error.message}`);
        errors += batch.length;
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    console.log(`\n✅ Import complete!`);
    console.log(`   • Imported: ${imported.toLocaleString()}`);
    console.log(`   • Errors: ${errors}`);
    console.log(`   • Time: ${elapsed}s\n`);

    // Verify final count
    console.log('🔍 Verifying import...');
    const [final] = await sql`SELECT COUNT(*) as count FROM lead_responses`;
    const finalCount = Number(final.count);
    const added = finalCount - currentCount;

    console.log(`\n📊 FINAL RESULTS:`);
    console.log(`   • Before: ${currentCount.toLocaleString()}`);
    console.log(`   • After: ${finalCount.toLocaleString()}`);
    console.log(`   • Added: ${added.toLocaleString()}`);
    console.log(`   • Expected: 455,940\n`);

    if (finalCount >= 450000) {
      console.log('🎉🎉🎉 SUCCESS! Responses migration complete! 🎉🎉🎉');
    } else {
      console.log(`⏳ Progress: ${Math.round((finalCount / 455940) * 100)}% complete`);
    }

    await sql.end();
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error(error.stack);
    await sql.end();
    process.exit(1);
  }
}

importFromCsv().catch(error => {
  console.error('\n❌ FATAL ERROR:', error.message);
  console.error(error.stack);
  process.exit(1);
});
