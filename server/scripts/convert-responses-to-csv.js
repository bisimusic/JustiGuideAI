#!/usr/bin/env node

/**
 * Convert lead_responses SQL INSERT statements to CSV format
 * This makes it easier to import using COPY or bulk insert methods
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '../..');
const parentDir = path.dirname(projectRoot);
const SQL_FILE = path.join(
  parentDir,
  'JustiGuideAI 3/server/scripts/exports/production-import-2025-10-30.sql'
);

const OUTPUT_CSV = path.join(__dirname, '../../data/lead_responses.csv');
const OUTPUT_JSON = path.join(__dirname, '../../data/lead_responses.json');

function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function parseSqlValue(value) {
  value = value.trim();
  if (value === 'NULL' || value === '') return null;
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replace(/''/g, "'");
  }
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/""/g, '"');
  }
  // Try to parse as number or boolean
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d*\.\d+$/.test(value)) return parseFloat(value);
  return value;
}

function parseValuesList(valuesStr) {
  const rows = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  let depth = 0;
  let currentRow = [];
  let currentValue = '';

  for (let i = 0; i < valuesStr.length; i++) {
    const char = valuesStr[i];
    const nextChar = valuesStr[i + 1];

    if ((char === '"' || char === "'") && (i === 0 || valuesStr[i - 1] !== '\\')) {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar && nextChar !== quoteChar) {
        inQuotes = false;
        quoteChar = '';
      } else if (char === quoteChar && nextChar === quoteChar) {
        // Escaped quote
        currentValue += char;
        i++; // Skip next quote
        continue;
      }
    } else if (char === '(' && !inQuotes) {
      depth++;
      if (depth === 1) {
        // Start of new row
        currentRow = [];
        currentValue = '';
        continue;
      }
    } else if (char === ')' && !inQuotes) {
      depth--;
      if (depth === 0) {
        // End of row
        if (currentValue.trim()) {
          currentRow.push(parseSqlValue(currentValue.trim()));
        }
        if (currentRow.length > 0) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentValue = '';
        continue;
      }
    } else if (char === ',' && !inQuotes && depth === 1) {
      // Value separator within a row
      currentRow.push(parseSqlValue(currentValue.trim()));
      currentValue = '';
      continue;
    }

    if (depth >= 1) {
      currentValue += char;
    }
  }

  // Handle last value if any
  if (currentValue.trim() && currentRow.length >= 0) {
    currentRow.push(parseSqlValue(currentValue.trim()));
    if (currentRow.length > 0) {
      rows.push(currentRow);
    }
  }

  return rows;
}

async function convertToCsv() {
  console.log('\n🔄 CONVERTING RESPONSES DATA TO CSV FORMAT');
  console.log('='.repeat(60));
  console.log('');

  // Check SQL file
  if (!fs.existsSync(SQL_FILE)) {
    console.error(`❌ SQL file not found: ${SQL_FILE}`);
    process.exit(1);
  }

  console.log('📖 Reading SQL file...');
  const sqlContent = fs.readFileSync(SQL_FILE, 'utf8');
  console.log(`✅ Read ${(sqlContent.length / 1024 / 1024).toFixed(1)} MB\n`);

  // Extract lead_responses INSERT statements
  console.log('🔍 Extracting lead_responses INSERT statements...');
  const insertRegex = /INSERT INTO\s+lead_responses\s*\(([^)]+)\)\s*VALUES\s*([^;]+);/gi;
  const matches = [];
  let match;

  while ((match = insertRegex.exec(sqlContent)) !== null) {
    matches.push({
      columns: match[1].split(',').map(c => c.trim()),
      values: match[2].trim()
    });
  }

  console.log(`✅ Found ${matches.length} INSERT statements\n`);

  // Parse all rows
  console.log('🔧 Parsing values...');
  const allRows = [];
  
  // Database column order (must match table schema)
  const dbColumnOrder = [
    'id',
    'lead_id',
    'response_slot',
    'response_content',
    'platform',
    'response_type',
    'post_id',
    'response_url',
    'status',
    'posted_at',
    'created_at'
  ];
  
  // Map from SQL column order to database column order
  const columnOrder = matches[0]?.columns || [];
  const columnMap = new Map();
  columnOrder.forEach((col, idx) => {
    columnMap.set(col.toLowerCase().trim(), idx);
  });

  matches.forEach((match, idx) => {
    try {
      const rows = parseValuesList(match.values);
      
      // Reorder columns to match database schema
      const reorderedRows = rows.map(row => {
        const reordered = [];
        dbColumnOrder.forEach(dbCol => {
          const sqlIdx = columnMap.get(dbCol);
          if (sqlIdx !== undefined && sqlIdx < row.length) {
            let value = row[sqlIdx];
            
            // Handle NULL values for response_slot
            if (dbCol === 'response_slot' && (value === null || value === 'NULL' || value === '')) {
              value = 0;
            }
            
            reordered.push(value);
          } else {
            // Default values for missing columns
            if (dbCol === 'response_slot') {
              reordered.push(0);
            } else if (dbCol === 'status') {
              reordered.push('posted');
            } else {
              reordered.push(null);
            }
          }
        });
        return reordered;
      });
      
      allRows.push(...reorderedRows);
      
      if ((idx + 1) % 100 === 0) {
        console.log(`   Processed ${idx + 1}/${matches.length} statements (${allRows.length.toLocaleString()} rows so far)`);
      }
    } catch (error) {
      console.error(`   ⚠️  Error parsing statement ${idx + 1}: ${error.message}`);
    }
  });

  console.log(`✅ Parsed ${allRows.length.toLocaleString()} total rows\n`);

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_CSV);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write CSV
  console.log('📝 Writing CSV file...');
  const csvStream = fs.createWriteStream(OUTPUT_CSV);
  
  // Write header in database column order
  const header = dbColumnOrder.map(col => escapeCsv(col)).join(',');
  csvStream.write(header + '\n');

  // Write rows
  let written = 0;
  for (const row of allRows) {
    // Ensure row has correct number of columns
    while (row.length < dbColumnOrder.length) {
      row.push(null);
    }
    const csvRow = row.slice(0, dbColumnOrder.length).map(val => escapeCsv(val)).join(',');
    csvStream.write(csvRow + '\n');
    written++;
    
    if (written % 10000 === 0) {
      console.log(`   Written ${written.toLocaleString()}/${allRows.length.toLocaleString()} rows`);
    }
  }

  csvStream.end();
  
  // Wait for stream to finish
  await new Promise((resolve) => {
    csvStream.on('finish', resolve);
  });
  
  console.log(`✅ CSV file written: ${OUTPUT_CSV}`);
  const csvSize = fs.existsSync(OUTPUT_CSV) ? fs.statSync(OUTPUT_CSV).size : 0;
  console.log(`   Size: ${(csvSize / 1024 / 1024).toFixed(1)} MB\n`);

  // Also write JSON for reference
  console.log('📝 Writing JSON file...');
  const jsonData = allRows.map(row => {
    const obj = {};
    dbColumnOrder.forEach((col, idx) => {
      obj[col] = row[idx] || null;
    });
    return obj;
  });

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(jsonData, null, 2));
  console.log(`✅ JSON file written: ${OUTPUT_JSON}`);
  console.log(`   Size: ${(fs.statSync(OUTPUT_JSON).size / 1024 / 1024).toFixed(1)} MB\n`);

  console.log('🎉 Conversion complete!');
  console.log(`\n📊 Summary:`);
  console.log(`   • Total rows: ${allRows.length.toLocaleString()}`);
  console.log(`   • CSV file: ${OUTPUT_CSV}`);
  console.log(`   • JSON file: ${OUTPUT_JSON}`);
  console.log(`\n💡 Next step: Import using:`);
  console.log(`   psql -c "\\COPY lead_responses FROM '${OUTPUT_CSV}' WITH (FORMAT csv, HEADER true, DELIMITER ',')"`);
}

convertToCsv().catch(error => {
  console.error('\n❌ FATAL ERROR:', error.message);
  console.error(error.stack);
  process.exit(1);
});
