"use client"

import { useEffect, useRef } from "react"
import { m } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"

const letterAnimation = {
  hidden: { opacity: 0, y: 35, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const }
  },
}

const containerAnimation = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.035, delayChildren: 0.4 },
  },
}

export const ShaderHero = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef(0)
  const pendingRef = useRef(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      if (!pendingRef.current) {
        pendingRef.current = true
        rafRef.current = requestAnimationFrame(() => {
          pendingRef.current = false
          if (spotlightRef.current) {
            spotlightRef.current.style.background = `radial-gradient(650px circle at ${x}% ${y}%, rgba(123, 123, 220, 0.08), rgba(0, 81, 195, 0.03) 40%, transparent 70%)`
          }
        })
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("mousemove", handleMouseMove, { passive: true })
    }
    return () => {
      cancelAnimationFrame(rafRef.current)
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative min-h-[92vh] md:min-h-screen bg-[#07070D] overflow-hidden w-full flex flex-col justify-center items-center select-none"
    >
      {/* Subtle background static gradient depth */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle at 50% 18%, rgba(18, 1, 89, 0.45) 0%, rgba(7, 7, 13, 0) 70%)'
        }}
      />

      {/* Subtle interactive cursor spotlight */}
      <div
        ref={spotlightRef}
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
      />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-24 pb-16 max-w-5xl mx-auto">
        {/* Badge */}
        <m.div
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mb-6 md:mb-8 px-4 py-1.5 rounded-full bg-white/[0.04] text-white/80 text-xs font-medium flex items-center gap-2 backdrop-blur-md border border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#7B7BDC]" />
          <span>ZYR0 2.0 — The Unified Platform</span>
        </m.div>

        {/* Hero Brand Wordmark in Agbalumo */}
        <m.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <h1 className="font-agbalumo text-7xl sm:text-8xl md:text-9xl lg:text-[10.5rem] text-white leading-[0.88] tracking-[-0.03em] drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
            ZYR0
          </h1>
        </m.div>

        {/* Subtitle tagline — letter by letter */}
        <m.h2
          variants={containerAnimation}
          initial="hidden"
          animate="visible"
          className="mt-5 md:mt-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] text-white/85 flex flex-wrap justify-center leading-tight font-display"
        >
          {"Think. Build. Scale to ∞.".split("").map((char, index) => (
            <m.span
              key={index}
              variants={letterAnimation}
              className={char === " " ? "w-2 md:w-3" : ""}
            >
              {char}
            </m.span>
          ))}
        </m.h2>

        {/* Supporting description */}
        <m.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="mt-6 md:mt-8 max-w-xl text-base sm:text-lg text-white/60 leading-relaxed font-sans"
        >
          An ecosystem of tools for those who build, learn, research, and work.
          Autonomous AI creation, modern school management, and verifiable credentials.
        </m.p>

        {/* CTAs */}
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.6 }}
          className="mt-10 md:mt-12 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto"
        >
          <Link to="/register?redirect=%2F" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto rounded-full px-8 py-6 text-sm font-semibold bg-white text-black hover:bg-neutral-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-[0_0_35px_rgba(255,255,255,0.18)]"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <a href="#products" className="w-full sm:w-auto">
            <Button
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto rounded-full px-7 py-6 text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.06] border border-white/[0.08] transition-all duration-200"
            >
              Explore Products
            </Button>
          </a>

          <Link to="/contact" className="w-full sm:w-auto">
            <Button
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto rounded-full px-7 py-6 text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
            >
              Book a Demo
            </Button>
          </Link>
        </m.div>

        {/* Product pillars */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.15, duration: 0.7 }}
          className="mt-16 md:mt-20 pt-6 border-t border-white/[0.06]"
        >
          <p className="font-label text-[11px] tracking-[0.28em] uppercase text-white/35 font-semibold">
            Build · Learn · Research · Work
          </p>
        </m.div>
      </div>

      {/* Bottom subtle edge divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/[0.06]" />
    </div>
  )
}

export const CleanHero = ShaderHero
