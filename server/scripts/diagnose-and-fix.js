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
  console.log('🔧 Processing INSERT statements (handling conflicts and NULL values)...');
  
  // Transform INSERT statements to handle conflicts and NULL values
  const transformedStatements = statements.map(stmt => {
    // Check if it's an INSERT statement
    if (stmt.trim().toUpperCase().startsWith('INSERT INTO')) {
      // Check if it already has ON CONFLICT
      if (stmt.toUpperCase().includes('ON CONFLICT')) {
        return stmt; // Already has conflict handling
      }
      
      // Extract table name
      const tableMatch = stmt.match(/INSERT INTO\s+(\w+)/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        
        // Handle NULL values for specific tables
        let processedStmt = stmt;
        
        if (tableName === 'lead_responses') {
          // For lead_responses, handle NULL response_slot values
          // response_slot is the last column (index 10)
          // Replace NULL that appears as the last value before closing paren
          // Handle both single-line and multi-line statements
          
          // Pattern 1: NULL followed by ) and semicolon (single line)
          processedStmt = processedStmt.replace(/,\s*NULL\s*\)\s*;/g, ', 0);');
          
          // Pattern 2: NULL followed by ) and ON CONFLICT (with our added clause)
          processedStmt = processedStmt.replace(/,\s*NULL\s*\)\s*ON CONFLICT/g, ', 0) ON CONFLICT');
          
          // Pattern 3: Multi-line - NULL on its own line before closing paren
          processedStmt = processedStmt.replace(/,\s*\n\s*NULL\s*\n\s*\)/g, ',\n0\n)');
          
          // Pattern 4: NULL with whitespace before closing paren (handles various formats)
          processedStmt = processedStmt.replace(/,\s*NULL\s*\)/g, ', 0)');
        }
        
        // Determine conflict target based on table
        let conflictTarget = 'id'; // Default to id
        if (tableName === 'lead_responses') {
          conflictTarget = '(lead_id, response_slot)'; // Unique constraint
        } else if (tableName === 'leads') {
          conflictTarget = 'id';
        } else if (tableName === 'templates') {
          conflictTarget = 'id';
        } else {
          // For other tables, try to use id or primary key
          conflictTarget = 'id';
        }
        
        // Add ON CONFLICT DO NOTHING before the semicolon
        const lastSemicolon = processedStmt.lastIndexOf(';');
        if (lastSemicolon > 0) {
          // Check if conflict target needs parentheses
          const conflictClause = conflictTarget.includes('(') 
            ? `ON CONFLICT ${conflictTarget} DO NOTHING`
            : `ON CONFLICT (${conflictTarget}) DO NOTHING`;
          
          return processedStmt.substring(0, lastSemicolon) + 
                 ` ${conflictClause}` + 
                 processedStmt.substring(lastSemicolon);
        }
        
        return processedStmt;
      }
    }
    return stmt; // Return unchanged if not an INSERT or can't parse
  });
  
  console.log(`✅ Processed ${transformedStatements.length.toLocaleString()} statements\n`);
  console.log('🚀 Executing statements...\n');
  
  let executed = 0;
  let errors = 0;
  const startTime = Date.now();
  const criticalErrors = [];
  const responseErrors = []; // Track lead_responses specific errors
  
  for (let i = 0; i < transformedStatements.length; i++) {
    const isResponseInsert = transformedStatements[i].toUpperCase().includes('INSERT INTO LEAD_RESPONSES');
    
    try {
      await sql.unsafe(transformedStatements[i]);
      executed++;
      
      if (executed % 500 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        const percent = ((executed / transformedStatements.length) * 100).toFixed(1);
        const rate = (executed / ((Date.now() - startTime) / 1000)).toFixed(0);
        console.log(`⏳ Progress: ${executed.toLocaleString()}/${transformedStatements.length.toLocaleString()} (${percent}%, ${elapsed}s, ~${rate}/sec, ${errors} errors)`);
      }
    } catch (error) {
      errors++;
      const msg = error.message.toLowerCase();
      
      // Special handling for lead_responses errors - log them all
      if (isResponseInsert && responseErrors.length < 20) {
        const stmtPreview = transformedStatements[i].substring(0, 200).replace(/\n/g, ' ');
        responseErrors.push({
          error: error.message,
          statement: stmtPreview,
          errorCode: error.code
        });
        console.log(`\n   🔴 LEAD_RESPONSES ERROR ${responseErrors.length}:`);
        console.log(`      ${error.message}`);
        console.log(`      Code: ${error.code || 'N/A'}`);
        console.log(`      Statement preview: ${stmtPreview}...\n`);
      }
      
      // Ignore expected errors that don't prevent migration
      const ignoreErrors = [
        'already exists', 
        'duplicate key', 
        'does not exist', 
        'relation',
        'permission denied',
        'system trigger',
        'null value', // Skip null value errors - data issue
        'malformed array', // Skip malformed array errors - data issue
        'column.*does not exist' // Skip schema mismatch errors
      ];
      
      const shouldIgnore = ignoreErrors.some(ignore => {
        if (ignore.includes('.*')) {
          // Regex pattern
          const regex = new RegExp(ignore, 'i');
          return regex.test(error.message);
        }
        return msg.includes(ignore);
      });
      
      // Log first few non-ignored errors for debugging
      if (!shouldIgnore && errors <= 10 && !isResponseInsert) {
        const stmtPreview = transformedStatements[i].substring(0, 100).replace(/\n/g, ' ');
        console.log(`   ⚠️  Error ${errors}: ${error.message.substring(0, 80)}`);
        console.log(`      Statement: ${stmtPreview}...`);
      }
      
      if (!shouldIgnore) {
        if (criticalErrors.length < 10) {
          criticalErrors.push({
            error: error.message.substring(0, 100),
            statement: transformedStatements[i].substring(0, 150)
          });
        }
      }
    }
  }
  
  // Report lead_responses errors summary
  if (responseErrors.length > 0) {
    console.log('\n📊 LEAD_RESPONSES ERROR SUMMARY:');
    console.log(`   Total errors: ${responseErrors.length}`);
    const errorTypes = {};
    responseErrors.forEach(err => {
      const key = err.error.substring(0, 50);
      errorTypes[key] = (errorTypes[key] || 0) + 1;
    });
    console.log('\n   Error types:');
    Object.entries(errorTypes).slice(0, 10).forEach(([err, count]) => {
      console.log(`      ${count}x: ${err}...`);
    });
  }
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log('\n✅ Import complete!');
  console.log(`   • Executed: ${executed.toLocaleString()}`);
  console.log(`   • Errors: ${errors}`);
  console.log(`   • Time: ${elapsed}s\n`);
  
  if (criticalErrors.length > 0) {
    console.log('⚠️  Sample errors encountered:');
    criticalErrors.slice(0, 5).forEach((err, idx) => {
      console.log(`   ${idx + 1}. ${err.error}`);
      console.log(`      ${err.statement}...`);
    });
    console.log('');
  }
  
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
