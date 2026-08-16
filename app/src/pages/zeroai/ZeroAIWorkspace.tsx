import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import '@/styles/zeroai.css';
import { SEO } from '@/components/SEO';
import { ZeroAiHeader } from '@/components/zeroai/ZeroAiHeader';
import { ZeroAiSidebar } from '@/components/zeroai/ZeroAiSidebar';
import { HeroInput, type ComposerSources } from '@/components/zeroai/HeroInput';
import { TelemetryStage } from '@/components/zeroai/TelemetryStage';
import { ReportCanvas } from '@/components/zeroai/ReportCanvas';
import { ByokSettingsModal } from '@/components/zeroai/ByokSettingsModal';
import { JsonInspectDialog } from '@/components/zeroai/JsonInspectDialog';
import { useZeroAiKeys } from '@/hooks/useZeroAiKeys';
import { useZeroAiHistory, titleFromPrompt } from '@/hooks/useZeroAiHistory';
import { REPORT_FIXTURE, type Depth, type ResearchReport } from '@/data/zeroAiFixtures';
import type { DecompositionResult } from '@/data/zeroAiTypes';
import { decompose } from '@/lib/zeroai/planner';

type Phase = 'idle' | 'planning' | 'processing' | 'completed';

export default function ZeroAIWorkspace() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [depth, setDepth] = useState<Depth>('STANDARD');
  const [sources, setSources] = useState<ComposerSources>({ academic: true, industry: true });
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [decomposition, setDecomposition] = useState<DecompositionResult | null>(null);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);
  const [keysOpen, setKeysOpen] = useState(false);
  const [jsonOpen, setJsonOpen] = useState(false);

  const { items, addItem, updateStatus, removeItem, clearAll } = useZeroAiHistory();
  const { keys, setProviderKey, clearAll: clearKeys, hasAny, configuredCount, masked } = useZeroAiKeys();

  const scrollRef = useRef<HTMLDivElement>(null);
  const runIdRef = useRef(0);
  const [lastPrompt, setLastPrompt] = useState('');

  const startResearch = useCallback(
    (prompt: string) => {
      const runId = ++runIdRef.current;
      setLastPrompt(prompt);
      setReport(null);
      setDecomposition(null);
      setPhase('planning');
      const item = addItem({
        id: `h-${Date.now()}`,
        title: titleFromPrompt(prompt),
        depth,
        status: 'running',
      });
      setActiveHistoryId(item.id);
      void decompose(prompt, keys).then((result) => {
        if (runIdRef.current !== runId) return;
        setDecomposition(result);
        if (result.provider === 'fallback') {
          toast.info(result.error ? `Fallback planner used: ${result.error}` : 'Fallback planner used (LLM unavailable)');
        }
        setPhase('processing');
      });
    },
    [addItem, depth, keys]
  );

  const handleComplete = useCallback(
    (result: ResearchReport) => {
      setReport(result);
      setPhase('completed');
      if (activeHistoryId) {
        updateStatus(activeHistoryId, { status: 'completed' });
      }
    },
    [activeHistoryId, updateStatus]
  );

  const newResearch = useCallback(() => {
    runIdRef.current++;
    setPhase('idle');
    setReport(null);
    setDecomposition(null);
    setActiveHistoryId(null);
  }, []);

  const selectHistory = useCallback(
    (itemId: string) => {
      setMobileHistoryOpen(false);
      if (itemId === activeHistoryId) return;
      const item = items.find((i) => i.id === itemId);
      if (!item) return;
      // Phase 1 mock: every history row restores the fixture report, keyed to the row.
      setReport({ ...REPORT_FIXTURE, id: `ZYR0-AI-2026-${itemId.slice(-4)}`, prompt: item.title });
      setActiveHistoryId(itemId);
      setPhase('completed');
    },
    [activeHistoryId, items]
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [phase, report]);

  return (
    <div className="zeroai-root flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <SEO
        title="0-AI — Deep Research Workspace"
        description="0-AI deep research workspace: plan, search, verify and synthesize sources into citation-grade reports."
        path="/0-ai"
        noIndex
      />

      <ZeroAiHeader
        depth={depth}
        onDepthChange={setDepth}
        hasAnyKeys={Boolean(hasAny)}
        configuredCount={configuredCount}
        onOpenKeys={() => setKeysOpen(true)}
        onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
        onOpenMobileHistory={() => setMobileHistoryOpen(true)}
      />

      <div className="flex min-h-0 flex-1">
        <ZeroAiSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
          mobileOpen={mobileHistoryOpen}
          onMobileOpenChange={setMobileHistoryOpen}
          items={items}
          activeId={activeHistoryId}
          onSelect={(item) => selectHistory(item.id)}
          onNewResearch={newResearch}
          onRemove={removeItem}
          onClearAll={clearAll}
          onOpenKeys={() => setKeysOpen(true)}
          hasAnyKeys={Boolean(hasAny)}
        />

        {/* Main chat column */}
        <main className="relative flex min-h-0 flex-1 flex-col" aria-live="polite">
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
            {phase === 'idle' && (
              <HeroInput
                depth={depth}
                onDepthChange={setDepth}
                sources={sources}
                onSourceToggle={(key) => setSources((prev) => ({ ...prev, [key]: !prev[key] }))}
                onStart={startResearch}
              />
            )}
            {phase === 'planning' && (
              <div className="flex flex-col gap-6 px-4 py-6">
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md border border-primary/25 bg-primary/10 px-4 py-2.5 text-sm leading-relaxed text-foreground">
                    {lastPrompt}
                  </div>
                </div>
                <div className="max-w-3xl">
                  <div className="rounded-2xl border bg-card p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="za-pulse-dot size-1.5 rounded-full bg-muted-foreground" />
                        <span className="za-pulse-dot size-1.5 rounded-full bg-muted-foreground" />
                        <span className="za-pulse-dot size-1.5 rounded-full bg-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Decomposing topic into research dimensions…</span>
                    </div>
                    <p className="za-mono mt-3 text-[11px] text-muted-foreground">
                      Planner Agent · running with your BYOK key · max 15s
                    </p>
                  </div>
                </div>
              </div>
            )}
            {phase === 'processing' && (
              <TelemetryStage
                prompt={lastPrompt}
                depth={depth}
                decomposition={decomposition}
                onComplete={handleComplete}
              />
            )}
            {phase === 'completed' && report && (
              <ReportCanvas
                report={report}
                onJsonInspect={() => setJsonOpen(true)}
                onNewResearch={newResearch}
              />
            )}
          </div>
        </main>
      </div>

      <ByokSettingsModal
        open={keysOpen}
        onOpenChange={setKeysOpen}
        keys={keys}
        masked={masked}
        onSave={setProviderKey}
        onClearAll={clearKeys}
      />
      {report && <JsonInspectDialog report={report} open={jsonOpen} onOpenChange={setJsonOpen} />}
    </div>
  );
}