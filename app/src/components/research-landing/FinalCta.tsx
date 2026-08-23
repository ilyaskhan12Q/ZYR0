import { Reveal } from './Reveal';

export function FinalCta() {
  return (
    <section className="rl-dark-section rl-section-full">
      <div className="rl-section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Left: CTA */}
          <Reveal variant="fade-left">
            <div className="flex flex-col justify-center">
              <p className="rl-eyebrow-light text-[#657C68] mb-3">Get started</p>
              <h2 className="rl-display rl-heading-text text-white mb-3">
                WHAT WILL YOU<br />RESEARCH NEXT?
              </h2>
              <p className="text-[#999] text-sm leading-relaxed mb-6 max-w-md">
                Search deeper. Verify faster. Understand more.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="/research-agent" className="rl-btn-primary-dark">
                  Start researching <span aria-hidden="true">&rarr;</span>
                </a>
                <a href="#pricing-plans" className="inline-flex items-center gap-2 px-6 py-3.5 text-[0.9375rem] font-medium text-[#999] hover:text-white transition-colors">
                  View pricing
                </a>
              </div>
            </div>
          </Reveal>

          {/* Right: About */}
          <Reveal variant="fade-right" delay={0.1}>
            <div className="border border-[#333] rounded-xl p-6">
              <p className="rl-eyebrow-light text-[#657C68] mb-3">About ZYROO</p>
              <h3 className="text-lg font-semibold text-white mb-2">Research without the guesswork.</h3>
              <p className="text-[#999] text-sm leading-relaxed mb-4">
                ZYROO is a research agent that explores academic and web sources, verifies every citation,
                and delivers structured reports.
              </p>
              <a href="/about" className="inline-block text-xs font-medium text-[#657C68] hover:text-[#8fa692] transition-colors rl-underline-anim">
                Learn more about ZYROO →
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
