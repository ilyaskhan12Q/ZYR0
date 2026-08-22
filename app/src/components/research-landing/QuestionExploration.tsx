import { Reveal, StaggerContainer, StaggerItem } from './Reveal';
import { RESEARCH_QUESTIONS } from '@/data/researchLandingDemo';

export function QuestionExploration() {
  return (
    <section className="rl-section">
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center mb-16">
          <span className="rl-eyebrow mb-4 inline-block">One question</span>
          <h2 className="rl-display rl-heading-text text-[var(--rl-ink)]">
            ONE QUESTION CAN OPEN<br /> AN ENTIRE FIELD OF RESEARCH.
          </h2>
        </Reveal>

        <StaggerContainer className="flex flex-col gap-12" stagger={0.2}>
          {RESEARCH_QUESTIONS.map((q, i) => (
            <StaggerItem key={q} variant="fade-up" duration={0.8}>
              <p
                className="rl-display text-[var(--rl-ink)] leading-tight"
                style={{
                  fontSize: `clamp(${2.5 - i * 0.4}rem, ${5 - i * 0.8}vw, ${5 - i * 0.5}rem)`,
                  opacity: 1 - i * 0.2,
                  fontWeight: 400,
                }}
              >
                {q}
              </p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
