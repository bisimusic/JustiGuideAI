#!/usr/bin/env ts-node

/**
 * Node.js-based import of production data
 * 
 * This script uses Node.js postgres client to import the SQL file
 * without requiring psql command-line tool.
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
  console.error('❌ DATABASE_URL environment variable is required');
  console.error('   Set it in .env file or: DATABASE_URL="..." npx ts-node server/scripts/import-production-data-node.ts');
  process.exit(1);
}

async function importData() {
  console.log('📊 PRODUCTION DATA IMPORT - Node.js Method');
  console.log('='.repeat(60));
  
  if (!fs.existsSync(PRODUCTION_SQL_FILE)) {
    console.error(`\n❌ Production SQL file not found:`);
    console.error(`   ${PRODUCTION_SQL_FILE}`);
    console.error(`\n💡 Make sure JustiGuideAI 3 is in: /Users/bisiobateru/Development/JustiGuideAI 3`);
    process.exit(1);
  }
  
  const fileSize = fs.statSync(PRODUCTION_SQL_FILE).size;
  const fileSizeMB = fileSize / (1024 * 1024);
  
  console.log(`\n✅ Source File: ${path.basename(PRODUCTION_SQL_FILE)}`);
  console.log(`📏 File Size: ${fileSizeMB.toFixed(1)} MB`);
  console.log(`🔗 Target Database: ${DATABASE_URL.split('@')[1]?.split('/')[0] || 'Neon Database'}`);
  
  const sql = postgres(DATABASE_URL, {
    max: 1, // Single connection for import
    idle_timeout: 0,
    connect_timeout: 30,
  });
  
  try {
    // Test connection
    console.log('\n🔍 Testing database connection...');
    await sql`SELECT 1`;
    console.log('✅ Database connected\n');
    
    // Check current data
    console.log('📊 Checking current database state...');
    try {
      const [currentLeads] = await sql`SELECT COUNT(*) as count FROM leads`;
      const [currentResponses] = await sql`SELECT COUNT(*) as count FROM lead_responses`;
      console.log(`   • Current leads: ${Number(currentLeads.count).toLocaleString()}`);
      console.log(`   • Current responses: ${Number(currentResponses.count).toLocaleString()}`);
      
      if (Number(currentLeads.count) > 0) {
        console.log('\n⚠️  WARNING: Database already has data!');
        console.log('   This import will ADD to existing data (may cause duplicates)');
        console.log('   Consider clearing tables first if you want a fresh import.\n');
      }
    } catch (e) {
      console.log('   • Tables may not exist yet (will be created by import)\n');
    }
    
    // Read and execute SQL file
    console.log('📥 Starting import...');
    console.log('   This will import:');
    console.log('   • 47,159 leads');
    console.log('   • 455,940 lead responses');
    console.log('   • 63,893 learned templates');
    console.log('   • Plus all supporting data\n');
    console.log('⏳ Processing (this may take 10-20 minutes for 312MB file)...\n');
    
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
      
      // Execute when we hit a semicolon (end of statement)
      if (trimmed.endsWith(';')) {
        const statement = currentStatement.trim();
        currentStatement = '';
        
        if (!statement) continue;
        
        try {
          // Use unsafe for raw SQL
          await sql.unsafe(statement);
          statementsExecuted++;
          
          // Progress update every 1000 statements
          if (statementsExecuted % 1000 === 0) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
            process.stdout.write(`\r⏳ Processed ${statementsExecuted.toLocaleString()} statements (${elapsed}s, ${errors} errors)...`);
          }
        } catch (error: any) {
          errors++;
          // Skip common non-critical errors
          const errorMsg = error.message.toLowerCase();
          if (!errorMsg.includes('already exists') && 
              !errorMsg.includes('duplicate key') &&
              !errorMsg.includes('relation') &&
              !errorMsg.includes('does not exist')) {
            if (errors <= 10) {
              console.error(`\n⚠️  Error (statement ${statementsExecuted}): ${error.message.substring(0, 150)}`);
            }
          }
        }
      }
    }
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    console.log(`\n\n✅ Import complete!`);
    console.log(`   • Statements executed: ${statementsExecuted.toLocaleString()}`);
    console.log(`   • Lines processed: ${linesProcessed.toLocaleString()}`);
    console.log(`   • Errors: ${errors}`);
    console.log(`   • Time elapsed: ${elapsed}s`);
    
    // Verify import
    console.log('\n📊 Verifying import...');
    const [leadsCount] = await sql`SELECT COUNT(*) as count FROM leads`;
    const [responsesCount] = await sql`SELECT COUNT(*) as count FROM lead_responses`;
    const [templatesCount] = await sql`SELECT COUNT(*) as count FROM learned_templates`.catch(() => [{ count: 0 }]);
    
    console.log(`\n✅ Verification Results:`);
    console.log(`   • Leads: ${Number(leadsCount.count).toLocaleString()}`);
    console.log(`   • Responses: ${Number(responsesCount.count).toLocaleString()}`);
    console.log(`   • Learned Templates: ${Number(templatesCount.count).toLocaleString()}`);
    
    await sql.end();
    
    console.log('\n🎉 Production data import complete!');
    console.log('   Your dashboard should now show the full data.');
    console.log('   Visit http://localhost:3002/admin/dashboard to see the results.');
    
  } catch (error: any) {
    console.error('\n❌ Import failed:', error.message);
    await sql.end();
    process.exit(1);
  }
}

// Run import
importData().catch(console.error);
