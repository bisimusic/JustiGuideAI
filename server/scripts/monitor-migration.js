#!/usr/bin/env node

/**
 * MONITOR MIGRATION - Writes all output to file for monitoring
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

const LOG_FILE = '/tmp/migration-monitor.log';
const STATUS_FILE = '/tmp/migration-status.json';

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, logMessage);
  console.log(message);
}

async function monitorMigration() {
  log('\n🔍 MONITORING MIGRATION STATUS');
  log('='.repeat(60));
  
  // Check database
  if (!process.env.DATABASE_URL) {
    log('❌ DATABASE_URL not set');
    return;
  }
  
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  
  try {
    const [leads] = await sql`SELECT COUNT(*) as count FROM leads`;
    const [responses] = await sql`SELECT COUNT(*) as count FROM lead_responses`;
    
    const leadsCount = Number(leads.count);
    const responsesCount = Number(responses.count);
    
    const status = {
      timestamp: new Date().toISOString(),
      leads: leadsCount,
      responses: responsesCount,
      expectedLeads: 47159,
      expectedResponses: 455940,
      progress: Math.round((leadsCount / 47159) * 100),
      complete: leadsCount >= 47000 && responsesCount >= 450000
    };
    
    fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
    
    log(`\n📊 CURRENT STATUS:`);
    log(`   Leads: ${leadsCount.toLocaleString()} / 47,159 (${status.progress}%)`);
    log(`   Responses: ${responsesCount.toLocaleString()} / 455,940`);
    
    if (status.complete) {
      log('\n✅✅✅ MIGRATION COMPLETE! ✅✅✅');
    } else if (leadsCount > 0) {
      log(`\n⏳ Migration in progress: ${status.progress}%`);
    } else {
      log('\n❌ No data - migration not started');
      log('   Run: node server/scripts/diagnose-and-fix.js');
    }
    
    await sql.end();
  } catch (error) {
    log(`❌ Error: ${error.message}`);
    await sql.end();
  }
}

monitorMigration().catch(error => {
  log(`Fatal error: ${error.message}`);
  process.exit(1);
});
