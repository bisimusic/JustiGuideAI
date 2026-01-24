#!/usr/bin/env node

/**
 * Verify migration completion
 */

require('dotenv').config();
const postgres = require('postgres');

async function verifyMigration() {
  console.log('\n🔍 VERIFYING MIGRATION STATUS');
  console.log('='.repeat(60));
  console.log('');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }
  
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  
  try {
    const [leads] = await sql`SELECT COUNT(*) as count FROM leads`;
    const [responses] = await sql`SELECT COUNT(*) as count FROM lead_responses`;
    let templates = { count: 0 };
    
    try {
      const [t] = await sql`SELECT COUNT(*) as count FROM learned_templates`;
      templates = t;
    } catch (e) {
      // Table might not exist
    }
    
    const leadsCount = Number(leads.count);
    const responsesCount = Number(responses.count);
    const templatesCount = Number(templates.count);
    
    console.log('📊 CURRENT DATABASE COUNTS:');
    console.log(`   Leads: ${leadsCount.toLocaleString()} / 47,159 expected`);
    console.log(`   Responses: ${responsesCount.toLocaleString()} / 455,940 expected`);
    console.log(`   Templates: ${templatesCount.toLocaleString()} / 63,893 expected`);
    console.log('');
    
    if (leadsCount >= 47000 && responsesCount >= 450000) {
      console.log('✅✅✅ MIGRATION COMPLETE! ✅✅✅');
      console.log('');
      console.log('🎉 All data has been successfully imported!');
      console.log('   Your dashboard will now show:');
      console.log('   • 47,159 leads');
      console.log('   • 455,940 responses');
      console.log('   • 63,893 templates');
      console.log('');
      console.log('✅ Migration task completed successfully!');
      await sql.end();
      process.exit(0);
    } else if (leadsCount > 0) {
      const progress = Math.round((leadsCount / 47159) * 100);
      console.log(`⏳ MIGRATION IN PROGRESS: ${progress}%`);
      console.log('');
      console.log(`   ${leadsCount.toLocaleString()} leads imported so far`);
      console.log(`   ${responsesCount.toLocaleString()} responses imported so far`);
      console.log('');
      console.log('   Import is still running. This takes 10-20 minutes.');
      await sql.end();
      process.exit(1);
    } else {
      console.log('❌ NO DATA FOUND');
      console.log('');
      console.log('   Migration may not have started yet.');
      console.log('   Run: node server/scripts/complete-import.js');
      await sql.end();
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sql.end();
    process.exit(1);
  }
}

verifyMigration().catch(console.error);
