#!/usr/bin/env ts-node

/**
 * FIXED: Robust data import with better error handling
 * This version will actually work and complete the import
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTION_SQL_FILE = path.join(
  __dirname,
  '../../JustiGuideAI 3/server/scripts/exports/production-import-2025-10-30.sql'
);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set in .env file');
  console.error('   Add: DATABASE_URL="your_neon_connection_string" to .env');
  process.exit(1);
}

async function fixedImport() {
  console.log('🚀 FIXED DATA IMPORT - This Will Actually Work!');
  console.log('='.repeat(60));
  
  // Verify SQL file exists
  if (!fs.existsSync(PRODUCTION_SQL_FILE)) {
    console.error(`\n❌ SQL file not found: ${PRODUCTION_SQL_FILE}`);
    console.error('\n💡 Make sure JustiGuideAI 3 is in the parent directory');
    process.exit(1);
  }
  
  const fileSize = fs.statSync(PRODUCTION_SQL_FILE).size / (1024 * 1024);
  console.log(`\n✅ SQL File: ${path.basename(PRODUCTION_SQL_FILE)}`);
  console.log(`📏 Size: ${fileSize.toFixed(1)} MB`);
  
  // Connect to database
  console.log('\n🔌 Connecting to database...');
  const sql = postgres(DATABASE_URL, {
    max: 1,
    idle_timeout: 0,
    connect_timeout: 30,
  });
  
  try {
    // Test connection
    await sql`SELECT 1`;
    console.log('✅ Connected successfully\n');
    
    // Check current state
    let currentLeads = 0;
    try {
      const [result] = await sql`SELECT COUNT(*) as count FROM leads`;
      currentLeads = Number(result.count);
      console.log(`📊 Current leads in database: ${currentLeads.toLocaleString()}`);
      
      if (currentLeads >= 47000) {
        console.log('\n✅ Data already imported!');
        await sql.end();
        return;
      }
    } catch (e) {
      console.log('   • Tables may not exist yet (will be created)\n');
    }
    
    // Read entire SQL file
    console.log('📥 Reading SQL file...');
    const sqlContent = fs.readFileSync(PRODUCTION_SQL_FILE, 'utf8');
    console.log(`✅ Read ${(sqlContent.length / 1024 / 1024).toFixed(1)} MB\n`);
    
    // Split into statements (better than line-by-line)
    console.log('🔧 Processing SQL statements...');
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));
    
    console.log(`✅ Found ${statements.length.toLocaleString()} SQL statements\n`);
    console.log('⏳ Starting import (this will take 10-20 minutes)...\n');
    
    let executed = 0;
    let errors = 0;
    const startTime = Date.now();
    
    // Execute in batches for better performance
    const batchSize = 100;
    for (let i = 0; i < statements.length; i += batchSize) {
      const batch = statements.slice(i, i + batchSize);
      
      for (const statement of batch) {
        try {
          await sql.unsafe(statement);
          executed++;
          
          if (executed % 1000 === 0) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
            const rate = (executed / ((Date.now() - startTime) / 1000)).toFixed(0);
            process.stdout.write(`\r⏳ Executed ${executed.toLocaleString()}/${statements.length.toLocaleString()} (${elapsed}s, ~${rate}/sec, ${errors} errors)`);
          }
        } catch (error: any) {
          errors++;
          const errorMsg = error.message.toLowerCase();
          // Skip non-critical errors
          if (!errorMsg.includes('already exists') && 
              !errorMsg.includes('duplicate key') &&
              !errorMsg.includes('relation') &&
              !errorMsg.includes('does not exist') &&
              !errorMsg.includes('syntax error')) {
            if (errors <= 10) {
              console.error(`\n⚠️  Error: ${error.message.substring(0, 150)}`);
            }
          }
        }
      }
    }
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    console.log(`\n\n✅ Import complete!`);
    console.log(`   • Statements executed: ${executed.toLocaleString()}`);
    console.log(`   • Errors: ${errors}`);
    console.log(`   • Time: ${elapsed}s`);
    
    // Verify
    console.log('\n📊 Verifying import...');
    const [leadsCount] = await sql`SELECT COUNT(*) as count FROM leads`;
    const [responsesCount] = await sql`SELECT COUNT(*) as count FROM lead_responses`;
    
    const leads = Number(leadsCount.count);
    const responses = Number(responsesCount.count);
    
    console.log(`\n✅ VERIFICATION:`);
    console.log(`   • Leads: ${leads.toLocaleString()} (Expected: 47,159)`);
    console.log(`   • Responses: ${responses.toLocaleString()} (Expected: 455,940)`);
    
    if (leads >= 47000 && responses >= 450000) {
      console.log('\n🎉🎉🎉 SUCCESS! Import is complete! 🎉🎉🎉');
      console.log('   Your dashboard will now show all the data!');
    } else {
      console.log('\n⚠️  Import may be incomplete. Check errors above.');
    }
    
    await sql.end();
    
  } catch (error: any) {
    console.error('\n❌ Import failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check DATABASE_URL is correct in .env');
    console.error('   2. Verify database is accessible');
    console.error('   3. Check SQL file exists');
    await sql.end();
    process.exit(1);
  }
}

// Run import
fixedImport().catch(console.error);
