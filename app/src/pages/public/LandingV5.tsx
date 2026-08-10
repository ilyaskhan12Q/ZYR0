import { SEO } from '@/components/SEO';
import { BASE_URL } from '@/config/seo';
import { HeroV5 } from '@/components/landing-v5/HeroV5';
import { TickerStrip } from '@/components/landing-v5/TickerStrip';
import { JourneyDeck } from '@/components/landing-v5/JourneyDeck';
import { ProofSplit } from '@/components/landing-v5/ProofSplit';
import { DomainExplorer } from '@/components/landing-v5/DomainExplorer';
import { CertificateSandbox } from '@/components/landing-v5/CertificateSandbox';
import { ReviewThread } from '@/components/landing-v5/ReviewThread';
import { FaqTerminal } from '@/components/landing-v5/FaqTerminal';
import { CtaSection } from '@/components/landing-v5/CtaSection';

const v5StructuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ZYR0',
    url: `${BASE_URL}/`,
    description: 'GitHub-native workforce readiness platform with verifiable internship credentials.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ZYR0',
    url: `${BASE_URL}/`,
    logo: `${BASE_URL}/zyro-logo.png`,
    sameAs: ['https://github.com/ilyaskhan12Q/ZYR0', 'https://linkedin.com/company/zyr0-co'],
  },
];

/**
 * Landing V5 — "Precision Engineering Console"
 * Dark-only, dev-tool aesthetic. Fully self-contained: renders inside PublicLayout
 * (which provides the site header & footer).
 */
export default function LandingV5() {
  return (
    <div className="bg-[#08090a] text-white overflow-x-clip antialiased">
      <SEO
        title="ZYR0 — Build Real Projects. Earn Verifiable Credentials."
        description="ZYR0 is a GitHub-native internship platform: structured tasks, mentor rubric reviews, official offer letters, and QR-verifiable certificates — proof of work employers can trust."
        path="/v5"
        keywords="internship platform, github internships, verifiable certificates, proof of work, student internships Pakistan"
        structuredData={v5StructuredData}
      />

      <HeroV5 />
      <TickerStrip />
      <JourneyDeck />
      <ProofSplit />
      <DomainExplorer />
      <CertificateSandbox />
      <ReviewThread />
      <FaqTerminal />
      <CtaSection />
    </div>
  );
}
