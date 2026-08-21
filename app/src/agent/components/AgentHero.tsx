'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Plus, Lightbulb, Paperclip, Image, FileCode,
  ChevronDown, Check, Sparkles, Zap, Brain, SendHorizontal, History
} from 'lucide-react'
import type { AgentModelInfo } from '@/agent/core/types'
import type { ResearchDepth } from '@/agent/research/types'

function ModelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  )
}

const DEPTHS: { id: ResearchDepth; label: string }[] = [
  { id: 'quick', label: 'Quick' },
  { id: 'standard', label: 'Standard' },
  { id: 'deep', label: 'Deep' },
]

function ModelSelector({
  models,
  selectedModel,
  onModelChange,
}: {
  models: AgentModelInfo[]
  selectedModel: string | null
  onModelChange: (id: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const selected = models.find(m => m.id === selectedModel) ?? models[0]

  const handleSelect = (model: AgentModelInfo) => {
    onModelChange(model.id)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 text-[#8a8a8f] hover:text-white hover:bg-white/5 active:scale-95"
      >
        <Zap className="size-4 text-emerald-400" />
        <span>{selected?.name ?? 'Model'}</span>
        <ChevronDown className={`size-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full left-0 mb-2 z-50 min-w-[220px] bg-[#1a1a1e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="p-1.5">
              <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#5a5a5f]">
                Select Model
              </div>
              {models.filter(m => m.enabled).map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleSelect(model)}
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-all duration-150 ${
                    selected?.id === model.id ? 'bg-white/10 text-white' : 'text-[#a0a0a5] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <Zap className="size-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{model.name}</span>
                      {model.tier === 'free' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-emerald-500/20 text-emerald-300">
                          Free
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#6a6a6f]">{model.provider}</span>
                  </div>
                  {selected?.id === model.id && <Check className="size-4 text-emerald-400 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ChatInput({
  onSend,
  onStop,
  running,
  depth,
  onDepthChange,
  placeholder = "What would you like to research?"
}: {
  onSend?: (message: string) => void
  onStop?: () => void
  running?: boolean
  depth?: ResearchDepth
  onDepthChange?: (d: ResearchDepth) => void
  placeholder?: string
}) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [message])

  const handleSubmit = () => {
    if (running) {
      onStop?.()
      return
    }
    if (message.trim()) {
      onSend?.(message)
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="relative w-full max-w-[680px] mx-auto">
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
      <div className="relative rounded-2xl bg-[#1e1e22] ring-1 ring-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_2px_20px_rgba(0,0,0,0.4)]">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full resize-none bg-transparent text-[15px] text-white placeholder-[#5a5a5f] px-5 pt-5 pb-3 focus:outline-none min-h-[80px] max-h-[200px]"
            style={{ height: '80px' }}
          />
        </div>

        <div className="flex items-center justify-between px-3 pb-3 pt-1">
          <div className="flex items-center gap-1">
            {onDepthChange && (
              <div className="flex items-center rounded-full text-xs">
                {DEPTHS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => onDepthChange(d.id)}
                    className={`px-2.5 py-1.5 rounded-full transition-all duration-150 ${
                      depth === d.id
                        ? 'bg-white/10 text-white'
                        : 'text-[#6a6a6f] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmit}
              disabled={!running && !message.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-[#1488fc] hover:bg-[#1a94ff] text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-[0_0_20px_rgba(20,136,252,0.3)]"
            >
              {running ? (
                <>
                  <span className="hidden sm:inline">Stop</span>
                  <div className="size-2 rounded-full bg-white animate-pulse" />
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Research</span>
                  <SendHorizontal className="size-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

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
}: AgentHeroProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden bg-[#0f0f0f]">
      <RayBackground />

      {onOpenHistory && (
        <button
          onClick={onOpenHistory}
          className="absolute top-5 right-5 z-30 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-[#8a8a8f] hover:text-white hover:bg-white/5 transition-all duration-200 active:scale-95"
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
            onSend={onSend}
            onStop={onStop}
            running={running}
            depth={depth}
            onDepthChange={onDepthChange}
          />
        </div>

        <div className="flex items-center gap-4 justify-center">
          <ModelSelector
            models={models}
            selectedModel={selectedModel}
            onModelChange={onSelectModel}
          />
        </div>
      </div>
    </div>
  )
}
