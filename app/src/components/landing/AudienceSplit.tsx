import { Link } from 'react-router-dom'
import { GraduationCap, Building2, UserCheck, Check, ArrowRight } from 'lucide-react'

const STUDENT_CHECKLIST = [
  'Browse 1,200+ paid internships across 40+ roles',
  '1-on-1 mentorship from industry professionals',
  'Employer-verified certificates with unique credential IDs',
  'Structured milestone tasks that build real portfolios',
  'Free for students — no fees, no strings attached',
]

const EMPLOYER_CHECKLIST = [
  'Post roles and manage cohorts from one dashboard',
  'Structured milestone tasks with clear acceptance criteria',
  'Assign mentors and track intern progress in real time',
  'Issue verified certificates interns can share instantly',
  'Replace spreadsheets with a unified hiring pipeline',
]

const MENTOR_CHECKLIST = [
  'Apply as an industry mentor and get matched with interns',
  'Review milestone submissions and provide 1-on-1 guidance',
  'Deliver structured, actionable feedback on every task',
  'Track intern growth through evaluations and reports',
  'Build your reputation as a leader in your field',
]

const CARDS = [
  {
    key: 'students',
    title: 'For Students',
    tagline: 'Land internships that actually build careers',
    icon: GraduationCap,
    iconBg: 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-600/25',
    glow: 'bg-blue-600/10',
    checkBg: 'bg-blue-600/15 dark:bg-sky-400/15',
    checkColor: 'text-blue-600 dark:text-sky-400',
    items: STUDENT_CHECKLIST,
    cta: { label: 'Find an Internship', to: '/internships', className: 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-600/25 hover:shadow-blue-500/40' },
  },
  {
    key: 'employers',
    title: 'For Employers',
    tagline: 'Run structured internship programs at scale',
    icon: Building2,
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25',
    glow: 'bg-emerald-500/10',
    checkBg: 'bg-emerald-500/15',
    checkColor: 'text-emerald-600 dark:text-emerald-400',
    items: EMPLOYER_CHECKLIST,
    cta: { label: 'Post an Internship', to: '/register', className: 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/25 hover:shadow-emerald-500/40' },
  },
  {
    key: 'mentors',
    title: 'For Mentors',
    tagline: 'Guide the next generation of industry talent',
    icon: UserCheck,
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/25',
    glow: 'bg-amber-500/10',
    checkBg: 'bg-amber-500/15',
    checkColor: 'text-amber-600 dark:text-amber-400',
    items: MENTOR_CHECKLIST,
    cta: { label: 'Become a Mentor', to: '/register', className: 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/25 hover:shadow-amber-500/40' },
  },
]

export default function AudienceSplit() {
  return (
    <section className="py-14 lg:py-20 px-4 bg-transparent content-visibility-auto">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="font-label text-[11px] uppercase tracking-[0.22em] text-blue-600 dark:text-sky-400">
            Built for students, employers &amp; mentors
          </span>
          <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-slate-900 dark:text-white">
            One platform.{' '}
            <span className="font-accent text-blue-600 dark:text-sky-400">
              Three journeys.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Whether you are starting your career, growing your team, or mentoring the
            next generation, ZYR0 turns internships into a structured, verifiable advantage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CARDS.map((card) => (
            <div
              key={card.key}
              className="glass-card-v3 relative overflow-hidden rounded-3xl p-8 flex flex-col"
            >
              <div className={`absolute -top-16 -right-16 w-48 h-48 ${card.glow} rounded-full blur-3xl pointer-events-none`} />
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center shadow-lg`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
                    {card.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {card.tagline}
                  </p>
                </div>
              </div>

              <ul className="mt-8 space-y-3.5 flex-1">
                {card.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className={`mt-0.5 w-5 h-5 rounded-full ${card.checkBg} flex items-center justify-center flex-shrink-0`}>
                      <Check className={`w-3 h-3 ${card.checkColor}`} />
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to={card.cta.to}
                className={`mt-8 inline-flex items-center justify-center gap-2 ${card.cta.className} text-white font-display font-semibold px-6 py-3.5 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm`}
              >
                {card.cta.label}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
