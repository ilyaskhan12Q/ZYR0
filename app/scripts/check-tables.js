import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple env file parser
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    envVars[key] = val;
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  console.log('Checking saved_internships table...');
  const { data: saveD, error: saveE } = await supabase.from('saved_internships').select('id').limit(1);
  if (saveE) {
    console.error('saved_internships error:', saveE.message);
  } else {
    console.log('saved_internships table exists!');
  }

  console.log('Checking company_ratings table...');
  const { data: rateD, error: rateE } = await supabase.from('company_ratings').select('id').limit(1);
  if (rateE) {
    console.error('company_ratings error:', rateE.message);
  } else {
    console.log('company_ratings table exists!');
  }
}

check();
