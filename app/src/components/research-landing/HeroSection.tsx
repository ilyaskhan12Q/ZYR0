import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Reveal, ParallaxLayer } from './Reveal';

const TYPING_PHRASES = [
  'How does generative AI affect university education?',
  'What are the latest breakthroughs in quantum computing?',
  'Compare transformer architectures for NLP tasks.',
  'Analyze renewable energy storage solutions.',
];
const TYPING_SPEED = 60;
const ERASING_SPEED = 30;
const PAUSE_AFTER_TYPE = 2500;
const PAUSE_AFTER_ERASE = 400;

export function HeroSection() {
  const prefersReduced = useReducedMotion();
  const [displayText, setDisplayText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (prefersReduced) {
      setDisplayText(TYPING_PHRASES[0]);
      return;
    }

    const currentPhrase = TYPING_PHRASES[phraseIndex];

    const timeout = setTimeout(() => {
      if (isTyping) {
        if (displayText.length < currentPhrase.length) {
          setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsTyping(false), PAUSE_AFTER_TYPE);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setPhraseIndex((prev) => (prev + 1) % TYPING_PHRASES.length);
          setIsTyping(true);
        }
      }
    }, isTyping ? TYPING_SPEED : ERASING_SPEED);

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, phraseIndex, prefersReduced]);

  return (
    <section id="research" className="relative min-h-screen flex items-center overflow-hidden" style={{ backgroundColor: 'var(--rl-bg)' }}>
      {/* Decorative floating elements */}
      <ParallaxLayer speed={0.15} className="absolute inset-0 pointer-events-none" direction="y">
        <div className="absolute top-[15%] left-[8%] w-24 h-24 rounded-full border border-[var(--rl-border)] opacity-20" />
        <div className="absolute top-[25%] right-[12%] w-16 h-16 rounded-full border border-[var(--rl-accent)] opacity-15" />
        <div className="absolute bottom-[20%] left-[15%] w-8 h-8 rounded-full bg-[var(--rl-accent)] opacity-10" />
        <div className="absolute bottom-[30%] right-[8%] w-32 h-32 rounded-full border border-[var(--rl-border)] opacity-15" />
        {/* Subtle grid lines */}
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-[var(--rl-border)] to-transparent opacity-20" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--rl-border)] to-transparent opacity-20" />
      </ParallaxLayer>

      <div className="rl-section w-full">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
          {/* Eyebrow with subtle entrance */}
          <Reveal variant="scale" duration={0.5}>
            <span className="rl-eyebrow mb-6 inline-block px-4 py-1.5 rounded-full border border-[var(--rl-border)] bg-[var(--rl-surface)]/50 backdrop-blur-sm">
              Deep Research · Verified Sources · Precision Editorial
            </span>
          </Reveal>

          {/* Hero headline — bold, staggered lines */}
          <div className="overflow-hidden mb-6">
            <Reveal variant="fade-up" delay={0.15} duration={0.8}>
              <h1 className="rl-display rl-hero-text text-[var(--rl-ink)]">
                RESEARCH
              </h1>
            </Reveal>
          </div>
          <div className="overflow-hidden mb-2">
            <Reveal variant="fade-up" delay={0.25} duration={0.8}>
              <h1 className="rl-display rl-hero-text text-[var(--rl-ink)]">
                WITHOUT THE
              </h1>
            </Reveal>
          </div>
          <div className="overflow-hidden mb-8">
            <Reveal variant="fade-up" delay={0.35} duration={0.8}>
              <h1 className="rl-display rl-hero-text rl-gradient-text">
                GUESSWORK.
              </h1>
            </Reveal>
          </div>

          {/* Subheading */}
          <Reveal delay={0.5}>
            <p className="rl-subheading text-[var(--rl-muted)] max-w-xl mb-10">
              One question. Multiple lines of research. Verified sources. Structured reports.
            </p>
          </Reveal>

          {/* Glassmorphism product mockup card */}
          <Reveal variant="scale" delay={0.6} className="w-full max-w-2xl">
            <div className="relative rounded-2xl rl-glass p-6 md:p-8">
              {/* Top bar */}
              <div className="flex items-center gap-3 mb-5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-[var(--rl-ink)] flex items-center justify-center">
                    <svg className="w-4.5 h-4.5 text-[var(--rl-bg)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[var(--rl-accent)] border-2 border-white" />
                </div>
                <span className="text-sm font-semibold text-[var(--rl-ink)]">Research Agent</span>
                <span className="ml-auto text-xs text-[var(--rl-muted)]">Online</span>
              </div>

              {/* Typing input */}
              <div className="w-full text-left px-4 py-3.5 rounded-xl border border-[var(--rl-border)] bg-[var(--rl-bg)]/80 text-[var(--rl-ink)] text-sm min-h-[44px] flex items-center">
                <span>{displayText}</span>
                <span className="rl-cursor" />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                  <span className="text-xs px-3 py-1.5 rounded-full border border-[var(--rl-border)] text-[var(--rl-muted)] font-medium">Standard</span>
                  <span className="text-xs px-3 py-1.5 rounded-full border border-[var(--rl-accent)] text-[var(--rl-accent-dark)] font-medium bg-[var(--rl-accent)]/5">Deep</span>
                </div>
                <button className="rl-btn-primary text-sm">
                  Research <span aria-hidden="true">&rarr;</span>
                </button>
              </div>
            </div>
          </Reveal>

          {/* Scroll indicator */}
          <Reveal delay={1} className="mt-12">
            <motion.div
              animate={prefersReduced ? {} : { y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-2 text-[var(--rl-muted)]"
            >
              <span className="text-xs font-medium tracking-wider uppercase">Scroll to explore</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </motion.div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
