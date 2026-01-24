#!/usr/bin/env node

require('dotenv').config();
const postgres = require('postgres');

async function quickStatus() {
  console.log('\n📊 MIGRATION STATUS CHECK');
  console.log('='.repeat(60));
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }
  
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  
  try {
    const [leads] = await sql`SELECT COUNT(*) as count FROM leads`;
    const [responses] = await sql`SELECT COUNT(*) as count FROM lead_responses`;
    
    const leadsCount = Number(leads.count);
    const responsesCount = Number(responses.count);
    
    console.log(`\nLeads: ${leadsCount.toLocaleString()} / 47,159 expected`);
    console.log(`Responses: ${responsesCount.toLocaleString()} / 455,940 expected\n`);
    
    if (leadsCount >= 47000 && responsesCount >= 450000) {
      console.log('✅✅✅ MIGRATION COMPLETE! ✅✅✅\n');
    } else if (leadsCount > 0) {
      const progress = Math.round((leadsCount / 47159) * 100);
      console.log(`⏳ Migration in progress: ${progress}%\n`);
    } else {
      console.log('❌ No data - migration not started');
      console.log('   Run: node server/scripts/diagnose-and-fix.js\n');
    }
    
    await sql.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sql.end();
    process.exit(1);
  }
}

quickStatus().catch(console.error);
