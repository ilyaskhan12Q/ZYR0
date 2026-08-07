import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_URLS = 10000;

function findKey() {
  const files = fs.readdirSync(publicDir);
  const keyFile = files.find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
  if (!keyFile) return null;
  const key = fs.readFileSync(path.join(publicDir, keyFile), 'utf-8').trim();
  return /^[0-9a-f]{32}$/.test(key) ? key : null;
}

function collectUrls() {
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) return [];
  const xml = fs.readFileSync(sitemapPath, 'utf-8');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  return [...new Set(urls)];
}

async function ping(key, urls) {
  const body = { host: 'zyroo.org', key, urlList: urls.slice(0, MAX_URLS) };
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`IndexNow API responded ${res.status}: ${await res.text()}`);
  return res.status;
}

const key = findKey();
if (!key) {
  console.warn('[IndexNow] No valid key file found in public/. Skipping ping.');
} else {
  const urls = collectUrls();
  if (urls.length === 0) {
    console.warn('[IndexNow] No URLs found in sitemap.xml. Skipping ping.');
  } else {
    try {
      const status = await ping(key, urls);
      console.log(`[IndexNow] Pinged ${urls.length} URLs -> HTTP ${status}`);
    } catch (err) {
      console.warn(`[IndexNow] Ping failed: ${err.message}`);
      process.exitCode = 1;
    }
  }
}
