import { Reveal } from './Reveal';
import { AUDIENCES } from '@/data/researchLandingDemo';

export function AudienceSection() {
  return (
    <section className="rl-section" style={{ backgroundColor: 'var(--rl-surface)' }}>
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-16">
          <h2 className="rl-display rl-heading-text text-[var(--rl-ink)]">
            BUILT FOR PEOPLE WHO NEED TO KNOW.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {AUDIENCES.map((audience, i) => (
            <Reveal key={audience.title} delay={i * 0.1}>
              <div className="flex flex-col h-full">
                <h3 className="rl-display text-xl text-[var(--rl-ink)] mb-3">{audience.title}</h3>
                <p className="text-sm text-[var(--rl-muted)] leading-relaxed mb-4">{audience.description}</p>
                <ul className="flex flex-col gap-2 mt-auto">
                  {audience.list.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-[var(--rl-ink)]">
                      <span className="w-1 h-1 rounded-full bg-[var(--rl-accent)] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
