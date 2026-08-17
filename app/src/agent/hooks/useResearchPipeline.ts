import { useCallback, useRef, useState } from 'react';
import supabase from '@/lib/supabase';
import { decompose } from '@/agent/research/planner';
import { runWorkers } from '@/agent/research/workers';
import { verifyAndBuildLedger } from '@/agent/research/verifier';
import { synthesizeReport } from '@/agent/research/editorial';
import type {
  CitationLedgerEntry,
  EvidenceItem,
  PipelineStage,
  PipelineStageUpdate,
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
  const [running, setRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

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

  const persist = useCallback(async (research: ResearchReport, status: 'completed' | 'failed') => {
    const { data, error } = await supabase
      .from('agent_researches')
      .insert({
        prompt: research.topic,
        mode: 'research',
        depth: 'standard',
        status,
        report_md: research.markdown,
        report_data: toReportData(research),
      })
      .select('id')
      .single();
    if (error || !data) return;

    await supabase.from('agent_messages').insert({
      research_id: data.id,
      role: 'user',
      content: research.topic,
      model: research.model,
    });
    research.researchId = data.id;
  }, []);

  const run = useCallback(async (topic: string) => {
    const text = topic.trim();
    if (!text || running) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setReport(null);
    setContracts([]);
    setEvidence([]);
    setLedger([]);
    setErrors([]);

    const started = performance.now();
    let research: ResearchReport | null = null;

    try {
      emit({ stage: 'planning', message: 'Planning the research agenda' });
      const decomposed = await decompose(text);
      if (controller.signal.aborted) return;
      setContracts(decomposed.contracts);
      if (decomposed.error) setErrors((prev) => [...prev, `planner: ${decomposed.error}`]);

      emit({
        stage: 'working',
        message: 'Gathering evidence',
        detail: `${decomposed.contracts.length} worker contracts dispatched`,
      });
      const gathered = await runWorkers(
        decomposed.contracts,
        () => undefined,
        (item) => setEvidence((prev) => [...prev, item]),
      );
      if (controller.signal.aborted) return;
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
        detail: `${finalLedger.length} verified sources in the citation ledger`,
      });
      const editorial = await synthesizeReport(text, decomposed.contracts, finalLedger, () => undefined);
      if (controller.signal.aborted) return;

      research = {
        topic: text,
        contracts: decomposed.contracts,
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
      await persist(research, 'completed');
      await loadHistory();
    } catch (err) {
      const failure = err instanceof Error ? err.message : 'Research pipeline failed';
      setErrors((prev) => [...prev, failure]);
      if (research) {
        await persist(research, 'failed');
      }
      emit({ stage: 'failed', message: 'Research failed', detail: failure });
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  }, [emit, loadHistory, persist, running]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setRunning(false);
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
    running,
    run,
    abort,
    clear,
    loadHistory,
    loadReport,
  };
}