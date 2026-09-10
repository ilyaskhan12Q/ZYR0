import React, { createContext, useContext, useRef } from "react"
import { m, useScroll, useTransform } from "framer-motion"
import type { MotionValue, UseScrollOptions } from "framer-motion"
import { cn } from "@/lib/utils"

interface StackingCardsContextValue {
  scrollYProgress: MotionValue<number>
  totalCards: number
  scaleMultiplier: number
}

const StackingCardsContext = createContext<StackingCardsContextValue | null>(null)

export function useStackingCards() {
  const context = useContext(StackingCardsContext)
  if (!context) {
    throw new Error("useStackingCards must be used within a StackingCards container")
  }
  return context
}

export interface StackingCardsProps extends React.HTMLAttributes<HTMLDivElement> {
  totalCards: number
  scaleMultiplier?: number
  scrollOptions?: UseScrollOptions & {
    container?: React.RefObject<HTMLElement | null>
  }
  children: React.ReactNode
  className?: string
}

export function StackingCards({
  totalCards = 0,
  scaleMultiplier = 0.03,
  scrollOptions = { offset: ["start start", "end end"] },
  children,
  className,
  ...props
}: StackingCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: scrollOptions?.offset || ["start start", "end end"],
    container: scrollOptions?.container,
  })

  return (
    <StackingCardsContext.Provider value={{ scrollYProgress, totalCards, scaleMultiplier }}>
      <div
        ref={containerRef}
        className={cn("relative w-full", className)}
        {...props}
      >
        {children}
      </div>
    </StackingCardsContext.Provider>
  )
}

export interface StackingCardItemProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number
  topPosition?: string
  children: React.ReactNode
  className?: string
}

export function StackingCardItem({
  index,
  topPosition,
  children,
  className,
  ...props
}: StackingCardItemProps) {
  const context = useContext(StackingCardsContext)
  if (!context) {
    throw new Error("StackingCardItem must be used within a StackingCards container")
  }

  const { scrollYProgress, totalCards, scaleMultiplier } = context
  const targetScale = 1 - (totalCards - index) * scaleMultiplier
  const rangeStart = totalCards > 0 ? index / totalCards : 0

  const scale = useTransform(
    scrollYProgress,
    [rangeStart, 1],
    [1, targetScale]
  )

  const calculatedTop = topPosition ?? `${5 + index * 3}%`

  return (
    <div
      className={cn("sticky flex items-center justify-center w-full transform-gpu", className)}
      style={{
        top: calculatedTop,
        zIndex: index + 1,
      }}
      {...props}
    >
      <m.div
        style={{
          scale,
        }}
        className="w-full flex justify-center items-center"
      >
        {children}
      </m.div>
    </div>
  )
}

export default StackingCards
