import React from "react"
import { Sparkles } from "lucide-react"
import { StackingCards, StackingCardItem } from "@/components/fancy/blocks/stacking-cards"
import { JourneyCard } from "./JourneyCard"
import { JOURNEY_CARDS } from "./journey-data"
import { cn } from "@/lib/utils"

interface JourneySectionProps {
  className?: string
}

export function JourneySection({ className }: JourneySectionProps) {
  return (
    <section className={cn("py-16 lg:py-24 px-4 bg-transparent relative overflow-x-clip", className)}>
      {/* Background Decorative Glow Effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-400/10 border border-sky-400/25 text-sky-400 font-label text-[10px] tracking-[0.2em] mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            End-to-End Internship Engine
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            How ZYR0 Works <br className="hidden sm:inline" />
            <span className="font-accent text-sky-400">
              The Complete Student & Employer Journey
            </span>
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg leading-relaxed">
            From discovering verified internship drops to earning tamper-proof credentials and transitioning into full-time roles — experience a transparent, structured pathway.
          </p>
        </div>

        {/* Stacking Cards Scroll Container */}
        <div className="relative w-full pb-24">
          <StackingCards totalCards={JOURNEY_CARDS.length} scaleMultiplier={0.03}>
            {JOURNEY_CARDS.map((card, idx) => (
              <StackingCardItem
                key={card.id}
                index={idx}
                topPosition={`${8 + idx * 3}%`}
                className="h-[560px] sm:h-[620px]"
              >
                <JourneyCard card={card} index={idx} totalCards={JOURNEY_CARDS.length} />
              </StackingCardItem>
            ))}
          </StackingCards>
        </div>
      </div>
    </section>
  )
}

export default JourneySection
