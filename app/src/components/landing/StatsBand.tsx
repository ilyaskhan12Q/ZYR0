import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { GraduationCap, Building2, Banknote, Star } from 'lucide-react'

interface StatItem {
  target: number
  decimals: number
  prefix?: string
  suffix?: string
  label: string
  icon: typeof GraduationCap
}

const STATS: StatItem[] = [
  { target: 2400, decimals: 0, suffix: '+', label: 'Student Placements', icon: GraduationCap },
  { target: 450, decimals: 0, suffix: '+', label: 'Partner Companies', icon: Building2 },
  { target: 18, decimals: 0, prefix: 'Rs ', suffix: 'M+', label: 'Stipends Disbursed', icon: Banknote },
  { target: 4.9, decimals: 1, suffix: '★', label: 'Mentor Rating', icon: Star },
]

function useCountUp(target: number, decimals: number, active: boolean) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }
    const duration = 1400
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(target * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, decimals, active])

  return value
}

function formatValue(value: number, decimals: number) {
  if (decimals === 0) return Math.round(value).toLocaleString('en-US')
  return value.toFixed(decimals)
}

function StatCell({ stat, active }: { stat: StatItem; active: boolean }) {
  const value = useCountUp(stat.target, stat.decimals, active)
  return (
    <div className="flex flex-col items-center md:items-start gap-1.5 text-center md:text-left">
      <stat.icon className="w-4 h-4 text-blue-500/80 dark:text-sky-400/80" />
      <span className="stat-value text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-sky-400 dark:to-indigo-400">
        {stat.prefix}
        {formatValue(value, stat.decimals)}
        {stat.suffix}
      </span>
      <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
        {stat.label}
      </span>
    </div>
  )
}

export default function StatsBand() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      className="py-14 lg:py-20 px-4 bg-transparent content-visibility-auto"
    >
      <div className="max-w-7xl mx-auto">
        <div className="glass-card-v3 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 p-8 sm:p-10">
          {STATS.map((stat) => (
            <StatCell key={stat.label} stat={stat} active={inView} />
          ))}
        </div>
      </div>
    </section>
  )
}
