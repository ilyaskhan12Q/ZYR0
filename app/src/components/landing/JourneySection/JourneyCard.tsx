import React from "react"
import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, User, Award, ExternalLink, Building2, Rocket } from "lucide-react"
import type { JourneyCardItem } from "./journey-data"
import { cn } from "@/lib/utils"

interface JourneyCardProps {
  card: JourneyCardItem
  index: number
  totalCards: number
}

const BADGE_STYLES: Record<
  JourneyCardItem["badgeVariant"],
  { bg: string; text: string; border: string; hoverBorder: string; glowBg: string; ctaBg: string; ctaHover: string; ctaText: string }
> = {
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-500/25",
    hoverBorder: "hover:border-cyan-500/40",
    glowBg: "bg-cyan-500",
    ctaBg: "bg-cyan-500",
    ctaHover: "hover:bg-cyan-400",
    ctaText: "text-slate-950",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/25",
    hoverBorder: "hover:border-emerald-500/40",
    glowBg: "bg-emerald-500",
    ctaBg: "bg-emerald-500",
    ctaHover: "hover:bg-emerald-400",
    ctaText: "text-slate-900 dark:text-white",
  },
  indigo: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-500/25",
    hoverBorder: "hover:border-indigo-500/40",
    glowBg: "bg-indigo-500",
    ctaBg: "bg-indigo-600",
    ctaHover: "hover:bg-indigo-500",
    ctaText: "text-slate-900 dark:text-white",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/25",
    hoverBorder: "hover:border-amber-500/40",
    glowBg: "bg-amber-500",
    ctaBg: "bg-amber-500",
    ctaHover: "hover:bg-amber-400",
    ctaText: "text-slate-950",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/25",
    hoverBorder: "hover:border-purple-500/40",
    glowBg: "bg-purple-500",
    ctaBg: "bg-purple-600",
    ctaHover: "hover:bg-purple-500",
    ctaText: "text-slate-900 dark:text-white",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/25",
    hoverBorder: "hover:border-blue-500/40",
    glowBg: "bg-blue-500",
    ctaBg: "bg-blue-600",
    ctaHover: "hover:bg-blue-500",
    ctaText: "text-slate-900 dark:text-white",
  },
}

export const JourneyCard = React.memo(function JourneyCard({ card, index, totalCards }: JourneyCardProps) {
  const badgeStyle = BADGE_STYLES[card.badgeVariant]
  const Icon = card.icon

  return (
    <div
      className={cn(
        "w-full max-w-5xl mx-auto rounded-3xl p-6 sm:p-8 lg:p-10",
        "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-2xl",
        "flex flex-col lg:flex-row gap-8 lg:gap-10 items-stretch justify-between",
        "relative overflow-hidden group transition-all duration-300",
        badgeStyle.hoverBorder
      )}
    >
      {/* Subtle Glow Circle Accent */}
      <div
        className={cn(
          "absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-30",
          badgeStyle.glowBg
        )}
      />

      {/* Left Column: Narrative Content */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between space-y-6 relative z-10">
        <div>
          {/* Header Step Badge & Counter */}
          <div className="flex items-center justify-between mb-4">
            <span
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border shadow-xs",
                badgeStyle.bg,
                badgeStyle.text,
                badgeStyle.border
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {card.badgeText}
            </span>
            <span className="text-3xl font-black font-mono text-slate-900/30 dark:text-slate-900 dark:text-white/30 group-hover:text-slate-900/60 dark:group-hover:text-slate-900 dark:text-white/60 transition-colors">
              {card.stepNumber} <span className="text-sm font-normal text-slate-900/20 dark:text-slate-900 dark:text-white/20">/ 0{totalCards}</span>
            </span>
          </div>

          {/* Title & Subtitle */}
          <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight mb-2">
            {card.title}
          </h3>
          <p className={cn("text-xs sm:text-sm font-semibold mb-4 tracking-wide uppercase", badgeStyle.text)}>
            {card.subtitle}
          </p>

          {/* Body Narrative */}
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-normal mb-6">
            {card.description}
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            {card.tags.map((tag, tIdx) => (
              <span
                key={tIdx}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 flex items-center gap-1.5"
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", badgeStyle.glowBg)} />
                {tag}
              </span>
            ))}
          </div>

          {/* Key Metrics / Highlights */}
          {card.stats && card.stats.length > 0 && (
            <div className="grid grid-cols-2 gap-4 py-4 px-4 rounded-xl bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 mb-6">
              {card.stats.map((stat, sIdx) => (
                <div key={sIdx}>
                  <div className="text-xs text-slate-500 dark:text-slate-600 dark:text-slate-400 font-medium">{stat.label}</div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">{stat.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        {card.ctaText && card.ctaHref && (
          <div>
            <Link
              to={card.ctaHref}
              className={cn(
                "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg active:scale-95 group/btn",
                badgeStyle.ctaBg,
                badgeStyle.ctaHover,
                badgeStyle.ctaText
              )}
            >
              {card.ctaText}
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>

      {/* Right Column: Custom Product Visual Mockup */}
      <div className="w-full lg:w-1/2 relative z-10 flex items-center justify-center">
        <CardVisualPreview type={card.previewType} />
      </div>
    </div>
  )
})

const CardVisualPreview = React.memo(function CardVisualPreview({ type }: { type: JourneyCardItem["previewType"] }) {
  switch (type) {
    case "filter_drops":
      return (
        <div className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-500 dark:text-slate-600 dark:text-slate-400 ml-2">zyr0.co/internships</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">LIVE DROPS</span>
          </div>

          <div className="space-y-3">
            {[
              { title: "Frontend Engineering Intern", company: "Systems Limited", type: "Remote • 3 Months", stipend: "PKR 45,000/mo" },
              { title: "AI/ML Engineer Intern", company: "TenSpeck Tech", type: "Hybrid • 6 Months", stipend: "PKR 60,000/mo" },
              { title: "UI/UX Product Designer", company: "DevSinc", type: "On-site • Lahore", stipend: "PKR 50,000/mo" }
            ].map((drop, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-white/5 hover:border-cyan-500/30 transition-all flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {drop.title}
                    {idx === 0 && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-1">
                    <Building2 className="w-3 h-3 text-slate-500" /> {drop.company} • {drop.type}
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">{drop.stipend}</span>
              </div>
            ))}
          </div>
        </div>
      )

    case "profile_apply":
      return (
        <div className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-white/10">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-lg">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Ayesha Khan
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-600 dark:text-slate-400">BS Computer Science • NUST 2026</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-600 dark:text-slate-400">Profile Readiness Score</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">100% Verified</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-full" />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Verified GitHub & Transcripts Attached
            </div>
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950">Applied</span>
          </div>
        </div>
      )

    case "selection_pipeline":
      return (
        <div className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-600 dark:text-slate-400 tracking-wider uppercase mb-2">Live Application Tracker</div>

          <div className="space-y-3">
            {[
              { stage: "Profile Submitted", time: "Just now", status: "COMPLETE", color: "text-slate-500 dark:text-slate-600 dark:text-slate-400 bg-slate-800 border-transparent" },
              { stage: "Employer Screening", time: "2 hours ago", status: "VERIFIED", color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/30" },
              { stage: "Shortlisted for Interview", time: "Live Alert", status: "SHORTLISTED", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 border-emerald-500/40 animate-pulse" }
            ].map((step, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-mono font-bold">
                    0{idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{step.stage}</div>
                    <div className="text-[10px] text-slate-500">{step.time}</div>
                  </div>
                </div>
                <span className={cn("px-2.5 py-0.5 rounded text-[10px] font-bold border", step.color)}>
                  {step.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )

    case "workspace_sprint":
      return (
        <div className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Milestone Workspace
            </div>
            <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold">Sprint 2 / 4</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-900 dark:text-white">Task: Implement OAuth2 Authentication</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">IN REVIEW</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-600 dark:text-slate-400">Assigned Mentor: Tariq Mahmood (Senior Staff Engineer)</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-600 dark:text-slate-400">
              <span>Rubric Check: Code Quality & Tests</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">PASSED (10/10)</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-600 dark:text-slate-400">
              <span>Rubric Check: Security Hygiene</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">PASSED (10/10)</span>
            </div>
          </div>
        </div>
      )

    case "verified_credential":
      return (
        <div className="w-full bg-slate-950/90 border border-purple-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <Award className="w-6 h-6" />
              <span className="text-xs font-bold tracking-wider font-mono">ZYR0 VERIFIED CREDENTIAL</span>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="space-y-1">
            <div className="text-lg font-extrabold text-slate-900 dark:text-white">Software Engineering Internship</div>
            <div className="text-xs text-slate-500 dark:text-slate-600 dark:text-slate-400">Issued to: Ayesha Khan • August 2026</div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
            <div>
              <span className="text-slate-500 block font-mono">CREDENTIAL ID</span>
              <span className="text-purple-300 font-mono font-bold">ZYR-2026-88419X</span>
            </div>
            <div className="px-3 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> QR VERIFIED
            </div>
          </div>
        </div>
      )

    case "career_launch":
      return (
        <div className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Rocket className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Full-Time Transition Pool
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">HIRED</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-white/5 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">Direct Return Offer Generated</div>
            <div className="text-xs text-slate-500 dark:text-slate-600 dark:text-slate-400">Systems Limited • Junior Software Engineer</div>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-slate-900 dark:text-white shadow-md">
              Offer Accepted
            </span>
          </div>
        </div>
      )

    default:
      return null
  }
})
