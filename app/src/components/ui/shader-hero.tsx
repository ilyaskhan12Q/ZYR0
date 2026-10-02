"use client"
import { m } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { HeroLineArtCycle } from "@/components/lineart"

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
  return (
    <div
      className="relative min-h-[92vh] md:min-h-screen overflow-hidden w-full flex flex-col justify-center items-center select-none transition-colors duration-200"
      style={{ background: 'var(--zyro-bg)' }}
    >
      {/* Subtle background static gradient depth */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle at 65% 35%, var(--zyro-accent-muted) 0%, transparent 70%)'
        }}
      />

      {/* Main 2-column container: Content on the Left, 3D Line Art on the Right */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-20 sm:pt-24 lg:pt-28 pb-10 sm:pb-14 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center">
          
          {/* 3D Cycling Line Art — on Mobile: Top (order-1); on Desktop: Right (order-2) */}
          <m.div
            initial={{ opacity: 0, scale: 0.92, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="order-1 lg:order-2 lg:col-span-6 flex justify-center lg:justify-end items-center w-full lg:translate-x-6 xl:translate-x-10 mb-2 lg:mb-0"
          >
            <HeroLineArtCycle intervalMs={4000} />
          </m.div>

          {/* ZYR0 Content & Actions — on Mobile: Below shapes (order-2); on Desktop: Left (order-1) */}
          <div className="order-2 lg:order-1 lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Badge */}
            <m.div
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mb-5 md:mb-6 px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 backdrop-blur-md border shadow-sm transition-colors"
              style={{
                background: 'var(--zyro-surface)',
                borderColor: 'var(--zyro-border)',
                color: 'var(--zyro-text-secondary)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#7B7BDC]" />
              <span>ZYR0 2.0 — The Unified Platform</span>
            </m.div>

            {/* Hero Brand Wordmark in Agbalumo */}
            <m.div
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1
                className="font-agbalumo text-6xl sm:text-7xl md:text-8xl lg:text-[7.5rem] leading-[0.88] tracking-[-0.03em] transition-colors"
                style={{ color: 'var(--zyro-text)' }}
              >
                ZYR0
              </h1>
            </m.div>

            {/* Subtitle tagline — letter by letter */}
            <m.h2
              variants={containerAnimation}
              initial="hidden"
              animate="visible"
              className="mt-4 md:mt-5 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.03em] flex flex-wrap justify-center lg:justify-start leading-tight font-display transition-colors"
              style={{ color: 'var(--zyro-text)' }}
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
              className="mt-5 md:mt-6 max-w-lg text-base sm:text-lg leading-relaxed font-sans transition-colors"
              style={{ color: 'var(--zyro-text-secondary)' }}
            >
              An ecosystem of tools for those who build, learn, research, and work.
              Autonomous AI creation, modern school management, and verifiable credentials.
            </m.p>

            {/* CTAs */}
            <m.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.6 }}
              className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto"
            >
              <Link to="/register?redirect=%2F" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full px-8 py-6 text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md"
                  style={{
                    background: 'var(--zyro-text)',
                    color: 'var(--zyro-bg)',
                  }}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <a href="#products" className="w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full sm:w-auto rounded-full px-7 py-6 text-sm font-medium border transition-all duration-200"
                  style={{
                    borderColor: 'var(--zyro-border)',
                    color: 'var(--zyro-text-secondary)',
                    background: 'var(--zyro-surface)',
                  }}
                >
                  Explore Products
                </Button>
              </a>

              <Link to="/contact" className="w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full sm:w-auto rounded-full px-7 py-6 text-sm font-medium transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ color: 'var(--zyro-text-muted)' }}
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
              className="mt-8 md:mt-14 pt-4 md:pt-5 border-t w-full max-w-lg"
              style={{ borderColor: 'var(--zyro-border)' }}
            >
              <p
                className="font-label text-[11px] tracking-[0.28em] uppercase font-semibold text-center lg:text-left"
                style={{ color: 'var(--zyro-text-muted)' }}
              >
                Build · Learn · Research · Work
              </p>
            </m.div>
          </div>

        </div>
      </div>

      {/* Bottom subtle edge divider */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'var(--zyro-border)', opacity: 0.5 }}
      />
    </div>
  )
}

export const CleanHero = ShaderHero

