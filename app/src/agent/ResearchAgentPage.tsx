import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentHero } from '@/agent/components/AgentHero';
import { ResearchReasoning } from '@/agent/components/ResearchReasoning';
import { ThreadInput } from '@/agent/components/ThreadInput';
import { AgentSidebar } from '@/agent/components/AgentSidebar';
import { useAgentChat } from '@/agent/hooks/useAgentChat';
import { useAgentModels } from '@/agent/hooks/useAgentModels';
import { useResearchPipeline } from '@/agent/hooks/useResearchPipeline';
import type { ResearchDepth, ResearchReport } from '@/agent/research/types';
import { useAuth } from '@/contexts/AuthContext';
import supabase from '@/lib/supabase';
import '@/styles/agent.css';

const SYSTEM_PROMPT = `You are ZYR0's Research Agent: a precise, honest research assistant.
- Answer from first principles; when uncertain, say so and explain what is known.
- Keep answers well-structured with markdown when it helps clarity.
- Never fabricate sources or facts.`;

function buildFollowUpPrompt(report: ResearchReport): string {
  const sources = report.ledger
    .map((entry) => `[${entry.key}] ${entry.title} — ${entry.sourceName} — ${entry.url}`)
    .join('\n');
  return `${SYSTEM_PROMPT}

You have a completed deep-research report on "${report.topic}" (below). Answer follow-up questions using this report and its citation ledger first; cite claims with the same [n] keys. If a question goes beyond the report's scope, say so and answer from first principles.

--- REPORT ---
${report.markdown}

--- CITATION LEDGER ---
${sources}`;
}

interface HistoryItem {
  id: string;
  prompt: string;
  status: string;
  mode: string;
  created_at: string;
}

export default function ResearchAgentPage() {
  const { user } = useAuth();
  const { models, selected, setSelected, loading } = useAgentModels();
  const { messages, streaming, error, sessionId, send, abort, resetSession } = useAgentChat(selected);
  const pipeline = useResearchPipeline();
  const [depth, setDepth] = useState<ResearchDepth>('standard');
  const [chatSystem, setChatSystem] = useState(SYSTEM_PROMPT);
  const [mode, setMode] = useState<'chat' | 'research'>('chat');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const runActive =
    pipeline.stage !== 'idle' || pipeline.review !== null || pipeline.report !== null;
  const isEmpty = messages.length === 0 && !runActive;

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    const { data } = await supabase
      .from('agent_researches')
      .select('id, prompt, status, mode, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    setHistory((data ?? []) as HistoryItem[]);
    setHistoryLoading(false);
  }, []);

  useEffect(() => {
    if (historyOpen) void fetchHistory();
  }, [historyOpen, fetchHistory]);

  const handleFollowUp = (report: ResearchReport) => {
    setChatSystem(buildFollowUpPrompt(report));
    setMode('chat');
  };

  const handleResearchSend = (topic: string, runDepth: ResearchDepth = depth) => {
    setMode('research');
    void pipeline.run(topic, runDepth);
  };

  const handleRegenerate = (topic: string) => {
    setMode('research');
    void pipeline.run(topic);
  };

  const handleNewSession = () => {
    resetSession();
    pipeline.clear();
    setChatSystem(SYSTEM_PROMPT);
    setMode('chat');
    setHistoryOpen(false);
  };

  const handleSelectHistory = (id: string, itemMode: string) => {
    setHistoryOpen(false);
    if (itemMode === 'research') {
      setMode('research');
      void pipeline.loadReport(id);
    } else {
      setMode('chat');
      // For chat sessions, we'd need to load via useAgentChat.loadSession
      // but that's not exposed from the current hook
    }
  };

  const handleSend = (text: string) => {
    if (mode === 'research') {
      handleResearchSend(text);
    } else {
      send(text, chatSystem);
    }
  };

  return (
    <div className="agent-root flex h-screen overflow-hidden relative">
      {/* Sidebar */}
      <AgentSidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        onNewSession={handleNewSession}
        activeId={sessionId ?? undefined}
      />

      {/* History panel (overlay) */}
      <AnimatePresence>
      {historyOpen && (
        <>
          <motion.div
            className="agent-history-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setHistoryOpen(false)}
          />
          <motion.div
            className="agent-history-panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h2 className="text-sm font-medium text-white">Research History</h2>
              <button
                onClick={() => setHistoryOpen(false)}
                className="text-[#6a6a6f] hover:text-white transition-colors text-xs"
              >
                Close
              </button>
            </div>
            <div className="p-2">
              <button
                onClick={handleNewSession}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-emerald-400 hover:bg-white/5 transition-colors mb-2"
              >
                + New Session
              </button>
              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <div className="text-[#5a5a5f] text-xs">Loading...</div>
                </div>
              ) : history.length === 0 ? (
                <div className="flex justify-center py-8">
                  <div className="text-[#5a5a5f] text-xs">No history yet</div>
                </div>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectHistory(item.id, item.mode)}
                    className="w-full flex flex-col gap-1 px-3 py-2.5 rounded-lg text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="text-sm text-white truncate">{item.prompt}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        item.mode === 'research' ? 'bg-blue-500/20 text-blue-300' : 'bg-white/10 text-[#8a8a8f]'
                      }`}>
                        {item.mode}
                      </span>
                      <span className="text-[10px] text-[#5a5a5f]">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>

      {/* Error banner */}
      {error && (
        <div className="absolute top-0 left-0 right-0 z-40 mx-auto max-w-3xl mt-2">
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400 text-center">
            {error}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
      <AnimatePresence mode="wait">
      {isEmpty ? (
        <motion.div
          key="hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="flex-1"
        >
        <AgentHero
          models={models}
          selectedModel={selected}
          onSelectModel={(id) => setSelected(id === 'auto' ? null : id)}
          onSend={handleSend}
          onStop={abort}
          running={pipeline.running || streaming}
          depth={depth}
          onDepthChange={setDepth}
          onOpenHistory={() => setHistoryOpen(true)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />
        </motion.div>
      ) : (
        <motion.div
          key="thread"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex min-h-0 flex-1 flex-col bg-[#0f0f0f]"
        >
          {/* Active session header */}
          <div className="shrink-0 border-b border-white/5 px-4 py-3">
            <div className="mx-auto max-w-3xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSidebarOpen((v) => !v)}
                  className="flex items-center justify-center size-8 rounded-lg text-[#6a6a6f] hover:text-white hover:bg-white/5 transition-colors"
                >
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 3v18" />
                  </svg>
                </button>
                <button
                  onClick={handleNewSession}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#8a8a8f] hover:text-white hover:bg-white/5 border border-white/5 transition-all duration-200 active:scale-95"
                >
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span className="hidden sm:inline">New</span>
                </button>
                <button
                  onClick={() => setHistoryOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#8a8a8f] hover:text-white hover:bg-white/5 border border-white/5 transition-all duration-200 active:scale-95"
                >
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M12 7v5l4 2" />
                  </svg>
                  <span className="hidden sm:inline">History</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className={`size-1.5 rounded-full ${pipeline.running || streaming ? 'bg-emerald-400 animate-pulse' : 'bg-[#5a5a5f]'}`} />
                <span className="text-xs text-[#5a5a5f]">
                  {pipeline.running ? 'Researching...' : streaming ? 'Generating...' : 'Ready'}
                </span>
              </div>
            </div>
          </div>

          {/* Thread area */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="mx-auto max-w-3xl px-4 py-6 flex flex-col gap-4">
              {/* Messages */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`agent-fade-up flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#1488fc] text-white'
                        : 'bg-[#1e1e22] text-[#e5e5e5] ring-1 ring-white/[0.08]'
                    }`}
                  >
                    {msg.streaming && !msg.content && (
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-[#4da5fc] rounded-full agent-pulse-dot" />
                        <div className="w-2 h-2 bg-[#4da5fc] rounded-full agent-pulse-dot" />
                        <div className="w-2 h-2 bg-[#4da5fc] rounded-full agent-pulse-dot" />
                      </div>
                    )}
                    {msg.error ? (
                      <span className="text-red-400">{msg.error}</span>
                    ) : (
                      <span className="agent-whitespace-pre-wrap">{msg.content}</span>
                    )}
                    {msg.streaming && msg.content && (
                      <span className="inline-block w-0.5 h-4 bg-white/70 ml-0.5 animate-pulse" />
                    )}
                  </div>
                </div>
              ))}

              {/* Pipeline reasoning */}
              {runActive && (
                <div className="agent-fade-up">
                  <ResearchReasoning
                    stage={pipeline.stage}
                    message={pipeline.message}
                    detail={pipeline.detail}
                    contracts={pipeline.contracts}
                    evidence={pipeline.evidence}
                    ledger={pipeline.ledger}
                    errors={pipeline.errors}
                    running={pipeline.running}
                    className="bg-[#1e1e22] rounded-xl ring-1 ring-white/[0.08] p-3"
                  />
                </div>
              )}

              {/* Report */}
              {pipeline.report && (
                <div className="agent-fade-up bg-[#1e1e22] rounded-xl ring-1 ring-white/[0.08] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-emerald-400 font-medium">Report Complete</span>
                    <span className="text-xs text-[#5a5a5f]">
                      {pipeline.ledger.filter(l => l.verified).length} verified sources
                    </span>
                  </div>
                  <div
                    className="prose prose-invert prose-sm max-w-none agent-whitespace-pre-wrap text-[#c5c5c5] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: pipeline.report.markdown.replace(/\n/g, '<br/>') }}
                  />
                  <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                    <button
                      onClick={() => handleFollowUp(pipeline.report!)}
                      className="text-xs text-[#6a6a6f] hover:text-white transition-colors"
                    >
                      Follow up
                    </button>
                    <button
                      onClick={() => handleRegenerate(pipeline.report!.topic)}
                      className="text-xs text-[#6a6a6f] hover:text-white transition-colors"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom input */}
          <ThreadInput
            mode={mode}
            onModeChange={setMode}
            models={models}
            selectedModel={selected}
            onSelectModel={(id) => setSelected(id === 'auto' ? null : id)}
            depth={depth}
            onDepthChange={setDepth}
            onSend={handleSend}
            onStop={abort}
            running={pipeline.running || streaming}
          />
        </motion.div>
      )}
      </AnimatePresence>
      </div>
    </div>
  );
}
