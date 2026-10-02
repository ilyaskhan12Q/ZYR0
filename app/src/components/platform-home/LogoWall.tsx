import React from 'react';

interface Partner {
  name: string;
  color: string;
  svg: React.ReactNode;
}

const PARTNERS: Partner[] = [
  {
    name: 'OpenAI',
    color: '#10A37F',
    svg: (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 8.71a4.47 4.47 0 0 1 2.37-2.012v.164l4.779 2.76a.795.795 0 0 0 .784 0l5.84-3.37-2.02-1.166a.08.08 0 0 1-.04-.055L9.314 2.45a4.504 4.504 0 0 0-6.974 6.26zm16.48-1.524a.795.795 0 0 0-.392.68v6.737l-2.02-1.168a.071.071 0 0 1-.038-.052V7.799a4.504 4.504 0 0 1 4.494-4.494 4.476 4.476 0 0 1 2.876 1.04l-.141.081-4.779 2.76zM7.228 10.608l4.772-2.755 4.772 2.755v5.51l-4.772 2.755-4.772-2.755zm13.172-1.898l-.142-.085-4.783-2.759a.771.771 0 0 0-.78 0L8.852 9.235V6.903a.08.08 0 0 1 .033-.062l4.84-2.795a4.5 4.5 0 0 1 6.675 4.662z" />
      </svg>
    ),
  },
  {
    name: 'Anthropic',
    color: '#D4A574',
    svg: (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.827 2.115l4.877 13.564H15.14l-1.07-3.097H9.93l-1.07 3.097H5.296L10.173 2.115h3.654zm-1.037 3.32h-.146l-1.922 5.567h4.004l-1.936-5.567zm5.914 10.45l4.877 6.002h-3.666l-3.04-3.766-3.041 3.766H9.72l4.877-6.002z" />
      </svg>
    ),
  },
  {
    name: 'DeepSeek',
    color: '#4D6BFE',
    svg: (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5c-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.44 2.27-4.44l1.23 1.64c-.9.65-1.5 1.71-1.5 2.8 0 1.93 1.57 3.5 3.5 3.5 1.09 0 2.15-.6 2.8-1.5l1.64 1.23c-1 1.38-2.62 2.27-4.44 2.27zm3-4.5h-2v-2h2v2z" />
      </svg>
    ),
  },
  {
    name: 'Cloudflare',
    color: '#F38020',
    svg: (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.32 10.18a5.53 5.53 0 0 0-5.26-3.83c-2.3 0-4.27 1.4-5.07 3.42A4.27 4.27 0 0 0 4.28 14c0 2.36 1.92 4.28 4.28 4.28h9.61a3.85 3.85 0 0 0 3.85-3.85 3.85 3.85 0 0 0-3.7-4.25zm-.17 6.13H8.56a2.31 2.31 0 0 1-2.31-2.31c0-1.25 1-2.27 2.24-2.31l.88-.03.28-.84a3.56 3.56 0 0 1 3.39-2.44c1.65 0 3.06 1.13 3.45 2.73l.25 1.02 1.05.08a1.88 1.88 0 0 1 1.78 1.88c0 1.23-1.01 2.22-2.24 2.22z" />
      </svg>
    ),
  },
  {
    name: 'Google',
    color: '#4285F4',
    svg: (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
      </svg>
    ),
  },
  {
    name: 'Vercel',
    color: '#EDEDED',
    svg: (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 22.525H0l12-21.05 12 21.05z" />
      </svg>
    ),
  },
  {
    name: 'Supabase',
    color: '#3ECF8E',
    svg: (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L.22 14.093a.792.792 0 0 0 .616 1.282h9.362v8.958a.396.396 0 0 0 .716.233l11.064-13.93a.792.792 0 0 0-.616-1.282z" />
      </svg>
    ),
  },
];

export default function LogoWall() {
  return (
    <section className="relative py-14 md:py-20 overflow-hidden bg-transparent">
      <div className="max-w-[1264px] mx-auto px-6 md:px-16 text-center mb-8 md:mb-10">
        <p
          className="font-label text-[11px] tracking-[0.25em] uppercase"
          style={{ color: 'var(--zyro-text-muted)' }}
        >
          Built on & integrated with industry-leading infrastructure
        </p>
      </div>

      {/* Continuous rolling marquee */}
      <div className="relative group">
        {/* Left fade gradient */}
        <div
          className="absolute inset-y-0 left-0 w-24 md:w-44 z-10 pointer-events-none"
          style={{
            background: `linear-gradient(to right, var(--zyro-bg), transparent)`,
          }}
        />
        {/* Right fade gradient */}
        <div
          className="absolute inset-y-0 right-0 w-24 md:w-44 z-10 pointer-events-none"
          style={{
            background: `linear-gradient(to left, var(--zyro-bg), transparent)`,
          }}
        />

        {/* Subtle dividers */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'var(--zyro-border)', opacity: 0.7 }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'var(--zyro-border)', opacity: 0.7 }}
        />

        {/* Marquee track — pauses on hover or prefers-reduced-motion */}
        <div className="flex w-max animate-marquee motion-reduce:animate-none py-5 md:py-7">
          {[...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS].map((partner, i) => (
            <div
              key={`${partner.name}-${i}`}
              className="group/item mx-6 sm:mx-10 md:mx-14 shrink-0 flex items-center gap-2.5 cursor-default transition-all duration-300 opacity-60 hover:opacity-100 hover:scale-105"
            >
              <span
                className="transition-colors duration-300"
                style={{ color: 'var(--zyro-text-muted)' }}
              >
                <span className="inline-block group-hover/item:text-[var(--brand)] transition-colors duration-300" style={{ '--brand': partner.color } as React.CSSProperties}>
                  {partner.svg}
                </span>
              </span>
              <span
                className="text-sm md:text-[15px] font-semibold tracking-tight whitespace-nowrap transition-colors duration-300 group-hover/item:text-white"
                style={{ color: 'var(--zyro-text-secondary)' }}
              >
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
