import { Helmet } from 'react-helmet-async';
import { SITE_NAME, BASE_URL, DEFAULT_IMAGE, TWITTER_HANDLE } from '@/config/seo';

interface SEOProps {
  /** Page title — will be appended with " | ZYR0" unless it already contains "ZYR0" */
  title: string;
  /** Meta description (recommended 150–160 chars) */
  description: string;
  /** Canonical path, e.g. "/internships". Defaults to "/" */
  path?: string;
  /** OG/Twitter image URL. Defaults to the site-wide og-image */
  image?: string;
  /** OG type. Defaults to "website" */
  type?: 'website' | 'article';
  /** Prevent search engines from indexing this page */
  noIndex?: boolean;
  /** JSON-LD structured data array (each item is a schema object) */
  structuredData?: Record<string, unknown>[];
  /** Additional meta keywords (comma-separated) */
  keywords?: string;
}

/**
 * Drop-in SEO head component using react-helmet-async.
 * Renders title, meta description, canonical, Open Graph, Twitter Card,
 * robots, and optional JSON-LD structured data.
 */
export function SEO({
  title,
  description,
  path = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  noIndex = false,
  structuredData,
  keywords,
}: SEOProps) {
  // Normalize branding to ensure consistency
  const normalizeBranding = (text: string): string => {
    if (!text) return text;
    // Replace standalone "Zyro" or "zyro" (case-insensitive) with "ZYR0"
    // Does not match URLs (e.g. zyroo.dpdns.org) or email addresses/handles (@zyroplatform)
    return text.replace(/\b[Zz]yro\b/g, 'ZYR0');
  };

  const cleanTitle = normalizeBranding(title);
  const cleanDescription = normalizeBranding(description);
  const cleanKeywords = keywords ? normalizeBranding(keywords) : undefined;

  const fullTitle = cleanTitle.includes(SITE_NAME) ? cleanTitle : `${cleanTitle} | ${SITE_NAME}`;
  const canonicalUrl = `${BASE_URL}${path}`;
  const robotsContent = noIndex ? 'noindex, nofollow' : 'index, follow';

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={cleanDescription} />
      {cleanKeywords && <meta name="keywords" content={cleanKeywords} />}
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={cleanDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={cleanDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {/* Structured Data */}
      {structuredData?.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
