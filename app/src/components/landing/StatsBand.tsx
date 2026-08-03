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

function useCountUp(target: number, decimals: number, active: boolean, delay: number) {
  const [value, setValue] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!active) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      setDone(true)
      return
    }
    const duration = 1600
    let raf = 0
    let start = 0
    const tick = (now: number) => {
      if (!start) start = now + delay
      const p = Math.min(Math.max((now - start) / duration, 0), 1)
      const eased = 1 - Math.pow(2, -10 * p)
      setValue(target * eased)
      if (p < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setValue(target)
        setDone(true)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, decimals, active, delay])

  return { value, done }
}

function formatValue(value: number, decimals: number) {
  if (decimals === 0) return Math.round(value).toLocaleString('en-US')
  return value.toFixed(decimals)
}

function StatCell({ stat, active, delay }: { stat: StatItem; active: boolean; delay: number }) {
  const { value, done } = useCountUp(stat.target, stat.decimals, active, delay)
  return (
    <div className="flex flex-col items-center gap-2 text-center md:px-6">
      <div
        className={`w-9 h-9 rounded-xl bg-sky-400/10 flex items-center justify-center transition-all duration-700 ${
          done
            ? 'scale-100 shadow-lg shadow-sky-400/25'
            : 'scale-90 opacity-70'
        }`}
      >
        <stat.icon className="w-4 h-4 text-sky-400" />
      </div>
      <span
        className={`stat-value text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 transition-all duration-500 ${
          done ? 'scale-100' : 'scale-95 opacity-60'
        }`}
      >
        {stat.prefix}
        {formatValue(value, stat.decimals)}
        {stat.suffix}
      </span>
      <span className="text-xs sm:text-sm text-slate-400 font-medium">
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
        <div className="glass-card-v3 grid grid-cols-2 md:grid-cols-4 gap-y-10 md:gap-y-0 md:divide-x md:divide-white/10 p-6 sm:p-8">
          {STATS.map((stat, i) => (
            <StatCell key={stat.label} stat={stat} active={inView} delay={i * 0.3} />
          ))}
        </div>
      </div>
    </section>
  )
}
