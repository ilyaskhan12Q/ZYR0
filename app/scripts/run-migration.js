/**
 * run-migration.js - Execute migration SQL via Supabase REST API
 * Uses service_role key if available, otherwise falls back to anon key with SQL exec
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse .env
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) {
    envVars[key.trim()] = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const serviceKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.SERVICE_ROLE_KEY;
const anonKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌  VITE_SUPABASE_URL not found in .env');
  process.exit(1);
}

const authKey = serviceKey || anonKey;
const keyType = serviceKey ? 'service_role' : 'anon (may fail due to RLS)';
console.log(`Using key type: ${keyType}`);

const migrationSQL = fs.readFileSync(
  path.join(__dirname, '../../supabase/migrations/023_add_saves_and_ratings.sql'),
  'utf8'
);

async function runMigration() {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authKey}`,
      'apikey': authKey,
    },
    body: JSON.stringify({ sql: migrationSQL }),
  });

  if (!response.ok) {
    const text = await response.text();
    // Try the pg endpoint instead
    console.log('Trying alternative endpoint...');
    const pgRes = await fetch(`${supabaseUrl}/pg/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authKey}`,
        'apikey': authKey,
      },
      body: JSON.stringify({ query: migrationSQL }),
    });

    if (!pgRes.ok) {
      const pgText = await pgRes.text();
      console.error('Migration failed:', pgText);
      console.log('\n📋 Run this SQL manually in Supabase SQL Editor:');
      console.log('https://supabase.com/dashboard/project/iczhrvgzbnuvlgjfzeol/sql');
      console.log('\n--- SQL START ---\n');
      console.log(migrationSQL);
      console.log('\n--- SQL END ---\n');
      return;
    }
    const pgData = await pgRes.json();
    console.log('Migration executed:', pgData);
  } else {
    const data = await response.json();
    console.log('Migration executed:', data);
  }
  console.log('✅  Migration 023 complete!');
}

runMigration().catch(console.error);
