#!/usr/bin/env node

/**
 * Direct Node.js import script (no TypeScript compilation needed)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

// Fix path - go up to parent directory first
const SQL_FILE = path.join(
  __dirname,
  '../../../JustiGuideAI 3/server/scripts/exports/production-import-2025-10-30.sql'
);

async function runImport() {
  console.log('\n🚀 STARTING DATA IMPORT');
  console.log('='.repeat(60));
  console.log('');
  
  // Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL not set in .env');
    process.exit(1);
  }
  console.log('✅ DATABASE_URL is set');
  
  // Check SQL file
  if (!fs.existsSync(SQL_FILE)) {
    console.error(`❌ ERROR: SQL file not found: ${SQL_FILE}`);
    process.exit(1);
  }
  const fileSize = fs.statSync(SQL_FILE).size / (1024 * 1024);
  console.log(`✅ SQL file found: ${path.basename(SQL_FILE)}`);
  console.log(`📏 Size: ${fileSize.toFixed(1)} MB`);
  
  // Connect to database
  console.log('\n🔌 Connecting to database...');
  const sql = postgres(process.env.DATABASE_URL, {
    max: 1,
    idle_timeout: 0,
    connect_timeout: 30,
  });
  
  try {
    await sql`SELECT 1`;
    console.log('✅ Connected successfully\n');
    
    // Check current state
    try {
      const [result] = await sql`SELECT COUNT(*) as count FROM leads`;
      const count = Number(result.count);
      console.log(`📊 Current leads: ${count.toLocaleString()}`);
      
      if (count >= 47000) {
        console.log('\n✅ Data already imported!');
        await sql.end();
        return;
      }
    } catch (e) {
      console.log('ℹ️  Tables will be created during import\n');
    }
    
    // Read SQL file
    console.log('📥 Reading SQL file...');
    const sqlContent = fs.readFileSync(SQL_FILE, 'utf8');
    console.log(`✅ Read ${(sqlContent.length / 1024 / 1024).toFixed(1)} MB\n`);
    
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
    console.log('🚀 Executing statements...');
    console.log('⏳ This will take 10-20 minutes...\n');
    
    let executed = 0;
    let errors = 0;
    const startTime = Date.now();
    
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
        const ignoreErrors = ['already exists', 'duplicate key', 'does not exist'];
        if (!ignoreErrors.some(ignore => msg.includes(ignore)) && errors <= 5) {
          console.error(`⚠️  Error: ${error.message.substring(0, 100)}`);
        }
      }
    }
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    console.log('\n✅ Import complete!');
    console.log(`   • Executed: ${executed.toLocaleString()}`);
    console.log(`   • Errors: ${errors}`);
    console.log(`   • Time: ${elapsed}s\n`);
    
    // Verify
    console.log('🔍 Verifying...');
    const [leads] = await sql`SELECT COUNT(*) as count FROM leads`;
    const [responses] = await sql`SELECT COUNT(*) as count FROM lead_responses`;
    
    const leadsCount = Number(leads.count);
    const responsesCount = Number(responses.count);
    
    console.log(`\n📊 RESULTS:`);
    console.log(`   • Leads: ${leadsCount.toLocaleString()} / 47,159 expected`);
    console.log(`   • Responses: ${responsesCount.toLocaleString()} / 455,940 expected\n`);
    
    if (leadsCount >= 47000 && responsesCount >= 450000) {
      console.log('🎉🎉🎉 SUCCESS! Import complete! 🎉🎉🎉');
      console.log('   Your dashboard will now show all the data!');
    }
    
    await sql.end();
    
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    await sql.end();
    process.exit(1);
  }
}

runImport().catch(console.error);
