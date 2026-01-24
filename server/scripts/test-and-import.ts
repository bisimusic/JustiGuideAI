#!/usr/bin/env ts-node

/**
 * TEST AND IMPORT - Shows all output clearly
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SQL_FILE = path.join(
  __dirname,
  '../../JustiGuideAI 3/server/scripts/exports/production-import-2025-10-30.sql'
);

async function testAndImport() {
  console.log('\n');
  console.log('🚀 TESTING AND STARTING IMPORT');
  console.log('='.repeat(60));
  console.log('');
  
  // Test 1: Check .env
  console.log('1️⃣  Checking .env file...');
  if (!fs.existsSync(path.join(__dirname, '../../.env'))) {
    console.error('   ❌ .env file not found!');
    console.error('   Create .env file with DATABASE_URL');
    process.exit(1);
  }
  console.log('   ✅ .env file exists');
  
  // Test 2: Check DATABASE_URL
  console.log('\n2️⃣  Checking DATABASE_URL...');
  if (!process.env.DATABASE_URL) {
    console.error('   ❌ DATABASE_URL not set in .env');
    console.error('   Add: DATABASE_URL="your_connection_string"');
    process.exit(1);
  }
  console.log('   ✅ DATABASE_URL is set');
  const dbHost = process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'unknown';
  console.log(`   📍 Database: ${dbHost}`);
  
  // Test 3: Check SQL file
  console.log('\n3️⃣  Checking SQL file...');
  if (!fs.existsSync(SQL_FILE)) {
    console.error(`   ❌ SQL file not found: ${SQL_FILE}`);
    process.exit(1);
  }
  const fileSize = fs.statSync(SQL_FILE).size / (1024 * 1024);
  console.log(`   ✅ SQL file found: ${path.basename(SQL_FILE)}`);
  console.log(`   📏 Size: ${fileSize.toFixed(1)} MB`);
  
  // Test 4: Test database connection
  console.log('\n4️⃣  Testing database connection...');
  const sql = postgres(process.env.DATABASE_URL, {
    max: 1,
    idle_timeout: 0,
    connect_timeout: 30,
  });
  
  try {
    await sql`SELECT 1`;
    console.log('   ✅ Database connection successful');
  } catch (error: any) {
    console.error(`   ❌ Database connection failed: ${error.message}`);
    await sql.end();
    process.exit(1);
  }
  
  // Test 5: Check current state
  console.log('\n5️⃣  Checking current database state...');
  try {
    const [leads] = await sql`SELECT COUNT(*) as count FROM leads`;
    const count = Number(leads.count);
    console.log(`   📊 Current leads: ${count.toLocaleString()}`);
    
    if (count >= 47000) {
      console.log('\n   ✅✅✅ DATA ALREADY IMPORTED! ✅✅✅');
      console.log('   No need to import again.');
      await sql.end();
      return;
    } else if (count > 0) {
      const progress = Math.round((count / 47159) * 100);
      console.log(`   ⏳ Partial import: ${progress}% complete`);
      console.log('   Will continue import...');
    } else {
      console.log('   ℹ️  No data yet - will import now');
    }
  } catch (e: any) {
    if (e.message.includes('does not exist')) {
      console.log('   ℹ️  Tables will be created during import');
    } else {
      console.log(`   ⚠️  ${e.message}`);
    }
  }
  
  // Start import
  console.log('\n');
  console.log('='.repeat(60));
  console.log('📥 STARTING DATA IMPORT');
  console.log('='.repeat(60));
  console.log('');
  console.log('⏳ This will take 10-20 minutes...');
  console.log('📊 You will see progress updates every 500 statements');
  console.log('');
  
  // Read SQL file
  console.log('📖 Reading SQL file...');
  const sqlContent = fs.readFileSync(SQL_FILE, 'utf8');
  console.log(`✅ Read ${(sqlContent.length / 1024 / 1024).toFixed(1)} MB`);
  
  // Parse statements
  console.log('🔧 Parsing SQL statements...');
  const statements: string[] = [];
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
  
  console.log(`✅ Found ${statements.length.toLocaleString()} SQL statements`);
  console.log('');
  console.log('🚀 Executing statements...');
  console.log('');
  
  let executed = 0;
  let errors = 0;
  const startTime = Date.now();
  const errorMessages: string[] = [];
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    try {
      await sql.unsafe(statement);
      executed++;
      
      if (executed % 500 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        const percent = ((executed / statements.length) * 100).toFixed(1);
        const rate = (executed / ((Date.now() - startTime) / 1000)).toFixed(0);
        console.log(`⏳ Progress: ${executed.toLocaleString()}/${statements.length.toLocaleString()} (${percent}%, ${elapsed}s, ~${rate}/sec, ${errors} errors)`);
      }
    } catch (error: any) {
      errors++;
      const msg = error.message.toLowerCase();
      
      const ignoreErrors = [
        'already exists',
        'duplicate key',
        'relation.*does not exist',
        'syntax error',
        'permission denied',
      ];
      
      const shouldIgnore = ignoreErrors.some(pattern => 
        msg.includes(pattern) || new RegExp(pattern).test(msg)
      );
      
      if (!shouldIgnore && errorMessages.length < 10) {
        errorMessages.push(error.message.substring(0, 100));
      }
    }
  }
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log('');
  console.log('='.repeat(60));
  console.log('✅ IMPORT COMPLETE!');
  console.log('='.repeat(60));
  console.log('');
  console.log(`📊 Statistics:`);
  console.log(`   • Statements executed: ${executed.toLocaleString()}`);
  console.log(`   • Errors: ${errors}`);
  console.log(`   • Time: ${elapsed} seconds`);
  console.log('');
  
  // Verify
  console.log('🔍 Verifying import...');
  const [leads] = await sql`SELECT COUNT(*) as count FROM leads`;
  const [responses] = await sql`SELECT COUNT(*) as count FROM lead_responses`;
  
  const leadsCount = Number(leads.count);
  const responsesCount = Number(responses.count);
  
  console.log('');
  console.log('='.repeat(60));
  console.log('📊 FINAL RESULTS');
  console.log('='.repeat(60));
  console.log('');
  console.log(`   Leads: ${leadsCount.toLocaleString()} / 47,159 expected`);
  console.log(`   Responses: ${responsesCount.toLocaleString()} / 455,940 expected`);
  console.log('');
  
  if (leadsCount >= 47000 && responsesCount >= 450000) {
    console.log('🎉🎉🎉 SUCCESS! Import is complete! 🎉🎉🎉');
    console.log('');
    console.log('✅ Your dashboard will now show all the data!');
    console.log('   Refresh: http://localhost:3002/admin/dashboard');
  } else if (leadsCount > 0) {
    console.log(`⚠️  Partial import: ${Math.round((leadsCount / 47159) * 100)}% complete`);
    console.log('   Some data imported, but not all.');
  } else {
    console.log('❌ No data imported. Check errors above.');
  }
  
  console.log('');
  
  await sql.end();
}

testAndImport().catch((error) => {
  console.error('\n❌ FATAL ERROR:', error.message);
  console.error('\nStack trace:', error.stack);
  process.exit(1);
});
