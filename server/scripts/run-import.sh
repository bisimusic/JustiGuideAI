#!/bin/bash

# Simple shell script to run the import with proper error handling

cd "$(dirname "$0")/../.."

echo "🚀 STARTING DATA IMPORT"
echo "======================"
echo ""

# Check .env exists
if [ ! -f .env ]; then
    echo "❌ ERROR: .env file not found"
    echo "   Create .env file with DATABASE_URL"
    exit 1
fi

# Check DATABASE_URL is set
source .env 2>/dev/null || true
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL not set in .env"
    echo "   Add: DATABASE_URL=\"your_connection_string\""
    exit 1
fi

# Check SQL file exists
SQL_FILE="../JustiGuideAI 3/server/scripts/exports/production-import-2025-10-30.sql"
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ ERROR: SQL file not found"
    echo "   Expected: $SQL_FILE"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""
echo "📊 Starting import..."
echo "   This will take 10-20 minutes"
echo ""

# Run import
npx ts-node --transpile-only server/scripts/working-import.ts
