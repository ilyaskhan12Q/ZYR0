import { lazy, Suspense } from 'react';
import { SEO } from '@/components/SEO';
import Header from '@/components/nav/Header';
import HeroSection from '@/components/platform-home/HeroSection';
import LogoWall from '@/components/platform-home/LogoWall';
import BentoProductGrid from '@/components/platform-home/BentoProductGrid';
import DeepDiveSection from '@/components/platform-home/DeepDiveSection';
import SolutionsSection from '@/components/platform-home/SolutionsSection';
import CTASection from '@/components/platform-home/CTASection';
import PlatformFooter from '@/components/nav/PlatformFooter';

const PricingSection = lazy(() => import('@/components/platform-home/PricingSection'));
const FAQSection = lazy(() => import('@/components/platform-home/FAQSection'));

function SectionFallback() {
  return (
    <div
      className="min-h-[200px] flex items-center justify-center text-xs"
      style={{ color: 'var(--zyro-text-muted)' }}
    >
      Loading...
    </div>
  );
}

export default function PlatformHome() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <SEO
        title="ZYR0 — The Multi-Product AI & SaaS Ecosystem"
        description="Build full-stack apps with ZYR0 Studio, manage educational institutions with School OS, run autonomous deep research with the Research Agent, and gain verified work experience with ZYR0 Work."
        path="/"
      />
      <Header />
      <main>
        <HeroSection />
        <LogoWall />
        <BentoProductGrid />
        <DeepDiveSection />
        <SolutionsSection />
        <Suspense fallback={<SectionFallback />}>
          <PricingSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <FAQSection />
        </Suspense>
        <CTASection />
      </main>
      <PlatformFooter />
    </div>
  );
}
