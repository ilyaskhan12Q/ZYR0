import { GitCommit } from 'lucide-react';

const ITEMS = [
  'SUPPORTED INFRASTRUCTURE',
  'GitHub Enterprise APIs',
  'Cloudflare Verified',
  'Supabase RLS',
  'Vercel Deployments',
  'PostgreSQL',
];

function TickerRun() {
  return (
    <div className="flex items-center gap-10 pr-10">
      {ITEMS.map((item) => (
        <span key={item} className="flex items-center gap-10">
          <span className="v5-mono text-xs tracking-[0.2em] text-white/40 uppercase whitespace-nowrap">
            {item}
          </span>
          <GitCommit className="w-3.5 h-3.5 text-white/25" />
        </span>
      ))}
    </div>
  );
}

export function TickerStrip() {
  return (
    <section className="border-y border-white/[0.08] bg-[#08090a] py-5 overflow-hidden" aria-label="Supported infrastructure">
      <div className="flex w-max animate-marquee">
        <TickerRun />
        <TickerRun />
      </div>
    </section>
  );
}
