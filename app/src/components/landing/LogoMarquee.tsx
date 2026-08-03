import { Hexagon, Code2, Database, PenTool, Cloud, Landmark, Cpu, HeartPulse } from 'lucide-react'

const ITEMS = [
  { name: 'NOVATECH', icon: Hexagon, accent: 'text-blue-500' },
  { name: 'CodeCraft', icon: Code2, accent: 'text-emerald-500' },
  { name: 'DATA FORGE', icon: Database, accent: 'text-amber-500' },
  { name: 'PixelWorks', icon: PenTool, accent: 'text-sky-500' },
  { name: 'CloudPilot', icon: Cloud, accent: 'text-indigo-400' },
  { name: 'FinEdge', icon: Landmark, accent: 'text-teal-500' },
  { name: 'AIvantage', icon: Cpu, accent: 'text-violet-400' },
  { name: 'MediCore', icon: HeartPulse, accent: 'text-rose-400' },
]

export default function LogoMarquee() {
  return (
    <section className="py-10 lg:py-14 px-4 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <p className="text-center font-label text-[11px] uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500 mb-8">
          Trusted by employers &amp; campus programs
        </p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div className="flex w-max items-center gap-14 animate-marquee">
            {[...ITEMS, ...ITEMS].map((item, i) => (
              <div
                key={`${item.name}-${i}`}
                className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors select-none"
              >
                <item.icon className={`w-5 h-5 ${item.accent}`} />
                <span className="whitespace-nowrap font-display font-semibold tracking-tight text-base">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
