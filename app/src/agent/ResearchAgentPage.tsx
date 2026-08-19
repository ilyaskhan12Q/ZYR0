import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AgentChat } from '@/agent/components/AgentChat';
import { ComposerDock } from '@/agent/components/ComposerDock';
import { AgentSettingsModal } from '@/agent/components/AgentSettingsModal';
import { PipelineView } from '@/agent/components/PipelineView';
import { ReportView } from '@/agent/components/ReportView';
import { AgentSidebar } from '@/agent/components/AgentSidebar';
import { PlanReview } from '@/agent/components/PlanReview';
import { LandingView } from '@/agent/components/LandingView';
import { useAgentChat } from '@/agent/hooks/useAgentChat';
import { useAgentLibrary } from '@/agent/hooks/useAgentLibrary';
import { useAgentModels } from '@/agent/hooks/useAgentModels';
import { useResearchPipeline } from '@/agent/hooks/useResearchPipeline';
import type { ResearchDepth, ResearchReport } from '@/agent/research/types';
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
  const { messages, streaming, error, sessionId, send, abort, resetSession, loadSession } = useAgentChat(selected);
  const pipeline = useResearchPipeline();
  const library = useAgentLibrary();
  const { refetch: refetchLibrary } = library;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mode, setMode] = useState<'chat' | 'research'>('chat');
  const [chatSystem, setChatSystem] = useState(SYSTEM_PROMPT);
  const [prefill, setPrefill] = useState<{ topic: string; seq: number } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [depth, setDepth] = useState<ResearchDepth>('standard');
  const [runTopic, setRunTopic] = useState('');

  const runActive =
    pipeline.stage !== 'idle' || pipeline.review !== null || pipeline.report !== null;
  const runVisible = runActive || prefill !== null;
  const isEmpty = messages.length === 0 && !runActive;

  useEffect(() => {
    void refetchLibrary();
  }, [sessionId, pipeline.report?.researchId, refetchLibrary]);

  const handleSelect = (id: string) => setSelected(id === 'auto' ? null : id);

  const handleFollowUp = (report: ResearchReport) => {
    setChatSystem(buildFollowUpPrompt(report));
    setMode('chat');
  };

  const handleNewResearch = (topic = '') => {
    pipeline.clear();
    setMode('research');
    if (topic) {
      setPrefill({ topic, seq: Date.now() });
      setRunTopic(topic);
    }
  };

  const handleResearchSend = (topic: string, runDepth: ResearchDepth = depth) => {
    setMode('research');
    setPrefill(null);
    setRunTopic(topic);
    void pipeline.run(topic, runDepth);
  };

  const handleRegenerate = (topic: string) => {
    setMode('research');
    setRunTopic(topic);
    void pipeline.run(topic);
  };

  const handleNewSession = () => {
    resetSession();
    pipeline.clear();
    setChatSystem(SYSTEM_PROMPT);
    setPrefill(null);
    setRunTopic('');
    setMode('chat');
  };

  const handleSelectChat = (id: string) => {
    setChatSystem(SYSTEM_PROMPT);
    setMode('chat');
    void loadSession(id);
  };

  const handleSelectResearch = (id: string) => {
    setMode('research');
    void pipeline.loadReport(id);
  };

  return (
    <div className="agent-root flex h-screen flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1">
        <AgentSidebar
          chats={library.chats}
          research={library.research}
          activeId={mode === 'chat' ? (sessionId ?? undefined) : pipeline.report?.researchId}
          onNewSession={handleNewSession}
          onSelectChat={handleSelectChat}
          onSelectResearch={handleSelectResearch}
          onOpenSettings={() => setSettingsOpen(true)}
          userEmail={user?.email}
          mobileOpen={sidebarOpen}
          onToggleMobile={() => setSidebarOpen((v) => !v)}
        />

        <div className="flex min-h-0 flex-1 flex-col">
          {/* Unified thread */}
          <ScrollArea className="agent-thread min-h-0 flex-1">
            <div className="mx-auto flex min-h-full max-w-4xl flex-col px-4 py-6">
              {error && (
                <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </div>
              )}

              {isEmpty ? (
                <div className="flex flex-1 flex-col justify-center">
                  <LandingView
                    prefill={prefill}
                    running={pipeline.running}
                    onRun={handleResearchSend}
                    mode={mode}
                    onChatSend={(text) => send(text, chatSystem)}
                  />
                </div>
              ) : (
                <>
                  <AgentChat messages={messages} />

                  {runVisible && (
                    <div className="mt-6 flex flex-col gap-4">
                      {runTopic && (
                        <div className="flex justify-end">
                          <div className="agent-whitespace-pre-wrap max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground">
                            {runTopic}
                          </div>
                        </div>
                      )}

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
                          onRun={handleResearchSend}
                          onStop={pipeline.abort}
                        />
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>

          <ComposerDock
            mode={mode}
            onModeChange={setMode}
            chatStreaming={streaming}
            onChatSend={(text) => send(text, chatSystem)}
            onChatStop={abort}
            researchRunning={pipeline.running}
            onResearchSend={(topic) => handleResearchSend(topic)}
            onResearchStop={pipeline.abort}
            models={models}
            selectedModel={selected}
            onSelectModel={handleSelect}
            modelsLoading={loading}
            depth={depth}
            onDepthChange={setDepth}
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
            hideInput={isEmpty}
          />

          <AgentSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} models={models} />
        </div>
      </div>
    </div>
  );
}