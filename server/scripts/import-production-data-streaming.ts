#!/usr/bin/env ts-node

/**
 * Streaming import of production data (alternative method)
 * 
 * This script reads the SQL file in chunks and executes commands
 * to avoid memory issues with large files.
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
  process.exit(1);
}

async function importStreaming() {
  console.log('📊 STREAMING PRODUCTION DATA IMPORT');
  console.log('='.repeat(60));
  
  if (!fs.existsSync(PRODUCTION_SQL_FILE)) {
    console.error(`❌ File not found: ${PRODUCTION_SQL_FILE}`);
    process.exit(1);
  }
  
  const fileSize = fs.statSync(PRODUCTION_SQL_FILE).size;
  console.log(`\n✅ File: ${path.basename(PRODUCTION_SQL_FILE)}`);
  console.log(`📏 Size: ${(fileSize / (1024 * 1024)).toFixed(1)} MB\n`);
  
  const sql = postgres(DATABASE_URL);
  
  try {
    // Test connection
    await sql`SELECT 1`;
    console.log('✅ Database connected\n');
    
    // Read file line by line
    const fileStream = fs.createReadStream(PRODUCTION_SQL_FILE);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    
    let currentStatement = '';
    let statementsExecuted = 0;
    let linesProcessed = 0;
    
    console.log('📥 Starting streaming import...\n');
    
    for await (const line of rl) {
      linesProcessed++;
      
      // Skip comments and empty lines
      if (line.trim().startsWith('--') || line.trim() === '') {
        continue;
      }
      
      currentStatement += line + '\n';
      
      // Execute when we hit a semicolon (end of statement)
      if (line.trim().endsWith(';')) {
        try {
          // Execute the statement
          await sql.unsafe(currentStatement.trim());
          statementsExecuted++;
          
          if (statementsExecuted % 1000 === 0) {
            process.stdout.write(`\r⏳ Processed ${statementsExecuted.toLocaleString()} statements...`);
          }
        } catch (error: any) {
          // Skip errors for statements that might already exist
          if (!error.message.includes('already exists') && 
              !error.message.includes('duplicate key')) {
            console.error(`\n⚠️  Error at line ${linesProcessed}: ${error.message.substring(0, 100)}`);
          }
        }
        
        currentStatement = '';
      }
    }
    
    console.log(`\n\n✅ Import complete!`);
    console.log(`   • Statements executed: ${statementsExecuted.toLocaleString()}`);
    console.log(`   • Lines processed: ${linesProcessed.toLocaleString()}`);
    
    // Verify
    console.log('\n📊 Verifying import...');
    const [leadsCount] = await sql`SELECT COUNT(*) as count FROM leads`;
    const [responsesCount] = await sql`SELECT COUNT(*) as count FROM lead_responses`;
    
    console.log(`\n✅ Verification:`);
    console.log(`   • Leads: ${Number(leadsCount.count).toLocaleString()}`);
    console.log(`   • Responses: ${Number(responsesCount.count).toLocaleString()}`);
    
    await sql.end();
    
    console.log('\n🎉 Import successful!');
    
  } catch (error: any) {
    console.error('\n❌ Import failed:', error.message);
    await sql.end();
    process.exit(1);
  }
}

importStreaming().catch(console.error);
