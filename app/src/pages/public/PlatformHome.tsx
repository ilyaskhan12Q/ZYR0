import { lazy, Suspense } from 'react';
import { SEO } from '@/components/SEO';
import PlatformNavbar from '@/components/platform-home/PlatformNavbar';
import HeroSection from '@/components/platform-home/HeroSection';
import ProductOverview from '@/components/platform-home/ProductOverview';
import BenefitsSection from '@/components/platform-home/BenefitsSection';
import ProgressSection from '@/components/platform-home/ProgressSection';
import ToolsSection from '@/components/platform-home/ToolsSection';
import CTASection from '@/components/platform-home/CTASection';
import PlatformFooter from '@/components/platform-home/PlatformFooter';
import '@/styles/platform-home.css';

const PricingSection = lazy(() => import('@/components/platform-home/PricingSection'));
const BlogSection = lazy(() => import('@/components/platform-home/BlogSection'));
const TeamSection = lazy(() => import('@/components/platform-home/TeamSection'));
const GlobalSection = lazy(() => import('@/components/platform-home/GlobalSection'));
const TestimonialsSection = lazy(() => import('@/components/platform-home/TestimonialsSection'));
const FAQSection = lazy(() => import('@/components/platform-home/FAQSection'));

function SectionFallback() {
  return <div style={{ minHeight: '200px' }} />;
}

export default function PlatformHome() {
  return (
    <div
      className="framer-cLVzK framer-UqYjt framer-ViuFf framer-TzYaw framer-kCvBu framer-yTp47 framer-fZtkZ framer-72rtr7"
      data-framer-root
      style={{ minHeight: '100vh', width: 'auto', background: 'rgb(0, 0, 0)', color: 'rgb(255, 255, 255)' }}
    >
      <SEO
        title="ZYR0 — Internships, Research, and More"
        description="A platform built for students, researchers, and the modern workforce. Find internships, conduct deep research, and build your career."
        path="/"
      />
      <PlatformNavbar />
      <HeroSection />
      <ProductOverview />
      <BenefitsSection />
      <ProgressSection />
      <ToolsSection />
      <Suspense fallback={<SectionFallback />}>
        <PricingSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <BlogSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <TeamSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <GlobalSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <TestimonialsSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <FAQSection />
      </Suspense>
      <CTASection />
      <PlatformFooter />
    </div>
  );
}
