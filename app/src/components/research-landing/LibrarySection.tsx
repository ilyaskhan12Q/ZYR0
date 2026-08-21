import { Reveal } from './Reveal';

export function LibrarySection() {
  return (
    <section className="rl-section">
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center mb-12">
          <span className="rl-eyebrow mb-4 inline-block">History</span>
          <h2 className="rl-display rl-heading-text text-[var(--rl-ink)]">
            YOUR RESEARCH, IN ONE PLACE.
          </h2>
        </Reveal>

        <Reveal>
          <div className="rounded-2xl bg-[var(--rl-surface)] border border-[var(--rl-border)] overflow-hidden">
            {/* Search bar */}
            <div className="p-4 border-b border-[var(--rl-border)]">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--rl-bg)] border border-[var(--rl-border)]">
                <svg className="w-4 h-4 text-[var(--rl-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <span className="text-sm text-[var(--rl-muted)]">Search your research...</span>
              </div>
            </div>

            {/* Today */}
            <div className="p-4">
              <div className="rl-eyebrow text-[var(--rl-muted)] mb-3 px-2">Today</div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-[var(--rl-bg)] transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--rl-ink)] truncate">AI & University Education — 18 sources</p>
                    <p className="text-xs text-[var(--rl-muted)]">Completed · Standard depth</p>
                  </div>
                  <span className="rl-chip ml-3 shrink-0">Complete</span>
                </div>
                <div className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-[var(--rl-bg)] transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--rl-ink)] truncate">Climate Policy Frameworks — 12 sources</p>
                    <p className="text-xs text-[var(--rl-muted)]">Completed · Deep depth</p>
                  </div>
                  <span className="rl-chip ml-3 shrink-0">Complete</span>
                </div>
              </div>
            </div>

            {/* Yesterday */}
            <div className="p-4 pt-0">
              <div className="rl-eyebrow text-[var(--rl-muted)] mb-3 px-2">Yesterday</div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-[var(--rl-bg)] transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--rl-ink)] truncate">Transformer Architectures for NLP — 9 sources</p>
                    <p className="text-xs text-[var(--rl-muted)]">Completed · Quick depth</p>
                  </div>
                  <span className="rl-chip ml-3 shrink-0">Complete</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
