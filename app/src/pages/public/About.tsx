import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { BASE_URL } from '@/config/seo';

const aboutStructuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'About', item: `${BASE_URL}/about` },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ZYR0',
    url: `${BASE_URL}/`,
    description:
      'ZYR0 is a product ecosystem for people who build, learn, research and work, with Studio, School, Research, Work, ToolHub and the Blog.',
    foundingDate: '2023',
    slogan: 'Build, learn, research, work.',
    sameAs: ['https://linkedin.com/company/zyr0-co'],
  },
];

const products = [
  {
    name: 'Studio',
    verb: 'build',
    to: '/studio',
    desc: 'A focused workspace for building and shipping software.',
  },
  {
    name: 'School',
    verb: 'run',
    to: '/school',
    desc: 'One operating system for schools and programs.',
  },
  {
    name: 'Research',
    verb: 'find',
    to: '/research',
    desc: 'Ask better questions and turn sources into reports.',
  },
  {
    name: 'Work',
    verb: 'start',
    to: '/internships',
    desc: 'Internships, cohorts and verified certificates in one place.',
  },
  {
    name: 'ToolHub',
    verb: 'keep',
    to: '/tools',
    desc: 'A curated shelf of tools, skills and resources.',
  },
  {
    name: 'Blog',
    verb: 'think',
    to: '/blog',
    desc: 'Notes on building, learning and the work in between.',
  },
];

const reasons = [
  {
    title: 'Most tools stop at one step',
    text: 'A student writes an application in one place, a teacher tracks classes in another, a team ships code somewhere else. ZYR0 connects those steps so the work carries forward instead of starting over.',
  },
  {
    title: 'Trust has to be built in',
    text: 'Verification, clear permissions and honest pricing are not extras. They are the reason a certificate means something and the reason people are willing to put their work on a platform.',
  },
  {
    title: 'Access should not depend on geography',
    text: 'Good tools and real opportunities are still concentrated in a few cities and a few institutions. We build for the people outside those circles, starting in Pakistan and growing from there.',
  },
];

const values = [
  {
    title: 'Clarity over noise',
    text: 'Every screen should explain itself. If a feature needs a manual, we have not finished it.',
  },
  {
    title: 'Small, sharp tools',
    text: 'We would rather ship one thing that works well than five that almost do.',
  },
  {
    title: 'Proof over promises',
    text: 'Certificates, reviews and public pages are verifiable. Claims should be too.',
  },
  {
    title: 'Privacy by default',
    text: 'Private work stays private. Public pages are a choice, not the default.',
  },
  {
    title: 'Room for everyone',
    text: 'Students, teachers, researchers, companies and mentors all deserve a product that respects their time.',
  },
  {
    title: 'Keep learning in public',
    text: 'We write about what we build, including the parts that did not work.',
  },
];

const principles = [
  {
    title: 'Ship the smallest useful thing',
    text: 'A feature earns its place by solving a real problem today. We cut the rest, then improve what people actually use.',
  },
  {
    title: 'Make the safe choice the easy one',
    text: 'Sensible defaults for privacy, permissions and data. You should not have to hunt through settings to be protected.',
  },
  {
    title: 'Keep the door open',
    text: 'The core of ZYR0 stays free to use. Ads on public pages help pay for the parts that cost us money to run, and paid plans add capacity rather than locking people out.',
  },
];

const milestones = [
  {
    year: '2023',
    title: 'Founded',
    text: 'ZYR0 started with a simple observation: the gap between education and work is mostly a gap in tooling.',
  },
  {
    year: '2024',
    title: 'First products',
    text: 'Student, company and mentor portals launched, giving internship programs a shared place to run.',
  },
  {
    year: '2025',
    title: 'Verification',
    text: 'Certificates gained unique IDs and a public verification page, so a completed program could be checked in seconds.',
  },
  {
    year: '2026',
    title: 'One ecosystem',
    text: 'Studio, School, Research, Work, ToolHub and the Blog came together under one account and one design language.',
  },
];

function CornerMarks() {
  return (
    <>
      <span aria-hidden="true" className="absolute -left-px -top-px h-2.5 w-2.5 border-l border-t border-zyro-accent/60" />
      <span aria-hidden="true" className="absolute -right-px -top-px h-2.5 w-2.5 border-r border-t border-zyro-accent/60" />
      <span aria-hidden="true" className="absolute -bottom-px -left-px h-2.5 w-2.5 border-b border-l border-zyro-accent/60" />
      <span aria-hidden="true" className="absolute -bottom-px -right-px h-2.5 w-2.5 border-b border-r border-zyro-accent/60" />
    </>
  );
}

interface PlateProps {
  index: string;
  label: string;
  title: string;
  children: ReactNode;
}

function Plate({ index, label, title, children }: PlateProps) {
  return (
    <section>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-[140px_minmax(0,1fr)] md:gap-12 md:py-16 lg:px-8">
        <div className="md:sticky md:top-[calc(var(--zyro-header-h)+2rem)] md:self-start">
          <p className="font-label text-[11px] tabular-nums text-zyro-accent">{index}</p>
          <p className="mt-1 font-label text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
        </div>
        <div>
          <h2 className="max-w-2xl font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h2>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default function About() {
  return (
    <div className="pb-24">
      <SEO
        title="About ZYR0 — One Ecosystem for Builders, Learners and Teams"
        description="ZYR0 is a product ecosystem for people who build, learn, research and work. Meet Studio, School, Research, Work, ToolHub and the Blog."
        path="/about"
        keywords="about ZYR0, product ecosystem, Studio, School, Research, Work, ToolHub, Pakistan technology"
        structuredData={aboutStructuredData}
      />

      {/* Hero and figure share one sapphire block, the card overlaps the split */}
      <div className="relative bg-[#0051C3]">
        <header className="relative">
          <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between font-label text-[10px] uppercase tracking-[0.18em] text-white/70">
              <span>ZYR0 / About</span>
              <span>Rev 2026.11</span>
            </div>
          </div>
          <div className="mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-6 lg:px-8 lg:pb-16 lg:pt-16">
            <h1 className="max-w-4xl font-serif text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              We started ZYR0 because the gap between education and work is mostly a gap in tooling.
            </h1>
            <p className="mt-6 max-w-2xl font-serif text-[17px] leading-8 text-white/80 first-letter:float-left first-letter:mr-2 first-letter:text-[3.4rem] first-letter:leading-[0.85] first-letter:text-white">
              Studio, School, Research, Work, ToolHub and the Blog share one account and one standard. Each product is useful on its own. Together they remove the handoffs that make people start over.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <a
                href="#ecosystem"
                className="inline-flex items-center gap-2 border-b border-white pb-0.5 text-sm font-medium text-white transition-opacity hover:opacity-70"
              >
                The ecosystem
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 border-b border-white/30 pb-0.5 text-sm font-medium text-white/80 transition-colors hover:border-white hover:text-white"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </header>

        {/* FIG. 01 — card straddles the sapphire and paper halves */}
        <section id="ecosystem" className="relative scroll-mt-[calc(var(--zyro-header-h)+2rem)]">
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-background" />
          <div className="relative mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-[140px_minmax(0,1fr)] md:gap-12 md:py-16 lg:px-8">
            <div className="md:sticky md:top-[calc(var(--zyro-header-h)+2rem)] md:self-start">
              <p className="font-label text-[11px] tabular-nums text-white">FIG. 01</p>
              <p className="mt-1 font-label text-[11px] uppercase tracking-[0.16em] text-white/70">
                The ecosystem
              </p>
            </div>
            <div
              className="relative rounded-lg border border-border/70 bg-background p-5 sm:p-8"
              style={{
                backgroundImage:
                  'linear-gradient(to right, hsl(var(--border) / 0.3) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border) / 0.3) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
              }}
            >
            <CornerMarks />
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-label text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                One account, six products
              </p>
              <p className="font-label text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Fig. 01
              </p>
            </div>
            <ul className="mt-4">
              {products.map((product, index) => (
                <li key={product.name} className="border-t border-border/60 first:border-t-0">
                  <Link
                    to={product.to}
                    className="group flex items-baseline gap-3 py-4 sm:gap-4"
                  >
                    <span className="font-label text-[11px] tabular-nums text-zyro-accent">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="w-20 font-heading text-base font-semibold text-foreground sm:w-24">
                      {product.name}
                    </span>
                    <span className="hidden font-label text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:inline">
                      {product.verb}
                    </span>
                    <span aria-hidden="true" className="mx-1 flex-1 border-b border-dotted border-border/80" />
                    <span className="hidden max-w-xs text-right text-sm leading-6 text-muted-foreground md:block">
                      {product.desc}
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </Link>
                  <p className="pb-3 text-sm leading-6 text-muted-foreground md:hidden">{product.desc}</p>
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-border/60 pt-4 font-label text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              All six share the same account
            </p>
          </div>
        </div>
        </section>
      </div>

      <Plate index="01" label="Why we exist" title="The journey is connected. The tools should be too.">
        <div className="grid gap-10 md:grid-cols-3">
          {reasons.map((reason, index) => (
            <div key={reason.title} className="border-t border-border pt-5">
              <span className="font-label text-[11px] tabular-nums text-zyro-accent">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-2 font-heading text-base font-semibold text-foreground">{reason.title}</h3>
              <p className="mt-2 font-serif text-[15px] leading-7 text-foreground/70">{reason.text}</p>
            </div>
          ))}
        </div>
      </Plate>

      <Plate index="02" label="Mission and vision" title="Serious work, easier to start and easier to prove.">
        <div className="grid gap-10 md:grid-cols-2 md:gap-0 md:divide-x md:divide-border">
          <div className="md:pr-10">
            <p className="font-label text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Mission</p>
            <p className="mt-3 font-serif text-[17px] leading-8 text-foreground/75">
              We build the everyday tools that sit between learning and doing: a place to write, a place to run a program, a place to find work, and a place to show what you finished.
            </p>
          </div>
          <div className="md:pl-10">
            <p className="font-label text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Vision</p>
            <p className="mt-3 font-serif text-[17px] leading-8 text-foreground/75">
              A level field for anyone willing to do the work. Location, institution and connections should not decide who gets a real chance.
            </p>
          </div>
        </div>
      </Plate>

      {/* Pull quote */}
      <section className="bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <blockquote className="max-w-4xl font-serif text-2xl italic leading-snug tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            “Good software should feel calm, fast and honest. The rest is detail we can argue about later.”
          </blockquote>
          <p className="mt-5 font-label text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Working note, ZYR0
          </p>
        </div>
      </section>

      <Plate index="03" label="Values" title="What we optimise for.">
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {values.map((value) => (
            <div key={value.title} className="border-t border-border pt-5">
              <h3 className="font-heading text-base font-semibold text-foreground">{value.title}</h3>
              <p className="mt-2 font-serif text-[15px] leading-7 text-foreground/70">{value.text}</p>
            </div>
          ))}
        </div>
      </Plate>

      <Plate index="04" label="How we work" title="Three rules we keep coming back to.">
        <div className="space-y-8">
          {principles.map((principle, index) => (
            <div key={principle.title} className="flex gap-5 border-t border-border pt-6">
              <span className="font-label text-[11px] tabular-nums text-zyro-accent">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="font-heading text-base font-semibold text-foreground">{principle.title}</h3>
                <p className="mt-2 max-w-2xl font-serif text-[15px] leading-7 text-foreground/70">{principle.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Plate>

      <Plate index="05" label="Journey" title="How we got here.">
        <div className="hidden md:grid md:grid-cols-4 md:gap-6">
          {milestones.map((milestone) => (
            <div key={milestone.year} className="relative border-t border-border pt-5">
              <span aria-hidden="true" className="absolute -top-[5px] left-0 h-2.5 w-2.5 rounded-full border border-zyro-accent bg-background" />
              <p className="font-label text-[11px] tabular-nums text-zyro-accent">{milestone.year}</p>
              <h3 className="mt-2 font-heading text-sm font-semibold text-foreground">{milestone.title}</h3>
              <p className="mt-1.5 font-serif text-sm leading-6 text-foreground/70">{milestone.text}</p>
            </div>
          ))}
        </div>
        <ol className="space-y-7 border-l border-border pl-5 md:hidden">
          {milestones.map((milestone) => (
            <li key={milestone.year} className="relative">
              <span aria-hidden="true" className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full border border-zyro-accent bg-background" />
              <p className="font-label text-[11px] tabular-nums text-zyro-accent">{milestone.year}</p>
              <h3 className="mt-1 font-heading text-sm font-semibold text-foreground">{milestone.title}</h3>
              <p className="mt-1.5 font-serif text-sm leading-6 text-foreground/70">{milestone.text}</p>
            </li>
          ))}
        </ol>
      </Plate>

      <Plate index="06" label="Team" title="A small team, building in the open.">
        <p className="max-w-2xl font-serif text-[17px] leading-8 text-foreground/75">
          Team profiles are being verified before we publish them. In the meantime, the work is public: read the blog, try the products, or write to us directly. We answer.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-5">
          <Link
            to="/careers"
            className="inline-flex items-center gap-2 border-b border-border pb-0.5 text-sm font-medium text-foreground/70 transition-colors hover:border-foreground hover:text-foreground"
          >
            Open roles
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 border-b border-border pb-0.5 text-sm font-medium text-foreground/70 transition-colors hover:border-foreground hover:text-foreground"
          >
            Contact
          </Link>
        </div>
        <p className="mt-10 font-agbalumo text-2xl text-foreground/80">the ZYR0 team</p>
      </Plate>

      {/* CTA */}
      <section className="bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div>
              <p className="font-label text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Start anywhere</p>
              <h2 className="mt-3 max-w-2xl font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
                One account. Six products. The whole journey.
              </h2>
              <p className="mt-4 max-w-xl font-serif text-[16px] leading-7 text-foreground/70">
                Create an account and move between Studio, School, Research, Work, ToolHub and the Blog without signing up again.
              </p>
            </div>
            <div className="flex flex-wrap gap-5 md:justify-end">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 border-b border-foreground pb-0.5 text-sm font-medium text-foreground transition-opacity hover:opacity-70"
              >
                Create an account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/tools"
                className="inline-flex items-center gap-2 border-b border-border pb-0.5 text-sm font-medium text-foreground/70 transition-colors hover:border-foreground hover:text-foreground"
              >
                Explore ToolHub
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
