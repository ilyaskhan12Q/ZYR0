"use client"
import { useEffect, useRef } from "react"
import { m } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

/**
 * Wordmark rasterised to a low-res mask, then drawn as uniform blocks in one ink colour.
 * The canvas is scaled to its own box × dpr so blocks stay square at any width (no
 * resampling artefacts), and on mount they resolve out of random noise left-to-right.
 */
const PixelWordmark = () => {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const out = canvas?.getContext("2d")
    if (!canvas || !out) return
    const BLOCK = 5 // CSS px per block
    const ASPECT = 32 / 150 // mask height / width
    let cols = 0
    let rows = 0
    let block = 6
    let mask = new Uint8Array(0)
    let raf = 0
    let done = false

    const ink = () =>
      (getComputedStyle(canvas).color.match(/\d+/g) ?? ["0", "0", "0"]).map(Number)

    const buildMask = () => {
      const c = document.createElement("canvas")
      c.width = cols
      c.height = rows
      const s = c.getContext("2d")
      if (!s) return
      s.textAlign = "center"
      s.textBaseline = "middle"
      s.font = `bold ${Math.round(rows * 0.92)}px "DM Serif Text", Georgia, serif`
      s.fillStyle = "#000"
      s.fillText("ZYR0", cols / 2, rows / 2)
      // low threshold keeps the thin strokes and counters of the glyphs
      const d = s.getImageData(0, 0, cols, rows).data
      mask = new Uint8Array(cols * rows)
      for (let i = 0; i < mask.length; i++) mask[i] = d[i * 4 + 3] > 90 ? 1 : 0
    }

    /** Size the bitmap to its CSS box so one block is a whole number of device pixels. */
    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const cssW = canvas.clientWidth || 800
      block = Math.max(2, Math.round(BLOCK * dpr))
      cols = Math.max(40, Math.floor((cssW * dpr) / block))
      rows = Math.max(10, Math.round(cols * ASPECT))
      canvas.width = cols * block
      canvas.height = rows * block
      buildMask()
    }

    const drawFinal = () => {
      const [r, g, b] = ink()
      out.clearRect(0, 0, canvas.width, canvas.height)
      out.fillStyle = `rgb(${r}, ${g}, ${b})`
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (mask[y * cols + x]) out.fillRect(x * block, y * block, block, block)
        }
      }
      done = true
    }

    const animate = (now: number, t0: number) => {
      const t = (now - t0) / 1000
      if (t > 0.85) {
        drawFinal()
        return
      }
      const [r, g, b] = ink()
      out.clearRect(0, 0, canvas.width, canvas.height)
      out.fillStyle = `rgb(${r}, ${g}, ${b})`
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (!mask[y * cols + x]) continue
          const local = (t - (x / cols) * 0.42) / 0.3
          if (local <= 0) continue
          if (local < 1 && Math.random() > local) continue
          out.fillRect(x * block, y * block, block, block)
        }
      }
      raf = requestAnimationFrame((n) => animate(n, t0))
    }

    const start = () => {
      layout()
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        drawFinal()
        return
      }
      done = false
      raf = requestAnimationFrame((n) => animate(n, n))
    }

    start()
    // fallback font may have been used for the mask; rebuild once the real one lands
    void document.fonts.ready.then(() => {
      if (done) start()
      else buildMask()
    })
    // ink comes from a token, so repaint when the theme class flips
    const mo = new MutationObserver(() => {
      if (done) drawFinal()
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    let resizeTimer = 0
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        cancelAnimationFrame(raf)
        start()
      }, 150)
    }
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(resizeTimer)
      window.removeEventListener("resize", onResize)
      mo.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={ref}
      width={1200}
      height={256}
      role="img"
      aria-label="ZYR0"
      className="block h-auto w-full max-w-[54rem] [image-rendering:pixelated]"
    />
  )
}

export const ShaderHero = () => {
  return (
    <section
      className="relative -mt-[var(--zyro-header-h,5rem)] min-h-[92vh] md:min-h-screen w-full overflow-hidden flex flex-col justify-center items-center transition-colors duration-200 [--px-ink:#120159] dark:[--px-ink:#F4F4F0] [--px-shadow:#120159] dark:[--px-shadow:#3D3C3A]"
      style={{
        backgroundColor: 'var(--zyro-bg)',
        backgroundImage: 'repeating-conic-gradient(var(--zyro-bg) 0% 25%, var(--zyro-border) 0% 50%)',
        backgroundSize: '8px 8px',
      }}
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-[calc(var(--zyro-header-h,5rem)+3rem)] pb-12 sm:pb-16 flex flex-col items-center text-center">
        <m.div
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex justify-center"
          style={{ color: 'var(--px-ink)' }}
        >
          <PixelWordmark />
        </m.div>

        <m.h2
          {...fadeUp}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-5 md:mt-7 font-serif text-3xl sm:text-4xl md:text-5xl tracking-[-0.02em] leading-tight text-[var(--px-ink)]"
        >
          Think. Build. Scale to ∞.
          <m.span
            aria-hidden="true"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            className="ml-1 inline-block h-[0.8em] w-[0.42em] translate-y-[0.05em] bg-[var(--px-ink)] align-baseline"
          />
        </m.h2>

        <m.p
          {...fadeUp}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="mt-5 md:mt-6 max-w-2xl text-lg sm:text-xl leading-relaxed text-[var(--zyro-text-secondary)]"
        >
          An ecosystem of tools for those who build, learn, research, and work.
          Autonomous AI creation, modern school management, and verifiable credentials.
        </m.p>

        <m.div
          {...fadeUp}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto"
        >
          <Link to="/register?redirect=%2F" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto rounded-none px-8 py-7 text-sm font-mono font-semibold uppercase tracking-[0.06em] bg-[var(--zyro-sapphire)] text-white shadow-[4px_4px_0_var(--px-shadow)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--px-shadow)] hover:bg-[var(--zyro-sapphire)] transition-all duration-150"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <a href="#products" className="w-full sm:w-auto">
            <Button
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto rounded-none px-8 py-7 text-sm font-mono font-semibold uppercase tracking-[0.06em] border-2 border-[var(--px-ink)] bg-[var(--zyro-surface)] text-[var(--px-ink)] shadow-[4px_4px_0_var(--px-shadow)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--px-shadow)] hover:bg-[var(--zyro-surface)] hover:text-[var(--px-ink)] transition-all duration-150"
            >
              Explore Products
            </Button>
          </a>

          <Link to="/contact" className="w-full sm:w-auto">
            <Button
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto rounded-none px-5 py-7 font-mono text-sm uppercase tracking-[0.06em] underline underline-offset-4 decoration-[var(--zyro-sapphire)] decoration-2 hover:bg-transparent hover:text-[var(--px-ink)] text-[var(--zyro-text-muted)]"
            >
              Book a Demo
            </Button>
          </Link>
        </m.div>

        <m.div
          {...fadeUp}
          transition={{ delay: 0.65, duration: 0.6 }}
          className="mt-10 md:mt-14 pt-4 border-t-2 border-[var(--zyro-border)] w-full max-w-xl"
        >
          <p className="font-mono text-xs tracking-[0.28em] uppercase font-semibold text-[var(--zyro-text-muted)]">
            Build · Learn · Research · Work
          </p>
        </m.div>
      </div>

      {/* Bottom subtle edge divider */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'var(--zyro-border)', opacity: 0.5 }}
      />
    </section>
  )
}

export const CleanHero = ShaderHero
