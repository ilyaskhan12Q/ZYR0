import { useCallback, useRef, useState } from 'react';
import supabase from '@/lib/supabase';
import { decompose } from '@/agent/research/planner';
import { runWorkers } from '@/agent/research/workers';
import { verifyAndBuildLedger, verifiedOnly } from '@/agent/research/verifier';
import { synthesizeReport } from '@/agent/research/editorial';
import type {
  CitationLedgerEntry,
  EvidenceItem,
  PipelineStage,
  PipelineStageUpdate,
  ResearchDepth,
  ResearchReport,
  SubTaskContract,
} from '@/agent/research/types';

export interface ResearchHistoryItem {
  id: string;
  prompt: string;
  status: string;
  created_at: string;
  report_md?: string | null;
}

export interface WorkerProgress {
  active: string[];
  counts: Record<string, number>;
}

export interface ReviewPlan {
  contracts: SubTaskContract[];
  provider: string;
  error?: string;
}

const SKIP_REVIEW_KEY = 'zyro-research-skip-review';

interface ReportPayload {
  contracts: SubTaskContract[];
  ledger: CitationLedgerEntry[];
  model: string;
  elapsedMs: number;
  evidenceCount: number;
}

function toReportData(report: ResearchReport): ReportPayload {
  return {
    contracts: report.contracts,
    ledger: report.ledger,
    model: report.model,
    elapsedMs: report.elapsedMs,
    evidenceCount: report.evidence.length,
  };
}

export function useResearchPipeline() {
  const [stage, setStage] = useState<PipelineStage>('idle');
  const [message, setMessage] = useState('');
  const [detail, setDetail] = useState<string | undefined>();
  const [contracts, setContracts] = useState<SubTaskContract[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [ledger, setLedger] = useState<CitationLedgerEntry[]>([]);
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [history, setHistory] = useState<ResearchHistoryItem[]>([]);
  const [review, setReview] = useState<ReviewPlan | null>(null);
  const [skipReview, setSkipReview] = useState<boolean>(() => {
    const stored = localStorage.getItem(SKIP_REVIEW_KEY);
    // Default to true (auto-approve) unless user explicitly set it to '0'.
    return stored === null || stored === '1';
  });
  const [running, setRunning] = useState(false);
  const [workerProgress, setWorkerProgress] = useState<WorkerProgress>({ active: [], counts: {} });
  const abortRef = useRef<AbortController | null>(null);
  const lastTopicRef = useRef('');
  const depthRef = useRef<ResearchDepth>('standard');

  const emit = useCallback((update: PipelineStageUpdate) => {
    setStage(update.stage);
    setMessage(update.message);
    setDetail(update.detail);
  }, []);

  const loadHistory = useCallback(async () => {
    const { data, error } = await supabase
      .from('agent_researches')
      .select('id, prompt, status, created_at, report_md')
      .eq('mode', 'research')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) return;
    setHistory((data ?? []) as ResearchHistoryItem[]);
  }, []);

  const loadReport = useCallback(async (id: string): Promise<ResearchReport | null> => {
    const { data, error } = await supabase
      .from('agent_researches')
      .select('id, prompt, report_md, report_data, created_at')
      .eq('id', id)
      .single();
    if (error || !data?.report_md) return null;

    const payload = (data.report_data ?? {}) as Partial<ReportPayload>;
    const loaded: ResearchReport = {
      topic: data.prompt,
      contracts: payload.contracts ?? [],
      evidence: [],
      ledger: payload.ledger ?? [],
      markdown: data.report_md,
      model: payload.model ?? '',
      elapsedMs: payload.elapsedMs ?? 0,
      created_at: data.created_at,
      researchId: data.id,
    };
    setReport(loaded);
    setContracts(loaded.contracts);
    setLedger(loaded.ledger);
    return loaded;
  }, []);

  const persist = useCallback(async (research: ResearchReport, status: 'completed' | 'failed'): Promise<boolean> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id) return false;

    const { data, error } = await supabase
      .from('agent_researches')
      .insert({
        user_id: user.id,
        prompt: research.topic,
        mode: 'research',
        depth: depthRef.current,
        status,
        report_md: research.markdown,
        report_data: toReportData(research),
      })
      .select('id')
      .single();
    if (error || !data) return false;

    const messageResult = await supabase.from('agent_messages').insert({
      user_id: user.id,
      research_id: data.id,
      role: 'user',
      content: research.topic,
      model: research.model,
    });
    if (messageResult.error) setErrors((prev) => [...prev, `history: ${messageResult.error.message}`]);
    research.researchId = data.id;
    return true;
  }, []);

  const continueFromReview = useCallback(
    async (topic: string, approved: SubTaskContract[], started: number, controller: AbortController) => {
      setReview(null);
      try {
        emit({
          stage: 'working',
          message: 'Gathering evidence',
          detail: `${approved.length} worker contracts dispatched`,
        });
        setWorkerProgress({ active: ['gateway'], counts: {} });
        const gathered = await runWorkers(
          approved,
          () => undefined,
          (item) => {
            setEvidence((prev) => [...prev, item]);
            setWorkerProgress((prev) => ({
              ...prev,
              counts: { ...prev.counts, [item.sourceName]: (prev.counts[item.sourceName] ?? 0) + 1 },
            }));
          },
          (note) => setErrors((prev) => [...prev, note]),
        );
        if (controller.signal.aborted) return;
        setWorkerProgress((prev) => ({ ...prev, active: [] }));
        if (gathered.errors.length > 0) setErrors((prev) => [...prev, ...gathered.errors]);

        emit({
          stage: 'verifying',
          message: 'Verifying sources',
          detail: `${gathered.items.length} candidates found`,
        });
        const { ledger: finalLedger, dropped } = await verifyAndBuildLedger(gathered.items);
        if (controller.signal.aborted) return;
        setLedger(finalLedger);
        if (dropped > 0) setErrors((prev) => [...prev, `verifier: dropped ${dropped} duplicate/dead links`]);

        emit({
          stage: 'writing',
          message: 'Writing the report',
          detail: `${verifiedOnly(finalLedger).length} verified sources · ${finalLedger.length - verifiedOnly(finalLedger).length} pending verification`,
        });
        let streamedMarkdown = '';
        const editorial = await synthesizeReport(topic, approved, verifiedOnly(finalLedger), (delta) => {
          streamedMarkdown += delta;
          // Stream partial markdown to the report state for live preview.
          setReport((prev) => prev ? { ...prev, markdown: streamedMarkdown } : null);
        });
        if (controller.signal.aborted) return;

        const research: ResearchReport = {
          topic,
          contracts: approved,
          evidence: gathered.items,
          ledger: finalLedger,
          markdown: editorial.markdown,
          model: editorial.model,
          elapsedMs: Math.round(performance.now() - started),
          created_at: new Date().toISOString(),
        };
        if (editorial.error) setErrors((prev) => [...prev, `editorial: ${editorial.error}`]);

        emit({ stage: 'done', message: 'Research complete' });
        setReport(research);
        const saved = await persist(research, 'completed');
        if (!saved) {
          setErrors((prev) => [...prev, 'history: could not save this run to your research history']);
        }
        await loadHistory();
      } catch (err) {
        const failure = err instanceof Error ? err.message : 'Research pipeline failed';
        setErrors((prev) => [...prev, failure]);
        emit({ stage: 'failed', message: 'Research failed', detail: failure });
      } finally {
        setRunning(false);
        abortRef.current = null;
      }
    },
    [emit, loadHistory, persist],
  );

  const run = useCallback(
    async (topic: string, depth: ResearchDepth = 'standard') => {
      const text = topic.trim();
      if (!text || running) return;

      const controller = new AbortController();
      abortRef.current = controller;
      lastTopicRef.current = text;
      depthRef.current = depth;
      setRunning(true);
      setReport(null);
      setContracts([]);
      setEvidence([]);
      setLedger([]);
      setErrors([]);
      setReview(null);
      setWorkerProgress({ active: [], counts: {} });

      const started = performance.now();

      try {
        emit({ stage: 'planning', message: 'Planning the research agenda' });
        const decomposed = await decompose(text);
        if (controller.signal.aborted) {
          setRunning(false);
          abortRef.current = null;
          return;
        }
        setContracts(decomposed.contracts);
        if (decomposed.error) setErrors((prev) => [...prev, `planner: ${decomposed.error}`]);

        if (skipReview) {
          await continueFromReview(text, decomposed.contracts, started, controller);
          return;
        }

        setReview({
          contracts: decomposed.contracts,
          provider: decomposed.provider,
          error: decomposed.error,
        });
        emit({
          stage: 'review',
          message: 'Review the research plan',
          detail: 'Approve to start gathering evidence, or edit the agenda first.',
        });
      } catch (err) {
        const failure = err instanceof Error ? err.message : 'Research pipeline failed';
        setErrors((prev) => [...prev, failure]);
        emit({ stage: 'failed', message: 'Research failed', detail: failure });
        setRunning(false);
        abortRef.current = null;
      }
    },
    [continueFromReview, emit, running, skipReview],
  );

  const approvePlan = useCallback(() => {
    if (!review || !running) return;
    void continueFromReview(
      lastTopicRef.current,
      review.contracts,
      performance.now(),
      abortRef.current ?? new AbortController(),
    );
  }, [continueFromReview, review, running]);

  const updatePlan = useCallback((updated: SubTaskContract[]) => {
    setReview((prev) => (prev ? { ...prev, contracts: updated } : prev));
    setContracts(updated);
  }, []);

  const regeneratePlan = useCallback(async () => {
    if (!running) return;
    const controller = abortRef.current;
    if (!controller) return;
    emit({ stage: 'planning', message: 'Regenerating the research plan' });
    const decomposed = await decompose(lastTopicRef.current);
    if (controller.signal.aborted) return;
    setContracts(decomposed.contracts);
    setReview({
      contracts: decomposed.contracts,
      provider: decomposed.provider,
      error: decomposed.error,
    });
    emit({
      stage: 'review',
      message: 'Review the research plan',
      detail: 'Regenerated — approve to start gathering evidence, or regenerate again.',
    });
  }, [emit, running]);

  const setSkipReviewPreference = useCallback((value: boolean) => {
    localStorage.setItem(SKIP_REVIEW_KEY, value ? '1' : '0');
    setSkipReview(value);
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setRunning(false);
    setReview(null);
    emit({ stage: 'failed', message: 'Research cancelled' });
  }, [emit]);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setRunning(false);
    setStage('idle');
    setMessage('');
    setDetail(undefined);
    setReport(null);
    setContracts([]);
    setEvidence([]);
    setLedger([]);
    setErrors([]);
    setReview(null);
    setWorkerProgress({ active: [], counts: {} });
  }, []);

  return {
    stage,
    message,
    detail,
    contracts,
    evidence,
    ledger,
    report,
    errors,
    history,
    review,
    skipReview,
    workerProgress,
    running,
    run,
    approvePlan,
    updatePlan,
    regeneratePlan,
    setSkipReviewPreference,
    abort,
    clear,
    loadHistory,
    loadReport,
  };
}