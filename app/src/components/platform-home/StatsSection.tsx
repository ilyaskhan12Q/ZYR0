import { Layers, Users, Building2, Activity } from 'lucide-react';
import { stats } from './data';
import Reveal from './Reveal';
import CountUp from './CountUp';

const icons = [Layers, Users, Building2, Activity];
const accents = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

export default function StatsSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-[1264px] mx-auto px-6 md:px-16">
        <Reveal scale={0.98}>
          <div
            className="relative rounded-2xl border overflow-hidden"
            style={{
              background: 'var(--zyro-surface)',
              borderColor: 'var(--zyro-border)',
            }}
          >
            {/* Subtle gradient orb */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-3xl pointer-events-none opacity-[0.07]"
              style={{ background: 'var(--zyro-accent)' }}
            />

            <div className="relative grid grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => {
                const Icon = icons[index];
                const accent = accents[index];
                const isLast = index === stats.length - 1;

                return (
                  <div
                    key={stat.label}
                    className={`flex flex-col items-center text-center py-10 md:py-12 px-6 ${
                      !isLast ? 'lg:border-r' : ''
                    }`}
                    style={{
                      borderColor: 'var(--zyro-border)',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: `${accent}18` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: accent }} />
                    </div>
                    <div
                      className="text-3xl md:text-4xl font-display mb-1"
                      style={{ color: 'var(--zyro-text)' }}
                    >
                      <CountUp end={stat.number} />
                    </div>
                    <div
                      className="font-label text-[10px] tracking-[0.15em]"
                      style={{ color: 'var(--zyro-text-muted)' }}
                    >
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
