#!/usr/bin/env ts-node

/**
 * Import production data from JustiGuideAI 3 into JustiGuideAI 2 database
 * 
 * This script imports the production SQL dump (312MB) from JustiGuideAI 3
 * into the Neon database for JustiGuideAI 2.
 * 
 * USAGE:
 *   DATABASE_URL="your_neon_connection_string" npx ts-node server/scripts/import-production-data.ts
 * 
 * OR with .env file:
 *   npx ts-node server/scripts/import-production-data.ts
 */

import 'dotenv/config';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the production SQL file in JustiGuideAI 3
const PRODUCTION_SQL_FILE = path.join(
  __dirname,
  '../../JustiGuideAI 3/server/scripts/exports/production-import-2025-10-30.sql'
);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.error('   Set it in .env file or as environment variable');
  process.exit(1);
}

if (!fs.existsSync(PRODUCTION_SQL_FILE)) {
  console.error(`❌ Production SQL file not found: ${PRODUCTION_SQL_FILE}`);
  console.error('   Make sure JustiGuideAI 3 is in the same parent directory');
  process.exit(1);
}

async function importProductionData() {
  console.log('📊 PRODUCTION DATA IMPORT');
  console.log('=' .repeat(60));
  console.log(`\n✅ Source: ${PRODUCTION_SQL_FILE}`);
  console.log(`📏 File Size: ${(fs.statSync(PRODUCTION_SQL_FILE).size / (1024 * 1024)).toFixed(1)} MB`);
  console.log(`🔗 Target: ${DATABASE_URL.split('@')[1] || 'Neon Database'}`);
  
  const fileSize = fs.statSync(PRODUCTION_SQL_FILE).size;
  const fileSizeMB = fileSize / (1024 * 1024);
  
  if (fileSizeMB > 100) {
    console.log('\n⚠️  Large file detected. Using streaming import...');
    console.log('   This may take several minutes...\n');
  }
  
  try {
    // Test database connection first
    console.log('🔍 Testing database connection...');
    const sql = postgres(DATABASE_URL, { max: 1 });
    await sql`SELECT 1`;
    console.log('✅ Database connection successful\n');
    await sql.end();
    
    // Import using psql command (more efficient for large files)
    console.log('📥 Starting import...');
    console.log('   This will import:');
    console.log('   • 47,159 leads');
    console.log('   • 455,940 lead responses');
    console.log('   • 63,893 learned templates');
    console.log('   • Plus all supporting data (contacts, investors, etc.)\n');
    
    // Use psql for large file import
    const importCommand = `psql "${DATABASE_URL}" < "${PRODUCTION_SQL_FILE}"`;
    
    console.log('⏳ Importing data (this may take 5-15 minutes)...\n');
    
    execSync(importCommand, {
      stdio: 'inherit',
      env: { ...process.env, PGPASSWORD: DATABASE_URL.match(/:(.*)@/)?.[1] || '' }
    });
    
    console.log('\n✅ Import completed successfully!');
    console.log('\n📊 Verifying import...');
    
    // Verify import
    const verifySql = postgres(DATABASE_URL);
    const [leadsCount] = await verifySql`SELECT COUNT(*) as count FROM leads`;
    const [responsesCount] = await verifySql`SELECT COUNT(*) as count FROM lead_responses`;
    
    console.log(`\n✅ Verification Results:`);
    console.log(`   • Leads imported: ${Number(leadsCount.count).toLocaleString()}`);
    console.log(`   • Responses imported: ${Number(responsesCount.count).toLocaleString()}`);
    
    await verifySql.end();
    
    console.log('\n🎉 Production data import complete!');
    console.log('   Your dashboard should now show the full data.');
    
  } catch (error: any) {
    console.error('\n❌ Import failed:', error.message);
    
    if (error.message.includes('psql')) {
      console.error('\n💡 Alternative: Use pg_restore or split the file');
      console.error('   The file is 312MB and may need to be imported in batches.');
    }
    
    process.exit(1);
  }
}

// Run import
importProductionData().catch(console.error);
