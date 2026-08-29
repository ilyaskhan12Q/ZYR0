'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check, Zap, SendHorizontal, History } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AgentModelInfo } from '@/agent/core/types'
import type { ResearchDepth } from '@/agent/research/types'

// ----------------------------------------------------------------------
// Transition Physics
// ----------------------------------------------------------------------
const SPRING_TRANSITION =
  'max-width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), height 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
const SMOOTH_HEIGHT_TRANSITION =
  'max-width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), height 0.15s ease-out'

const DEPTH_LABELS: Record<ResearchDepth, string> = {
  quick: 'Quick',
  standard: 'Standard',
  deep: 'Deep',
}
const DEPTH_ORDER: ResearchDepth[] = ['quick', 'standard', 'deep']

// ----------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------
function MorphingText({ text }: { text: string }) {
  const [width, setWidth] = useState<number | 'auto'>('auto')
  const spanRef = useRef<HTMLSpanElement>(null)
  useEffect(() => { if (spanRef.current) setWidth(spanRef.current.offsetWidth) }, [text])
  return (
    <span className="relative inline-flex items-center justify-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]" style={{ width }}>
      <span ref={spanRef} className="invisible whitespace-nowrap px-1">{text}</span>
      <span key={text} className="absolute inset-0 flex items-center justify-center whitespace-nowrap animate-in fade-in zoom-in-95 duration-300">{text}</span>
    </span>
  )
}

function ArrowUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 12V2M7 2L2.5 6.5M7 2L11.5 6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MicIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="5" y="1" width="4" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.75 6.5V7a4.25 4.25 0 0 0 8.5 0v-.5M7 11.25V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" fill="currentColor" />
    </svg>
  )
}

function DynamicBarsIcon({ level }: { level: string }) {
  const isMediumOrHigh = level === 'Standard' || level === 'Deep'
  const isHigh = level === 'Deep'
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1.5" y="8" width="2.5" height="4.5" rx="1" fill="currentColor" className="transition-opacity duration-300" opacity={1} />
      <rect x="5.75" y="5" width="2.5" height="7.5" rx="1" fill="currentColor" className="transition-opacity duration-300" opacity={isMediumOrHigh ? 1 : 0.3} />
      <rect x="10" y="2" width="2.5" height="10.5" rx="1" fill="currentColor" className="transition-opacity duration-300" opacity={isHigh ? 1 : 0.3} />
    </svg>
  )
}

// ----------------------------------------------------------------------
// ChatInput Component
// ----------------------------------------------------------------------
function ChatInput({
  models,
  selectedModel,
  onSelectModel,
  onSend,
  onStop,
  running,
  depth,
  onDepthChange,
  placeholder = 'What would you like to research?',
}: {
  models: AgentModelInfo[]
  selectedModel: string | null
  onSelectModel: (id: string) => void
  onSend?: (message: string) => void
  onStop?: () => void
  running?: boolean
  depth: ResearchDepth
  onDepthChange: (d: ResearchDepth) => void
  placeholder?: string
}) {
  const [expanded, setExpanded] = useState(false)
  const [isSmoothResize, setIsSmoothResize] = useState(false)
  const [localValue, setLocalValue] = useState('')
  const [effortIndex, setEffortIndex] = useState(() => DEPTH_ORDER.indexOf(depth))
  const [isModelSelectOpen, setIsModelSelectOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioData, setAudioData] = useState<number[]>(new Array(5).fill(0))

  const valueRef = useRef(localValue)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const rafRef = useRef<number | null>(null)
  const recognitionRef = useRef<any>(null)
  const demoTextIntervalRef = useRef<number | null>(null)

  const [hoverStyle, setHoverStyle] = useState({ opacity: 0, transform: 'translateY(0px) scale(0.95)', transition: 'none' })
  const [containerHeight, setContainerHeight] = useState(116)
  const [textareaHeight, setTextareaHeight] = useState(68)
  const [isScrolling, setIsScrolling] = useState(false)

  const value = localValue
  const hasValue = value.trim() !== ''

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const internalContainerRef = useRef<HTMLDivElement>(null)
  const topFadeRef = useRef<HTMLDivElement>(null)
  const bottomFadeRef = useRef<HTMLDivElement>(null)

  const selected = models.find((m) => m.id === selectedModel) ?? models[0]
  const effortLabel = DEPTH_LABELS[DEPTH_ORDER[effortIndex]] ?? 'Standard'

  useEffect(() => { valueRef.current = value }, [value])
  useEffect(() => { const idx = DEPTH_ORDER.indexOf(depth); if (idx !== -1) setEffortIndex(idx) }, [depth])

  const updateFades = () => {
    const el = textareaRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    if (topFadeRef.current) topFadeRef.current.style.opacity = Math.min(scrollTop / 20, 1).toString()
    if (bottomFadeRef.current) {
      const bottomScroll = scrollHeight - clientHeight - scrollTop
      bottomFadeRef.current.style.opacity = Math.min(Math.max(bottomScroll - 16, 0) / 10, 1).toString()
    }
  }

  const handleValueChange = useCallback((val: string) => { setIsSmoothResize(true); setLocalValue(val) }, [])

  const expand = () => { setIsSmoothResize(false); setExpanded(true) }

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null }
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null }
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null }
    if (demoTextIntervalRef.current) { window.clearInterval(demoTextIntervalRef.current); demoTextIntervalRef.current = null }
    setIsRecording(false)
    setAudioData(new Array(5).fill(0))
  }, [])

  const startRecording = useCallback(async () => {
    setIsSmoothResize(false)
    setExpanded(true)
    let stream: MediaStream | null = null
    try {
      if (navigator.mediaDevices?.getUserMedia) stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch { /* mic denied */ }
    setIsRecording(true)
    function simulateText() {
      const fakeText = 'What are the latest advances in quantum computing?'
      const words = fakeText.split(' ')
      let i = 0
      let currentBase = valueRef.current
      demoTextIntervalRef.current = window.setInterval(() => {
        if (i < words.length) { currentBase = (currentBase ? currentBase + ' ' : '') + words[i]; handleValueChange(currentBase); i++ }
        else stopRecording()
      }, 300)
    }
    if (stream) {
      streamRef.current = stream
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      const audioCtx = new AudioCtx()
      audioContextRef.current = audioCtx
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 64
      const source = audioCtx.createMediaStreamSource(stream)
      source.connect(analyser)
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      const updateVisualizer = () => {
        analyser.getByteFrequencyData(dataArray)
        const bands = new Array(5).fill(0)
        const step = Math.floor(dataArray.length / 5)
        for (let i = 0; i < 5; i++) { let sum = 0; for (let j = 0; j < step; j++) sum += dataArray[i * step + j]; bands[i] = sum / step / 255 }
        setAudioData(bands)
        rafRef.current = requestAnimationFrame(updateVisualizer)
      }
      updateVisualizer()
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        let baseline = valueRef.current
        recognition.onresult = (event: any) => {
          let interim = '', final = ''
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) final += event.results[i][0].transcript
            else interim += event.results[i][0].transcript
          }
          if (final) baseline += (baseline ? ' ' : '') + final
          handleValueChange((baseline + (interim ? ' ' + interim : '')).trim())
        }
        recognition.onerror = () => stopRecording()
        recognition.onend = () => stopRecording()
        recognitionRef.current = recognition
        recognition.start()
      } else { simulateText() }
    } else {
      demoTextIntervalRef.current = window.setInterval(() => { setAudioData(Array.from({ length: 5 }, () => Math.random() * 0.8 + 0.1)) }, 100)
      simulateText()
    }
  }, [handleValueChange, stopRecording])

  useEffect(() => { if (isRecording && textareaRef.current) textareaRef.current.scrollTop = textareaRef.current.scrollHeight }, [value, isRecording])
  useEffect(() => { return () => stopRecording() }, [stopRecording])

  useEffect(() => { if (value.trim() !== '' && !expanded) { setIsSmoothResize(false); setExpanded(true) } }, [value, expanded])
  useEffect(() => {
    if (expanded && !isRecording) {
      const timer = setTimeout(() => { if (textareaRef.current) { textareaRef.current.focus(); const l = textareaRef.current.value.length; textareaRef.current.setSelectionRange(l, l) } }, 50)
      return () => clearTimeout(timer)
    }
  }, [expanded, isRecording])

  useEffect(() => {
    if (!textareaRef.current) return
    const el = textareaRef.current
    const cur = el.style.height; el.style.transition = 'none'; el.style.height = '0px'
    const sh = el.scrollHeight; el.style.height = cur; void el.offsetHeight; el.style.transition = ''
    const nh = Math.max(68, Math.min(sh, 160)); el.style.height = `${nh}px`
    setTextareaHeight(nh); setIsScrolling(sh > 160); setTimeout(updateFades, 0)
  }, [value, expanded])

  useEffect(() => { setContainerHeight(Math.max(116, textareaHeight + 48)); setTimeout(updateFades, 0) }, [textareaHeight])



  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (internalContainerRef.current && internalContainerRef.current.contains(e.relatedTarget as Node)) return
    if (value.trim() === '' && !isRecording) { setIsSmoothResize(false); setExpanded(false); setIsModelSelectOpen(false) }
  }

  const handleSubmit = () => {
    if (value.trim() === '') return
    setIsSmoothResize(false)
    onSend?.(value)
    handleValueChange('')
    setExpanded(false)
    setIsModelSelectOpen(false)
  }

  const cycleEffort = (e: React.MouseEvent) => {
    e.stopPropagation()
    const next = (effortIndex + 1) % DEPTH_ORDER.length
    setEffortIndex(next)
    onDepthChange(DEPTH_ORDER[next])
  }

  const showArrow = hasValue && !isRecording
  const showStop = isRecording
  const showMic = !hasValue && !isRecording

  const onActionButtonClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isRecording) stopRecording()
    else if (hasValue) handleSubmit()
    else startRecording()
  }

  return (
    <div className="relative w-full max-w-[680px] mx-auto">
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />

      <div
        ref={(node) => { // @ts-ignore
          internalContainerRef.current = node
        }}
        onBlur={handleBlur}
        className="relative"
      >
        {/* Main Input Card */}
        <div
          onMouseDown={(e) => { if (expanded && e.target !== textareaRef.current && !isRecording) { e.preventDefault(); textareaRef.current?.focus() } }}
          style={{
            borderRadius: 24,
            height: expanded ? containerHeight : 56,
            transition: isSmoothResize ? SMOOTH_HEIGHT_TRANSITION : SPRING_TRANSITION,
            overflow: expanded ? 'visible' : 'hidden',
          }}
          className={cn(
            'relative w-full border border-white/10 bg-[#1e1e22] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_2px_20px_rgba(0,0,0,0.4)] focus-within:border-white/20 z-10',
            expanded ? 'cursor-text' : 'cursor-default'
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => handleValueChange(e.target.value)}
            onScroll={updateFades}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
              if (e.key === 'Escape' && value.trim() === '') { setIsSmoothResize(false); setExpanded(false); setIsModelSelectOpen(false) }
            }}
            placeholder={placeholder}
            aria-label="Prompt"
            disabled={isRecording}
            style={{ transition: isSmoothResize ? 'height 0.15s ease-out' : 'opacity 0.3s ease-out, transform 0.3s ease-out, height 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
            className={cn(
              'absolute top-0 inset-x-0 z-[1] w-full resize-none bg-transparent pl-5 pr-12 py-4 text-[15px] leading-[22px] text-white outline-none placeholder:font-medium placeholder:text-[#5a5a5f] cursor-text',
              expanded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-1 pointer-events-none',
              isScrolling ? 'overflow-y-auto' : 'overflow-y-hidden',
              isRecording && 'pointer-events-none'
            )}
          />

          <div ref={topFadeRef} className="absolute left-5 right-12 top-0 z-[2] h-8 bg-gradient-to-b from-[#1e1e22] via-[#1e1e22]/90 to-transparent pointer-events-none" />
          <div
            ref={bottomFadeRef}
            className="absolute left-5 right-12 z-[2] h-8 bg-gradient-to-t from-[#1e1e22] via-[#1e1e22]/90 to-transparent pointer-events-none"
            style={{ opacity: 0, top: `${textareaHeight - 32}px`, transition: isSmoothResize ? 'top 0.15s ease-out' : 'top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
          />

          <button
            type="button"
            onClick={expand}
            style={{ transition: isSmoothResize ? 'none' : 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
            className={cn(
              'absolute inset-x-0 top-0 z-[1] cursor-text pl-5 pr-12 py-4 text-left text-[15px] font-medium leading-[22px] text-[#5a5a5f] outline-none',
              !expanded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-105 translate-y-1 pointer-events-none'
            )}
            aria-label="Open prompt input"
          >
            {placeholder}
          </button>

            {/* Bottom Actions */}
            <div
              className={cn(
                'absolute bottom-2 left-3 right-14 z-[10] flex items-center gap-0 transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]',
                expanded && !isRecording ? 'opacity-100 blur-0 translate-y-0 pointer-events-auto' : 'opacity-0 blur-sm translate-y-2 pointer-events-none'
              )}
            >
              {/* Model Selector */}
              <div className="relative">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => { e.stopPropagation(); setIsModelSelectOpen((prev) => !prev) }}
                  className={cn('group flex items-center gap-1 rounded-full px-2 py-1 text-white/50 transition-all duration-200 outline-none hover:bg-white/5 hover:text-white', isModelSelectOpen && 'bg-white/5 text-white')}
                  aria-label={`Select model. Current: ${selected?.name}`}
                >
                  <Zap className="size-3.5 text-emerald-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span className="text-xs font-semibold select-none"><MorphingText text={selected?.name ?? 'Model'} /></span>
                </button>

                {isModelSelectOpen && createPortal(
                  <>
                    <div className="fixed inset-0 z-[9998]" onClick={() => setIsModelSelectOpen(false)} />
                    <div
                      className="fixed z-[9999] w-[260px] max-h-[320px] max-w-[calc(100vw-32px)] overflow-y-auto bg-[#1a1a1e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 animate-in fade-in duration-150"
                      style={{
                        bottom: window.innerHeight - (internalContainerRef.current?.getBoundingClientRect().top ?? 0) + 8,
                        left: Math.min(internalContainerRef.current?.getBoundingClientRect().left ?? 16, window.innerWidth - 276),
                      }}
                    >
                      <div className="p-1.5">
                        <div className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#5a5a5f] sticky top-0 bg-[#1a1a1e]/95 backdrop-blur-xl z-10">Select Model</div>
                        {models.filter((m) => m.enabled).map((model) => (
                          <button key={model.id} onClick={(e) => { e.stopPropagation(); onSelectModel(model.id); setIsModelSelectOpen(false) }}
                            className={cn('w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-left transition-all duration-150', selected?.id === model.id ? 'bg-white/10 text-white' : 'text-[#a0a0a5] hover:bg-white/5 hover:text-white')}>
                            <Zap className="size-3.5 text-emerald-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm truncate">{model.name}</span>
                                {model.tier === 'free' && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-emerald-500/20 text-emerald-300 shrink-0">Free</span>}
                              </div>
                            </div>
                            {selected?.id === model.id && <Check className="size-3.5 text-emerald-400 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>,
                  document.body,
                )}
              </div>

              {/* Effort Cycling */}
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={cycleEffort}
                className="group flex items-center gap-1 rounded-full px-2 py-1 text-white/50 transition-all duration-200 hover:bg-white/5 hover:text-white outline-none">
                <DynamicBarsIcon level={effortLabel} />
                <span className="text-xs font-semibold select-none hidden sm:inline"><MorphingText text={effortLabel} /></span>
              </button>
            </div>

            {/* Audio Wave Visualizer */}
          <div className={cn('absolute right-14 bottom-2 z-[10] flex h-8 items-center justify-end gap-[3px] transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]', isRecording ? 'w-16 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-4 pointer-events-none')}>
            {audioData.map((val, i) => (
              <div key={i} className="w-1 rounded-full bg-[#1488fc] transition-[height] duration-75 ease-out" style={{ height: `${Math.max(4, val * 24)}px` }} />
            ))}
          </div>

            {/* Action Button */}
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
              onClick={onActionButtonClick}
              aria-label={showArrow ? 'Send prompt' : showStop ? 'Stop recording' : 'Use voice input'}
              style={{ borderRadius: 9999 }}
              className="absolute right-2 bottom-2 z-[10] flex h-8 w-8 items-center justify-center bg-[#1488fc] text-white transition-all duration-300 hover:bg-[#1a94ff] outline-none focus-visible:ring-2 focus-visible:ring-white/30 shadow-[0_0_20px_rgba(20,136,252,0.3)]"
            >
              <span className="relative flex h-full w-full items-center justify-center">
                <span className={cn('absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]', showArrow ? 'opacity-100 scale-100 rotate-0 blur-none' : 'opacity-0 scale-50 rotate-45 blur-[1px] pointer-events-none')}>
                  {running ? <StopIcon /> : <ArrowUpIcon />}
                </span>
                <span className={cn('absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]', showMic ? 'opacity-100 scale-100 rotate-0 blur-none' : 'opacity-0 scale-50 -rotate-45 blur-[1px] pointer-events-none')}>
                  <MicIcon />
                </span>
              </span>
            </button>
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// RayBackground
// ----------------------------------------------------------------------
function RayBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
      <div className="absolute inset-0 bg-[#0f0f0f]" />
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[4000px] h-[1800px] sm:w-[6000px]"
        style={{
          background: `radial-gradient(circle at center 800px, rgba(20, 136, 252, 0.8) 0%, rgba(20, 136, 252, 0.35) 14%, rgba(20, 136, 252, 0.18) 18%, rgba(20, 136, 252, 0.08) 22%, rgba(17, 17, 20, 0.2) 25%)`
        }}
      />
      <div
        className="absolute top-[175px] left-1/2 w-[1600px] h-[1600px] sm:top-1/2 sm:w-[3043px] sm:h-[2865px]"
        style={{ transform: 'translate(-50%) rotate(180deg)' }}
      >
        <div className="absolute w-full h-full rounded-full -mt-[13px]" style={{ background: 'radial-gradient(43.89% 25.74% at 50.02% 97.24%, #111114 0%, #0f0f0f 100%)', border: '16px solid white', transform: 'rotate(180deg)', zIndex: 5 }} />
        <div className="absolute w-full h-full rounded-full bg-[#0f0f0f] -mt-[11px]" style={{ border: '23px solid #b7d7f6', transform: 'rotate(180deg)', zIndex: 4 }} />
        <div className="absolute w-full h-full rounded-full bg-[#0f0f0f] -mt-[8px]" style={{ border: '23px solid #8fc1f2', transform: 'rotate(180deg)', zIndex: 3 }} />
        <div className="absolute w-full h-full rounded-full bg-[#0f0f0f] -mt-[4px]" style={{ border: '23px solid #64acf6', transform: 'rotate(180deg)', zIndex: 2 }} />
        <div className="absolute w-full h-full rounded-full bg-[#0f0f0f]" style={{ border: '20px solid #1172e2', boxShadow: '0 -15px 24.8px rgba(17, 114, 226, 0.6)', transform: 'rotate(180deg)', zIndex: 1 }} />
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// AgentHero
// ----------------------------------------------------------------------
interface AgentHeroProps {
  models: AgentModelInfo[]
  selectedModel: string | null
  onSelectModel: (id: string) => void
  onSend: (message: string) => void
  onStop?: () => void
  running?: boolean
  depth: ResearchDepth
  onDepthChange: (d: ResearchDepth) => void
  onOpenHistory?: () => void
  onToggleSidebar?: () => void
}

export function AgentHero({
  models,
  selectedModel,
  onSelectModel,
  onSend,
  onStop,
  running,
  depth,
  onDepthChange,
  onOpenHistory,
  onToggleSidebar,
}: AgentHeroProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden bg-[#0f0f0f]">
      <RayBackground />

      {onToggleSidebar && (
        <button
          onClick={onToggleSidebar}
          className="absolute top-5 left-5 z-30 flex items-center justify-center size-10 rounded-full text-[#8a8a8f] hover:text-white hover:bg-white/5 transition-all duration-200 active:scale-95"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18" />
          </svg>
        </button>
      )}

      {onOpenHistory && (
        <button
          onClick={onOpenHistory}
          className="absolute top-5 right-5 z-30 flex items-center gap-1.5 px-3 py-3 rounded-full text-xs font-medium text-[#8a8a8f] hover:text-white hover:bg-white/5 transition-all duration-200 active:scale-95"
        >
          <History className="size-4" />
          <span className="hidden sm:inline">History</span>
        </button>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center w-full px-4">
        <div className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-1">
            What will you{' '}
            <span className="bg-gradient-to-b from-[#4da5fc] via-[#4da5fc] to-white bg-clip-text text-transparent italic">
              research
            </span>
            ?
          </h1>
          <p className="text-base font-semibold sm:text-lg text-[#8a8a8f]">
            Explore any topic with deep research, verified sources, and structured reports.
          </p>
        </div>

        <div className="w-full max-w-[700px] mb-6 sm:mb-8 mt-2">
          <ChatInput
            placeholder="What would you like to research?"
            models={models}
            selectedModel={selectedModel}
            onSelectModel={onSelectModel}
            onSend={onSend}
            onStop={onStop}
            running={running}
            depth={depth}
            onDepthChange={onDepthChange}
          />
        </div>
      </div>
    </div>
  )
}
