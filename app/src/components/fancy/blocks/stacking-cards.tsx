import React, { createContext, useContext, useRef } from "react"
import { motion, useScroll, useTransform, MotionValue } from "framer-motion"
import { cn } from "@/lib/utils"

interface StackingCardsContextValue {
  scrollYProgress: MotionValue<number>
  totalCards: number
}

const StackingCardsContext = createContext<StackingCardsContextValue | null>(null)

export function useStackingCards() {
  const context = useContext(StackingCardsContext)
  if (!context) {
    throw new Error("useStackingCards must be used within a StackingCards container")
  }
  return context
}

interface StackingCardsProps extends React.HTMLAttributes<HTMLDivElement> {
  totalCards: number
  children: React.ReactNode
  className?: string
  scrollOptions?: {
    container?: React.RefObject<HTMLElement | null>
  }
}

export function StackingCards({
  totalCards,
  children,
  className,
  scrollOptions,
  ...props
}: StackingCardsProps) {
  const targetRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
    container: scrollOptions?.container,
  })

  return (
    <StackingCardsContext.Provider value={{ scrollYProgress, totalCards }}>
      <div
        ref={targetRef}
        className={cn("relative w-full", className)}
        {...props}
      >
        {children}
      </div>
    </StackingCardsContext.Provider>
  )
}

interface StackingCardItemProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number
  children: React.ReactNode
  className?: string
  topOffset?: string
}

export function StackingCardItem({
  index,
  children,
  className,
  topOffset = "top-24 sm:top-28",
  ...props
}: StackingCardItemProps) {
  const context = useContext(StackingCardsContext)
  const cardRef = useRef<HTMLDivElement>(null)

  // Calculate dynamic scale and top positioning based on index
  const total = context?.totalCards || 6
  const targetScale = 1 - (total - index) * 0.03

  // Fallback scroll progress if not inside context
  const { scrollYProgress: cardScroll } = useScroll({
    target: cardRef,
    offset: ["start end", "start start"],
  })

  const scrollProgress = context?.scrollYProgress || cardScroll
  
  // Transform scale dynamically as cards stack
  const rangeStart = index / total
  const scale = useTransform(scrollProgress, [rangeStart, 1], [1, targetScale])

  return (
    <div
      ref={cardRef}
      className={cn("sticky flex items-center justify-center w-full", topOffset, className)}
      style={{
        zIndex: index + 1,
      }}
      {...props}
    >
      <motion.div
        style={{
          scale: context ? scale : 1,
        }}
        className="w-full flex justify-center transform-gpu transition-all duration-200"
      >
        {children}
      </motion.div>
    </div>
  )
}

export default StackingCards
