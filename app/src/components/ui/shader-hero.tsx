"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MeshGradient } from "@paper-design/shaders-react"
import { ArrowRight, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"

const letterAnimation = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: "easeOut" } },
}

const containerAnimation = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04 },
  },
}

export const ShaderHero = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      })
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("mousemove", handleMouseMove)
    }
    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black relative overflow-hidden w-full"
    >
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.004" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.25" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
        </defs>
      </svg>

      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#000000", "#2a2a2a", "#4a4a4a", "#ffffff"]}
        speed={0.25}
        backgroundColor="#000000"
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-50"
        colors={["#000000", "#ffffff", "#3a3a3a"]}
        speed={0.15}
        wireframe="true"
        backgroundColor="transparent"
      />

      {/* Radial spotlight following mouse */}
      <div
        className="absolute inset-0 opacity-30 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(700px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,255,255,0.12), transparent 60%)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-screen px-4">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8 px-4 py-1.5 rounded-full bg-white/[0.06] text-white/80 text-xs font-medium flex items-center gap-2 backdrop-blur-xl border border-white/[0.08]"
        >
          <Sparkles className="w-3.5 h-3.5 text-white/60" />
          ZYR0 2.0 — Now Live
        </motion.div>

        {/* Title — ZYR0 on first line */}
        <motion.div
          initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <h1 className="text-7xl md:text-9xl lg:text-[10rem] font-black tracking-[-0.05em] text-white leading-[0.85]">
            ZYR0
          </h1>
        </motion.div>

        {/* Subtitle tagline — letter by letter */}
        <motion.h2
          variants={containerAnimation}
          initial="hidden"
          animate="visible"
          className="mt-4 text-2xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.02em] text-white/70 flex flex-wrap justify-center leading-[1.2]"
        >
          {"Think. Build. Scale to ∞.".split("").map((char, index) => (
            <motion.span
              key={index}
              variants={letterAnimation}
              className={char === " " ? "w-2 md:w-3" : ""}
            >
              {char}
            </motion.span>
          ))}
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-8 max-w-lg text-base md:text-lg text-white/50 leading-relaxed"
        >
          An ecosystem of tools for those who build, learn, research, and work.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-12 flex flex-col sm:flex-row items-center gap-3"
        >
          <Link to="/register">
            <Button
              size="lg"
              className="rounded-full px-7 py-5 text-sm font-semibold bg-white text-black hover:bg-white/90 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)]"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/#products">
            <Button
              variant="ghost"
              size="lg"
              className="rounded-full px-7 py-5 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/[0.06] transition-all duration-300"
            >
              Explore Products
            </Button>
          </Link>
          <Link to="/contact">
            <Button
              variant="ghost"
              size="lg"
              className="rounded-full px-7 py-5 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/[0.06] transition-all duration-300"
            >
              Book a Demo
            </Button>
          </Link>
        </motion.div>

        {/* Product pillars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="mt-20"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-white/40 font-bold">
            Build · Learn · Research · Work
          </p>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </div>
  )
}
