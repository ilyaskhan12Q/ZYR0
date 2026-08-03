import { Link } from 'react-router-dom'
import {
  Code2, Server, BrainCircuit, PenTool, BarChart3, Megaphone,
  PenLine, ShieldCheck, GitBranch, Boxes, Smartphone, Layers,
} from 'lucide-react'

const ROLES = [
  { name: 'Frontend Development', icon: Code2 },
  { name: 'Backend Development', icon: Server },
  { name: 'AI / ML', icon: BrainCircuit },
  { name: 'UI / UX Design', icon: PenTool },
  { name: 'Data Analytics', icon: BarChart3 },
  { name: 'Digital Marketing', icon: Megaphone },
  { name: 'Content Writing', icon: PenLine },
  { name: 'Cybersecurity', icon: ShieldCheck },
  { name: 'DevOps', icon: GitBranch },
  { name: 'Product Management', icon: Boxes },
  { name: 'Mobile Development', icon: Smartphone },
  { name: 'Software Engineering', icon: Layers },
]

export default function RoleChips() {
  return (
    <section className="py-14 lg:py-20 px-4 bg-transparent content-visibility-auto">
      <div className="max-w-7xl mx-auto">
        <p className="text-center font-label text-[11px] uppercase tracking-[0.22em] text-blue-600 dark:text-sky-400 mb-3">
          Trending this week
        </p>
        <h2 className="text-center font-display font-bold text-3xl sm:text-4xl tracking-tight text-slate-900 dark:text-white">
          Roles companies are hiring for
        </h2>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {ROLES.map((role) => (
            <Link
              key={role.name}
              to="/internships"
              className="chip-v3 border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-blue-600/40 dark:hover:border-sky-400/40 hover:text-blue-700 dark:hover:text-sky-300 hover:shadow-lg hover:shadow-blue-600/10 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <role.icon className="w-3.5 h-3.5" />
              {role.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
