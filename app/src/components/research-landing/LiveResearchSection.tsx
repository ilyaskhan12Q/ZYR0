import { Reveal } from './Reveal';

export function LiveResearchSection() {
  return (
    <section id="research" className="rl-section-full" style={{ backgroundColor: 'var(--rl-surface)' }}>
      <div className="rl-section">
        <div className="max-w-3xl mb-12">
          <Reveal variant="fade-up">
            <p className="rl-eyebrow mb-4">Introducing</p>
          </Reveal>
          <Reveal variant="fade-up" delay={0.05}>
            <h2 className="rl-display rl-heading-text text-[var(--rl-ink)] mb-4">
              THE RESEARCH AGENT.
            </h2>
          </Reveal>
          <Reveal variant="fade-up" delay={0.1}>
            <p className="text-[var(--rl-muted)] text-lg leading-relaxed max-w-xl">
              A research workspace that thinks in depth. Ask a question, choose how deep to go,
              and watch the agent explore, verify, and structure — in real time.
            </p>
          </Reveal>
        </div>

        <Reveal variant="fade-up" delay={0.15}>
          <div className="rounded-xl overflow-hidden border border-[var(--rl-border)] bg-[var(--rl-dark)] aspect-[16/9] flex items-center justify-center">
            <div className="text-center px-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28ca42]" />
              </div>
              <p className="rl-display text-3xl text-white mb-3">Research Agent</p>
              <p className="text-[#666] text-sm">Dark workspace • Real-time pipeline • Verified sources</p>
              <div className="mt-8 flex items-center justify-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#657C68] animate-pulse" />
                <span className="text-[#657C68] text-xs font-medium">Researching...</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
