import { Reveal } from './Reveal';
import { RESEARCH_QUESTIONS } from '@/data/researchLandingDemo';

export function QuestionExploration() {
  return (
    <section className="rl-section">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-16">
          <h2 className="rl-display rl-statement-text text-[var(--rl-ink)]">
            ONE QUESTION CAN OPEN AN ENTIRE FIELD OF RESEARCH.
          </h2>
        </Reveal>

        <div className="flex flex-col gap-12">
          {RESEARCH_QUESTIONS.map((q, i) => (
            <Reveal key={i} delay={i * 0.15} y={30}>
              <p
                className="rl-display text-[var(--rl-ink)]"
                style={{
                  fontSize: `clamp(${2.5 - i * 0.3}rem, ${5 - i}vw, ${5 - i * 0.5}rem)`,
                  opacity: 1 - i * 0.2,
                }}
              >
                {q}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
