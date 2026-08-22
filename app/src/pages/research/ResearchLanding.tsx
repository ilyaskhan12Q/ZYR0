import { SEO } from '@/components/SEO';
import { ResearchNav } from '@/components/research-landing/ResearchNav';
import { HeroSection } from '@/components/research-landing/HeroSection';
import { EditorialStatement } from '@/components/research-landing/EditorialStatement';
import { QuestionExploration } from '@/components/research-landing/QuestionExploration';
import { ResearchEngine } from '@/components/research-landing/ResearchEngine';
import { LiveResearchSection } from '@/components/research-landing/LiveResearchSection';
import { SourceUniverse } from '@/components/research-landing/SourceUniverse';
import { EvidenceSection } from '@/components/research-landing/EvidenceSection';
import { ReportSection } from '@/components/research-landing/ReportSection';
import { FeaturesSection } from '@/components/research-landing/FeaturesSection';
import { AudienceSection } from '@/components/research-landing/AudienceSection';
import { LibrarySection } from '@/components/research-landing/LibrarySection';
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
      <ResearchNav />
      <main>
        <HeroSection />
        <EditorialStatement />
        <QuestionExploration />
        <ResearchEngine />
        <LiveResearchSection />
        <SourceUniverse />
        <EvidenceSection />
        <ReportSection />
        <FeaturesSection />
        <AudienceSection />
        <LibrarySection />
        <ModelsSection />
        <PricingSection />
        <FinalCta />
      </main>
      <ResearchFooter />
    </div>
  );
}
