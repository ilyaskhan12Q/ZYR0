import { Reveal } from './Reveal';

export function FinalCta() {
  return (
    <section id="pricing" className="rl-dark-section rl-section-full">
      <div className="rl-section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {/* Left: CTA */}
          <Reveal variant="fade-left">
            <div className="flex flex-col justify-center">
              <p className="rl-eyebrow-light text-[#657C68] mb-4">Get started</p>
              <h2 className="rl-display rl-heading-text text-white mb-4">
                WHAT WILL YOU<br />RESEARCH NEXT?
              </h2>
              <p className="text-[#999] text-base leading-relaxed mb-8 max-w-md">
                Search deeper. Verify faster. Understand more.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
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
            <div className="border border-[#333] rounded-xl p-8">
              <p className="rl-eyebrow-light text-[#657C68] mb-4">About ZYROO</p>
              <h3 className="text-xl font-semibold text-white mb-3">Research without the guesswork.</h3>
              <p className="text-[#999] text-sm leading-relaxed mb-6">
                ZYROO is a research agent that explores academic and web sources, verifies every citation,
                and delivers structured reports — so you can focus on understanding, not searching.
              </p>
              <a href="/about" className="inline-block text-sm font-medium text-[#657C68] hover:text-[#8fa692] transition-colors rl-underline-anim">
                Learn more about ZYROO →
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
