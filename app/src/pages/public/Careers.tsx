import { useState } from 'react';
import {
  Users, HeartHandshake, ClipboardList, ArrowDownRight, Briefcase, Medal,
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { BASE_URL } from '@/config/seo';
import { BackgroundLayer } from '@/components/landing/BackgroundLayer';
import { FoundingHero } from '@/components/team/FoundingHero';
import { MissionSection } from '@/components/team/MissionSection';
import { FeatureGridSection } from '@/components/team/FeatureGridSection';
import { RolesSection } from '@/components/team/RolesSection';
import { TimelineSection } from '@/components/team/TimelineSection';
import { FaqSection } from '@/components/team/FaqSection';
import { TeamApplication } from '@/components/team/TeamApplication';
import { FinalCtaSection } from '@/components/team/FinalCtaSection';
import {
  WHY_JOIN, CULTURE_PRINCIPLES, WORKFLOW, SELECTION_STEPS,
  EXPECTATIONS, RECOGNITION, FAQS,
} from '@/components/team/team-data';

const teamStructuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Careers', item: `${BASE_URL}/careers` },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: 'ZYR0 Founding Development Team',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  },
];

export default function Careers() {
  const [selectedRole, setSelectedRole] = useState('');

  const handleApply = (roleId: string) => {
    setSelectedRole(roleId);
    document.getElementById('team-apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-slate-100 overflow-x-clip bg-slate-100 dark:bg-slate-950">
      <BackgroundLayer />

      <div className="relative z-10">
        <SEO
          title="Founding Development Team at ZYR0 — Join Our Team"
          description="Join the ZYR0 founding development team. Build a real product, work with modern engineering practices, and earn verified recognition for every contribution. 11 student-friendly roles across engineering, design, data, and growth."
          path="/careers"
          keywords="ZYR0 careers, founding team, student jobs, engineering internships, contribute to open source, EdTech team, developer experience, student team"
          structuredData={teamStructuredData}
        />

        {/* 1 — Hero */}
        <FoundingHero />

        {/* 2 — Mission */}
        <MissionSection />

        {/* 3 — Why join */}
        <FeatureGridSection
          eyebrow="Why Join"
          title="Build experience that"
          accent="employers actually recognize"
          description="The founding team is where theoretical degrees turn into shipped products, reviewed code, and verified credentials."
          icon={Users}
          cards={WHY_JOIN}
          columns={3}
        />

        {/* 4 — Engineering culture */}
        <FeatureGridSection
          eyebrow="Engineering Culture"
          title="Principles that define"
          accent="how we build"
          description="Small team, professional standards. These eight principles shape every decision, review, and merge."
          icon={HeartHandshake}
          cards={CULTURE_PRINCIPLES}
          columns={4}
          numbered
        />

        {/* 5 — Open roles */}
        <RolesSection onApply={handleApply} />

        {/* 6 — Development workflow */}
        <TimelineSection
          id="team-workflow"
          eyebrow="Development Workflow"
          title="From ticket to launch,"
          accent="with full transparency"
          description="A predictable, professional pipeline — the same rhythm professional engineering teams use."
          icon={ClipboardList}
          steps={WORKFLOW}
          variant="blue"
        />

        {/* 7 — Expectations */}
        <FeatureGridSection
          eyebrow="Expectations"
          title="What we ask of"
          accent="every contributor"
          description="Clear, fair, and written down. If anything here would block you, tell us — we plan around your semester."
          icon={ArrowDownRight}
          cards={EXPECTATIONS}
          columns={3}
          numbered
        />

        {/* 8 — Selection process */}
        <TimelineSection
          eyebrow="Selection Process"
          title="Simple, transparent,"
          accent="and human"
          description="No maze of recruiter rounds. You always know where you stand, and every stage ends with clear feedback."
          icon={Briefcase}
          steps={SELECTION_STEPS}
          variant="emerald"
        />

        {/* 9 — Recognition */}
        <FeatureGridSection
          eyebrow="Recognition"
          title="Recognized work,"
          accent="not just rewarded"
          description="Contributors receive verified recognition they can carry into their careers — not empty perks."
          icon={Medal}
          cards={RECOGNITION}
          columns={3}
        />

        {/* 10 — FAQ */}
        <FaqSection />

        {/* 11 — Application */}
        <TeamApplication preferredRole={selectedRole} />

        {/* 12 — Final CTA */}
        <FinalCtaSection />
      </div>
    </div>
  );
}