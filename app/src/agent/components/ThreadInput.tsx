'use client'

import * as React from 'react'
import { useRef, useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check, Zap, SendHorizontal } from 'lucide-react'
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

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------
interface Attachment {
  id: string
  file: File
  url: string
  name: string
  width?: number
  height?: number
}

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

  useEffect(() => {
    if (spanRef.current) {
      setWidth(spanRef.current.offsetWidth)
    }
  }, [text])

  return (
    <span
      className="relative inline-flex items-center justify-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
      style={{ width }}
    >
      <span ref={spanRef} className="invisible whitespace-nowrap px-1">
        {text}
      </span>
      <span
        key={text}
        className="absolute inset-0 flex items-center justify-center whitespace-nowrap animate-in fade-in zoom-in-95 duration-300"
      >
        {text}
      </span>
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

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2.5V11.5M2.5 7H11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 2.5L11.5 11.5M11.5 2.5L2.5 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
// Attachment Thumbnail
// ----------------------------------------------------------------------
function AttachmentThumb({
  attachment,
  index,
  onRemove,
}: {
  attachment: Attachment
  index: number
  onRemove: (id: string) => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: `${index * 35}ms`, animationFillMode: 'backwards' }}
      className={cn(
        'group relative size-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 outline-none',
        'transition-transform duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:scale-[1.04] active:scale-[0.96]',
        'animate-in fade-in slide-in-from-top-3 zoom-in-90 duration-400'
      )}
      aria-label={`Open preview of ${attachment.name}`}
    >
      <img src={attachment.url} alt={attachment.name} className="size-full object-cover" draggable={false} />
      <span className={cn('absolute inset-0 flex items-start justify-end bg-black/0 transition-colors duration-200', isHovered && 'bg-black/25')}>
        <span
          role="button"
          tabIndex={-1}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
          onClick={(e) => { e.stopPropagation(); onRemove(attachment.id) }}
          className={cn(
            'm-1 flex size-4 items-center justify-center rounded-full bg-white/90 text-black shadow-sm transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:bg-white hover:scale-110',
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'
          )}
          aria-label={`Remove ${attachment.name}`}
        >
          <CloseIcon />
        </span>
      </span>
    </button>
  )
}

// ----------------------------------------------------------------------
// Shared-Element Gallery Modal
// ----------------------------------------------------------------------
function AttachmentGalleryModal({
  attachment,
  originRect,
  onClose,
}: {
  attachment: Attachment
  originRect: DOMRect
  onClose: () => void
}) {
  const [phase, setPhase] = useState<'opening' | 'open' | 'closing'>('opening')
  const [targetRect, setTargetRect] = useState<{
    top: number; left: number; width: number; height: number; radius: number
  } | null>(null)

  useEffect(() => {
    const maxW = Math.min(window.innerWidth * 0.86, 560)
    const maxH = Math.min(window.innerHeight * 0.78, 720)
    const naturalW = attachment.width || 800
    const naturalH = attachment.height || 600
    const scale = Math.min(maxW / naturalW, maxH / naturalH, 1.6)
    const width = naturalW * scale
    const height = naturalH * scale
    setTargetRect({
      top: (window.innerHeight - height) / 2,
      left: (window.innerWidth - width) / 2,
      width, height, radius: 20,
    })
    const raf = requestAnimationFrame(() => setPhase('open'))
    return () => cancelAnimationFrame(raf)
  }, [attachment])

  const handleClose = useCallback(() => setPhase('closing'), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [handleClose])

  const isOpen = phase === 'open'
  const isClosing = phase === 'closing'
  const geometry = isOpen && targetRect
    ? targetRect
    : { top: originRect.top, left: originRect.left, width: originRect.width, height: originRect.height, radius: 12 }
  const animEasing = isClosing ? 'ease-out' : 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  const animDur = isClosing ? '0.3s' : '0.45s'
  const flipTransition = `top ${animDur} ${animEasing}, left ${animDur} ${animEasing}, width ${animDur} ${animEasing}, height ${animDur} ${animEasing}, border-radius ${animDur} ${animEasing}`

  return (
    <div className="fixed inset-0 z-[100]" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-400" style={{ opacity: isOpen ? 1 : 0 }} />
      <div
        style={{
          position: 'fixed',
          top: geometry.top, left: geometry.left, width: geometry.width, height: geometry.height,
          borderRadius: geometry.radius, transition: flipTransition, overflow: 'hidden',
          boxShadow: isOpen ? '0 24px 60px -12px rgb(0 0 0 / 0.35)' : '0 0px 0px 0px rgb(0 0 0 / 0)',
        }}
        className="bg-[#1a1a1e]"
        onTransitionEnd={() => { if (phase === 'closing') onClose() }}
        onClick={(e) => e.stopPropagation()}
      >
        <img src={attachment.url} alt={attachment.name} className="size-full object-cover" draggable={false} />
      </div>
      <button
        type="button" onClick={handleClose}
        style={{ opacity: isOpen ? 1 : 0, transform: isOpen ? 'scale(1)' : 'scale(0.7)' }}
        className={cn(
          'fixed right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white/10 text-white shadow-md backdrop-blur-sm',
          'transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:bg-white/20',
          !isOpen && 'pointer-events-none'
        )}
      >
        <span className="scale-150"><CloseIcon /></span>
      </button>
    </div>
  )
}

// ----------------------------------------------------------------------
// Main ThreadInput Component
// ----------------------------------------------------------------------
export interface ThreadInputProps {
  mode: 'chat' | 'research'
  onModeChange: (m: 'chat' | 'research') => void
  models: AgentModelInfo[]
  selectedModel: string | null
  onSelectModel: (id: string) => void
  depth: ResearchDepth
  onDepthChange: (d: ResearchDepth) => void
  onSend: (text: string) => void
  onStop: () => void
  running: boolean
  disabled?: boolean
  placeholder?: string
}

export function ThreadInput({
  mode,
  onModeChange,
  models,
  selectedModel,
  onSelectModel,
  depth,
  onDepthChange,
  onSend,
  onStop,
  running,
  disabled,
  placeholder,
}: ThreadInputProps) {
  const [expanded, setExpanded] = useState(false)
  const [isSmoothResize, setIsSmoothResize] = useState(false)
  const [localValue, setLocalValue] = useState('')
  const [effortIndex, setEffortIndex] = useState(() => DEPTH_ORDER.indexOf(depth))
  const [isModelSelectOpen, setIsModelSelectOpen] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [activeAttachment, setActiveAttachment] = useState<{ attachment: Attachment; rect: DOMRect } | null>(null)
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
  const hasValue = value.trim() !== '' || attachments.length > 0
  const hasAttachments = attachments.length > 0
  const maxAttachments = 6

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const internalContainerRef = useRef<HTMLDivElement>(null)
  const topFadeRef = useRef<HTMLDivElement>(null)
  const bottomFadeRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selected = models.find((m) => m.id === selectedModel) ?? models[0]
  const effortLabel = DEPTH_LABELS[DEPTH_ORDER[effortIndex]] ?? 'Standard'

  useEffect(() => { valueRef.current = value }, [value])

  // Sync effortIndex when depth prop changes externally
  useEffect(() => {
    const idx = DEPTH_ORDER.indexOf(depth)
    if (idx !== -1) setEffortIndex(idx)
  }, [depth])

  const updateFades = () => {
    const el = textareaRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    if (topFadeRef.current) {
      topFadeRef.current.style.opacity = Math.min(scrollTop / 20, 1).toString()
    }
    if (bottomFadeRef.current) {
      const bottomScroll = scrollHeight - clientHeight - scrollTop
      bottomFadeRef.current.style.opacity = Math.min(Math.max(bottomScroll - 16, 0) / 10, 1).toString()
    }
  }

  const handleValueChange = useCallback((val: string) => {
    setIsSmoothResize(true)
    setLocalValue(val)
  }, [])

  const expand = () => {
    setIsSmoothResize(false)
    setExpanded(true)
  }

  // --- Voice Recording ---
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
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      }
    } catch { /* mic denied */ }

    setIsRecording(true)

    function simulateText() {
      const fakeText = 'What are the latest advances in quantum computing?'
      const words = fakeText.split(' ')
      let i = 0
      let currentBase = valueRef.current
      demoTextIntervalRef.current = window.setInterval(() => {
        if (i < words.length) {
          currentBase = (currentBase ? currentBase + ' ' : '') + words[i]
          handleValueChange(currentBase)
          i++
        } else { stopRecording() }
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
        for (let i = 0; i < 5; i++) {
          let sum = 0
          for (let j = 0; j < step; j++) sum += dataArray[i * step + j]
          bands[i] = sum / step / 255
        }
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
          let interimTranscript = ''
          let finalTranscript = ''
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript
            else interimTranscript += event.results[i][0].transcript
          }
          if (finalTranscript) baseline += (baseline ? ' ' : '') + finalTranscript
          handleValueChange((baseline + (interimTranscript ? ' ' + interimTranscript : '')).trim())
        }
        recognition.onerror = () => stopRecording()
        recognition.onend = () => stopRecording()
        recognitionRef.current = recognition
        recognition.start()
      } else {
        simulateText()
      }
    } else {
      demoTextIntervalRef.current = window.setInterval(() => {
        setAudioData(Array.from({ length: 5 }, () => Math.random() * 0.8 + 0.1))
      }, 100)
      simulateText()
    }
  }, [handleValueChange, stopRecording])

  useEffect(() => {
    if (isRecording && textareaRef.current) textareaRef.current.scrollTop = textareaRef.current.scrollHeight
  }, [value, isRecording])

  useEffect(() => {
    return () => { stopRecording(); attachments.forEach((a) => URL.revokeObjectURL(a.url)) }
  }, [stopRecording, attachments])

  useEffect(() => {
    if ((value.trim() !== '' || hasAttachments) && !expanded) { setIsSmoothResize(false); setExpanded(true) }
  }, [value, expanded, hasAttachments])

  useEffect(() => {
    if (expanded && !isRecording) {
      const timer = setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          const length = textareaRef.current.value.length
          textareaRef.current.setSelectionRange(length, length)
        }
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [expanded, isRecording])

  useEffect(() => {
    if (!textareaRef.current) return
    const el = textareaRef.current
    const currentHeight = el.style.height
    el.style.transition = 'none'
    el.style.height = '0px'
    const scrollHeight = el.scrollHeight
    el.style.height = currentHeight
    void el.offsetHeight
    el.style.transition = ''
    const newHeight = Math.max(68, Math.min(scrollHeight, 160))
    el.style.height = `${newHeight}px`
    setTextareaHeight(newHeight)
    setIsScrolling(scrollHeight > 160)
    setTimeout(updateFades, 0)
  }, [value, expanded])

  useEffect(() => {
    setContainerHeight(Math.max(116, textareaHeight + 48))
    setTimeout(updateFades, 0)
  }, [textareaHeight])

  useEffect(() => {
    if (!isModelSelectOpen) return
    const handleOutsideClick = (e: MouseEvent) => {
      if (internalContainerRef.current && !internalContainerRef.current.contains(e.target as Node)) setIsModelSelectOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isModelSelectOpen])

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (internalContainerRef.current && internalContainerRef.current.contains(e.relatedTarget as Node)) return
    if (value.trim() === '' && !hasAttachments && !isRecording) {
      setIsSmoothResize(false)
      setExpanded(false)
      setIsModelSelectOpen(false)
    }
  }

  const handleSubmit = () => {
    if (value.trim() === '' && !hasAttachments) return
    setIsSmoothResize(false)
    onSend(value)
    handleValueChange('')
    attachments.forEach((a) => URL.revokeObjectURL(a.url))
    setAttachments([])
    setExpanded(false)
    setIsModelSelectOpen(false)
  }

  const cycleEffort = (e: React.MouseEvent) => {
    e.stopPropagation()
    const next = (effortIndex + 1) % DEPTH_ORDER.length
    setEffortIndex(next)
    onDepthChange(DEPTH_ORDER[next])
  }

  const openFileChooser = (e: React.MouseEvent) => {
    e.stopPropagation()
    fileInputRef.current?.click()
  }

  const handleFilesChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith('image/'))
    e.target.value = ''
    if (files.length === 0) return
    const room = Math.max(0, maxAttachments - attachments.length)
    const accepted = files.slice(0, room)
    if (!expanded) { setIsSmoothResize(false); setExpanded(true) } else { setIsSmoothResize(true) }
    for (const file of accepted) {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        const id = `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`
        setAttachments((prev) => [...prev, { id, file, url, name: file.name, width: img.naturalWidth, height: img.naturalHeight }])
      }
      img.onerror = () => {
        const id = `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`
        setAttachments((prev) => [...prev, { id, file, url, name: file.name, width: 800, height: 600 }])
      }
      img.src = url
    }
  }

  const removeAttachment = (id: string) => {
    setIsSmoothResize(true)
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter((a) => a.id !== id)
    })
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

  const defaultPlaceholder = running
    ? mode === 'research' ? 'Researching...' : 'Generating...'
    : mode === 'research' ? 'Research topic — e.g. "climate policy in Germany 2024"' : 'Ask anything — Shift+Enter for newlines'

  return (
    <>
      <div className="shrink-0 px-4 pt-2 pb-6">
        <div className="mx-auto max-w-3xl">
          {/* Outer Wrapper */}
          <div
            ref={(node) => {
              // @ts-ignore
              internalContainerRef.current = node
            }}
            onBlur={handleBlur}
            className="relative flex flex-col w-full"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChosen}
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
            />

            {/* Attachment Tab */}
            <div
              aria-hidden={!hasAttachments}
              style={{
                height: hasAttachments && expanded ? 68 : 0,
                transition: isSmoothResize ? 'height 0.15s ease-out' : 'height 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              }}
              className="w-full relative z-0 overflow-hidden"
            >
              <div
                style={{
                  position: 'absolute', bottom: -8, left: 20, right: 20, height: 68,
                  transform: hasAttachments && expanded ? 'translateY(0)' : 'translateY(100%)',
                  opacity: hasAttachments && expanded ? 1 : 0,
                  transition: isSmoothResize
                    ? 'transform 0.15s ease-out, opacity 0.15s ease-out'
                    : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease-out',
                }}
                className="border border-white/10 border-b-0 bg-[#1a1a1e] rounded-t-2xl px-2 pt-2 pb-1 flex items-start gap-2 overflow-x-auto"
              >
                {attachments.map((attachment, index) => (
                  <AttachmentThumb key={attachment.id} attachment={attachment} index={index} onRemove={removeAttachment} />
                ))}
              </div>
            </div>

            {/* Main Input Card */}
            <div
              onMouseDown={(e) => {
                const isTextarea = e.target === textareaRef.current
                if (expanded && !isTextarea && !isRecording) { e.preventDefault(); textareaRef.current?.focus() }
              }}
              style={{
                borderRadius: 24,
                height: expanded ? containerHeight : 48,
                transition: isSmoothResize ? SMOOTH_HEIGHT_TRANSITION : SPRING_TRANSITION,
                overflow: expanded ? 'visible' : 'hidden',
              }}
              className={cn(
                'relative w-full border border-white/10 bg-[#1a1a1e] shadow-lg shadow-black/20 focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10 hover:border-white/15 z-10',
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
                  if (e.key === 'Escape' && value.trim() === '' && !hasAttachments) { setIsSmoothResize(false); setExpanded(false); setIsModelSelectOpen(false) }
                }}
                placeholder={placeholder ?? defaultPlaceholder}
                aria-label="Prompt"
                disabled={isRecording}
                style={{
                  transition: isSmoothResize
                    ? 'height 0.15s ease-out'
                    : 'opacity 0.3s ease-out, transform 0.3s ease-out, height 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }}
                className={cn(
                  'absolute top-0 inset-x-0 z-[1] w-full resize-none bg-transparent pl-4 pr-12 py-3.5 text-sm leading-[22px] text-white outline-none placeholder:font-medium placeholder:text-[#5a5a5f] cursor-text',
                  expanded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-1 pointer-events-none',
                  isScrolling ? 'overflow-y-auto' : 'overflow-y-hidden',
                  isRecording && 'pointer-events-none'
                )}
              />

              <div ref={topFadeRef} className="absolute left-4 right-12 top-0 z-[2] h-8 bg-gradient-to-b from-[#1a1a1e] via-[#1a1a1e]/90 to-transparent pointer-events-none" />
              <div
                ref={bottomFadeRef}
                className="absolute left-4 right-12 z-[2] h-8 bg-gradient-to-t from-[#1a1a1e] via-[#1a1a1e]/90 to-transparent pointer-events-none"
                style={{
                  opacity: 0,
                  top: `${textareaHeight - 32}px`,
                  transition: isSmoothResize ? 'top 0.15s ease-out' : 'top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }}
              />

              <button
                type="button"
                onClick={expand}
                style={{ transition: isSmoothResize ? 'none' : 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                className={cn(
                  'absolute inset-x-0 top-0 z-[1] cursor-text pl-4 pr-12 py-[15px] text-left text-sm font-medium leading-[17px] text-[#5a5a5f] outline-none',
                  !expanded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-105 translate-y-1 pointer-events-none'
                )}
                aria-label="Open prompt input"
              >
                {placeholder ?? defaultPlaceholder}
              </button>

              {/* Bottom Actions */}
              <div
                className={cn(
                  'absolute bottom-2 left-3 right-12 z-[10] flex items-center gap-0 transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]',
                  expanded && !isRecording ? 'opacity-100 blur-0 translate-y-0 pointer-events-auto' : 'opacity-0 blur-sm translate-y-2 pointer-events-none'
                )}
              >
                {/* Model Selector */}
                <div className="relative">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => { e.stopPropagation(); setIsModelSelectOpen((prev) => !prev) }}
                    className={cn(
                      'group flex items-center gap-1 rounded-full px-2 py-1 text-white/50 transition-all duration-200 outline-none hover:bg-white/5 hover:text-white',
                      isModelSelectOpen ? 'bg-white/5 text-white' : ''
                    )}
                    aria-label={`Select model. Current: ${selected?.name}`}
                  >
                    <Zap className="size-3.5 text-emerald-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                    <span className="text-xs font-semibold select-none transition-colors">
                      <MorphingText text={selected?.name ?? 'Model'} />
                    </span>
                  </button>

                  {isModelSelectOpen && createPortal(
                    <>
                      <div className="fixed inset-0 z-[9998]" onClick={() => setIsModelSelectOpen(false)} />
                      <div
                        className="fixed z-[9999] w-[260px] max-h-[320px] max-w-[calc(100vw-32px)] overflow-y-auto bg-[#1a1a1e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 animate-in fade-in duration-150"
                        style={{
                          bottom: window.innerHeight - (internalContainerRef.current?.getBoundingClientRect().top ?? 0) + 8,
                          left: Math.min(
                            internalContainerRef.current?.getBoundingClientRect().left ?? 16,
                            window.innerWidth - 276
                          ),
                        }}
                      >
                        <div className="p-1.5">
                          <div className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#5a5a5f] sticky top-0 bg-[#1a1a1e]/95 backdrop-blur-xl z-10">
                            Select Model
                          </div>
                          {models.filter((m) => m.enabled).map((model) => (
                            <button
                              key={model.id}
                              onClick={(e) => { e.stopPropagation(); onSelectModel(model.id); setIsModelSelectOpen(false) }}
                              className={cn(
                                'w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-left transition-all duration-150',
                                selected?.id === model.id ? 'bg-white/10 text-white' : 'text-[#a0a0a5] hover:bg-white/5 hover:text-white'
                              )}
                            >
                              <Zap className="size-3.5 text-emerald-400 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm truncate">{model.name}</span>
                                  {model.tier === 'free' && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-emerald-500/20 text-emerald-300 shrink-0">Free</span>
                                  )}
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

                {/* Effort / Depth Cycling */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={cycleEffort}
                  className="group flex items-center gap-1 rounded-full px-2 py-1 text-white/50 transition-all duration-200 hover:bg-white/5 hover:text-white outline-none"
                >
                  <DynamicBarsIcon level={effortLabel} />
                  <span className="text-xs font-semibold select-none transition-colors">
                    <MorphingText text={effortLabel} />
                  </span>
                </button>

                {/* File Attachment */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={openFileChooser}
                  disabled={attachments.length >= maxAttachments}
                  className="ml-auto flex size-7 items-center justify-center rounded-full text-white/50 transition-all duration-200 hover:bg-white/5 hover:text-white outline-none disabled:opacity-40 disabled:pointer-events-none"
                >
                  <PlusIcon />
                </button>
              </div>

              {/* Audio Wave Visualizer */}
              <div
                className={cn(
                  'absolute right-12 bottom-2 z-[10] flex h-8 items-center justify-end gap-[3px] transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]',
                  isRecording ? 'w-16 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-4 pointer-events-none'
                )}
              >
                {audioData.map((val, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-[#1488fc] transition-[height] duration-75 ease-out"
                    style={{ height: `${Math.max(4, val * 24)}px` }}
                  />
                ))}
              </div>

              {/* Action Button */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                onClick={onActionButtonClick}
                aria-label={showArrow ? 'Send prompt' : showStop ? 'Stop recording' : 'Use voice input'}
                style={{ borderRadius: 9999 }}
                className="absolute right-2 bottom-2 z-[10] flex h-8 w-8 items-center justify-center bg-[#1488fc] text-white transition-all duration-300 hover:bg-[#1a94ff] outline-none focus-visible:ring-2 focus-visible:ring-white/30"
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

          {/* Mode Toggle */}
          <div className="flex justify-center mt-3">
            <div className="flex rounded-full border border-white/10 text-xs overflow-hidden">
              <button
                type="button"
                onClick={() => onModeChange('chat')}
                className={cn(
                  'px-4 py-2 transition-all duration-150',
                  mode === 'chat' ? 'bg-white/10 text-white' : 'text-[#6a6a6f] hover:text-white hover:bg-white/5'
                )}
              >
                Chat
              </button>
              <button
                type="button"
                onClick={() => onModeChange('research')}
                className={cn(
                  'px-4 py-2 transition-all duration-150',
                  mode === 'research' ? 'bg-white/10 text-white' : 'text-[#6a6a6f] hover:text-white hover:bg-white/5'
                )}
              >
                Research
              </button>
            </div>
          </div>

          <p className="mt-2 text-center text-[11px] text-[#5a5a5f]">
            Free-tier models are shared and rate-limited — the gateway falls back automatically when one is throttled.
          </p>
        </div>
      </div>

      {activeAttachment && (
        <AttachmentGalleryModal
          attachment={activeAttachment.attachment}
          originRect={activeAttachment.rect}
          onClose={() => setActiveAttachment(null)}
        />
      )}
    </>
  )
}
