import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { AgentChat } from '@/agent/components/AgentChat';
import { Composer } from '@/agent/components/Composer';
import { ModelPill } from '@/agent/components/ModelPill';
import { AgentSettingsModal } from '@/agent/components/AgentSettingsModal';
import { PipelineView } from '@/agent/components/PipelineView';
import { ReportView } from '@/agent/components/ReportView';
import { HistoryPanel } from '@/agent/components/HistoryPanel';
import { useAgentChat } from '@/agent/hooks/useAgentChat';
import { useAgentModels } from '@/agent/hooks/useAgentModels';
import { useResearchPipeline } from '@/agent/hooks/useResearchPipeline';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/agent.css';

const SYSTEM_PROMPT = `You are ZYR0's Research Agent: a precise, honest research assistant.
- Answer from first principles; when uncertain, say so and explain what is known.
- Keep answers well-structured with markdown when it helps clarity.
- Never fabricate sources or facts.`;

export default function ResearchAgentPage() {
  const { user } = useAuth();
  const { models, selected, setSelected, loading } = useAgentModels();
  const { messages, streaming, error, send, abort } = useAgentChat(selected);
  const pipeline = useResearchPipeline();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mode, setMode] = useState<'chat' | 'research'>('chat');

  useEffect(() => {
    if (mode === 'research') pipeline.loadHistory();
  }, [mode]);

  const handleSelect = (id: string) => setSelected(id === 'auto' ? null : id);

  return (
    <div className="agent-root flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card/60 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="agent-logo-ring flex size-8 items-center justify-center rounded-lg text-sm font-bold">
            Z
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight">Research Agent</h1>
            <p className="text-[11px] leading-tight text-muted-foreground">
              {user ? `Signed in — metered per user` : 'Sign in required'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-border bg-card p-0.5 text-xs">
            <button
              onClick={() => setMode('chat')}
              className={`rounded-full px-3 py-1 transition ${
                mode === 'chat' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setMode('research')}
              className={`rounded-full px-3 py-1 transition ${
                mode === 'research' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Research
            </button>
          </div>
          <ModelPill models={models} selectedId={selected} onSelect={handleSelect} disabled={loading} />
          <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
            Settings
          </Button>
        </div>
      </header>

      {mode === 'research' ? (
        <div className="flex min-h-0 flex-1">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              {pipeline.report ? (
                <ReportView report={pipeline.report} />
              ) : (
                <div className="flex-1">
                  <PipelineView
                    stage={pipeline.stage}
                    message={pipeline.message}
                    detail={pipeline.detail}
                    evidence={pipeline.evidence}
                    errors={pipeline.errors}
                    running={pipeline.running}
                    onRun={pipeline.run}
                    onStop={pipeline.abort}
                  />
                </div>
              )}
            </div>
            {pipeline.report && (
              <div className="border-t border-border bg-card/60 p-4">
                <div className="mx-auto flex max-w-3xl justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      pipeline.clear();
                    }}
                  >
                    New research
                  </Button>
                  <p className="text-[11px] text-muted-foreground">
                    Run persisted to your research history.
                  </p>
                </div>
              </div>
            )}
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
          <Composer streaming={streaming} onSend={(text) => send(text, SYSTEM_PROMPT)} onStop={abort} />
        </>
      )}

      <AgentSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} models={models} />
    </div>
  );
}