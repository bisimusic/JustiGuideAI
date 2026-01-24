#!/usr/bin/env ts-node

/**
 * Extract and analyze backup data from git history
 * Shows what data was in the admin dashboard before Next.js conversion
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const BACKUP_COMMIT = 'affe7ba27d9cbc20942e94da777fc8740a231449';
const BACKUP_FILE = 'backups/database/backup-2025-08-25T16-02-42-690Z.json';

interface BackupData {
  timestamp: string;
  backupId: string;
  data: {
    leads?: any[];
    dashboardStats?: any;
    responses?: any[];
    [key: string]: any;
  };
}

async function extractBackupData() {
  try {
    console.log('📊 Extracting backup data from git...\n');
    
    // Extract backup file from git
    const backupContent = execSync(
      `git show ${BACKUP_COMMIT}:${BACKUP_FILE}`,
      { encoding: 'utf-8' }
    );
    
    const backup: BackupData = JSON.parse(backupContent);
    
    console.log('='.repeat(60));
    console.log('ADMIN DASHBOARD DATA FROM BACKUP');
    console.log('='.repeat(60));
    console.log(`\n✅ Backup ID: ${backup.backupId}`);
    console.log(`📅 Timestamp: ${backup.timestamp}`);
    
    if (backup.data.leads) {
      const leads = backup.data.leads;
      console.log(`\n📊 LEADS DATA:`);
      console.log(`   Total Leads: ${leads.length.toLocaleString()}`);
      
      // Analyze platforms
      const platforms: Record<string, number> = {};
      let totalAiScore = 0;
      let aiScoreCount = 0;
      let validatedCount = 0;
      
      for (const lead of leads) {
        const platform = lead.sourcePlatform || lead.source_platform || 'unknown';
        platforms[platform] = (platforms[platform] || 0) + 1;
        
        const aiScore = parseFloat(lead.aiScore || lead.ai_score || '0');
        if (aiScore > 0) {
          totalAiScore += aiScore;
          aiScoreCount++;
        }
        
        if (lead.isValidated || lead.is_validated) {
          validatedCount++;
        }
      }
      
      console.log(`\n📊 Platform Breakdown:`);
      for (const [platform, count] of Object.entries(platforms).sort((a, b) => b[1] - a[1])) {
        console.log(`   • ${platform}: ${count.toLocaleString()}`);
      }
      
      if (aiScoreCount > 0) {
        console.log(`\n📊 AI Scores:`);
        console.log(`   • Average: ${(totalAiScore / aiScoreCount).toFixed(2)}`);
      }
      
      console.log(`\n📊 Validation:`);
      console.log(`   • Validated: ${validatedCount.toLocaleString()}`);
      console.log(`   • Rate: ${((validatedCount / leads.length) * 100).toFixed(1)}%`);
      
      // Show sample lead
      if (leads.length > 0) {
        console.log(`\n📋 Sample Lead Structure:`);
        const sample = leads[0];
        for (const [key, value] of Object.entries(sample).slice(0, 15)) {
          const displayValue = typeof value === 'string' && value.length > 50 
            ? value.substring(0, 50) + '...' 
            : value;
          console.log(`   • ${key}: ${displayValue}`);
        }
      }
    }
    
    if (backup.data.dashboardStats) {
      console.log(`\n📊 DASHBOARD STATS:`);
      const stats = backup.data.dashboardStats;
      for (const [key, value] of Object.entries(stats)) {
        console.log(`   • ${key}: ${value}`);
      }
    }
    
    // Save summary to file
    const outputDir = path.join(process.cwd(), 'server', 'exports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const summary = {
      backupId: backup.backupId,
      timestamp: backup.timestamp,
      totalLeads: backup.data.leads?.length || 0,
      platforms: Object.fromEntries(
        Object.entries(platforms || {}).sort((a, b) => b[1] - a[1])
      ),
      avgAiScore: aiScoreCount > 0 ? (totalAiScore / aiScoreCount).toFixed(2) : 0,
      validatedCount: validatedCount,
      validationRate: backup.data.leads 
        ? ((validatedCount / backup.data.leads.length) * 100).toFixed(1) + '%'
        : '0%',
    };
    
    const summaryFile = path.join(outputDir, 'backup-data-summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    console.log(`\n✅ Summary saved to: ${summaryFile}`);
    
  } catch (error: any) {
    console.error('❌ Error extracting backup data:', error.message);
    process.exit(1);
  }
}

extractBackupData();
