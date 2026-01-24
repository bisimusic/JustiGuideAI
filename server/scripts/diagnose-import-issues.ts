#!/usr/bin/env ts-node

/**
 * DIAGNOSTIC: Check why import has been failing for 2 days
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function diagnose() {
  console.log('\n🔍 DIAGNOSING IMPORT ISSUES');
  console.log('='.repeat(60));
  
  const issues: string[] = [];
  const fixes: string[] = [];
  
  // 1. Check .env file
  console.log('\n1️⃣  Checking .env file...');
  if (!fs.existsSync(path.join(__dirname, '../../.env'))) {
    issues.push('❌ .env file not found');
    fixes.push('Create .env file with DATABASE_URL');
  } else {
    console.log('   ✅ .env file exists');
  }
  
  // 2. Check DATABASE_URL
  console.log('\n2️⃣  Checking DATABASE_URL...');
  if (!process.env.DATABASE_URL) {
    issues.push('❌ DATABASE_URL not set in environment');
    fixes.push('Add DATABASE_URL="postgresql://..." to .env file');
  } else {
    console.log('   ✅ DATABASE_URL is set');
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl.includes('neon.tech')) {
      console.log('   ✅ Looks like Neon database URL');
    }
  }
  
  // 3. Test database connection
  console.log('\n3️⃣  Testing database connection...');
  if (process.env.DATABASE_URL) {
    try {
      const sql = postgres(process.env.DATABASE_URL, { max: 1, connect_timeout: 10 });
      await sql`SELECT 1`;
      console.log('   ✅ Database connection successful');
      await sql.end();
    } catch (error: any) {
      issues.push(`❌ Database connection failed: ${error.message}`);
      fixes.push('Check DATABASE_URL is correct and database is accessible');
    }
  }
  
  // 4. Check SQL file
  console.log('\n4️⃣  Checking SQL file...');
  const sqlFile = path.join(__dirname, '../../JustiGuideAI 3/server/scripts/exports/production-import-2025-10-30.sql');
  if (!fs.existsSync(sqlFile)) {
    issues.push(`❌ SQL file not found: ${sqlFile}`);
    fixes.push('Make sure JustiGuideAI 3 is in parent directory');
  } else {
    const stats = fs.statSync(sqlFile);
    console.log(`   ✅ SQL file exists`);
    console.log(`   📏 Size: ${(stats.size / 1024 / 1024).toFixed(1)} MB`);
    
    // Check if file is readable
    try {
      const sample = fs.readFileSync(sqlFile, 'utf8').substring(0, 100);
      if (sample.includes('CREATE TABLE') || sample.includes('INSERT INTO')) {
        console.log('   ✅ File appears to be valid SQL');
      } else {
        issues.push('⚠️  SQL file may be corrupted or empty');
      }
    } catch (error: any) {
      issues.push(`❌ Cannot read SQL file: ${error.message}`);
    }
  }
  
  // 5. Check current database state
  console.log('\n5️⃣  Checking current database state...');
  if (process.env.DATABASE_URL) {
    try {
      const sql = postgres(process.env.DATABASE_URL, { max: 1 });
      try {
        const [result] = await sql`SELECT COUNT(*) as count FROM leads`;
        const count = Number(result.count);
        console.log(`   📊 Current leads: ${count.toLocaleString()}`);
        if (count >= 47000) {
          console.log('   ✅ Data already imported!');
        } else if (count > 0) {
          console.log(`   ⚠️  Partial import: ${Math.round((count / 47159) * 100)}%`);
        } else {
          console.log('   ⚠️  No data - import needed');
        }
      } catch (e: any) {
        if (e.message.includes('does not exist')) {
          console.log('   ℹ️  Tables don\'t exist yet (will be created)');
        } else {
          issues.push(`❌ Cannot query database: ${e.message}`);
        }
      }
      await sql.end();
    } catch (error: any) {
      issues.push(`❌ Database error: ${error.message}`);
    }
  }
  
  // 6. Check Node modules
  console.log('\n6️⃣  Checking dependencies...');
  const packageJson = path.join(__dirname, '../../package.json');
  if (fs.existsSync(packageJson)) {
    const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
    if (pkg.dependencies?.postgres || pkg.dependencies?.['@neondatabase/serverless']) {
      console.log('   ✅ postgres package found');
    } else {
      issues.push('❌ postgres package not found in package.json');
      fixes.push('Run: npm install postgres');
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 DIAGNOSIS SUMMARY');
  console.log('='.repeat(60));
  
  if (issues.length === 0) {
    console.log('\n✅ No issues found! Everything looks good.');
    console.log('\n💡 Try running: npx ts-node server/scripts/working-import.ts');
  } else {
    console.log(`\n❌ Found ${issues.length} issue(s):\n`);
    issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
    
    console.log(`\n🔧 Fixes needed:\n`);
    fixes.forEach((fix, i) => {
      console.log(`   ${i + 1}. ${fix}`);
    });
  }
  
  console.log('\n');
}

diagnose().catch(console.error);
