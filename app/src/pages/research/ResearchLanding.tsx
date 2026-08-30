import { SEO } from '@/components/SEO';
import Header from '@/components/nav/Header';
import { HeroSection } from '@/components/research-landing/HeroSection';
import { EditorialStatement } from '@/components/research-landing/EditorialStatement';
import { ResearchEngine } from '@/components/research-landing/ResearchEngine';
import { LiveResearchSection } from '@/components/research-landing/LiveResearchSection';
import { SourceUniverse } from '@/components/research-landing/SourceUniverse';
import { EvidenceSection } from '@/components/research-landing/EvidenceSection';
import { ReportSection } from '@/components/research-landing/ReportSection';
import { FeaturesSection } from '@/components/research-landing/FeaturesSection';
import { AudienceSection } from '@/components/research-landing/AudienceSection';
import { ModelsSection } from '@/components/research-landing/ModelsSection';
import { PricingSection } from '@/components/research-landing/PricingSection';
import { FinalCta } from '@/components/research-landing/FinalCta';
import { ResearchFooter } from '@/components/research-landing/ResearchFooter';
import '@/styles/research-landing.css';

export default function ResearchLanding() {
  return (
    <div className="rl-root min-h-screen">
      <SEO
        title="ZYR0 Research Agent — Research without the guesswork"
        description="Deep research, verified sources, structured reports. One question at a time."
        path="/research"
      />
      <Header />
      <main>
        <HeroSection />
        <EditorialStatement />
        <ResearchEngine />
        <LiveResearchSection />
        <SourceUniverse />
        <EvidenceSection />
        <ReportSection />
        <FeaturesSection />
        <AudienceSection />
        <ModelsSection />
        <PricingSection />
        <FinalCta />
      </main>
      <ResearchFooter />
    </div>
  );
}
