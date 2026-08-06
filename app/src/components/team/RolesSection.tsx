import { useState } from 'react';
import { Briefcase, CheckCircle2, ArrowRight, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { Reveal, SectionHeading } from './SectionHeading';
import {
  TEAM_ROLES,
  STATUS_META,
  departmentCounts,
  type TeamRole,
} from './team-data';
import { cn } from '@/lib/utils';

interface RolesSectionProps {
  /** Called when a candidate taps "Apply" on a role card */
  onApply: (roleId: string) => void;
}

function RoleCard({ role, onApply }: { role: TeamRole; onApply: (roleId: string) => void }) {
  const Icon = role.icon;
  const status = STATUS_META[role.status];

  return (
    <article
      className="group h-full flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-emerald-500/10"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110', role.accent)}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {role.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {role.department} · {role.positions} position{role.positions > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <span className={cn('shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold', status.classes)}>
          <span className={cn('w-1.5 h-1.5 rounded-full', role.status === 'open' ? 'bg-emerald-500' : 'bg-amber-500')} />
          {status.label}
        </span>
      </div>

      {/* Overview */}
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {role.overview}
      </p>

      {/* Responsibilities */}
      <div className="mt-5">
        <h4 className="font-label text-[10px] tracking-[0.2em] text-blue-600 dark:text-sky-400">
          Core Responsibilities
        </h4>
        <ul className="mt-2.5 space-y-1.5">
          {role.responsibilities.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Required tech */}
      <div className="mt-5">
        <h4 className="font-label text-[10px] tracking-[0.2em] text-blue-600 dark:text-sky-400">
          Required Technologies
        </h4>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {role.requiredTech.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-sky-400/10 text-blue-700 dark:text-sky-300 border border-sky-400/20"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Preferred skills */}
      <div className="mt-3.5">
        <h4 className="font-label text-[10px] tracking-[0.2em] text-slate-400 dark:text-slate-500">
          Preferred Skills
        </h4>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {role.preferredSkills.map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded-md text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-white/5"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-auto pt-5 border-t border-slate-200/80 dark:border-white/10">
        <button
          type="button"
          onClick={() => onApply(role.id)}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 text-white font-display font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-500/35 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 text-sm group/btn"
        >
          Apply for this role
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </article>
  );
}

export function RolesSection({ onApply }: RolesSectionProps) {
  const [filter, setFilter] = useState<string>('all');
  const [showAll, setShowAll] = useState(false);
  const departments = departmentCounts(TEAM_ROLES);
  const visibleRoles =
    filter === 'all' ? TEAM_ROLES : TEAM_ROLES.filter((r) => r.department === filter);

  // In the "All roles" view we surface a compact preview first, then let
  // candidates reveal the rest — department views are small enough to show fully.
  const limited = filter === 'all' && !showAll;
  const shownRoles = limited ? visibleRoles.slice(0, 2) : visibleRoles;
  const selectDepartment = (name: string) => {
    setFilter(name);
    setShowAll(false);
  };

  return (
    <section className="py-14 lg:py-20 px-4 bg-transparent content-visibility-auto" id="team-roles">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Open Roles"
          title="Find your place on"
          accent="the founding team"
          description="Every role is built for students and early-career builders. Pick a discipline — or two — and grow with the team as the platform scales."
          icon={Briefcase}
        />

        {/* Department filters */}
        <Reveal className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filter
          </span>
          <button
            type="button"
            onClick={() => selectDepartment('all')}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200',
              filter === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-600/25'
                : 'bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-blue-400/50 hover:text-blue-600 dark:hover:text-sky-400'
            )}
            aria-pressed={filter === 'all'}
          >
            All roles
          </button>
          {departments.map((dept) => (
            <button
              key={dept.name}
              type="button"
              onClick={() => selectDepartment(dept.name)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200',
                filter === dept.name
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-600/25'
                  : 'bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-blue-400/50 hover:text-blue-600 dark:hover:text-sky-400'
              )}
              aria-pressed={filter === dept.name}
            >
              {dept.name} <span className="opacity-60">({dept.count})</span>
            </button>
          ))}
        </Reveal>

        {/* Role cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {shownRoles.map((role, i) => (
            <Reveal key={role.id} delay={(i % 2) * 0.08} className="h-full">
              <RoleCard role={role} onApply={onApply} />
            </Reveal>
          ))}
        </div>

        {/* Show all / Show less */}
        {filter === 'all' && visibleRoles.length > 2 && (
          <div className="flex justify-center mt-10">
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border border-slate-300 dark:border-white/15 bg-white/70 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200 hover:border-blue-400/60 hover:text-blue-600 dark:hover:text-sky-400 transition-all duration-200"
              aria-expanded={showAll}
            >
              {showAll ? (
                <>Show less <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>Show all {visibleRoles.length} roles <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          </div>
        )}

        {visibleRoles.length === 0 && (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-10">
            No open roles in this department right now — check back soon.
          </p>
        )}
      </div>
    </section>
  );
}
