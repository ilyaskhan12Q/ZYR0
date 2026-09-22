import { lazy, Suspense } from 'react';
import { SEO } from '@/components/SEO';
import Header from '@/components/nav/Header';
import { ShaderHero } from '@/components/ui/shader-hero';
import LogoWall from '@/components/platform-home/LogoWall';
import BentoProductGrid from '@/components/platform-home/BentoProductGrid';
import FeatureHighlightStrip from '@/components/platform-home/FeatureHighlightStrip';
import SkillsSection from '@/components/platform-home/SkillsSection';
import BlogPreviewSection from '@/components/platform-home/BlogPreviewSection';
import CTASection from '@/components/platform-home/CTASection';
import PlatformFooter from '@/components/nav/PlatformFooter';

const FAQSection = lazy(() => import('@/components/platform-home/FAQSection'));

function SectionFallback() {
  return (
    <div
      className="min-h-[160px] flex items-center justify-center text-xs"
      style={{ color: 'var(--zyro-text-muted)' }}
    >
      Loading...
    </div>
  );
}

export default function PlatformHome() {
  return (
    <div className="min-h-screen bg-[#07070D] text-white overflow-x-hidden">
      <SEO
        title="ZYR0 — The Multi-Product AI & SaaS Ecosystem"
        description="Build full-stack apps with ZYR0 Studio, manage institutions with School OS, run autonomous deep research with the Research Agent, and gain verified experience with ZYR0 Work."
        path="/"
      />
      {/* Header — preserved untouched */}
      <Header />

      <main>
        {/* Clean Hero — solid dark, Apple-style minimal, Agbalumo wordmark */}
        <ShaderHero />

        {/* Partner & Infrastructure Logos — authentic SVGs */}
        <LogoWall />

        {/* Core Products Showcase — enriched Bento Grid with UI mockups */}
        <BentoProductGrid />

        {/* Linear/Vercel-style Feature Highlight Strip */}
        <FeatureHighlightStrip />

        {/* Skills Marketplace — featured official & community skills */}
        <SkillsSection />

        {/* Editorial Insights — Latest from the Blog */}
        <BlogPreviewSection />

        {/* Common Questions & Answers Accordion */}
        <Suspense fallback={<SectionFallback />}>
          <FAQSection />
        </Suspense>

        {/* Minimal Statement CTA */}
        <CTASection />
      </main>

      {/* Footer — preserved untouched */}
      <PlatformFooter />
    </div>
  );
}
