#!/usr/bin/env ts-node

/**
 * Check import status and current database counts
 */

import 'dotenv/config';
import postgres from 'postgres';

async function checkStatus() {
  console.log('\n📊 IMPORT STATUS CHECK');
  console.log('='.repeat(60));
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }
  
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  
  try {
    // Check leads
    const [leads] = await sql`SELECT COUNT(*) as count FROM leads`;
    const leadsCount = Number(leads.count);
    
    // Check responses
    const [responses] = await sql`SELECT COUNT(*) as count FROM lead_responses`;
    const responsesCount = Number(responses.count);
    
    // Check templates
    let templatesCount = 0;
    try {
      const [templates] = await sql`SELECT COUNT(*) as count FROM learned_templates`;
      templatesCount = Number(templates.count);
    } catch (e) {
      // Table might not exist
    }
    
    console.log('\n✅ Current Database Counts:');
    console.log(`   • Leads: ${leadsCount.toLocaleString()} / 47,159 expected`);
    console.log(`   • Responses: ${responsesCount.toLocaleString()} / 455,940 expected`);
    console.log(`   • Templates: ${templatesCount.toLocaleString()} / 63,893 expected`);
    
    console.log('\n📊 Import Status:');
    if (leadsCount >= 47000 && responsesCount >= 450000) {
      console.log('   🎉🎉🎉 IMPORT COMPLETE! 🎉🎉🎉');
      console.log('   All data has been successfully imported!');
    } else if (leadsCount > 0) {
      const progress = Math.round((leadsCount / 47159) * 100);
      console.log(`   ⏳ Import in progress: ${progress}%`);
      console.log(`   • ${leadsCount.toLocaleString()} leads imported so far`);
      console.log(`   • ${responsesCount.toLocaleString()} responses imported so far`);
    } else {
      console.log('   ❌ No data found - import may not have started');
      console.log('   Run: npx ts-node server/scripts/working-import.ts');
    }
    
    await sql.end();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await sql.end();
    process.exit(1);
  }
}

checkStatus().catch(console.error);
