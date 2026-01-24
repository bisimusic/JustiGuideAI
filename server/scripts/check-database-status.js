#!/usr/bin/env node

/**
 * Check database connection and provide helpful error messages
 */

require('dotenv').config();
const postgres = require('postgres');

async function checkDatabase() {
  console.log('\n🔍 CHECKING DATABASE STATUS');
  console.log('='.repeat(60));
  console.log('');
  
  // Check .env
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in .env file');
    console.error('');
    console.error('📝 Fix: Add DATABASE_URL to your .env file');
    console.error('   Example: DATABASE_URL="postgresql://user:pass@host/db"');
    process.exit(1);
  }
  
  const dbUrl = process.env.DATABASE_URL;
  console.log('✅ DATABASE_URL is set');
  
  // Parse connection details
  try {
    const url = new URL(dbUrl.replace(/^postgresql:/, 'http:'));
    const host = url.hostname;
    console.log(`📍 Database Host: ${host}`);
    
    if (host.includes('neon.tech')) {
      console.log('   ℹ️  Neon database detected');
    } else if (host.includes('supabase')) {
      console.log('   ℹ️  Supabase database detected');
    } else if (host.includes('railway')) {
      console.log('   ℹ️  Railway database detected');
    }
  } catch (e) {
    // Ignore parsing errors
  }
  
  console.log('');
  console.log('🔌 Testing connection...');
  
  const sql = postgres(dbUrl, {
    max: 1,
    connect_timeout: 10,
  });
  
  try {
    await sql`SELECT 1`;
    console.log('✅ Database connection successful!');
    console.log('');
    
    // Try to get counts
    try {
      const [leads] = await sql`SELECT COUNT(*) as count FROM leads`;
      const [responses] = await sql`SELECT COUNT(*) as count FROM lead_responses`;
      const leadsCount = Number(leads.count);
      const responsesCount = Number(responses.count);
      
      console.log('📊 Current Database State:');
      console.log(`   Leads: ${leadsCount.toLocaleString()}`);
      console.log(`   Responses: ${responsesCount.toLocaleString()}`);
      console.log('');
      
      if (leadsCount >= 47000 && responsesCount >= 450000) {
        console.log('✅✅✅ MIGRATION COMPLETE! ✅✅✅');
        console.log('   All data has been imported successfully!');
      } else if (leadsCount > 0) {
        const progress = Math.round((leadsCount / 47159) * 100);
        console.log(`⏳ Migration in progress: ${progress}%`);
        console.log('   Run: node server/scripts/diagnose-and-fix.js to continue');
      } else {
        console.log('ℹ️  No data yet - ready to import');
        console.log('   Run: node server/scripts/diagnose-and-fix.js');
      }
    } catch (e) {
      console.log('ℹ️  Tables may not exist yet - ready to import');
      console.log('   Run: node server/scripts/diagnose-and-fix.js');
    }
    
    await sql.end();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('');
    console.error(`   Error: ${error.message}`);
    console.error('');
    
    // Provide helpful error messages
    if (error.message.includes('disabled') || error.message.includes('endpoint')) {
      console.error('🔧 FIX REQUIRED: Database endpoint is disabled');
      console.error('');
      console.error('📝 Steps to fix:');
      console.error('   1. Go to https://console.neon.tech');
      console.error('   2. Log in to your account');
      console.error('   3. Navigate to your project');
      console.error('   4. Go to Settings → Connection Details');
      console.error('   5. Look for "Endpoint Status" or "Suspend/Resume"');
      console.error('   6. Click "Resume" or "Enable" if suspended');
      console.error('   7. Or copy a fresh connection string');
      console.error('   8. Update DATABASE_URL in .env file');
      console.error('');
      console.error('   Then run this script again to verify.');
    } else if (error.message.includes('password') || error.message.includes('authentication')) {
      console.error('🔧 FIX: Check your database credentials');
      console.error('   Verify DATABASE_URL in .env file is correct');
    } else if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
      console.error('🔧 FIX: Database may be unreachable');
      console.error('   Check network connection and firewall settings');
    } else {
      console.error('🔧 FIX: Check your DATABASE_URL');
      console.error('   Verify the connection string is correct');
    }
    
    await sql.end();
    process.exit(1);
  }
}

checkDatabase().catch((error) => {
  console.error('\n❌ FATAL ERROR:', error.message);
  process.exit(1);
});
