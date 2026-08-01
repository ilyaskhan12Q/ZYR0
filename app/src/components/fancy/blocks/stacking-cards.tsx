import React, { createContext, useContext, useRef, useState, useEffect } from "react"
import { motion, useScroll, useTransform, MotionValue } from "framer-motion"
import { cn } from "@/lib/utils"

interface StackingCardsContextValue {
  totalCards: number
  isReducedMotion: boolean
  scrollOptions?: {
    container?: React.RefObject<HTMLElement | null>
  }
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
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setIsReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches)
    mediaQuery.addEventListener?.("change", handleChange)
    return () => mediaQuery.removeEventListener?.("change", handleChange)
  }, [])

  return (
    <StackingCardsContext.Provider value={{ totalCards, isReducedMotion, scrollOptions }}>
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
  topOffset = "top-20 sm:top-24 lg:top-28",
  ...props
}: StackingCardItemProps) {
  const context = useContext(StackingCardsContext)
  const cardRef = useRef<HTMLDivElement>(null)

  const total = context?.totalCards || 1
  const targetScale = 1 - (total - index) * 0.04

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start start", "end start"],
    container: context?.scrollOptions?.container,
  })

  const scale = useTransform(scrollYProgress, [0, 1], [1, targetScale])
  const isReducedMotion = context?.isReducedMotion || false

  return (
    <div
      ref={cardRef}
      className={cn("sticky flex items-center justify-center w-full transform-gpu", topOffset, className)}
      style={{
        zIndex: index + 1,
      }}
      {...props}
    >
      <motion.div
        style={{
          scale: isReducedMotion ? 1 : scale,
        }}
        className="w-full flex justify-center"
      >
        {children}
      </motion.div>
    </div>
  )
}

export default StackingCards
