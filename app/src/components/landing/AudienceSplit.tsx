import { Link } from 'react-router-dom'
import { GraduationCap, Building2, Check, ArrowRight } from 'lucide-react'

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

export default function AudienceSplit() {
  return (
    <section className="py-14 lg:py-20 px-4 bg-transparent content-visibility-auto">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="font-label text-[11px] uppercase tracking-[0.22em] text-blue-600 dark:text-sky-400">
            Built for both sides
          </span>
          <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-slate-900 dark:text-white">
            One platform.{' '}
            <span className="font-accent text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-sky-400 dark:to-indigo-400">
              Two journeys.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Whether you are starting your career or growing your team, ZYR0 turns
            internships into a structured, verifiable advantage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* For Students */}
          <div className="glass-card-v3 relative overflow-hidden rounded-3xl p-8 sm:p-10 flex flex-col">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/25">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
                  For Students
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Land internships that actually build careers
                </p>
              </div>
            </div>

            <ul className="mt-8 space-y-3.5 flex-1">
              {STUDENT_CHECKLIST.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-blue-600/15 dark:bg-sky-400/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-blue-600 dark:text-sky-400" />
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              to="/internships"
              className="mt-8 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-display font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm"
            >
              Find an Internship
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* For Employers */}
          <div className="glass-card-v3 relative overflow-hidden rounded-3xl p-8 sm:p-10 flex flex-col">
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
                  For Employers
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Run structured internship programs at scale
                </p>
              </div>
            </div>

            <ul className="mt-8 space-y-3.5 flex-1">
              {EMPLOYER_CHECKLIST.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              to="/register"
              className="mt-8 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-display font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm"
            >
              Post an Internship
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
