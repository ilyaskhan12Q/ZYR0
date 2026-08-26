import { SEO } from '@/components/SEO';
import PlatformNavbar from '@/components/platform-home/PlatformNavbar';
import HeroSection from '@/components/platform-home/HeroSection';
import ProductOverview from '@/components/platform-home/ProductOverview';
import BenefitsSection from '@/components/platform-home/BenefitsSection';
import ProgressSection from '@/components/platform-home/ProgressSection';
import ToolsSection from '@/components/platform-home/ToolsSection';
import PricingSection from '@/components/platform-home/PricingSection';
import BlogSection from '@/components/platform-home/BlogSection';
import TeamSection from '@/components/platform-home/TeamSection';
import GlobalSection from '@/components/platform-home/GlobalSection';
import TestimonialsSection from '@/components/platform-home/TestimonialsSection';
import FAQSection from '@/components/platform-home/FAQSection';
import CTASection from '@/components/platform-home/CTASection';
import PlatformFooter from '@/components/platform-home/PlatformFooter';
import '@/styles/platform-home.css';

export default function PlatformHome() {
  return (
    <div className="ph-root">
      <SEO
        title="ZYR0 — Internships, Research, and More"
        description="A platform built for students, researchers, and the modern workforce. Find internships, conduct deep research, and build your career."
        path="/"
      />
      <PlatformNavbar />
      <main>
        <HeroSection />
        <ProductOverview />
        <BenefitsSection />
        <ProgressSection />
        <ToolsSection />
        <PricingSection />
        <BlogSection />
        <TeamSection />
        <GlobalSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <PlatformFooter />
    </div>
  );
}
