#!/usr/bin/env node

/**
 * Monitor import progress
 */

const fs = require('fs');
const path = require('path');

const STATUS_FILE = '/tmp/import-status.json';

function checkStatus() {
  if (!fs.existsSync(STATUS_FILE)) {
    console.log('⏳ Import not started yet');
    return;
  }
  
  const status = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
  
  console.log('\n📊 IMPORT STATUS');
  console.log('='.repeat(60));
  console.log(`Phase: ${status.phase}`);
  console.log(`Progress: ${status.progress}%`);
  console.log(`Executed: ${status.executed?.toLocaleString() || 0} statements`);
  console.log(`Errors: ${status.errors || 0}`);
  
  if (status.leads) {
    console.log(`Leads: ${status.leads.toLocaleString()}`);
  }
  if (status.responses) {
    console.log(`Responses: ${status.responses.toLocaleString()}`);
  }
  
  if (status.completed) {
    console.log('\n✅ Import completed!');
    if (status.leads >= 47000) {
      console.log('🎉 SUCCESS - All data imported!');
    }
  } else {
    console.log('\n⏳ Import in progress...');
  }
  
  if (status.error) {
    console.log(`\n❌ Error: ${status.error}`);
  }
}

checkStatus();
