import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { AgentChat } from '@/agent/components/AgentChat';
import { Composer } from '@/agent/components/Composer';
import { ModelPill } from '@/agent/components/ModelPill';
import { AgentSettingsModal } from '@/agent/components/AgentSettingsModal';
import { PipelineView } from '@/agent/components/PipelineView';
import { ReportView } from '@/agent/components/ReportView';
import { HistoryPanel } from '@/agent/components/HistoryPanel';
import { PlanReview } from '@/agent/components/PlanReview';
import { useAgentChat } from '@/agent/hooks/useAgentChat';
import { useAgentModels } from '@/agent/hooks/useAgentModels';
import { useResearchPipeline } from '@/agent/hooks/useResearchPipeline';
import type { ResearchReport } from '@/agent/research/types';
import { useAuth } from '@/contexts/AuthContext';
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

export default function ResearchAgentPage() {
  const { user } = useAuth();
  const { models, selected, setSelected, loading } = useAgentModels();
  const { messages, streaming, error, send, abort } = useAgentChat(selected);
  const pipeline = useResearchPipeline();
  const { loadHistory } = pipeline;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mode, setMode] = useState<'chat' | 'research'>('chat');
  const [chatSystem, setChatSystem] = useState(SYSTEM_PROMPT);
  const [prefill, setPrefill] = useState<{ topic: string; seq: number } | null>(null);

  useEffect(() => {
    if (mode === 'research') loadHistory();
  }, [mode, loadHistory]);

  const handleSelect = (id: string) => setSelected(id === 'auto' ? null : id);

  const handleFollowUp = (report: ResearchReport) => {
    setChatSystem(buildFollowUpPrompt(report));
    setMode('chat');
  };

  const handleNewResearch = (topic = '') => {
    pipeline.clear();
    setMode('research');
    if (topic) setPrefill({ topic, seq: Date.now() });
  };

  const handleRegenerate = (topic: string) => {
    setMode('research');
    void pipeline.run(topic);
  };

  return (
    <div className="agent-root flex h-screen flex-col overflow-hidden">
      {/* Top navigation bar */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
        <div className="flex h-full items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="agent-logo-ring flex size-7 items-center justify-center rounded text-[13px] font-bold">
              Z
            </div>
            <span className="agent-serif text-lg font-semibold tracking-tight">ZYROO</span>
          </div>
          <nav className="hidden h-full items-center gap-7 sm:flex">
            <button
              type="button"
              onClick={() => setMode('chat')}
              className={`flex h-full items-center border-b-2 text-sm transition ${
                mode === 'chat'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => setMode('research')}
              className={`flex h-full items-center border-b-2 text-sm transition ${
                mode === 'research'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Research
            </button>
          </nav>
          <div className="flex rounded-[2px] border border-border text-xs sm:hidden">
            <button
              type="button"
              onClick={() => setMode('chat')}
              className={`px-3 py-1.5 transition ${
                mode === 'chat' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => setMode('research')}
              className={`px-3 py-1.5 transition ${
                mode === 'research' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              Research
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {mode === 'chat' && (
            <ModelPill models={models} selectedId={selected} onSelect={handleSelect} disabled={loading} />
          )}
          <Button
            size="sm"
            className="rounded-[2px] bg-foreground text-background hover:bg-foreground/90"
            disabled={pipeline.running}
            onClick={() => handleNewResearch()}
          >
            New Research
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8 rounded-[2px]"
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
          >
            <Settings className="size-4" />
          </Button>
          <div
            title={user?.email ?? 'Signed in'}
            className="flex size-8 items-center justify-center rounded-full bg-[#4f46e5] text-xs font-semibold text-white"
          >
            {(user?.email ?? 'Z').charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {mode === 'research' ? (
        <div className="flex min-h-0 flex-1">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              {pipeline.report ? (
                <ReportView
                  report={pipeline.report}
                  errors={pipeline.errors}
                  onFollowUp={handleFollowUp}
                  onNewResearch={handleNewResearch}
                  onRegenerate={handleRegenerate}
                />
              ) : pipeline.review && pipeline.stage === 'review' ? (
                <PlanReview
                  contracts={pipeline.review.contracts}
                  provider={pipeline.review.provider}
                  error={pipeline.review.error}
                  skipReview={pipeline.skipReview}
                  running={pipeline.running}
                  onApprove={pipeline.approvePlan}
                  onUpdate={pipeline.updatePlan}
                  onRegenerate={() => void pipeline.regeneratePlan()}
                  onSkipReviewChange={pipeline.setSkipReviewPreference}
                  onCancel={pipeline.abort}
                />
              ) : (
                <div className="flex-1">
                  <PipelineView
                    stage={pipeline.stage}
                    message={pipeline.message}
                    detail={pipeline.detail}
                    evidence={pipeline.evidence}
                    ledger={pipeline.ledger}
                    errors={pipeline.errors}
                    workerProgress={pipeline.workerProgress}
                    running={pipeline.running}
                    prefill={prefill}
                    onRun={pipeline.run}
                    onStop={pipeline.abort}
                  />
                </div>
              )}
            </div>
          </div>
          <HistoryPanel
            items={pipeline.history}
            activeId={pipeline.report?.researchId}
            onSelect={(id) => pipeline.loadReport(id)}
          />
        </div>
      ) : (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1">
            <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-end px-4 py-6">
              {error && (
                <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </div>
              )}
              <AgentChat messages={messages} />
            </div>
          </ScrollArea>

          {/* Composer */}
          <Composer streaming={streaming} onSend={(text) => send(text, chatSystem)} onStop={abort} />
        </>
      )}

      <AgentSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} models={models} />
    </div>
  );
}