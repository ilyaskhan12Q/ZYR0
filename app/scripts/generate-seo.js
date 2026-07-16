import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const distDir = path.join(projectRoot, 'dist');

// Read env files to get VITE_SITE_URL
function getSiteUrl() {
  if (process.env.VITE_SITE_URL) {
    return process.env.VITE_SITE_URL.trim().replace(/\/+$/, '');
  }
  const envFiles = ['.env.production', '.env.local', '.env'];
  for (const file of envFiles) {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      for (const line of lines) {
        const match = line.match(/^\s*VITE_SITE_URL\s*=\s*([^\s#]+)/);
        if (match) {
          let url = match[1].trim();
          // Remove wrapping quotes if present
          if (url.startsWith('"') && url.endsWith('"')) {
            url = url.substring(1, url.length - 1);
          }
          if (url.startsWith("'") && url.endsWith("'")) {
            url = url.substring(1, url.length - 1);
          }
          // Clean trailing slash
          return url.replace(/\/+$/, '');
        }
      }
    }
  }
  return 'https://zyroo.dpdns.org'; // Centralized fallback
}

const SITE_URL = getSiteUrl();
console.log(`[SEO Generate] Using domain: ${SITE_URL}`);

// Public pages list
const pages = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: 'internships', priority: '0.9', changefreq: 'daily' },
  { path: 'companies', priority: '0.8', changefreq: 'daily' },
  { path: 'careers', priority: '0.8', changefreq: 'weekly' },
  { path: 'about', priority: '0.7', changefreq: 'monthly' },
  { path: 'contact', priority: '0.7', changefreq: 'monthly' },
  { path: 'faq', priority: '0.6', changefreq: 'weekly' },
  { path: 'help', priority: '0.6', changefreq: 'weekly' },
  { path: 'verify', priority: '0.5', changefreq: 'monthly' },
  { path: 'privacy', priority: '0.3', changefreq: 'monthly' },
  { path: 'terms', priority: '0.3', changefreq: 'monthly' },
  { path: 'cookies', priority: '0.3', changefreq: 'monthly' }
];

const today = new Date().toISOString().split('T')[0];

// Generate sitemap.xml
function generateSitemap() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  for (const page of pages) {
    const loc = page.path ? `${SITE_URL}/${page.path}` : `${SITE_URL}/`;
    xml += '  <url>\n';
    xml += `    <loc>${loc}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  }
  
  xml += '</urlset>\n';
  return xml;
}

// Generate robots.txt
function generateRobots() {
  return `User-agent: *
Allow: /

# Public pages — index
Allow: /internships
Allow: /companies
Allow: /about
Allow: /contact
Allow: /privacy
Allow: /terms
Allow: /cookies
Allow: /faq
Allow: /help
Allow: /careers
Allow: /verify

# Auth pages — no index
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /auth/

# Authenticated dashboard routes — not for public crawlers
Disallow: /student/
Disallow: /company/
Disallow: /mentor/
Disallow: /admin/

# Build artifacts
Disallow: /src/
Disallow: /.vite/

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write sitemap and robots to public/ (source directory)
const sitemapContent = generateSitemap();
const robotsContent = generateRobots();

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent, 'utf-8');
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsContent, 'utf-8');
console.log(`[SEO Generate] Wrote sitemap.xml and robots.txt to ${publicDir}`);

// If dist/ exists (meaning build has run), write them to dist/ too
if (fs.existsSync(distDir)) {
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapContent, 'utf-8');
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsContent, 'utf-8');
  console.log(`[SEO Generate] Wrote sitemap.xml and robots.txt to ${distDir}`);
}
