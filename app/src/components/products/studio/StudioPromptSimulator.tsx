import React, { useState } from 'react';
import {
  Sparkles, Code, Play, Terminal, Eye,
  Copy, Check, ArrowRight, Layers, Laptop,
  Smartphone, RefreshCw, CheckCircle2, Shield
} from 'lucide-react';

interface Preset {
  id: string;
  title: string;
  prompt: string;
  codeSnippet: string;
  previewComponent: React.ReactNode;
}

const PRESETS: Preset[] = [
  {
    id: 'analytics',
    title: 'AI Analytics Dashboard',
    prompt: 'Build a high-performance dark-mode analytics dashboard with real-time MRR, token usage stats, and interactive retention chart',
    codeSnippet: `// Generated with ZYR0 Studio AI
import { Card, Metric, AreaChart } from '@/components/ui';

export default function AnalyticsDashboard() {
  return (
    <div className="p-6 bg-neutral-950 text-white rounded-2xl border border-white/10 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold font-mono">Real-Time Metrics</h2>
        <span className="px-2.5 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded-full font-mono">
          Live • 99.9% Uptime
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card title="Monthly Recurring" value="$48,290" change="+14.2%" />
        <Card title="Active GPU Nodes" value="128 / 130" change="Stable" />
        <Card title="Inference Latency" value="42 ms" change="-8 ms" />
      </div>
    </div>
  );
}`,
    previewComponent: (
      <div className="p-4 sm:p-6 bg-neutral-950 text-white rounded-2xl border border-white/10 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-bold font-mono">Telemetry Overview</span>
          </div>
          <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 rounded font-mono border border-emerald-500/30">
            Live Sync
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-neutral-900/80 rounded-xl border border-white/5">
            <div className="text-[11px] text-neutral-400">Total MRR</div>
            <div className="text-lg font-black text-white font-mono mt-1">$48,290</div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">↑ 14.2% this week</div>
          </div>
          <div className="p-3 bg-neutral-900/80 rounded-xl border border-white/5">
            <div className="text-[11px] text-neutral-400">Active Workspaces</div>
            <div className="text-lg font-black text-white font-mono mt-1">1,420</div>
            <div className="text-[10px] text-cyan-400 font-mono mt-0.5">↑ 89 new today</div>
          </div>
          <div className="p-3 bg-neutral-900/80 rounded-xl border border-white/5">
            <div className="text-[11px] text-neutral-400">Avg Latency</div>
            <div className="text-lg font-black text-white font-mono mt-1">42 ms</div>
            <div className="text-[10px] text-indigo-400 font-mono mt-0.5">Global Edge CDN</div>
          </div>
        </div>

        <div className="p-3 bg-neutral-900/50 rounded-xl border border-white/5">
          <div className="flex justify-between text-xs text-neutral-400 mb-2">
            <span>Weekly API Throughput</span>
            <span className="font-mono text-white">99.98% Success</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden flex gap-1">
            <div className="bg-cyan-400 h-full w-[70%]" />
            <div className="bg-emerald-400 h-full w-[25%]" />
            <div className="bg-indigo-400 h-full w-[5%]" />
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'saas-landing',
    title: 'SaaS Waitlist Hero',
    prompt: 'Generate an ultra-sleek high-converting SaaS landing hero with animated glowing gradient button and email capture form',
    codeSnippet: `// Generated with ZYR0 Studio AI
import { Sparkles, ArrowRight } from 'lucide-react';

export default function WaitlistHero() {
  return (
    <section className="text-center py-12 px-6 bg-black text-white rounded-2xl border border-white/10">
      <span className="px-3 py-1 text-xs bg-sky-500/20 text-sky-400 rounded-full border border-sky-500/30">
        ✨ Early Access Beta
      </span>
      <h1 className="text-3xl font-extrabold font-mono mt-4">
        Ship Applications at the Speed of Thought
      </h1>
      <div className="max-w-md mx-auto mt-6 flex gap-2">
        <input className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-2 text-sm flex-1" placeholder="you@company.com" />
        <button className="px-5 py-2 bg-sky-500 text-black font-bold rounded-xl text-sm">Join Waitlist</button>
      </div>
    </section>
  );
}`,
    previewComponent: (
      <div className="text-center p-6 sm:p-8 bg-black text-white rounded-2xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] bg-sky-500/20 text-sky-300 rounded-full border border-sky-500/30 font-mono">
          <Sparkles className="w-3 h-3 text-sky-400" /> Early Access Beta
        </span>
        <h3 className="text-xl sm:text-2xl font-black font-mono text-white mt-3">
          Ship Apps at the Speed of Thought
        </h3>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-2 mb-5 leading-relaxed">
          The next generation web builder powered by autonomous agents and instant React 19 compilation.
        </p>
        <div className="max-w-sm mx-auto flex gap-2">
          <input
            type="email"
            readOnly
            value="founder@stealth.ai"
            className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-neutral-300 font-mono"
          />
          <button
            type="button"
            className="px-4 py-2 bg-sky-400 text-black font-bold text-xs rounded-xl hover:bg-sky-300 flex-shrink-0 shadow-md"
          >
            Claim Access
          </button>
        </div>
      </div>
    )
  },
  {
    id: 'crypto',
    title: 'DeFi Swap Widget',
    prompt: 'Create a clean, responsive Web3 DeFi token exchange interface with slippage settings and instant wallet connect',
    codeSnippet: `// Generated with ZYR0 Studio AI
import { Wallet, ArrowDownUp } from 'lucide-react';

export default function TokenSwap() {
  return (
    <div className="max-w-md mx-auto p-5 bg-neutral-900 rounded-2xl border border-white/10 text-white">
      <div className="flex justify-between items-center mb-3">
        <span className="font-mono text-sm font-bold">Swap Tokens</span>
        <span className="text-xs text-neutral-400">0.5% Slippage</span>
      </div>
      <TokenRow token="ETH" amount="1.45" usd="$4,620.00" />
      <SwapButton />
      <TokenRow token="USDC" amount="4,620.00" usd="$4,620.00" />
    </div>
  );
}`,
    previewComponent: (
      <div className="max-w-sm mx-auto p-4 sm:p-5 bg-neutral-900 rounded-2xl border border-white/10 text-white space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-mono font-bold text-white">Instant Swap</span>
          <span className="text-neutral-400 font-mono">0.1% Fee</span>
        </div>

        <div className="p-3 bg-black/60 rounded-xl border border-white/5 flex justify-between items-center">
          <div>
            <div className="text-[10px] text-neutral-400">You Pay</div>
            <div className="text-base font-bold font-mono">1.50 ETH</div>
          </div>
          <span className="px-2 py-1 bg-white/10 rounded-lg text-xs font-mono font-semibold">ETH</span>
        </div>

        <div className="flex justify-center -my-1">
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sky-400 text-xs">
            ↓
          </div>
        </div>

        <div className="p-3 bg-black/60 rounded-xl border border-white/5 flex justify-between items-center">
          <div>
            <div className="text-[10px] text-neutral-400">You Receive</div>
            <div className="text-base font-bold font-mono text-emerald-400">4,815.00 USDC</div>
          </div>
          <span className="px-2 py-1 bg-white/10 rounded-lg text-xs font-mono font-semibold">USDC</span>
        </div>

        <button
          type="button"
          className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg"
        >
          Confirm Swap
        </button>
      </div>
    )
  }
];

export default function StudioPromptSimulator() {
  const [activePreset, setActivePreset] = useState<Preset>(PRESETS[0]);
  const [customPrompt, setCustomPrompt] = useState(PRESETS[0].prompt);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSelectPreset = (preset: Preset) => {
    setActivePreset(preset);
    setCustomPrompt(preset.prompt);
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activePreset.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl bg-neutral-900/80 border border-white/15 p-4 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/80">
      {/* Header & Preset Selector */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <Sparkles className="w-4 h-4" />
            <span>Interactive AI Generator Canvas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-neutral-950 p-1 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                  viewMode === 'preview'
                    ? 'bg-sky-500 text-black font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Live Preview
              </button>
              <button
                type="button"
                onClick={() => setViewMode('code')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                  viewMode === 'code'
                    ? 'bg-sky-500 text-black font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                React 19 Code
              </button>
            </div>
          </div>
        </div>

        {/* Preset Pills */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`text-xs px-3.5 py-1.5 rounded-xl border transition-all ${
                activePreset.id === preset.id
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-semibold shadow-sm'
                  : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white hover:bg-white/10'
              }`}
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input Bar */}
      <div className="mb-6 relative">
        <div className="flex items-center bg-black rounded-2xl border border-white/15 p-2 focus-within:border-sky-500/50 transition-all shadow-inner">
          <div className="pl-3 pr-2 text-neutral-500 font-mono text-xs">prompt&gt;</div>
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Describe any web app, dashboard, or component to generate..."
            className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none font-mono py-1.5"
          />
          <button
            type="button"
            onClick={() => {
              setIsGenerating(true);
              setTimeout(() => setIsGenerating(false), 700);
            }}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-sky-500/20 active:scale-95 flex-shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate</span>
          </button>
        </div>
      </div>

      {/* Canvas Area (Preview or Code) */}
      <div className="rounded-2xl bg-neutral-950 border border-white/10 overflow-hidden min-h-[340px] flex flex-col justify-center relative">
        {/* Generating Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
            <span className="text-xs font-mono text-sky-400">Synthesizing React Components...</span>
          </div>
        )}

        {viewMode === 'preview' ? (
          <div className="p-4 sm:p-8 flex items-center justify-center w-full">
            <div className="w-full max-w-2xl">{activePreset.previewComponent}</div>
          </div>
        ) : (
          <div className="p-4 sm:p-6 text-xs font-mono relative">
            <button
              type="button"
              onClick={handleCopyCode}
              className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 text-[11px] flex items-center gap-1 transition-all"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
            <pre className="text-neutral-300 overflow-x-auto leading-relaxed">
              <code>{activePreset.codeSnippet}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Bottom Footer Info */}
      <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-neutral-400 gap-2 px-1">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
          Full JSX/TSX Source Code Export Included
        </span>
        <span className="font-mono text-[11px] text-neutral-500">
          Powered by ZYR0 Studio Engine
        </span>
      </div>
    </div>
  );
}
