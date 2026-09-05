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
const PROD_URL = 'https://zyroo.org';

// Only accept URLs that belong to this site (production domain, subdomains, or Vercel previews).
// Anything malformed or foreign falls back to the canonical production URL.
function isTrustedSiteUrl(value) {
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    const host = u.hostname;
    return host === 'zyroo.org' || host.endsWith('.zyroo.org') || host.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

function getSiteUrl() {
  const candidates = [process.env.VITE_SITE_URL];
  const envFiles = ['.env.production', '.env.local', '.env'];
  for (const file of envFiles) {
    const filePath = path.join(projectRoot, file);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*VITE_SITE_URL\s*=\s*([^\s#]+)/);
      if (match) {
        let url = match[1].trim();
        if (url.startsWith('"') && url.endsWith('"')) url = url.substring(1, url.length - 1);
        if (url.startsWith("'") && url.endsWith("'")) url = url.substring(1, url.length - 1);
        candidates.push(url);
      }
    }
  }
  for (const candidate of candidates) {
    if (candidate && isTrustedSiteUrl(candidate)) {
      return candidate.replace(/\/+$/, '');
    }
  }
  return PROD_URL; // Canonical fallback — never emit invalid domains
}

const SITE_URL = getSiteUrl();
console.log(`[SEO Generate] Using domain: ${SITE_URL}`);

// Public pages list — static routes with honest lastmod dates
// (update these only when the page's content genuinely changes)
const pages = [
  { path: '', lastmod: '2026-08-27' },
  { path: 'studio', lastmod: '2026-08-27' },
  { path: 'school', lastmod: '2026-08-27' },
  { path: 'edu', lastmod: '2026-08-27' },
  { path: 'research', lastmod: '2026-08-27' },
  { path: 'internships', lastmod: '2026-08-27' },
  { path: 'internships/browse', lastmod: '2026-08-27' },
  { path: 'companies', lastmod: '2026-08-06' },
  { path: 'careers', lastmod: '2026-08-06' },
  { path: 'careers/apply', lastmod: '2026-08-06' },
  { path: 'about', lastmod: '2026-08-06' },
  { path: 'contact', lastmod: '2026-08-06' },
  { path: 'faq', lastmod: '2026-08-06' },
  { path: 'help', lastmod: '2026-08-06' },
  { path: 'verify', lastmod: '2026-08-06' },
  { path: 'privacy', lastmod: '2026-07-18' },
  { path: 'terms', lastmod: '2026-07-18' },
  { path: 'cookies', lastmod: '2026-07-18' }
];

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isoDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

function buildStaticSitemapEntries() {
  return pages.map((page) => ({
    loc: page.path ? `${SITE_URL}/${page.path}` : `${SITE_URL}/`,
    lastmod: page.lastmod
  }));
}

// Generate sitemap.xml — loc + honest lastmod only (Google ignores priority/changefreq)
function buildSitemapXml(entries) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const entry of entries) {
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(entry.loc)}</loc>\n`;
    if (entry.lastmod) {
      xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    }
    xml += '  </url>\n';
  }
  xml += '</urlset>\n';
  return xml;
}

function writeSitemap(entries) {
  const sitemapContent = buildSitemapXml(entries);
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent, 'utf-8');
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapContent, 'utf-8');
  }
  console.log(`[SEO Generate] Wrote sitemap.xml with ${entries.length} URLs`);
}

// Generate robots.txt — public crawl rules, private-area blocks, and 2026 AI crawler policy
// (training bots blocked, retrieval/search bots allowed to keep content citable in AI answers)
function generateRobots() {
  return `User-agent: *
Allow: /

# Authenticated & private areas — not for public crawlers
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /auth/
Disallow: /student/
Disallow: /company/
Disallow: /mentor/
Disallow: /admin/

# AI training crawlers — blocked (content stays out of model training sets)
User-agent: GPTBot
Disallow: /
User-agent: CCBot
Disallow: /
User-agent: Google-Extended
Disallow: /
User-agent: anthropic-ai
Disallow: /
User-agent: Applebot-Extended
Disallow: /
User-agent: Bytespider
Disallow: /

# AI retrieval crawlers — allowed (stay citable in ChatGPT, Perplexity, Claude answers)
User-agent: ChatGPT-User
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: PerplexityBot
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

// Generate llms.txt — AI-discovery index (llms.txt spec) guiding AI crawlers to priority pages
function generateLlmsTxt() {
  return `# ZYR0

> ZYR0 is Pakistan's structured internship platform. Students apply for verified internship opportunities, work on real milestone-based tasks with professional mentors, and earn blockchain-verified digital certificates that employers can instantly authenticate online. Companies hire and manage interns; mentors review and guide their work.

## Important
- [Home](${SITE_URL}/): ZYR0 — structured internships for students and employers in Pakistan.
- [Browse Internships](${SITE_URL}/internships): Search verified internship opportunities in Pakistan by domain, location, and type.
- [Partner Companies](${SITE_URL}/companies): Verified companies offering structured internships on ZYR0.
- [Verify Certificate](${SITE_URL}/verify): Instantly verify ZYR0 internship certificates and offer letters by credential ID.
- [About ZYR0](${SITE_URL}/about): ZYR0's mission, vision, and values.
- [FAQ](${SITE_URL}/faq): Common questions about applying, stipends, milestone tasks, and certificates.
- [Help Center](${SITE_URL}/help): Getting-started guides for students, companies, and mentors.

## Optional
- [Contact](${SITE_URL}/contact): Contact ZYR0 support and partnerships.
- [Careers](${SITE_URL}/careers): Join the ZYR0 founding team.
- [Privacy Policy](${SITE_URL}/privacy): How ZYR0 handles your personal data.
- [Terms of Service](${SITE_URL}/terms): Terms governing use of the ZYR0 platform.
- [Cookie Policy](${SITE_URL}/cookies): How ZYR0 uses cookies.
`;
}

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write sitemap (static baseline; dynamic URLs are appended after the Supabase fetch below)
writeSitemap(buildStaticSitemapEntries());

// Write robots.txt to public/ and dist/ (if it exists)
const robotsContent = generateRobots();
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsContent, 'utf-8');
if (fs.existsSync(distDir)) {
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsContent, 'utf-8');
}
console.log(`[SEO Generate] Wrote robots.txt to ${publicDir}`);

// Write llms.txt (AI-discovery index) to public/ and dist/ (if it exists)
const llmsContent = generateLlmsTxt();
fs.writeFileSync(path.join(publicDir, 'llms.txt'), llmsContent, 'utf-8');
if (fs.existsSync(distDir)) {
  fs.writeFileSync(path.join(distDir, 'llms.txt'), llmsContent, 'utf-8');
}
console.log(`[SEO Generate] Wrote llms.txt to ${publicDir}`);

// ==========================================
// STATIC PRE-RENDERING (SSG) FOR CRAWLERS
// ==========================================

const staticPagesMeta = {
  '': {
    title: 'ZYR0 — Structured Internship Platform for Students & Employers',
    description: 'ZYR0 is a professional internship platform connecting students, companies, and mentors. Track student internships, verify completion certificates, and coordinate mentor feedback on a structured platform.',
    keywords: 'internship platform, internship management, student internships, internships in Pakistan, internship tracking, internship certificates, mentor feedback, internship workflow, companies hiring interns',
    structuredData: (url) => [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${url}/` }],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'ZYR0',
        'url': `${url}/`,
        'description': 'Structured internship platform for students, companies, and mentors.',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${url}/internships?search={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'ZYR0',
        'url': `${url}/`,
        'logo': `${url}/zyro-logo.png`,
        'description': 'ZYR0 is a professional internship platform connecting students, companies, and mentors for structured, verifiable internship experiences.',
        'sameAs': [
          'https://github.com/ilyaskhan12Q/ZYR0',
          'https://linkedin.com/company/zyr0-co'
        ],
        'contactPoint': {
          '@type': 'ContactPoint',
          'email': 'support@zyroo.org',
          'contactType': 'customer support',
          'availableLanguage': 'English'
        }
      }
    ]
  },
  'internships': {
    title: 'Browse Internships — Find Your Perfect Opportunity',
    description: 'Explore hundreds of verified internship opportunities across technology, design, data science, and more. Filter by domain, location, and type to find the internship that fits your career goals.',
    keywords: 'browse internships, internship opportunities, student jobs, career internship, remote internship, technology internship',
    structuredData: (url) => [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${url}/` },
          { '@type': 'ListItem', position: 2, name: 'Internships', item: `${url}/internships` }
        ],
      }
    ]
  },
  'companies': {
    title: 'Partner Companies — Internship Opportunities from Top Organizations',
    description: 'Discover internship opportunities from verified companies across technology, design, data science, fintech, and more. Explore company profiles, active listings, and team culture.',
    keywords: 'internship companies, hiring companies, top internship providers, company profiles, tech companies hiring interns',
    structuredData: (url) => [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${url}/` },
          { '@type': 'ListItem', position: 2, name: 'Companies', item: `${url}/companies` }
        ],
      }
    ]
  },
  'about': {
    title: 'About ZYR0 — Our Mission, Vision & Values',
    description: 'Learn about ZYR0\'s mission to bridge the gap between education and industry. Discover how we connect students, companies, and mentors through structured internship management and verified digital certificates.',
    keywords: 'about ZYR0, internship platform mission, career ecosystem, digital certificates, student mentorship',
    structuredData: (url) => [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${url}/` },
          { '@type': 'ListItem', position: 2, name: 'About', item: `${url}/about` }
        ],
      }
    ]
  },
  'contact': {
    title: 'Contact ZYR0 — Get in Touch with Our Team',
    description: 'Have questions about ZYR0? Reach out to our support team for help with your account, internship listings, certificate verification, or partnership opportunities. We respond within 24 hours.',
    keywords: 'contact ZYR0, ZYR0 support, internship platform help, partnership inquiry',
    structuredData: (url) => [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${url}/` },
          { '@type': 'ListItem', position: 2, name: 'Contact', item: `${url}/contact` }
        ],
      }
    ]
  },
  'faq': {
    title: 'FAQ — Frequently Asked Questions About ZYR0',
    description: 'Find answers to the most common questions about the ZYR0 internship platform. Get help for students, companies, and mentors on applications, task submissions, certificates, and account management.',
    keywords: 'ZYR0 FAQ, internship platform questions, certificate verification help, student internship FAQ, company FAQ',
    structuredData: (url) => [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${url}/` },
          { '@type': 'ListItem', position: 2, name: 'FAQ', item: `${url}/faq` }
        ],
      }
    ]
  },
  'help': {
    title: 'Help Center — Getting Started Guides for ZYR0',
    description: 'Step-by-step guides for students, companies, and mentors. Learn how to browse internships, review applicants, submit project work, issue certificates, and verify credentials on ZYR0.',
    keywords: 'ZYR0 help center, getting started guide, internship platform help, student guide, company guide, mentor guide',
    structuredData: (url) => [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${url}/` },
          { '@type': 'ListItem', position: 2, name: 'Help Center', item: `${url}/help` }
        ],
      }
    ]
  },
  'careers': {
    title: 'Careers at ZYR0 — Join Our Team',
    description: 'ZYR0 is growing and will be hiring across engineering, product, design, and operations. Express your interest early and help us build the platform connecting students to real career opportunities.',
    keywords: 'ZYR0 careers, work at ZYR0, internship platform jobs, tech startup jobs, EdTech careers',
    structuredData: (url) => [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${url}/` },
          { '@type': 'ListItem', position: 2, name: 'Careers', item: `${url}/careers` }
        ],
      }
    ]
  },
  'verify': {
    title: 'Verify Certificate — Authenticate ZYR0 Credentials',
    description: 'Instantly verify the authenticity of any ZYR0-issued internship certificate using its unique credential ID. Blockchain-backed verification for students, employers, and institutions.',
    keywords: 'verify certificate, internship certificate verification, blockchain certificate, credential verification, ZYR0 certificate',
    structuredData: (url) => [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${url}/` },
          { '@type': 'ListItem', position: 2, name: 'Verify Certificate', item: `${url}/verify` }
        ],
      }
    ]
  },
  'privacy': {
    title: 'Privacy Policy — How ZYR0 Handles Your Data',
    description: 'Read ZYR0\'s Privacy Policy to understand how we collect, use, and protect your personal information. We are committed to data security and transparency for all platform users.',
    keywords: 'ZYR0 privacy policy, data privacy, GDPR, personal data, user privacy, internship platform privacy',
    structuredData: (url) => [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${url}/` },
          { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: `${url}/privacy` }
        ],
      }
    ]
  },
  'terms': {
    title: 'Terms of Service — ZYR0 Platform Usage Agreement',
    description: 'Review ZYR0\'s Terms of Service governing your access and use of the ZYR0 internship management platform, including rights, responsibilities, and limitations for students, companies, and mentors.',
    keywords: 'ZYR0 terms of service, platform terms, usage agreement, internship platform terms, user agreement',
    structuredData: (url) => [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${url}/` },
          { '@type': 'ListItem', position: 2, name: 'Terms of Service', item: `${url}/terms` }
        ],
      }
    ]
  },
  'cookies': {
    title: 'Cookie Policy — How ZYR0 Uses Cookies',
    description: 'Learn how ZYR0 uses cookies to keep you logged in, remember your preferences, and improve your experience. Find out which cookies are strictly necessary and which are optional.',
    keywords: 'ZYR0 cookie policy, cookies, website cookies, analytics cookies, strictly necessary cookies',
    structuredData: (url) => [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${url}/` },
          { '@type': 'ListItem', position: 2, name: 'Cookie Policy', item: `${url}/cookies` }
        ],
      }
    ]
  }
};

// Simple env parser to read Supabase credentials
function getSupabaseCreds() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (url && key) {
    return { url: url.trim(), key: key.trim() };
  }
  const envFiles = ['.env.production', '.env.local', '.env'];
  let foundUrl = '';
  let foundKey = '';
  for (const file of envFiles) {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      for (const line of lines) {
        const urlMatch = line.match(/^\s*VITE_SUPABASE_URL\s*=\s*([^\s#]+)/);
        if (urlMatch) {
          foundUrl = urlMatch[1].trim().replace(/^['"]|['"]$/g, '');
        }
        const keyMatch = line.match(/^\s*VITE_SUPABASE_ANON_KEY\s*=\s*([^\s#]+)/);
        if (keyMatch) {
          foundKey = keyMatch[1].trim().replace(/^['"]|['"]$/g, '');
        }
      }
      if (foundUrl && foundKey) break;
    }
  }
  return { url: foundUrl, key: foundKey };
}

// Helper to generate search-engine-readable body HTML for pre-rendered pages
function generateBodyHtml(routePath, data = {}) {
  const headerHtml = `
    <header style="border-bottom: 1px solid #e2e8f0; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; font-family: sans-serif;">
      <a href="/" style="font-weight: 800; font-size: 1.5rem; text-decoration: none; color: #2563eb; display: flex; align-items: center; gap: 0.5rem;">
        <img src="/zyro-logo.webp" alt="ZYR0" style="height: 32px; width: 32px; object-fit: contain;" />
        ZYR0
      </a>
      <nav style="display: flex; gap: 1.5rem; font-weight: 500;">
        <a href="/internships" style="text-decoration: none; color: #475569;">Internships</a>
        <a href="/companies" style="text-decoration: none; color: #475569;">Companies</a>
        <a href="/about" style="text-decoration: none; color: #475569;">About</a>
        <a href="/contact" style="text-decoration: none; color: #475569;">Contact</a>
        <a href="/faq" style="text-decoration: none; color: #475569;">FAQ</a>
        <a href="/help" style="text-decoration: none; color: #475569;">Help Center</a>
        <a href="/careers" style="text-decoration: none; color: #475569;">Careers</a>
        <a href="/verify" style="text-decoration: none; color: #475569;">Verify Certificate</a>
      </nav>
    </header>
  `;

  const footerHtml = `
    <footer style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 3rem 2rem; margin-top: 4rem; font-family: sans-serif;">
      <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem;">
        <div>
          <h4 style="font-weight: 700; color: #1e293b; margin-bottom: 1rem;">ZYR0 Ecosystem</h4>
          <p style="font-size: 0.875rem; color: #64748b; line-height: 1.5;">Structured internship program management for students, mentors, universities, and company partners in Pakistan.</p>
        </div>
        <div>
          <h4 style="font-weight: 700; color: #1e293b; margin-bottom: 1rem;">Quick Links</h4>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.875rem; line-height: 2;">
            <li><a href="/internships" style="text-decoration: none; color: #475569;">Browse Internships</a></li>
            <li><a href="/companies" style="text-decoration: none; color: #475569;">Employer Partners</a></li>
            <li><a href="/careers" style="text-decoration: none; color: #475569;">Careers at ZYR0</a></li>
            <li><a href="/verify" style="text-decoration: none; color: #475569;">Verify Certificate</a></li>
          </ul>
        </div>
        <div>
          <h4 style="font-weight: 700; color: #1e293b; margin-bottom: 1rem;">Support</h4>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.875rem; line-height: 2;">
            <li><a href="/help" style="text-decoration: none; color: #475569;">Help Center</a></li>
            <li><a href="/faq" style="text-decoration: none; color: #475569;">Frequently Asked Questions</a></li>
            <li><a href="/contact" style="text-decoration: none; color: #475569;">Contact Support</a></li>
          </ul>
        </div>
        <div>
          <h4 style="font-weight: 700; color: #1e293b; margin-bottom: 1rem;">Legal</h4>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.875rem; line-height: 2;">
            <li><a href="/privacy" style="text-decoration: none; color: #475569;">Privacy Policy</a></li>
            <li><a href="/terms" style="text-decoration: none; color: #475569;">Terms of Service</a></li>
            <li><a href="/cookies" style="text-decoration: none; color: #475569;">Cookie Policy</a></li>
          </ul>
        </div>
      </div>
      <div style="max-width: 1200px; margin: 2rem auto 0 auto; border-top: 1px solid #e2e8f0; padding-top: 1.5rem; text-align: center; font-size: 0.875rem; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} ZYR0. All rights reserved. Blockchain-verified credentials ecosystem.
      </div>
    </footer>
  `;

  let contentHtml = '';

  if (routePath === '') {
    // Homepage: pre-rendered SSR content for crawlers (React app takes over on client)
    contentHtml = `
      <section style="padding: 5rem 2rem 3rem; text-align: center; max-width: 1000px; margin: 0 auto; font-family: sans-serif;">
        <h1 style="font-size: 3rem; font-weight: 800; color: #1e293b; margin-bottom: 1.5rem; line-height: 1.1;">
          Structured Internship Platform for Students & Employers
        </h1>
        <p style="font-size: 1.25rem; color: #475569; line-height: 1.7; max-width: 700px; margin: 0 auto 2.5rem auto;">
          ZYR0 connects students, companies, and mentors through structured internship tracking, milestone-based task management, and blockchain-verified digital certificates. Built for Pakistan's next generation of engineers.
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 4rem;">
          <a href="/internships" style="background: #2563eb; color: #ffffff; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600;">Browse Internships</a>
          <a href="/register?type=employer" style="background: #059669; color: #ffffff; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600;">Register Your Company</a>
          <a href="/verify" style="background: #f1f5f9; color: #334155; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; border: 1px solid #e2e8f0;">Verify Certificate</a>
        </div>
      </section>

      <section style="padding: 4rem 2rem; background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
        <div style="max-width: 1000px; margin: 0 auto; font-family: sans-serif;">
          <h2 style="font-size: 2rem; font-weight: 700; color: #1e293b; text-align: center; margin-bottom: 0.5rem;">Four Products, One Ecosystem</h2>
          <p style="text-align: center; color: #64748b; margin-bottom: 3rem; font-size: 1.05rem;">Each product works standalone. Together, they cover the full lifecycle.</p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem;">
            <div style="padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; background: #ffffff;">
              <h3 style="font-weight: 700; color: #1e293b; margin-bottom: 0.5rem;">ZYR0 Studio</h3>
              <p style="color: #64748b; font-size: 0.9rem; line-height: 1.5;">Turn natural language into production-ready React apps. No boilerplate, no config.</p>
            </div>
            <div style="padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; background: #ffffff;">
              <h3 style="font-weight: 700; color: #1e293b; margin-bottom: 0.5rem;">ZYR0 School OS</h3>
              <p style="color: #64748b; font-size: 0.9rem; line-height: 1.5;">A modern operating system for schools. Admissions, attendance, grading, and timetables.</p>
            </div>
            <div style="padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; background: #ffffff;">
              <h3 style="font-weight: 700; color: #1e293b; margin-bottom: 0.5rem;">ZYR0 Research</h3>
              <p style="color: #64748b; font-size: 0.9rem; line-height: 1.5;">Autonomous deep research with verifiable citations and cross-verified reports.</p>
            </div>
            <div style="padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; background: #ffffff;">
              <h3 style="font-weight: 700; color: #1e293b; margin-bottom: 0.5rem;">ZYR0 Work</h3>
              <p style="color: #64748b; font-size: 0.9rem; line-height: 1.5;">Proof-of-work internships with GitHub-backed projects and cryptographic certificates.</p>
            </div>
          </div>
        </div>
      </section>

      <section style="padding: 4rem 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif;">
        <h2 style="font-size: 2rem; font-weight: 700; color: #1e293b; text-align: center; margin-bottom: 2.5rem;">Trusted by Students & Companies Across Pakistan</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; text-align: center;">
          <div>
            <div style="font-size: 2.5rem; font-weight: 800; color: #2563eb;">50+</div>
            <div style="color: #64748b; font-size: 0.95rem;">University Partners</div>
          </div>
          <div>
            <div style="font-size: 2.5rem; font-weight: 800; color: #059669;">100+</div>
            <div style="color: #64748b; font-size: 0.95rem;">Verified Companies</div>
          </div>
          <div>
            <div style="font-size: 2.5rem; font-weight: 800; color: #7c3aed;">1000+</div>
            <div style="color: #64748b; font-size: 0.95rem;">Interns Placed</div>
          </div>
          <div>
            <div style="font-size: 2.5rem; font-weight: 800; color: #ea580c;">100%</div>
            <div style="color: #64748b; font-size: 0.95rem;">Verified Certificates</div>
          </div>
        </div>
      </section>
    `;

  } else if (routePath === 'about') {
    contentHtml = `
      <section style="padding: 4rem 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif;">
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #1e293b; margin-bottom: 1.5rem;">About ZYR0</h1>
        <p style="font-size: 1.125rem; color: #475569; line-height: 1.7; margin-bottom: 1.5rem;">ZYR0 is Pakistan's premier modern career ecosystem, designed specifically to connect university students, supervisor mentors, and industry-leading employers in a structured portal. We bridge the gap between classroom theory and workplace experience by providing structured workflows, real-time application tracking, task management, and tamper-proof digital certificate verification.</p>
        
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1e293b; margin-top: 3rem; margin-bottom: 1rem;">Our Mission</h2>
        <p style="color: #475569; line-height: 1.7; margin-bottom: 1.5rem;">To democratize access to high-quality training and practical career experiences in Pakistan. ZYR0 enforces structured deliverables and transparent evaluations, ensuring that every internship is a genuine learning experience rather than administrative chore-work.</p>
        
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1e293b; margin-top: 2rem; margin-bottom: 1rem;">Our Vision</h2>
        <p style="color: #475569; line-height: 1.7; margin-bottom: 1.5rem;">To become the foundational career platform for higher education across South Asia. We aim to support millions of young professionals in securing vetted opportunities, acquiring certified skills, and connecting with global employers through transparent portfolios.</p>

        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1e293b; margin-top: 2rem; margin-bottom: 1rem;">Core Values</h2>
        <ul style="line-height: 1.8; color: #475569; padding-left: 1.5rem; margin-bottom: 1.5rem;">
          <li><strong>Trust:</strong> We verify every partner organization and secure all credentials to eliminate fake resumes.</li>
          <li><strong>Quality:</strong> We structure learning roadmaps so that internships lead to measurable skill acquisition.</li>
          <li><strong>Collaboration:</strong> We build dedicated channels for student, company, and mentor collaboration.</li>
          <li><strong>Equity:</strong> We enable students from all backgrounds to access career opportunities based on merit.</li>
        </ul>

        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1e293b; margin-top: 2rem; margin-bottom: 1rem;">Our Growth & Timeline</h2>
        <p style="color: #475569; line-height: 1.7; margin-bottom: 1.5rem;">Founded in 2023, ZYR0 started as an academic collaboration tool. Recognizing the massive fragmentation in the internship market, we expanded the system into an enterprise platform in 2024. Today, we support thousands of active users, collaborate with over 50 leading universities, and host hundreds of verified companies.</p>
      </section>
    `;
  } else if (routePath === 'internships') {
    contentHtml = `
      <section style="padding: 4rem 2rem; max-width: 1000px; margin: 0 auto; font-family: sans-serif;">
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #1e293b; margin-bottom: 1.5rem;">Browse Verified Internships</h1>
        <p style="font-size: 1.125rem; color: #475569; line-height: 1.7; margin-bottom: 2.5rem;">Explore vetted, detail-rich internship listings in technology, engineering, finance, design, and marketing. Filter roles by location, stipend, domain, and company size to find the position that matches your professional aspirations.</p>
        
        <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 0.5rem; padding: 2.5rem; text-align: center; margin-bottom: 3rem;">
          <h3 style="font-weight: 700; color: #334155; margin-bottom: 0.5rem;">Interactive Internship Search</h3>
          <p style="color: #64748b; max-width: 600px; margin: 0 auto 1.5rem auto;">Please enable JavaScript to search, filter, and apply to active internship listings on ZYR0.</p>
          <a href="/register" style="background: #2563eb; color: #ffffff; padding: 0.6rem 1.25rem; border-radius: 0.25rem; text-decoration: none; font-weight: 600; font-size: 0.875rem;">Create Student Profile</a>
        </div>

        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1e293b; margin-bottom: 1.5rem;">Explore Popular Domains</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 3rem;">
          <div style="padding: 1.25rem; border: 1px solid #e2e8f0; border-radius: 0.375rem;">
            <h4 style="font-weight: 700; color: #1e293b;">Software Engineering</h4>
            <p style="color: #64748b; font-size: 0.875rem; margin-top: 0.25rem;">Frontend, backend, mobile app, and DevOps positions.</p>
          </div>
          <div style="padding: 1.25rem; border: 1px solid #e2e8f0; border-radius: 0.375rem;">
            <h4 style="font-weight: 700; color: #1e293b;">Data Science & Analytics</h4>
            <p style="color: #64748b; font-size: 0.875rem; margin-top: 0.25rem;">Machine learning, SQL database design, and business intelligence.</p>
          </div>
          <div style="padding: 1.25rem; border: 1px solid #e2e8f0; border-radius: 0.375rem;">
            <h4 style="font-weight: 700; color: #1e293b;">Product Design</h4>
            <p style="color: #64748b; font-size: 0.875rem; margin-top: 0.25rem;">UI/UX research, wireframing, and interactive design prototyping.</p>
          </div>
          <div style="padding: 1.25rem; border: 1px solid #e2e8f0; border-radius: 0.375rem;">
            <h4 style="font-weight: 700; color: #1e293b;">Business & Marketing</h4>
            <p style="color: #64748b; font-size: 0.875rem; margin-top: 0.25rem;">Digital marketing, growth hacking, and operations strategy.</p>
          </div>
        </div>
      </section>
    `;
  } else if (routePath === 'companies') {
    contentHtml = `
      <section style="padding: 4rem 2rem; max-width: 1000px; margin: 0 auto; font-family: sans-serif;">
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #1e293b; margin-bottom: 1.5rem;">Partner Companies & Employers</h1>
        <p style="font-size: 1.125rem; color: #475569; line-height: 1.7; margin-bottom: 2.5rem;">ZYR0 works with vetted startups, established enterprises, software houses, and non-profits in Pakistan. Our employer partners are dedicated to providing structured internships, weekly mentorship feedback, and verified digital certificates.</p>
        
        <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 0.5rem; padding: 2.5rem; text-align: center; margin-bottom: 3rem;">
          <h3 style="font-weight: 700; color: #334155; margin-bottom: 0.5rem;">Employer Directory</h3>
          <p style="color: #64748b; max-width: 600px; margin: 0 auto 1.5rem auto;">Please enable JavaScript to browse profiles, active listings, and cultures of our partner companies.</p>
          <a href="/register?type=employer" style="background: #059669; color: #ffffff; padding: 0.6rem 1.25rem; border-radius: 0.25rem; text-decoration: none; font-weight: 600; font-size: 0.875rem;">Register Your Organization</a>
        </div>
      </section>
    `;
  } else if (routePath === 'contact') {
    contentHtml = `
      <section style="padding: 4rem 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif;">
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #1e293b; margin-bottom: 1.5rem;">Contact ZYR0 Support</h1>
        <p style="font-size: 1.125rem; color: #475569; line-height: 1.7; margin-bottom: 2.5rem;">Have questions about setting up your student profile, registering your company, matching with mentors, or verifying certificates? Our customer success team is here to assist you.</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-bottom: 3rem;">
          <div style="padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: 0.5rem;">
            <h3 style="font-weight: 700; color: #1e293b; margin-bottom: 0.5rem;">Email Support</h3>
            <p style="color: #475569; font-size: 0.95rem; margin-bottom: 0.5rem;">For general queries, accounts, and help:</p>
            <a href="mailto:support@zyroo.org" style="color: #2563eb; font-weight: 600; text-decoration: none;">support@zyroo.org</a>
          </div>
          <div style="padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: 0.5rem;">
            <h3 style="font-weight: 700; color: #1e293b; margin-bottom: 0.5rem;">Business Partnerships</h3>
            <p style="color: #475569; font-size: 0.95rem; margin-bottom: 0.5rem;">For university partnerships and enterprise plans:</p>
            <a href="mailto:partnerships@zyroo.org" style="color: #2563eb; font-weight: 600; text-decoration: none;">partnerships@zyroo.org</a>
          </div>
        </div>

        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem;">Send Us a Message</h2>
        <p style="color: #64748b; margin-bottom: 1.5rem;">Please enable JavaScript to use our secure interactive contact form. Alternatively, feel free to send us an email directly at support@zyroo.org.</p>
      </section>
    `;
  } else if (routePath === 'faq') {
    contentHtml = `
      <section style="padding: 4rem 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif;">
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #1e293b; margin-bottom: 1.5rem;">Frequently Asked Questions (FAQ)</h1>
        <p style="font-size: 1.125rem; color: #475569; line-height: 1.7; margin-bottom: 2.5rem;">Find answers to common questions about the ZYR0 internship platform. Learn how students, employers, and mentors leverage our structured workflows.</p>
        
        <div style="display: flex; flex-direction: column; gap: 2rem;">
          <div>
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem;">What is ZYR0?</h3>
            <p style="color: #475569; line-height: 1.6;">ZYR0 is a structured internship management platform. We connect university students with vetted company placements and industry mentors, providing transparent tracking tools and blockchain-verified certificates.</p>
          </div>
          <div>
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem;">Are the internships on ZYR0 paid?</h3>
            <p style="color: #475569; line-height: 1.6;">We encourage our company partners to offer stipends. Each listing explicitly details whether the position is paid, unpaid, or offers commission, alongside expected working hours and duration.</p>
          </div>
          <div>
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem;">How are certificates verified?</h3>
            <p style="color: #475569; line-height: 1.6;">Every completion certificate issued by ZYR0 is assigned a unique digital signature and credential ID. Prospective employers can enter this ID on our public verification portal to view the original internship details, company validation, and completed milestones.</p>
          </div>
          <div>
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem;">Who can become a mentor on ZYR0?</h3>
            <p style="color: #475569; line-height: 1.6;">Industry professionals with at least 3 years of technical or administrative experience can register as mentors. Mentors are matched with interns in their domain to conduct review calls, evaluate project deliverables, and guide development.</p>
          </div>
        </div>
      </section>
    `;
  } else if (routePath === 'help') {
    contentHtml = `
      <section style="padding: 4rem 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif;">
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #1e293b; margin-bottom: 1.5rem;">Help Center & Guides</h1>
        <p style="font-size: 1.125rem; color: #475569; line-height: 1.7; margin-bottom: 2.5rem;">Access comprehensive guides, tutorials, and documentations to help you get started with your ZYR0 account. Choose your role below to explore customized instructions.</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
          <div style="padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: 0.5rem;">
            <h3 style="font-weight: 700; color: #2563eb; margin-bottom: 0.5rem;">For Students</h3>
            <p style="color: #475569; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem;">Learn how to build a profile, search vetted internships, apply to postings, track application status, submit tasks, and claim certificates.</p>
            <a href="/help/student-guide" style="color: #2563eb; font-weight: 600; text-decoration: none;">Explore Student Docs &rarr;</a>
          </div>
          <div style="padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: 0.5rem;">
            <h3 style="font-weight: 700; color: #059669; margin-bottom: 0.5rem;">For Companies</h3>
            <p style="color: #475569; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem;">Learn how to verify your business, post internship positions, manage applicants, set up milestone paths, and issue verified credentials.</p>
            <a href="/help/company-guide" style="color: #059669; font-weight: 600; text-decoration: none;">Explore Employer Docs &rarr;</a>
          </div>
          <div style="padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: 0.5rem;">
            <h3 style="font-weight: 700; color: #7c3aed; margin-bottom: 0.5rem;">For Mentors</h3>
            <p style="color: #475569; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem;">Learn how to set your availability, access your matched cohort, conduct project reviews, write critiques, and evaluate student progress.</p>
            <a href="/help/mentor-guide" style="color: #7c3aed; font-weight: 600; text-decoration: none;">Explore Mentor Docs &rarr;</a>
          </div>
        </div>
      </section>
    `;
  } else if (routePath === 'careers') {
    contentHtml = `
      <section style="padding: 4rem 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif;">
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #1e293b; margin-bottom: 1.5rem;">Careers at ZYR0</h1>
        <p style="font-size: 1.125rem; color: #475569; line-height: 1.7; margin-bottom: 2rem;">At ZYR0, we are building the digital infrastructure to bridge education and professional careers. We are a fast-growing, mission-driven team of engineers, designers, and community builders working to democratize quality mentorship and career training.</p>
        <p style="font-size: 1.125rem; color: #475569; line-height: 1.7; margin-bottom: 2.5rem;">We will soon be expanding our team across product engineering, developer relations, operations, and community outreach. If you are passionate about education technology, drop us an email with your profile.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 2rem; margin-bottom: 3rem;">
          <h3 style="font-weight: 700; color: #1e293b; margin-bottom: 0.5rem;">Express Your Interest</h3>
          <p style="color: #475569; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem;">Interested in joining us? Send your CV/Portfolio and a brief description of how you want to contribute to our engineering or operations teams:</p>
          <a href="mailto:careers@zyroo.org" style="color: #2563eb; font-weight: 600; text-decoration: none; font-size: 1.1rem;">careers@zyroo.org</a>
        </div>
      </section>
    `;
  } else if (routePath === 'verify') {
    contentHtml = `
      <section style="padding: 4rem 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif;">
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #1e293b; margin-bottom: 1.5rem;">Verify ZYR0 Digital Certificate</h1>
        <p style="font-size: 1.125rem; color: #475569; line-height: 1.7; margin-bottom: 2.5rem;">Instantly verify the validity and authenticity of any digital certificate of completion issued by the ZYR0 platform. Enter the unique credential ID found on the certificate below.</p>
        
        <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 0.5rem; padding: 2.5rem; text-align: center; margin-bottom: 3rem;">
          <h3 style="font-weight: 700; color: #334155; margin-bottom: 0.5rem;">Certificate Verification Portal</h3>
          <p style="color: #64748b; max-width: 600px; margin: 0 auto 1.5rem auto;">Please enable JavaScript to search and authenticate ZYR0 credentials in real time using our secure lookup engine.</p>
          <a href="/" style="color: #2563eb; font-weight: 600; text-decoration: none;">Return to Home Page &rarr;</a>
        </div>
      </section>
    `;
  } else if (routePath === 'privacy') {
    contentHtml = `
      <section style="padding: 4rem 2rem; max-width: 800px; margin: 0 auto; line-height: 1.7; color: #334155; font-family: sans-serif;">
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #1e293b; margin-bottom: 1.5rem;">Privacy Policy</h1>
        <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 2rem;">Last Updated: July 18, 2026</p>
        
        <p>At ZYR0, we take your privacy extremely seriously. This Privacy Policy describes how we collect, store, share, use, and protect your personal information when you access or use our platform, including our website, mobile interface, and related APIs.</p>
        
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-top: 2rem; margin-bottom: 1rem;">1. Information We Collect</h2>
        <p>We collect information you provide directly to us when creating student, company, or mentor accounts. This includes name, email address, phone number, university records, resume data, employer registration numbers, and digital wallet keys for credential validation.</p>
        
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-top: 2rem; margin-bottom: 1rem;">2. How We Use Your Information</h2>
        <p>We use the collected information to establish secure accounts, process internship applications, facilitate communication between supervisors and students, maintain progress logs, and issue digital certificates of completion. We do not sell or lease your personal information to third parties.</p>

        <h2 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-top: 2rem; margin-bottom: 1rem;">3. Data Sharing and Protection</h2>
        <p>We share user details strictly as required by our platform workflow — for example, sharing student profiles with employers they apply to, or providing completed tasks to matched mentors. All data transit is encrypted, and user files are stored in secure cloud systems.</p>
      </section>
    `;
  } else if (routePath === 'terms') {
    contentHtml = `
      <section style="padding: 4rem 2rem; max-width: 800px; margin: 0 auto; line-height: 1.7; color: #334155; font-family: sans-serif;">
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #1e293b; margin-bottom: 1.5rem;">Terms of Service</h1>
        <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 2rem;">Last Updated: July 18, 2026</p>
        
        <p>By accessing or using the ZYR0 platform, you agree to comply with and be bound by these Terms of Service. Please read them carefully before creating your student, company, or mentor account.</p>
        
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-top: 2rem; margin-bottom: 1rem;">1. Account Registration</h2>
        <p>You agree to provide true, accurate, and complete information during registration. Users are solely responsible for maintaining the confidentiality of their credentials and all activities occurring under their accounts.</p>
        
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-top: 2rem; margin-bottom: 1rem;">2. Platform Usage and Conduct</h2>
        <p>ZYR0 serves as a structured portal for professional development. Students must submit original project work, companies must provide verified training positions with proper mentorship, and mentors must deliver fair and honest reviews. Abuse, plagiarism, or fraud will result in immediate termination.</p>

        <h2 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-top: 2rem; margin-bottom: 1rem;">3. Intellectual Property and Certificates</h2>
        <p>All software, brand elements, and workflows are the property of ZYR0. Certificates of completion issued on the platform remain valid as long as they can be authenticated on our official verification portal.</p>
      </section>
    `;
  } else if (routePath === 'cookies') {
    contentHtml = `
      <section style="padding: 4rem 2rem; max-width: 800px; margin: 0 auto; line-height: 1.7; color: #334155; font-family: sans-serif;">
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #1e293b; margin-bottom: 1.5rem;">Cookie Policy</h1>
        <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 2rem;">Last Updated: July 18, 2026</p>
        
        <p>This Cookie Policy explains how ZYR0 uses cookies and similar tracking technologies to recognize you when you visit our website. It explains what these technologies are, why we use them, and your rights to control them.</p>
        
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-top: 2rem; margin-bottom: 1rem;">1. What Are Cookies?</h2>
        <p>Cookies are small data files placed on your computer or mobile device when you visit a website. They are widely used by website owners to make websites work, or work more efficiently, as well as to provide reporting information.</p>
        
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-top: 2rem; margin-bottom: 1rem;">2. Cookies We Use</h2>
        <p>We use strictly necessary cookies to keep you logged in to your student or employer dashboard, remember your security sessions, and handle system settings. We also use performance/analytics cookies to track page views and optimize loading times.</p>
      </section>
    `;
  } else if (routePath === '404') {
    contentHtml = `
      <section style="text-align: center; padding: 5rem 2rem; max-width: 600px; margin: 0 auto; font-family: sans-serif;">
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #1e293b; margin-bottom: 1rem;">Page Not Found</h1>
        <p style="font-size: 1.125rem; color: #475569; line-height: 1.6; margin-bottom: 2rem;">The page you are looking for does not exist or has been moved.</p>
        <a href="/" style="color: #2563eb; font-weight: 600; text-decoration: none;">Return to ZYR0 Home &rarr;</a>
      </section>
    `;
  } else if (routePath === 'company_profile') {
    const c = data.company || {};
    contentHtml = `
      <section style="padding: 4rem 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif;">
        <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem;">
          <img src="${c.logo_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(c.name || '')}" alt="${c.name || 'Company'}" style="width: 80px; height: 80px; border-radius: 0.5rem; object-fit: contain; border: 1px solid #e2e8f0; padding: 0.25rem;" />
          <div>
            <h1 style="font-size: 2.25rem; font-weight: 800; color: #1e293b; margin: 0 0 0.5rem 0;">${c.name}</h1>
            <p style="color: #64748b; margin: 0; font-size: 1.1rem;">Verified Employer Partner</p>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 3rem; margin-top: 2rem;">
          <div>
            <h2 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem;">About ${c.name}</h2>
            <p style="color: #475569; line-height: 1.7; margin-bottom: 1.5rem;">${c.description || 'No description provided.'}</p>
          </div>
          <div>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1.5rem;">
              <h3 style="font-size: 1.1rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem;">Company Info</h3>
              <p style="font-size: 0.9rem; color: #475569; margin-bottom: 0.75rem;"><strong>Website:</strong> <a href="${c.website || '#'}" style="color: #2563eb; text-decoration: none;">${c.website || 'N/A'}</a></p>
              <p style="font-size: 0.9rem; color: #475569; margin-bottom: 0.75rem;"><strong>Industry:</strong> ${c.industry || 'Technology'}</p>
              <p style="font-size: 0.9rem; color: #475569; margin-bottom: 0;"><strong>Location:</strong> Pakistan</p>
            </div>
          </div>
        </div>
      </section>
    `;
  } else if (routePath === 'internship_detail') {
    const j = data.internship || {};
    const companyName = j.company?.name || 'ZYR0 Partner';
    contentHtml = `
      <section style="padding: 4rem 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif;">
        <a href="/internships" style="color: #2563eb; text-decoration: none; font-weight: 600; font-size: 0.9rem;">&larr; Back to Internships</a>
        
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #1e293b; margin-top: 1.5rem; margin-bottom: 0.5rem;">${j.title}</h1>
        <p style="font-size: 1.25rem; color: #64748b; margin-bottom: 2rem;">at <strong>${companyName}</strong></p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 3rem; padding: 1.5rem; background-color: #f8fafc; border-radius: 0.5rem; border: 1px solid #e2e8f0;">
          <div>
            <div style="font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Domain</div>
            <div style="font-weight: 600; color: #334155; margin-top: 0.25rem;">${j.domain}</div>
          </div>
          <div>
            <div style="font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Duration</div>
            <div style="font-weight: 600; color: #334155; margin-top: 0.25rem;">${j.duration}</div>
          </div>
          <div>
            <div style="font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Location</div>
            <div style="font-weight: 600; color: #334155; margin-top: 0.25rem;">${j.location_type} (${j.location || 'Remote'})</div>
          </div>
          <div>
            <div style="font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Stipend</div>
            <div style="font-weight: 600; color: #334155; margin-top: 0.25rem;">${j.stipend ? '$' + j.stipend + '/month' : 'Unpaid'}</div>
          </div>
        </div>

        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem;">Internship Description</h2>
        <p style="color: #475569; line-height: 1.7; margin-bottom: 2rem;">${j.description || 'No description provided.'}</p>
        
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem;">Requirements & Qualifications</h2>
        <p style="color: #475569; line-height: 1.7; margin-bottom: 2rem;">${j.requirements || 'No specific requirements listed. Open to motivated students.'}</p>

        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem;">What You Will Learn</h2>
        <p style="color: #475569; line-height: 1.7; margin-bottom: 3rem;">Participate in structured cohorts, complete assigned projects on our interactive milestone tracker, and obtain detailed feedback and reviews from matched industry mentors.</p>

        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 0.5rem; padding: 2rem; text-align: center;">
          <h3 style="font-weight: 700; color: #1e3a8a; margin-bottom: 0.5rem;">Ready to Apply?</h3>
          <p style="color: #2b6cb0; font-size: 0.95rem; margin-bottom: 1.25rem;">Create your student account and submit your profile directly to ${companyName}.</p>
          <a href="/register" style="background: #2563eb; color: #ffffff; padding: 0.6rem 1.5rem; border-radius: 0.25rem; text-decoration: none; font-weight: 600; font-size: 0.9rem; display: inline-block;">Apply Now on ZYR0</a>
        </div>
      </section>
    `;
  }

  return `
    ${headerHtml}
    <main style="min-height: 70vh; font-family: sans-serif;">
      ${contentHtml}
    </main>
    ${footerHtml}
  `;
}

// Function to construct pre-rendered HTML by injecting tags
function renderTemplate(html, meta) {
  const normalizeBranding = (text) => {
    if (!text) return text;
    return text.replace(/\b[Zz]yro\b/g, 'ZYR0');
  };

  const title = normalizeBranding(meta.title);
  const description = normalizeBranding(meta.description);
  const keywords = meta.keywords ? normalizeBranding(meta.keywords) : '';
  const canonicalUrl = meta.canonicalUrl;
  const image = meta.image || `${SITE_URL}/og-image.png`;
  const type = meta.type || 'website';
  const noIndex = !!meta.noIndex;

  let structuredDataHtml = '';
  if (meta.structuredData) {
    const list = typeof meta.structuredData === 'function' ? meta.structuredData(SITE_URL) : meta.structuredData;
    if (Array.isArray(list)) {
      structuredDataHtml = list.map(schema => 
        `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
      ).join('\n    ');
    }
  }

  // Build full title
  const fullTitle = title.includes('ZYR0') ? title : `${title} | ZYR0`;

  const metaTags = `
    <!-- Pre-rendered SEO Tags -->
    <title>${fullTitle}</title>
    <meta name="description" content="${description}" />
    ${keywords ? `<meta name="keywords" content="${keywords}" />` : ''}
    <meta name="robots" content="${noIndex ? 'noindex, nofollow' : 'index, follow'}" />
    <link rel="canonical" href="${canonicalUrl}" />

    <!-- Open Graph -->
    <meta property="og:type" content="${type}" />
    <meta property="og:site_name" content="ZYR0" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${fullTitle}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:alt" content="${fullTitle}" />
    <meta property="og:locale" content="en_US" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@zyroplatform" />
    <meta name="twitter:creator" content="@zyroplatform" />
    <meta name="twitter:title" content="${fullTitle}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:image:alt" content="${fullTitle}" />

    <!-- Structured Data -->
    ${structuredDataHtml}
  `;

  // Strip any existing SEO/meta tags from the template to prevent duplicates
  let cleanedHtml = html
    .replace(/<title>[^]*?<\/title>/gi, '')
    .replace(/<meta\s+name=["']description["']\s+content=["'][^]*?["']\s*\/?>/gi, '')
    .replace(/<meta\s+property=["']og:title["']\s+content=["'][^]*?["']\s*\/?>/gi, '')
    .replace(/<meta\s+property=["']og:description["']\s+content=["'][^]*?["']\s*\/?>/gi, '')
    .replace(/<meta\s+name=["']twitter:title["']\s+content=["'][^]*?["']\s*\/?>/gi, '')
    .replace(/<meta\s+name=["']twitter:description["']\s+content=["'][^]*?["']\s*\/?>/gi, '')
    .replace(/<link\s+rel=["']canonical["']\s+href=["'][^]*?["']\s*\/?>/gi, '');

  // Inject pre-rendered body HTML inside #root if path is provided
  if (meta.path !== undefined) {
    const bodyHtml = generateBodyHtml(meta.path, meta.data);
    if (bodyHtml) {
      cleanedHtml = cleanedHtml.replace(/<div\s+id=["']root["']>\s*<\/div>/i, `<div id="root">${bodyHtml}</div>`);
    }
  }

  // Inject metaTags just before </head>
  return cleanedHtml.replace('</head>', `${metaTags}\n  </head>`);
}

function prerenderStaticPages(indexHtml) {
  console.log('[SEO Prerender] Pre-rendering static public pages...');
  
  for (const [routePath, meta] of Object.entries(staticPagesMeta)) {
    const pagePath = routePath;
    const canonicalUrl = pagePath ? `${SITE_URL}/${pagePath}` : `${SITE_URL}/`;
    
    const pageMeta = {
      ...meta,
      canonicalUrl,
      path: routePath
    };

    const pageHtml = renderTemplate(indexHtml, pageMeta);

    if (!pagePath) {
      // Overwrite the root index.html in dist
      fs.writeFileSync(path.join(distDir, 'index.html'), pageHtml, 'utf-8');
      console.log(`[SEO Prerender] Wrote pre-rendered homepage to ${distDir}/index.html`);
    } else {
      const routeDir = path.join(distDir, pagePath);
      fs.mkdirSync(routeDir, { recursive: true });
      fs.writeFileSync(path.join(routeDir, 'index.html'), pageHtml, 'utf-8');
      console.log(`[SEO Prerender] Wrote pre-rendered static page: ${pagePath} to ${routeDir}/index.html`);
    }
  }
}

// Extend the sitemap with dynamic, indexable URLs (approved companies + active internships)
// using honest lastmod dates from the database. Listing pages adopt the newest record date.
function writeEnhancedSitemap(companies, internships) {
  const entries = buildStaticSitemapEntries();

  const newest = (rows) => {
    if (!rows || rows.length === 0) return '';
    return isoDate(Math.max(...rows.map((r) => new Date(r.updated_at || r.created_at).getTime())));
  };
  const newestCompany = newest(companies);
  const newestInternship = newest(internships);

  for (const entry of entries) {
    if (entry.loc === `${SITE_URL}/companies` && newestCompany) entry.lastmod = newestCompany;
    if (entry.loc === `${SITE_URL}/internships` && newestInternship) entry.lastmod = newestInternship;
  }

  for (const company of companies || []) {
    entries.push({
      loc: `${SITE_URL}/companies/${company.id}`,
      lastmod: isoDate(company.updated_at || company.created_at),
    });
  }
  for (const internship of internships || []) {
    entries.push({
      loc: `${SITE_URL}/internships/${internship.id}`,
      lastmod: isoDate(internship.updated_at || internship.created_at),
    });
  }

  writeSitemap(entries);
}

async function prerenderDynamicPages(indexHtml) {
  const creds = getSupabaseCreds();
  if (!creds.url || !creds.key) {
    console.warn('[SEO Prerender] Missing Supabase credentials. Skipping dynamic pages pre-rendering.');
    return;
  }

  // PostgREST helper — plain fetch (no supabase-js, so no WebSocket requirement on Node 20 CI)
  async function supabaseQuery(path, params) {
    const url = new URL(`${creds.url}/rest/v1/${path}`);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const res = await fetch(url, {
      headers: {
        apikey: creds.key,
        Authorization: `Bearer ${creds.key}`,
        Accept: 'application/json',
      },
    });
    if (!res.ok) throw new Error(`Supabase ${path} failed: HTTP ${res.status} ${await res.text()}`);
    return res.json();
  }

  try {
    let companies = [];
    let internships = [];

    console.log('[SEO Prerender] Fetching approved companies from Supabase...');
    try {
      companies = await supabaseQuery('companies', { select: '*', status: 'eq.approved' });
      console.log(`[SEO Prerender] Pre-rendering ${companies.length} approved company profiles...`);
    } catch (err) {
      console.error('[SEO Prerender] Error fetching companies:', err.message);
    }

    for (const company of companies) {
        const id = company.id;
        const pagePath = `companies/${id}`;
        const canonicalUrl = `${SITE_URL}/${pagePath}`;
        
        // Define metadata
        const title = `${company.name} — Careers, Internships & Company Profile`;
        const description = company.description || `Learn more about ${company.name}, view their available internship programs, project categories, and contact information on ZYR0.`;
        const keywords = `${company.name}, ${company.name} internships, ${company.name} jobs, ZYR0 companies`;
        const logoUrl = company.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random`;
        
        const companyStructuredData = [
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: company.name,
            description: company.description || `Learn about careers and internship opportunities at ${company.name} on ZYR0.`,
            logo: logoUrl,
            url: company.website || canonicalUrl,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Companies', item: `${SITE_URL}/companies` },
              { '@type': 'ListItem', position: 3, name: company.name, item: canonicalUrl },
            ],
          },
        ];

        const meta = {
          title,
          description,
          keywords,
          canonicalUrl,
          image: company.logo_url || undefined,
          structuredData: companyStructuredData,
          path: 'company_profile',
          data: { company }
        };

        const pageHtml = renderTemplate(indexHtml, meta);
        const routeDir = path.join(distDir, 'companies', id);
        fs.mkdirSync(routeDir, { recursive: true });
        fs.writeFileSync(path.join(routeDir, 'index.html'), pageHtml, 'utf-8');
      }

    console.log('[SEO Prerender] Fetching active internships from Supabase...');
    try {
      internships = await supabaseQuery('internships', {
        select: '*,company:companies(name, website, logo_url)',
        status: 'eq.Active',
      });
      console.log(`[SEO Prerender] Pre-rendering ${internships.length} active internship opportunities...`);
    } catch (err) {
      console.error('[SEO Prerender] Error fetching internships:', err.message);
    }

    for (const internship of internships) {
        const id = internship.id;
        const pagePath = `internships/${id}`;
        const canonicalUrl = `${SITE_URL}/${pagePath}`;
        const companyName = internship.company?.name || 'ZYR0 Partner';
        
        // Define metadata
        const title = `${internship.title} Internship at ${companyName}`;
        const description = `${internship.title} internship opportunity. Domain: ${internship.domain}. Duration: ${internship.duration}. Location: ${internship.location_type}. Learn more and apply on ZYR0.`;
        const keywords = `${internship.title}, ${companyName} internship, ${internship.domain} internship, ZYR0 jobs`;
        const logoUrl = internship.company?.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}`;
        
        const jobStructuredData = [
          {
            '@context': 'https://schema.org',
            '@type': 'JobPosting',
            title: internship.title,
            description: internship.description,
            datePosted: internship.posted_date || internship.created_at,
            validThrough: internship.deadline || undefined,
            employmentType: 'INTERN',
            hiringOrganization: {
              '@type': 'Organization',
              name: companyName,
              sameAs: internship.company?.website || undefined,
              logo: logoUrl,
            },
            jobLocation: {
              '@type': 'Place',
              address: {
                '@type': 'PostalAddress',
                addressLocality: internship.location || 'Remote',
                addressCountry: 'US',
              },
            },
            baseSalary: internship.stipend ? {
              '@type': 'MonetaryAmount',
              currency: 'USD',
              value: {
                '@type': 'QuantitativeValue',
                value: internship.stipend,
                unitText: 'MONTH',
              },
            } : undefined,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Internships', item: `${SITE_URL}/internships` },
              { '@type': 'ListItem', position: 3, name: internship.title, item: canonicalUrl },
            ],
          },
        ];

        const meta = {
          title,
          description,
          keywords,
          canonicalUrl,
          image: internship.company?.logo_url || undefined,
          structuredData: jobStructuredData,
          path: 'internship_detail',
          data: { internship }
        };

        const pageHtml = renderTemplate(indexHtml, meta);
        const routeDir = path.join(distDir, 'internships', id);
        fs.mkdirSync(routeDir, { recursive: true });
        fs.writeFileSync(path.join(routeDir, 'index.html'), pageHtml, 'utf-8');
      }

    // Append dynamic URLs to the sitemap now that real data is available
    writeEnhancedSitemap(companies, internships);

  } catch (err) {
    console.error('[SEO Prerender] Dynamic pre-rendering failed:', err);
  }
}

// Run pre-rendering if dist/ exists
if (fs.existsSync(distDir)) {
  const indexHtmlPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
    // Strip any previously pre-rendered tags to start with a clean template
    const cleanIndexHtml = indexHtml.replace(/<!-- Pre-rendered SEO Tags -->[\s\S]*<\/head>/i, '</head>');
    
    // First pre-render static pages (which also updates dist/index.html)
    prerenderStaticPages(cleanIndexHtml);

    // Pre-render a no-index 404 fallback for crawlers that hit unknown URLs without JS
    const notFoundMeta = {
      title: 'Page Not Found',
      description: 'The page you are looking for does not exist or has been moved. Return to ZYR0 to find internships and career opportunities.',
      canonicalUrl: `${SITE_URL}/`,
      path: '404',
      noIndex: true,
    };
    const notFoundHtml = renderTemplate(cleanIndexHtml, notFoundMeta);
    fs.writeFileSync(path.join(distDir, '404.html'), notFoundHtml, 'utf-8');
    console.log('[SEO Prerender] Wrote noindex 404 fallback to dist/404.html');
    
    // Then pre-render dynamic pages using the clean original indexHtml template
    await prerenderDynamicPages(cleanIndexHtml);
  } else {
    console.warn(`[SEO Prerender] Template ${indexHtmlPath} not found!`);
  }
}

