#!/usr/bin/env node

/**
 * DIAGNOSE AND FIX - Actually runs and shows output
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

// Fix path - __dirname is server/scripts, go up 2 levels to project root, then to parent/JustiGuideAI 3
const projectRoot = path.resolve(__dirname, '../..');
const parentDir = path.dirname(projectRoot);
const SQL_FILE = path.join(
  parentDir,
  'JustiGuideAI 3/server/scripts/exports/production-import-2025-10-30.sql'
);

async function diagnoseAndFix() {
  console.log('\n🔍 DIAGNOSING MIGRATION ISSUES');
  console.log('='.repeat(60));
  console.log('');
  
  // Check 1: .env file
  console.log('1️⃣  Checking .env file...');
  const envPath = path.join(__dirname, '../../.env');
  if (!fs.existsSync(envPath)) {
    console.error('   ❌ .env file not found!');
    console.error('   Create .env file with DATABASE_URL');
    process.exit(1);
  }
  console.log('   ✅ .env file exists');
  
  // Check 2: DATABASE_URL
  console.log('\n2️⃣  Checking DATABASE_URL...');
  if (!process.env.DATABASE_URL) {
    console.error('   ❌ DATABASE_URL not set in .env');
    console.error('   Add: DATABASE_URL="your_connection_string"');
    process.exit(1);
  }
  const dbUrl = process.env.DATABASE_URL;
  const dbHost = dbUrl.split('@')[1]?.split('/')[0] || 'unknown';
  console.log('   ✅ DATABASE_URL is set');
  console.log(`   📍 Database: ${dbHost}`);
  
  // Check 3: SQL file
  console.log('\n3️⃣  Checking SQL file...');
  if (!fs.existsSync(SQL_FILE)) {
    console.error(`   ❌ SQL file not found: ${SQL_FILE}`);
    process.exit(1);
  }
  const fileSize = fs.statSync(SQL_FILE).size / (1024 * 1024);
  console.log(`   ✅ SQL file found: ${path.basename(SQL_FILE)}`);
  console.log(`   📏 Size: ${fileSize.toFixed(1)} MB`);
  
  // Check 4: Database connection
  console.log('\n4️⃣  Testing database connection...');
  const sql = postgres(dbUrl, {
    max: 1,
    connect_timeout: 30,
  });
  
  try {
    await sql`SELECT 1`;
    console.log('   ✅ Database connection successful');
  } catch (error) {
    console.error(`   ❌ Database connection failed: ${error.message}`);
    await sql.end();
    process.exit(1);
  }
  
  // Check 5: Current database state
  console.log('\n5️⃣  Checking current database state...');
  try {
    const [leads] = await sql`SELECT COUNT(*) as count FROM leads`;
    const [responses] = await sql`SELECT COUNT(*) as count FROM lead_responses`;
    const leadsCount = Number(leads.count);
    const responsesCount = Number(responses.count);
    
    console.log(`   📊 Current leads: ${leadsCount.toLocaleString()}`);
    console.log(`   📊 Current responses: ${responsesCount.toLocaleString()}`);
    
    if (leadsCount >= 47000 && responsesCount >= 450000) {
      console.log('\n   ✅✅✅ DATA ALREADY IMPORTED! ✅✅✅');
      console.log('   Migration is complete!');
      await sql.end();
      return;
    } else if (leadsCount > 0) {
      const progress = Math.round((leadsCount / 47159) * 100);
      console.log(`\n   ⏳ Partial import: ${progress}% complete`);
      console.log('   Will continue import...');
    } else {
      console.log('\n   ℹ️  No data yet - will import now');
    }
  } catch (e) {
    if (e.message.includes('does not exist')) {
      console.log('   ℹ️  Tables will be created during import');
    } else {
      console.log(`   ⚠️  ${e.message}`);
    }
  }
  
  // Start import
  console.log('\n');
  console.log('='.repeat(60));
  console.log('🚀 STARTING DATA IMPORT');
  console.log('='.repeat(60));
  console.log('');
  console.log('⏳ This will take 10-20 minutes...');
  console.log('📊 Progress updates every 500 statements');
  console.log('');
  
  // Read SQL file
  console.log('📖 Reading SQL file...');
  const sqlContent = fs.readFileSync(SQL_FILE, 'utf8');
  console.log(`✅ Read ${(sqlContent.length / 1024 / 1024).toFixed(1)} MB`);
  
  // Parse statements
  console.log('🔧 Parsing SQL statements...');
  const statements = [];
  let current = '';
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < sqlContent.length; i++) {
    const char = sqlContent[i];
    
    if ((char === '"' || char === "'") && sqlContent[i - 1] !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
    }
    
    current += char;
    
    if (char === ';' && !inString) {
      const trimmed = current.trim();
      if (trimmed && !trimmed.startsWith('--') && trimmed.length > 5) {
        statements.push(trimmed);
      }
      current = '';
    }
  }
  
  if (current.trim()) {
    statements.push(current.trim());
  }
  
  console.log(`✅ Found ${statements.length.toLocaleString()} statements\n`);
  console.log('🚀 Executing statements...\n');
  
  let executed = 0;
  let errors = 0;
  const startTime = Date.now();
  const criticalErrors = [];
  
  for (let i = 0; i < statements.length; i++) {
    try {
      await sql.unsafe(statements[i]);
      executed++;
      
      if (executed % 500 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        const percent = ((executed / statements.length) * 100).toFixed(1);
        const rate = (executed / ((Date.now() - startTime) / 1000)).toFixed(0);
        console.log(`⏳ Progress: ${executed.toLocaleString()}/${statements.length.toLocaleString()} (${percent}%, ${elapsed}s, ~${rate}/sec, ${errors} errors)`);
      }
    } catch (error) {
      errors++;
      const msg = error.message.toLowerCase();
      const ignoreErrors = ['already exists', 'duplicate key', 'does not exist', 'relation', 'syntax error'];
      
      if (!ignoreErrors.some(ignore => msg.includes(ignore))) {
        if (criticalErrors.length < 5) {
          criticalErrors.push(error.message.substring(0, 100));
        }
      }
    }
  }
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log('\n✅ Import complete!');
  console.log(`   • Executed: ${executed.toLocaleString()}`);
  console.log(`   • Errors: ${errors}`);
  console.log(`   • Time: ${elapsed}s\n`);
  
  // Verify
  console.log('🔍 Verifying import...');
  const [leads] = await sql`SELECT COUNT(*) as count FROM leads`;
  const [responses] = await sql`SELECT COUNT(*) as count FROM lead_responses`;
  
  const leadsCount = Number(leads.count);
  const responsesCount = Number(responses.count);
  
  console.log(`\n📊 FINAL RESULTS:`);
  console.log(`   • Leads: ${leadsCount.toLocaleString()} / 47,159 expected`);
  console.log(`   • Responses: ${responsesCount.toLocaleString()} / 455,940 expected\n`);
  
  if (leadsCount >= 47000 && responsesCount >= 450000) {
    console.log('🎉🎉🎉 SUCCESS! Migration complete! 🎉🎉🎉');
    console.log('   Your dashboard will now show all the data!');
  } else if (leadsCount > 0) {
    console.log(`⚠️  Partial import: ${Math.round((leadsCount / 47159) * 100)}% complete`);
  } else {
    console.log('❌ No data imported. Check errors above.');
  }
  
  await sql.end();
}

diagnoseAndFix().catch((error) => {
  console.error('\n❌ FATAL ERROR:', error.message);
  console.error(error.stack);
  process.exit(1);
});
