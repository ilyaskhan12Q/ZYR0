import { lazy, Suspense } from 'react';
import { SEO } from '@/components/SEO';
import PlatformNav from '@/components/nav/PlatformNav';
import HeroSection from '@/components/platform-home/HeroSection';
import BentoProductGrid from '@/components/platform-home/BentoProductGrid';
import SolutionsSection from '@/components/platform-home/SolutionsSection';
import CTASection from '@/components/platform-home/CTASection';
import PlatformFooter from '@/components/nav/PlatformFooter';

const PricingSection = lazy(() => import('@/components/platform-home/PricingSection'));
const FAQSection = lazy(() => import('@/components/platform-home/FAQSection'));

function SectionFallback() {
  return <div className="min-h-[200px] flex items-center justify-center text-neutral-600 text-xs font-mono">Loading section...</div>;
}

export default function PlatformHome() {
  return (
    <div
      className="min-h-screen bg-black text-white selection:bg-cyan-500 selection:text-black font-sans antialiased overflow-x-hidden"
    >
      <SEO
        title="ZYR0 — The Multi-Product AI & SaaS Ecosystem"
        description="Build full-stack apps with ZYR0 Studio, manage educational institutions with School OS, run autonomous deep research with 0-AI, and gain verified work experience with ZYR0 Work."
        path="/"
      />
      <PlatformNav />
      <main>
        <HeroSection />
        <BentoProductGrid />
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
