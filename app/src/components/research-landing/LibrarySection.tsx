import { useState } from 'react';
import { Reveal } from './Reveal';

export function LibrarySection() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <section className="rl-section">
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center mb-12">
          <span className="rl-eyebrow mb-4 inline-block">History</span>
          <h2 className="rl-display rl-heading-text text-[var(--rl-ink)]">
            YOUR RESEARCH, IN ONE PLACE.
          </h2>
        </Reveal>

        <Reveal variant="scale">
          <div className="rounded-2xl bg-[var(--rl-surface)] border border-[var(--rl-border)] overflow-hidden">
            {/* Search bar with focus animation */}
            <div className="p-4 border-b border-[var(--rl-border)]">
              <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--rl-bg)] border transition-all duration-300 ${
                searchFocused ? 'border-[var(--rl-accent)] shadow-sm ring-2 ring-[var(--rl-accent)]/10' : 'border-[var(--rl-border)]'
              }`}>
                <svg className={`w-4 h-4 transition-colors duration-300 ${searchFocused ? 'text-[var(--rl-accent)]' : 'text-[var(--rl-muted)]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search your research..."
                  className="flex-1 bg-transparent text-sm text-[var(--rl-ink)] placeholder-[var(--rl-muted)] outline-none"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </div>
            </div>

            {/* Today */}
            <div className="p-4">
              <div className="rl-eyebrow text-[var(--rl-muted)] mb-3 px-2">Today</div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-[var(--rl-bg)] transition-colors cursor-pointer group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--rl-ink)] truncate group-hover:text-[var(--rl-accent-dark)] transition-colors">
                      AI & University Education — 18 sources
                    </p>
                    <p className="text-xs text-[var(--rl-muted)]">Completed · Standard depth</p>
                  </div>
                  <span className="rl-chip ml-3 shrink-0">Complete</span>
                </div>
                <div className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-[var(--rl-bg)] transition-colors cursor-pointer group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--rl-ink)] truncate group-hover:text-[var(--rl-accent-dark)] transition-colors">
                      Climate Policy Frameworks — 12 sources
                    </p>
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
                <div className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-[var(--rl-bg)] transition-colors cursor-pointer group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--rl-ink)] truncate group-hover:text-[var(--rl-accent-dark)] transition-colors">
                      Transformer Architectures for NLP — 9 sources
                    </p>
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
