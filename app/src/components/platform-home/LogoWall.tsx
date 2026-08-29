const logos = [
  { name: 'Vercel', icon: '▲' },
  { name: 'Stripe', icon: 'S' },
  { name: 'Notion', icon: '◆' },
  { name: 'Linear', icon: 'gué' },
  { name: 'Supabase', icon: '⚡' },
  { name: 'GitHub', icon: '⊚' },
  { name: 'Figma', icon: '◉' },
  { name: 'Slack', icon: '#' },
  { name: 'Raycast', icon: '◈' },
  { name: 'Clerk', icon: '⬡' },
];

function LogoPlaceholder({ name, icon }: { name: string; icon: string }) {
  return (
    <div className="flex items-center gap-2.5 select-none shrink-0">
      <span
        className="text-lg md:text-xl"
        style={{ color: 'var(--zyro-text-muted)' }}
      >
        {icon}
      </span>
      <span
        className="text-sm md:text-base font-semibold tracking-tight whitespace-nowrap"
        style={{ color: 'var(--zyro-text-secondary)' }}
      >
        {name}
      </span>
    </div>
  );
}

export default function LogoWall() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="max-w-[1264px] mx-auto px-6 md:px-16">
        <p
          className="font-label text-[11px] tracking-[0.25em] uppercase text-center mb-12"
          style={{ color: 'var(--zyro-text-muted)' }}
        >
          Trusted by teams building the future
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
          {[...logos, ...logos, ...logos].map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="mx-8 md:mx-14 shrink-0 flex items-center"
            >
              <LogoPlaceholder name={logo.name} icon={logo.icon} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
