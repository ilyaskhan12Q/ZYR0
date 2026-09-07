const PARTNERS = [
  { name: 'OpenAI', color: '#10A37F' },
  { name: 'Anthropic', color: '#D4A574' },
  { name: 'DeepSeek', color: '#4D6BFE' },
  { name: 'Cloudflare', color: '#F38020' },
  { name: 'Google', color: '#4285F4' },
  { name: 'Vercel', color: '#666666' },
  { name: 'Supabase', color: '#3ECF8E' },
]

export default function LogoWall() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="max-w-[1264px] mx-auto px-6 md:px-16">
        <p
          className="font-label text-[11px] tracking-[0.25em] uppercase text-center mb-12"
          style={{ color: 'var(--zyro-text-muted)' }}
        >
          Powered by industry-leading technology
        </p>
      </div>

      {/* Continuous rolling marquee */}
      <div className="relative">
        {/* Left fade */}
        <div
          className="absolute inset-y-0 left-0 w-20 md:w-32 z-10 pointer-events-none"
          style={{
            background: `linear-gradient(to right, var(--zyro-bg), transparent)`,
          }}
        />
        {/* Right fade */}
        <div
          className="absolute inset-y-0 right-0 w-20 md:w-32 z-10 pointer-events-none"
          style={{
            background: `linear-gradient(to left, var(--zyro-bg), transparent)`,
          }}
        />

        {/* Top border line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'var(--zyro-border)' }}
        />
        {/* Bottom border line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'var(--zyro-border)' }}
        />

        {/* Marquee track */}
        <div className="flex w-max animate-marquee py-6 md:py-8">
          {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((partner, i) => (
            <div
              key={`${partner.name}-${i}`}
              className="partner-item mx-8 md:mx-14 shrink-0 flex items-center cursor-default"
              style={{ '--brand': partner.color } as React.CSSProperties}
            >
              <span
                className="text-sm md:text-base font-semibold tracking-tight whitespace-nowrap transition-colors duration-300"
                style={{ color: 'var(--zyro-text-secondary)' }}
              >
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
