import { Reveal } from './Reveal';

export function LiveResearchSection() {
  return (
    <section id="research" className="rl-section-full" style={{ backgroundColor: 'var(--rl-surface)' }}>
      <div className="rl-section">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: copy */}
          <Reveal variant="fade-left">
            <div>
              <p className="rl-eyebrow mb-3">Introducing</p>
              <h2 className="rl-display rl-heading-text text-[var(--rl-ink)] mb-3">
                THE RESEARCH<br />AGENT.
              </h2>
              <p className="text-[var(--rl-muted)] text-base leading-relaxed mb-6 max-w-md">
                A research workspace that thinks in depth. Ask a question, choose how deep to go,
                and watch the agent explore, verify, and structure — in real time.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="/research-agent" className="rl-btn-primary text-sm">
                  Try it now <span aria-hidden="true">&rarr;</span>
                </a>
                <a href="#how-it-works" className="rl-btn-secondary text-sm">
                  See how it works
                </a>
              </div>
            </div>
          </Reveal>

          {/* Right: mockup */}
          <Reveal variant="fade-right" delay={0.1}>
            <div className="rounded-xl overflow-hidden border border-[var(--rl-border)] bg-[var(--rl-dark)] shadow-2xl">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#222]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28ca42]" />
                <span className="ml-3 text-xs text-[#666] font-medium">Research Agent</span>
              </div>
              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-[#657C68] animate-pulse" />
                  <span className="text-[#657C68] text-xs font-medium">Researching...</span>
                </div>
                {/* Pipeline dots */}
                <div className="flex items-center gap-1.5 mb-4">
                  {['Q', 'U', 'P', 'A', 'E', 'V', 'S', 'R'].map((l, i) => (
                    <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${i < 4 ? 'bg-[#657C68] text-white' : 'bg-[#222] text-[#666]'}`}>
                      {l}
                    </div>
                  ))}
                </div>
                {/* Fake source cards */}
                <div className="space-y-2">
                  {['Chen & Martinez (2024)', 'Williams & Patel (2024)', 'Kim & Thompson (2023)'].map((s, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#222]">
                      <span className="text-xs text-[#999]">{s}</span>
                      <span className="rl-chip-dark text-[10px]">Verified</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
