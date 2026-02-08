#!/bin/bash

# Import lead_responses from CSV using PostgreSQL COPY command
# This is the fastest method for bulk data import

set -e

CSV_FILE="$(dirname "$0")/../../data/lead_responses.csv"
DB_URL="${DATABASE_URL:-postgresql://neondb_owner:npg_keVh1GDUYyj3@ep-little-bread-ahnojb92-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require}"

if [ ! -f "$CSV_FILE" ]; then
  echo "❌ CSV file not found: $CSV_FILE"
  echo "   Run: node server/scripts/convert-responses-to-csv.js first"
  exit 1
fi

echo ""
echo "📥 IMPORTING RESPONSES FROM CSV USING COPY"
echo "============================================================"
echo ""
echo "✅ CSV file: $(basename "$CSV_FILE")"
echo "   Size: $(du -h "$CSV_FILE" | cut -f1)"
echo ""

# Check current count
echo "📊 Current data count:"
CURRENT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM lead_responses;" | xargs)
echo "   Responses: $CURRENT"
echo ""

# Create temporary table for staging (matching CSV column order)
echo "🔧 Creating temporary staging table..."
psql "$DB_URL" <<EOF
DROP TABLE IF EXISTS temp_lead_responses;
CREATE TEMP TABLE temp_lead_responses (
  id VARCHAR,
  lead_id VARCHAR,
  response_slot INTEGER,
  response_content TEXT,
  platform TEXT,
  response_type TEXT,
  post_id TEXT,
  response_url TEXT,
  status TEXT,
  posted_at TIMESTAMP,
  created_at TIMESTAMP
);
EOF

# Import CSV into temp table
echo "📥 Importing CSV into temporary table..."
psql "$DB_URL" <<EOF
\COPY temp_lead_responses FROM '$CSV_FILE' WITH (FORMAT csv, HEADER true, DELIMITER ',', NULL '')
EOF

# Insert from temp table with conflict handling
echo "🔄 Inserting into main table (handling conflicts and NULLs)..."
echo "   This may take a few minutes for 455k rows..."
psql "$DB_URL" <<'EOFSQL'
-- Insert in batches, handling conflicts
DO $$
DECLARE
  batch_size INTEGER := 10000;
  total_rows INTEGER;
  inserted_count INTEGER := 0;
  batch_num INTEGER := 0;
BEGIN
  -- Get total count
  SELECT COUNT(*) INTO total_rows
  FROM temp_lead_responses
  WHERE id IS NOT NULL 
    AND lead_id IS NOT NULL 
    AND response_content IS NOT NULL
    AND platform IS NOT NULL
    AND response_type IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM lead_responses lr WHERE lr.id = temp_lead_responses.id);

  RAISE NOTICE 'Total rows to insert: %', total_rows;

  -- Process in batches
  LOOP
    batch_num := batch_num + 1;
    
    INSERT INTO lead_responses (
      id, lead_id, response_content, platform, response_type,
      post_id, status, posted_at, created_at, response_url, response_slot
    )
    SELECT 
      t.id,
      t.lead_id,
      t.response_content,
      t.platform,
      t.response_type,
      NULLIF(t.post_id, '') as post_id,
      COALESCE(NULLIF(t.status, ''), 'posted') as status,
      CASE WHEN t.posted_at::text = '' OR t.posted_at IS NULL THEN NOW() ELSE t.posted_at END as posted_at,
      CASE WHEN t.created_at::text = '' OR t.created_at IS NULL THEN NOW() ELSE t.created_at END as created_at,
      NULLIF(t.response_url, '') as response_url,
      -- For conflicts on (lead_id, response_slot), find next available slot
      COALESCE(
        (SELECT MIN(slot) 
         FROM generate_series(
           COALESCE(NULLIF(t.response_slot::text, ''), '0')::INTEGER,
           1000
         ) AS slot
         WHERE NOT EXISTS (
           SELECT 1 FROM lead_responses lr 
           WHERE lr.lead_id = t.lead_id AND lr.response_slot = slot
         )
         LIMIT 1
        ),
        COALESCE(NULLIF(t.response_slot::text, ''), '0')::INTEGER
      ) as response_slot
    FROM (
      SELECT * FROM temp_lead_responses
      WHERE id IS NOT NULL 
        AND lead_id IS NOT NULL 
        AND response_content IS NOT NULL
        AND platform IS NOT NULL
        AND response_type IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM lead_responses lr WHERE lr.id = temp_lead_responses.id)
      LIMIT batch_size
      OFFSET (batch_num - 1) * batch_size
    ) t
    ON CONFLICT (lead_id, response_slot) DO NOTHING;

    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    
    IF batch_num % 10 = 0 OR inserted_count > 0 THEN
      RAISE NOTICE 'Processed batch %, inserted % rows (offset: %)', batch_num, inserted_count, (batch_num - 1) * batch_size;
    END IF;

    -- Check if we've processed all rows
    IF (batch_num - 1) * batch_size >= total_rows THEN
      EXIT;
    END IF;

    -- Safety check - allow more batches
    IF batch_num > 500 THEN
      RAISE NOTICE 'Reached maximum batch limit of 500';
      EXIT;
    END IF;
  END LOOP;

  RAISE NOTICE 'Import complete!';
END $$;
EOFSQL

# Get final count
echo ""
echo "📊 Final results:"
FINAL=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM lead_responses;" | xargs)
ADDED=$((FINAL - CURRENT))
echo "   Before: $CURRENT"
echo "   After: $FINAL"
echo "   Added: $ADDED"
echo ""

if [ "$FINAL" -ge 450000 ]; then
  echo "🎉🎉🎉 SUCCESS! Responses migration complete! 🎉🎉🎉"
else
  PERCENT=$((FINAL * 100 / 455940))
  echo "⏳ Progress: $PERCENT% complete"
fi

echo ""
