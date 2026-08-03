import { Reveal, SectionHeading } from './SectionHeading';
import { MISSION_CARDS } from './team-data';
import { cn } from '@/lib/utils';

export function MissionSection() {
  return (
    <section className="py-14 lg:py-20 px-4 bg-transparent content-visibility-auto" id="team-mission">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Our Mission"
          title="A founding team with"
          accent="a real purpose"
          description="ZYR0 was built on one belief: practical engineering capability should be proven through real work, not just academic credentials. This team is how that belief becomes software."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Narrative */}
          <Reveal className="lg:col-span-5 space-y-5">
            <div>
              <span className="font-label text-[11px] tracking-[0.22em] text-blue-600 dark:text-sky-400">
                Why the team exists
              </span>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Every year, thousands of talented students finish university with strong theory and
                almost no opportunity to prove they can build. Companies, in turn, struggle to
                verify whether candidates can actually deliver. ZYR0 closes that gap with structured,
                transparent, and verifiable internship experiences.
              </p>
            </div>
            <div>
              <span className="font-label text-[11px] tracking-[0.22em] text-blue-600 dark:text-sky-400">
                What we are building
              </span>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                The platform spans student profiles, internship management, mentor feedback loops,
                task workspaces, and cryptographically verifiable certificates — all engineered to
                professional standards. The founding team shapes every layer of that experience,
                from database schema to the pixels users interact with.
              </p>
            </div>
            <div>
              <span className="font-label text-[11px] tracking-[0.22em] text-blue-600 dark:text-sky-400">
                Where you come in
              </span>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Founding contributors do not watch from the sidelines. They own real features, write
                real code, review real pull requests, and leave with an engineering portfolio that
                speaks for itself — while earning verified recognition for every contribution.
              </p>
            </div>
          </Reveal>

          {/* Mission cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {MISSION_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <Reveal
                  key={card.title}
                  delay={i * 0.08}
                  className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-emerald-500/10 flex flex-col"
                >
                  <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110', card.accent)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-bold text-slate-900 dark:text-white">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {card.description}
                  </p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
