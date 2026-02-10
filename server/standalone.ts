/**
 * Minimal Express server for listening/monitoring APIs.
 * Runs on port 5000 so the Next.js app (Admin → Settings → Start Monitoring) can control listening.
 * No @shared/schema or full routes deps required.
 */
import 'dotenv/config';
import express from 'express';

const app = express();
app.use(express.json());

// In-memory monitoring state (Start/Stop Monitoring in Admin UI)
let monitoringState = { isRunning: false };

// Monitoring control – used by Next.js /api/monitoring/start, stop, status
app.post('/api/monitoring/start', (_req, res) => {
  monitoringState.isRunning = true;
  console.log('Monitoring started');
  res.json({ success: true, message: 'Monitoring scheduler started successfully' });
});

app.post('/api/monitoring/stop', (_req, res) => {
  monitoringState.isRunning = false;
  console.log('Monitoring stopped');
  res.json({ success: true, message: 'Monitoring scheduler stopped successfully' });
});

app.get('/api/monitoring/status', (_req, res) => {
  res.json({ success: true, monitoring: monitoringState });
});

// Immigration channels (social listening config) – used by ImmigrationChannels and others
app.get('/api/immigration/subreddits', (_req, res) => {
  try {
    res.json({
      success: true,
      subreddits: [
        { name: 'immigration', description: 'General immigration discussions and questions', focus: 'general' },
        { name: 'h1b', description: 'H1B visa discussions, lottery, extensions', focus: 'work_visas' },
        { name: 'greencard', description: 'Green card applications, priority dates, I-485', focus: 'permanent_residence' },
        { name: 'uscis', description: 'USCIS processes, forms, updates', focus: 'government' },
        { name: 'citizenship', description: 'Naturalization, N-400, citizenship test', focus: 'citizenship' },
        { name: 'visas', description: 'All visa types and processes', focus: 'temporary_visas' },
        { name: 'legaladvice', description: 'Legal advice for immigration matters', focus: 'legal_support' },
        { name: 'iwantout', description: 'People seeking to emigrate from their home country', focus: 'emigration' },
        { name: 'expats', description: 'Expat life, relocation, and residency abroad', focus: 'eu_residency' },
        { name: 'europe', description: 'European topics including mobility and residency', focus: 'eu_residency' },
        { name: 'europeanunion', description: 'EU policy, freedom of movement, and residency', focus: 'eu_residency' },
        { name: 'ImmigrationCanada', description: 'Canadian immigration, PR, Express Entry', focus: 'canada' },
        { name: 'canada', description: 'Canada general, moving and immigration', focus: 'canada' },
        { name: 'AskACanadian', description: 'Canada Q&A including immigration', focus: 'canada' },
      ],
      highValueKeywords: [
        'urgent', 'deadline', 'denied', 'rfe', 'help', 'lawyer', 'attorney',
        'EU residency', 'European residency', 'EU fast track', 'highly qualified talent', 'EU citizenship',
        'Canada', 'Canadian PR', 'Express Entry', 'IRCC', 'permanent resident Canada', 'PNP', 'provincial nominee',
      ],
      totalChannels: 14,
      newChannelsAdded: ['citizenship', 'legaladvice', 'expats', 'europe', 'europeanunion', 'ImmigrationCanada', 'canada', 'AskACanadian'],
      focusAreas: ['work_visas', 'permanent_residence', 'citizenship', 'legal_support', 'general', 'eu_residency', 'canada'],
    });
  } catch (error) {
    console.error('Immigration subreddits error:', error);
    res.status(500).json({ error: 'Failed to fetch immigration channels' });
  }
});

const port = parseInt(process.env.PORT || process.env.EXPRESS_PORT || '5001', 10);
app.listen(port, '0.0.0.0', () => {
  console.log(`Express listening server on port ${port}`);
  console.log('Monitoring: POST /api/monitoring/start | stop, GET /api/monitoring/status');
  console.log('Channels:   GET /api/immigration/subreddits');
});
