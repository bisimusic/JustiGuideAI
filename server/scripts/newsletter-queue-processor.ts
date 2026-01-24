#!/usr/bin/env ts-node

/**
 * Newsletter Queue Processor
 * Processes email queue at configured rate (e.g., 10 emails per hour)
 * 
 * Usage:
 *   - Run manually: ts-node server/scripts/newsletter-queue-processor.ts
 *   - Or set up as cron job to run every hour
 */

import * as https from 'https';
import * as http from 'http';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
const PROCESS_ENDPOINT = `${API_URL}/api/newsletter/queue/process`;

async function processQueue() {
  console.log(`\n📧 Processing newsletter queue...`);
  console.log(`   Endpoint: ${PROCESS_ENDPOINT}`);
  console.log(`   Time: ${new Date().toISOString()}\n`);

  try {
    const url = new URL(PROCESS_ENDPOINT);
    const client = url.protocol === 'https:' ? https : http;

    const response = await new Promise<any>((resolve, reject) => {
      const req = client.request(PROCESS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Invalid JSON response: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.end();
    });

    if (response.success) {
      console.log(`✅ Batch processed successfully`);
      console.log(`   Sent: ${response.batch?.sent || 0}`);
      console.log(`   Failed: ${response.batch?.failed || 0}`);
      console.log(`\n📊 Queue Status:`);
      console.log(`   Total: ${response.queue?.total || 0}`);
      console.log(`   Sent: ${response.queue?.sent || 0}`);
      console.log(`   Failed: ${response.queue?.failed || 0}`);
      console.log(`   Pending: ${response.queue?.pending || 0}`);
      console.log(`   Progress: ${response.queue?.progress || 0}%`);

      if (response.errors && response.errors.length > 0) {
        console.log(`\n⚠️  Errors:`);
        response.errors.forEach((err: string) => console.log(`   - ${err}`));
      }
    } else {
      console.error(`❌ Processing failed: ${response.error || response.message}`);
      if (response.status === 'paused') {
        console.log(`\n⏸️  Queue is paused. Use PUT /api/newsletter/queue with action: "resume" to continue.`);
      }
    }
  } catch (error: any) {
    console.error(`❌ Error processing queue:`, error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  processQueue()
    .then(() => {
      console.log(`\n✨ Done!\n`);
      process.exit(0);
    })
    .catch((error) => {
      console.error(`\n💥 Fatal error:`, error);
      process.exit(1);
    });
}

export { processQueue };
