import { Reveal } from './Reveal';

export function ResearchFooter() {
  return (
    <footer className="rl-section py-12" style={{ borderTop: '1px solid var(--rl-border)' }}>
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <div className="flex flex-col md:flex-row justify-between gap-8">
            {/* Brand */}
            <div>
              <span className="rl-display text-xl font-bold text-[var(--rl-ink)]">ZYROO</span>
              <p className="text-sm text-[var(--rl-muted)] mt-2 max-w-xs">
                Deep research, verified sources, structured reports. One question at a time.
              </p>
            </div>

            {/* Links */}
            <div className="flex gap-12">
              <div>
                <h4 className="rl-eyebrow text-[var(--rl-ink)] mb-3">Product</h4>
                <ul className="flex flex-col gap-2">
                  <li><a href="#research" className="text-sm text-[var(--rl-muted)] hover:text-[var(--rl-ink)] transition-colors">Research</a></li>
                  <li><a href="#how-it-works" className="text-sm text-[var(--rl-muted)] hover:text-[var(--rl-ink)] transition-colors">How it works</a></li>
                  <li><a href="#pricing" className="text-sm text-[var(--rl-muted)] hover:text-[var(--rl-ink)] transition-colors">Pricing</a></li>
                </ul>
              </div>
              <div>
                <h4 className="rl-eyebrow text-[var(--rl-ink)] mb-3">Company</h4>
                <ul className="flex flex-col gap-2">
                  <li><a href="/about" className="text-sm text-[var(--rl-muted)] hover:text-[var(--rl-ink)] transition-colors">About</a></li>
                  <li><a href="/privacy" className="text-sm text-[var(--rl-muted)] hover:text-[var(--rl-ink)] transition-colors">Privacy</a></li>
                  <li><a href="/terms" className="text-sm text-[var(--rl-muted)] hover:text-[var(--rl-ink)] transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6" style={{ borderTop: '1px solid var(--rl-border)' }}>
            <p className="text-xs text-[var(--rl-muted)]">
              © 2026 Zyroo. All rights reserved.
            </p>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
