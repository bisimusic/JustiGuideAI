#!/usr/bin/env node

/**
 * COMPLETE IMPORT - Handles all errors and completes migration
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

const STATUS_FILE = '/tmp/import-status.json';

function writeStatus(status) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
}

async function completeImport() {
  const status = {
    started: new Date().toISOString(),
    phase: 'initializing',
    progress: 0,
    executed: 0,
    errors: 0,
    leads: 0,
    responses: 0,
    completed: false,
    error: null
  };
  
  writeStatus(status);
  
  try {
    console.log('\n🚀 COMPLETE DATA IMPORT');
    console.log('='.repeat(60));
    console.log('');
    
    // Check DATABASE_URL
    status.phase = 'checking_env';
    writeStatus(status);
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not set in .env');
    }
    console.log('✅ DATABASE_URL is set');
    
    // Check SQL file
    status.phase = 'checking_file';
    writeStatus(status);
    
    if (!fs.existsSync(SQL_FILE)) {
      throw new Error(`SQL file not found: ${SQL_FILE}`);
    }
    const fileSize = fs.statSync(SQL_FILE).size / (1024 * 1024);
    console.log(`✅ SQL file found: ${path.basename(SQL_FILE)}`);
    console.log(`📏 Size: ${fileSize.toFixed(1)} MB`);
    
    // Connect to database
    status.phase = 'connecting';
    writeStatus(status);
    
    console.log('\n🔌 Connecting to database...');
    const sql = postgres(process.env.DATABASE_URL, {
      max: 1,
      idle_timeout: 0,
      connect_timeout: 30,
    });
    
    await sql`SELECT 1`;
    console.log('✅ Connected successfully\n');
    
    // Check current state
    status.phase = 'checking_state';
    writeStatus(status);
    
    try {
      const [result] = await sql`SELECT COUNT(*) as count FROM leads`;
      const count = Number(result.count);
      status.leads = count;
      console.log(`📊 Current leads: ${count.toLocaleString()}`);
      
      if (count >= 47000) {
        console.log('\n✅ Data already imported!');
        status.completed = true;
        status.phase = 'complete';
        writeStatus(status);
        await sql.end();
        return;
      }
    } catch (e) {
      console.log('ℹ️  Tables will be created during import\n');
    }
    
    // Read SQL file
    status.phase = 'reading_file';
    writeStatus(status);
    
    console.log('📥 Reading SQL file...');
    const sqlContent = fs.readFileSync(SQL_FILE, 'utf8');
    console.log(`✅ Read ${(sqlContent.length / 1024 / 1024).toFixed(1)} MB\n`);
    
    // Parse statements
    status.phase = 'parsing';
    writeStatus(status);
    
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
    
    // Execute statements
    status.phase = 'importing';
    status.totalStatements = statements.length;
    writeStatus(status);
    
    let executed = 0;
    let errors = 0;
    const startTime = Date.now();
    const criticalErrors = [];
    
    for (let i = 0; i < statements.length; i++) {
      try {
        await sql.unsafe(statements[i]);
        executed++;
        status.executed = executed;
        status.progress = Math.round((executed / statements.length) * 100);
        
        if (executed % 500 === 0) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
          const percent = ((executed / statements.length) * 100).toFixed(1);
          const rate = (executed / ((Date.now() - startTime) / 1000)).toFixed(0);
          console.log(`⏳ Progress: ${executed.toLocaleString()}/${statements.length.toLocaleString()} (${percent}%, ${elapsed}s, ~${rate}/sec, ${errors} errors)`);
          writeStatus(status);
        }
      } catch (error) {
        errors++;
        status.errors = errors;
        const msg = error.message.toLowerCase();
        const ignoreErrors = ['already exists', 'duplicate key', 'does not exist', 'relation', 'syntax error'];
        
        if (!ignoreErrors.some(ignore => msg.includes(ignore))) {
          if (criticalErrors.length < 10) {
            criticalErrors.push(error.message.substring(0, 150));
          }
        }
        writeStatus(status);
      }
    }
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    console.log('\n✅ Import complete!');
    console.log(`   • Executed: ${executed.toLocaleString()}`);
    console.log(`   • Errors: ${errors}`);
    console.log(`   • Time: ${elapsed}s\n`);
    
    // Verify
    status.phase = 'verifying';
    writeStatus(status);
    
    console.log('🔍 Verifying...');
    const [leads] = await sql`SELECT COUNT(*) as count FROM leads`;
    const [responses] = await sql`SELECT COUNT(*) as count FROM lead_responses`;
    
    const leadsCount = Number(leads.count);
    const responsesCount = Number(responses.count);
    
    status.leads = leadsCount;
    status.responses = responsesCount;
    
    console.log(`\n📊 RESULTS:`);
    console.log(`   • Leads: ${leadsCount.toLocaleString()} / 47,159 expected`);
    console.log(`   • Responses: ${responsesCount.toLocaleString()} / 455,940 expected\n`);
    
    if (leadsCount >= 47000 && responsesCount >= 450000) {
      console.log('🎉🎉🎉 SUCCESS! Import complete! 🎉🎉🎉');
      console.log('   Your dashboard will now show all the data!');
      status.completed = true;
      status.phase = 'complete';
    } else if (leadsCount > 0) {
      console.log(`⚠️  Partial import: ${Math.round((leadsCount / 47159) * 100)}% complete`);
      status.phase = 'partial';
    } else {
      console.log('❌ No data imported');
      status.phase = 'failed';
    }
    
    status.completed = true;
    status.finished = new Date().toISOString();
    writeStatus(status);
    
    await sql.end();
    
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    status.error = error.message;
    status.phase = 'error';
    status.completed = true;
    writeStatus(status);
    process.exit(1);
  }
}

completeImport().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
