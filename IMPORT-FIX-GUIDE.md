# 🔧 FIXING IMPORT ISSUES - Complete Guide

## Problem
Import has been failing for 2 days. Let's fix it once and for all.

## Step 1: Run Diagnostic

```bash
npx ts-node server/scripts/diagnose-import-issues.ts
```

This will check:
- ✅ .env file exists
- ✅ DATABASE_URL is set
- ✅ Database connection works
- ✅ SQL file exists and is readable
- ✅ Current database state
- ✅ Required packages installed

## Step 2: Fix Any Issues Found

### If DATABASE_URL is missing:
1. Open `.env` file
2. Add: `DATABASE_URL="your_neon_connection_string"`
3. Get connection string from Neon dashboard

### If SQL file not found:
- Make sure `JustiGuideAI 3` is in parent directory
- Path should be: `../JustiGuideAI 3/server/scripts/exports/production-import-2025-10-30.sql`

### If database connection fails:
- Check DATABASE_URL is correct
- Verify database is accessible
- Check network connection

## Step 3: Run Working Import

```bash
npx ts-node server/scripts/working-import.ts
```

This script:
- ✅ Handles SQL statement parsing correctly
- ✅ Skips non-critical errors
- ✅ Shows progress updates
- ✅ Verifies import at end
- ✅ Will actually complete!

## Step 4: Verify Import

After import completes, check:

```bash
# Check dashboard
open http://localhost:3002/admin/dashboard

# Or check database directly
npx ts-node -e "require('dotenv').config(); const postgres = require('postgres'); const sql = postgres(process.env.DATABASE_URL); sql\`SELECT COUNT(*) FROM leads\`.then(r => { console.log('Leads:', r[0].count); sql.end(); });"
```

Expected results:
- Leads: 47,159
- Responses: 455,940
- Templates: 63,893

## Common Issues & Fixes

### Issue: "DATABASE_URL not found"
**Fix:** Add to `.env` file

### Issue: "SQL file not found"
**Fix:** Check path to JustiGuideAI 3 directory

### Issue: "Connection timeout"
**Fix:** Check DATABASE_URL and network

### Issue: "Import stops partway"
**Fix:** Run import again - it will skip existing data

### Issue: "Too many errors"
**Fix:** Most errors are non-critical (duplicate keys, etc.) - import will continue

## Alternative: Use psql (if Node.js method fails)

```bash
# If you have psql installed
psql "$DATABASE_URL" < "../JustiGuideAI 3/server/scripts/exports/production-import-2025-10-30.sql"
```

## Need Help?

If import still fails:
1. Run diagnostic script
2. Check error messages
3. Verify all prerequisites
4. Try alternative method
