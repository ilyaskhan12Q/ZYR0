import { SEO } from '@/components/SEO';
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
import '@/styles/research-landing.css';

export default function ResearchLanding() {
  return (
    <div className="rl-root min-h-page -mt-[var(--zyro-header-h)]">
      <SEO
        title="ZYR0 Research Agent — Research without the guesswork"
        description="Deep research, verified sources, structured reports. One question at a time."
        path="/research"
      />
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
    </div>
  );
}
