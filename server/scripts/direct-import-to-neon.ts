#!/usr/bin/env ts-node

/**
 * Direct import of production data to Neon database
 * Reads SQL file and executes statements directly
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTION_SQL_FILE = path.join(
  __dirname,
  '../../JustiGuideAI 3/server/scripts/exports/production-import-2025-10-30.sql'
);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set in .env file');
  process.exit(1);
}

async function directImport() {
  console.log('🚀 DIRECT DATA TRANSFER TO NEON DATABASE');
  console.log('='.repeat(60));
  
  // Check SQL file
  if (!fs.existsSync(PRODUCTION_SQL_FILE)) {
    console.error(`\n❌ SQL file not found: ${PRODUCTION_SQL_FILE}`);
    process.exit(1);
  }
  
  const fileSize = fs.statSync(PRODUCTION_SQL_FILE).size / (1024 * 1024);
  console.log(`\n✅ SQL File: ${path.basename(PRODUCTION_SQL_FILE)}`);
  console.log(`📏 Size: ${fileSize.toFixed(1)} MB`);
  console.log(`🔗 Database: ${DATABASE_URL.split('@')[1]?.split('/')[0] || 'Neon'}`);
  
  // Connect to Neon
  console.log('\n🔌 Connecting to Neon database...');
  const sql = postgres(DATABASE_URL, {
    max: 1,
    idle_timeout: 0,
    connect_timeout: 30,
  });
  
  try {
    // Test connection
    await sql`SELECT 1`;
    console.log('✅ Connected to Neon database\n');
    
    // Check current state
    console.log('📊 Checking current database state...');
    try {
      const [currentLeads] = await sql`SELECT COUNT(*) as count FROM leads`;
      const [currentResponses] = await sql`SELECT COUNT(*) as count FROM lead_responses`;
      console.log(`   • Current leads: ${Number(currentLeads.count).toLocaleString()}`);
      console.log(`   • Current responses: ${Number(currentResponses.count).toLocaleString()}`);
      
      if (Number(currentLeads.count) >= 47000) {
        console.log('\n✅ Data already imported!');
        await sql.end();
        return;
      }
    } catch (e) {
      console.log('   • Tables may not exist yet (will be created)\n');
    }
    
    // Read and execute SQL file
    console.log('📥 Starting data transfer...');
    console.log('   This will import:');
    console.log('   • 47,159 leads');
    console.log('   • 455,940 lead responses');
    console.log('   • 63,893 learned templates');
    console.log('   • All supporting data\n');
    console.log('⏳ Processing SQL file (this may take 10-20 minutes)...\n');
    
    const fileStream = fs.createReadStream(PRODUCTION_SQL_FILE, { encoding: 'utf8' });
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    
    let currentStatement = '';
    let statementsExecuted = 0;
    let linesProcessed = 0;
    let errors = 0;
    const startTime = Date.now();
    
    for await (const line of rl) {
      linesProcessed++;
      
      // Skip comments and empty lines
      const trimmed = line.trim();
      if (trimmed.startsWith('--') || trimmed === '' || trimmed.startsWith('/*')) {
        continue;
      }
      
      currentStatement += line + '\n';
      
      // Execute when we hit semicolon
      if (trimmed.endsWith(';')) {
        const statement = currentStatement.trim();
        currentStatement = '';
        
        if (!statement) continue;
        
        try {
          await sql.unsafe(statement);
          statementsExecuted++;
          
          // Progress update
          if (statementsExecuted % 1000 === 0) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
            const rate = (statementsExecuted / ((Date.now() - startTime) / 1000)).toFixed(0);
            process.stdout.write(`\r⏳ Processed ${statementsExecuted.toLocaleString()} statements (${elapsed}s, ~${rate}/sec, ${errors} errors)...`);
          }
        } catch (error: any) {
          errors++;
          const errorMsg = error.message.toLowerCase();
          // Skip non-critical errors
          if (!errorMsg.includes('already exists') && 
              !errorMsg.includes('duplicate key') &&
              !errorMsg.includes('relation') &&
              !errorMsg.includes('does not exist')) {
            if (errors <= 5) {
              console.error(`\n⚠️  Error: ${error.message.substring(0, 100)}`);
            }
          }
        }
      }
    }
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    console.log(`\n\n✅ Data transfer complete!`);
    console.log(`   • Statements executed: ${statementsExecuted.toLocaleString()}`);
    console.log(`   • Lines processed: ${linesProcessed.toLocaleString()}`);
    console.log(`   • Errors: ${errors}`);
    console.log(`   • Time: ${elapsed}s`);
    
    // Verify import
    console.log('\n📊 Verifying data in Neon database...');
    const [leadsCount] = await sql`SELECT COUNT(*) as count FROM leads`;
    const [responsesCount] = await sql`SELECT COUNT(*) as count FROM lead_responses`;
    const [templatesCount] = await sql`SELECT COUNT(*) as count FROM learned_templates`.catch(() => [{ count: 0 }]);
    
    console.log(`\n✅ VERIFICATION RESULTS:`);
    console.log(`   • Leads: ${Number(leadsCount.count).toLocaleString()} (Expected: 47,159)`);
    console.log(`   • Responses: ${Number(responsesCount.count).toLocaleString()} (Expected: 455,940)`);
    console.log(`   • Templates: ${Number(templatesCount.count).toLocaleString()} (Expected: 63,893)`);
    
    if (Number(leadsCount.count) >= 47000) {
      console.log('\n🎉 SUCCESS! Data has been transferred to Neon database!');
      console.log('   Your dashboard should now show the full data.');
    } else {
      console.log('\n⚠️  Import may be incomplete. Check errors above.');
    }
    
    await sql.end();
    
  } catch (error: any) {
    console.error('\n❌ Transfer failed:', error.message);
    await sql.end();
    process.exit(1);
  }
}

// Run import
directImport().catch(console.error);
