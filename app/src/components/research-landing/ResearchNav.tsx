import { useState, useEffect } from 'react';
import { Reveal } from './Reveal';

const NAV_LINKS = [
  { label: 'Research', href: '#research' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
];

export function ResearchNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Reveal>
      <nav className={`rl-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="flex w-full items-center justify-between mx-auto" style={{ maxWidth: 1200 }}>
          <a href="/" className="rl-display text-xl font-bold tracking-tight text-[var(--rl-ink)]">
            ZYROO
          </a>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[var(--rl-muted)] hover:text-[var(--rl-ink)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm font-medium text-[var(--rl-muted)] hover:text-[var(--rl-ink)] transition-colors hidden sm:inline">
              Sign in
            </a>
            <a href="/research-agent" className="rl-btn-primary text-sm">
              Start researching <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      </nav>
    </Reveal>
  );
}
