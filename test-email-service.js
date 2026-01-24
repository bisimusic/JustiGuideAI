#!/usr/bin/env node

/**
 * Test script for JustiGuide Email Service
 * Usage: node test-email-service.js [email-address]
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Load .env file manually
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

async function testEmailService() {
  console.log('📧 JustiGuide Email Service Test\n');
  
  // Check configuration
  const hasGmail = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
  const hasSMTP = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
  
  console.log('Configuration Status:');
  console.log(`  Gmail: ${hasGmail ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`  SMTP: ${hasSMTP ? '✅ Configured' : '❌ Not configured'}`);
  console.log('');
  
  if (!hasGmail && !hasSMTP) {
    console.error('❌ No email service configured!');
    console.log('\nPlease set one of the following:');
    console.log('  - GMAIL_USER and GMAIL_APP_PASSWORD (for Gmail)');
    console.log('  - SMTP_HOST, SMTP_USER, and SMTP_PASSWORD (for custom SMTP)');
    process.exit(1);
  }
  
  // Get test email from command line or use default
  const testEmail = process.argv[2] || process.env.NOTIFICATION_EMAIL || process.env.GMAIL_USER;
  
  if (!testEmail) {
    console.error('❌ No email address provided!');
    console.log('\nUsage: node test-email-service.js [email-address]');
    process.exit(1);
  }
  
  console.log(`Sending test email to: ${testEmail}\n`);
  
  let transporter;
  
  if (hasGmail) {
    console.log('Using Gmail SMTP...');
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  } else {
    console.log('Using Custom SMTP...');
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  
  try {
    // Verify connection
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('✅ Connection verified!\n');
    
    // Send test email
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER || process.env.SMTP_USER || 'noreply@justiguide.com',
      to: testEmail,
      subject: 'JustiGuide Email Service Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6B5FCF;">JustiGuide Email Service Test</h2>
          <p>This is a test email from JustiGuide to verify that your email service is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Service:</strong> ${hasGmail ? 'Gmail SMTP' : 'Custom SMTP'}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">If you received this email, your email service is configured correctly! ✅</p>
        </div>
      `,
      text: `JustiGuide Email Service Test\n\nThis is a test email from JustiGuide to verify that your email service is working correctly.\n\nTimestamp: ${new Date().toISOString()}\nService: ${hasGmail ? 'Gmail SMTP' : 'Custom SMTP'}\n\nIf you received this email, your email service is configured correctly! ✅`,
    });
    
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   To: ${testEmail}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    console.log('\n📬 Check your inbox for the test email!');
    
  } catch (error) {
    console.error('❌ Failed to send test email:');
    console.error(`   Error: ${error.message}`);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    process.exit(1);
  }
}

testEmailService();
