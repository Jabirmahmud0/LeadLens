'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleDashed,
  Clock3,
  ExternalLink,
  FileSearch,
  Globe2,
  Layers3,
  Loader2,
  RotateCcw,
  Server,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  X,
  Zap,
} from 'lucide-react';

type StepStatus = 'queued' | 'processing' | 'completed' | 'skipped' | 'failed' | 'partial';
type JobStatus = StepStatus | 'cancelled';

interface JobStep {
  key: string;
  status: StepStatus;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  outputSummary: Record<string, unknown> | null;
}

interface SourceEvidence {
  id: string;
  url: string;
  title: string | null;
  statusCode: number | null;
  isPrimary: boolean | null;
  errorCode: string | null;
  errorMessage: string | null;
  fetchedAt: string | null;
}

interface JobProgress {
  id: string;
  status: JobStatus;
  progressPercent: number;
  currentStep: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isStalled: boolean;
  failureCode?: string | null;
  failureMessage?: string | null;
  prospect?: { companyName: string | null; websiteUrl: string; normalizedDomain: string } | null;
  sources: SourceEvidence[];
  steps: JobStep[];
}

const PIPELINE_STAGES = [
  { id: 'discover_pages', label: 'Discover pages', detail: 'Map the public buying journey', icon: Globe2 },
  { id: 'fetch_pages', label: 'Capture evidence', detail: 'Read and preserve useful content', icon: FileSearch },
  { id: 'technical_checks', label: 'Technical checks', detail: 'Review structure, metadata, and health', icon: ShieldCheck },
  { id: 'pagespeed', label: 'Performance', detail: 'Collect mobile and desktop signals', icon: Zap },
  { id: 'technology_detection', label: 'Technology stack', detail: 'Identify platforms and tooling', icon: Server },
  { id: 'ai_extraction', label: 'Business facts', detail: 'Extract source-backed company context', icon: Sparkles },
  { id: 'ai_classification', label: 'Opportunity analysis', detail: 'Classify issues and likely impact', icon: Activity },
  { id: 'ai_service_match', label: 'Service matching', detail: 'Connect findings to your capabilities', icon: Layers3 },
  { id: 'ai_fit_score', label: 'Fit scoring', detail: 'Prioritize the sales opportunity', icon: CheckCircle2 },
  { id: 'ai_outreach', label: 'Outreach draft', detail: 'Prepare a relevant first message', icon: ArrowRight },
  { id: 'ai_call_prep', label: 'Call preparation', detail: 'Build discovery questions', icon: Clock3 },
  { id: 'ai_proposal', label: 'Proposal direction', detail: 'Frame scope and next steps', icon: FileSearch },
  { id: 'ai_verify', label: 'Source verification', detail: 'Check claims against evidence', icon: ShieldCheck },
  { id: 'save_report', label: 'Create report', detail: 'Assemble the opportunity brief', icon: Check },
] as const;

const TERMINAL_STATUSES = new Set<JobStatus>(['completed', 'failed', 'partial', 'cancelled']);
const POLL_INTERVAL_MS = 3000;
const REQUEST_TIMEOUT_MS = 12000;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function hostFromUrl(url?: string | null) {
  if (!url) return 'Prospect website';
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

function formatDuration(start?: string | null, end?: string | null) {
  if (!start) return 'Not started';
  const milliseconds = Math.max(0, new Date(end || start).getTime() - new Date(start).getTime());
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return minutes ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function statusCopy(status: JobStatus, hasReport: boolean) {
  if (status === 'failed') return { eyebrow: 'Needs attention', title: 'The brief could not be completed', description: 'Your captured evidence is safe. Review the blocked stages below, then retry the analysis.' };
  if (status === 'cancelled') return { eyebrow: 'Analysis stopped', title: 'This analysis was cancelled', description: 'The evidence collected so far remains available. Start again whenever you are ready.' };
  if (hasReport) return { eyebrow: status === 'partial' ? 'Partial brief ready' : 'Analysis complete', title: 'Your opportunity brief is ready', description: status === 'partial' ? 'A report was created with limitations clearly marked.' : 'Every stage finished and the report is ready for review.' };
  return { eyebrow: 'Live investigation', title: 'Building a source-backed point of view', description: 'LeadLens is collecting evidence, connecting findings, and preparing your sales brief.' };
}

export default function AnalysisProcessingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<JobProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);

  const fetchProgress = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch(`/api/analyses/${params.id}`, { cache: 'no-store', signal });
    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      throw new Error(payload?.error || 'Unable to load this analysis.');
    }
    return response.json() as Promise<JobProgress>;
  }, [params.id]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;
    let controller: AbortController | undefined;

    const poll = async () => {
      controller = new AbortController();
      const requestTimeout = setTimeout(() => controller?.abort(), REQUEST_TIMEOUT_MS);
      try {
        const result = await fetchProgress(controller.signal);
        if (stopped) return;
        setData(result);
        setError(null);
        if (!TERMINAL_STATUSES.has(result.status)) timer = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (requestError) {
        if (stopped) return;
        setError(requestError instanceof DOMException && requestError.name === 'AbortError'
          ? 'The status request timed out. Check your connection and try again.'
          : requestError instanceof Error ? requestError.message : 'Unable to load this analysis.');
      } finally {
        clearTimeout(requestTimeout);
      }
    };

    void poll();
    return () => {
      stopped = true;
      controller?.abort();
      if (timer) clearTimeout(timer);
    };
  }, [fetchProgress]);

  const performAction = async (action: 'retry' | 'restart' | 'cancel') => {
    setIsActing(true);
    try {
      const response = await fetch(`/api/analyses/${params.id}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) throw new Error(payload?.error || `Unable to ${action} analysis.`);
      setData(await fetchProgress());
      setError(null);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : `Unable to ${action} analysis.`);
    } finally {
      setIsActing(false);
    }
  };

  const stageRows = useMemo(() => PIPELINE_STAGES.map((stage) => {
    const stored = data?.steps.find((step) => step.key === stage.id);
    const isCurrent = data?.currentStep === stage.id && (data.status === 'queued' || data.status === 'processing');
    const status: StepStatus = isCurrent ? 'processing' : stored?.status || 'queued';
    return { ...stage, status, stored };
  }), [data]);

  if (error && !data) {
    return <div className="grid min-h-[calc(100vh-2rem)] place-items-center bg-[#f6faf6] p-6">
      <div className="w-full max-w-lg rounded-[28px] border border-rose-200 bg-white p-8 text-center shadow-[0_24px_70px_rgba(34,74,53,0.09)]">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600"><AlertCircle className="size-5" /></span>
        <h1 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#153d2b]">We could not load this analysis</h1>
        <p className="mt-2 text-sm leading-6 text-[#637b6f]">{error}</p>
        <button type="button" onClick={() => window.location.reload()} className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#176b43] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#115636]"><RotateCcw className="size-4" /> Try again</button>
      </div>
    </div>;
  }

  if (!data) {
    return <div className="min-h-[calc(100vh-2rem)] bg-[#f6faf6] p-6 md:p-10">
      <div className="mx-auto max-w-7xl animate-pulse space-y-6">
        <div className="h-56 rounded-[30px] bg-[#e8f2eb]" />
        <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]"><div className="h-[520px] rounded-[26px] bg-white" /><div className="h-[420px] rounded-[26px] bg-white" /></div>
      </div>
    </div>;
  }

  const hasReport = data.status === 'completed' || data.status === 'partial';
  const copy = statusCopy(data.status, hasReport);
  const completedCount = data.steps.filter((step) => step.status === 'completed').length;
  const blockedSteps = data.steps.filter((step) => step.status === 'failed' || step.status === 'skipped');
  const successfulSources = data.sources.filter((source) => !source.errorCode);
  const failedSources = data.sources.filter((source) => source.errorCode);
  const discovery = asRecord(data.steps.find((step) => step.key === 'discover_pages')?.outputSummary);
  const discoveredUrls = Array.isArray(discovery?.urls) ? discovery.urls : [];
  const isActive = data.status === 'queued' || data.status === 'processing';
  const activeStage = stageRows.find((stage) => stage.status === 'processing');
  // A retried job may retain an old 100% value. While active, completed stages
  // are the honest source of progress and the bar never claims completion early.
  const progress = isActive
    ? Math.min(96, Math.round((completedCount / PIPELINE_STAGES.length) * 100))
    : Math.min(100, Math.max(0, data.progressPercent || 0));
  const isFailure = data.status === 'failed';

  return (
    <main className="min-h-full bg-[radial-gradient(circle_at_88%_5%,rgba(183,226,198,0.34),transparent_28%),linear-gradient(180deg,#f8fbf7_0%,#f3f8f4_100%)] px-4 py-5 text-[#153d2b] sm:px-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-[1380px] animate-in fade-in duration-500">
        <button type="button" onClick={() => router.push('/analyses')} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#607a6d] transition hover:text-[#176b43]"><ArrowLeft className="size-4" /> All analyses</button>

        <section className={`relative overflow-hidden rounded-[30px] border p-6 shadow-[0_22px_65px_rgba(34,74,53,0.08)] md:p-9 ${isFailure ? 'border-rose-200 bg-[#fffafa]' : 'border-[#cfe4d5] bg-white'}`}>
          <div className={`pointer-events-none absolute -right-16 -top-20 size-72 rounded-full blur-3xl ${isFailure ? 'bg-rose-100/70' : 'bg-emerald-100/80'}`} />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] ${isFailure ? 'bg-rose-100 text-rose-700' : hasReport ? 'bg-emerald-100 text-emerald-800' : 'bg-[#e8f6ed] text-[#176b43]'}`}>
                  {isFailure ? <TriangleAlert className="size-3.5" /> : hasReport ? <CheckCircle2 className="size-3.5" /> : <Loader2 className="size-3.5 animate-spin" />}{copy.eyebrow}
                </span>
                <span className="text-sm text-[#789084]">{data.prospect?.companyName || hostFromUrl(data.prospect?.websiteUrl)}</span>
              </div>
              <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-[1.05] tracking-[-0.045em] text-[#123b29] sm:text-4xl lg:text-5xl">{copy.title}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#607a6d] sm:text-base">{copy.description}</p>
            </div>

            <div className={`rounded-2xl border p-5 backdrop-blur-sm ${isActive ? 'border-emerald-200 bg-white shadow-[0_14px_38px_rgba(27,139,87,0.11)]' : 'border-[#dce9df] bg-[#f8fbf8]/90'}`} aria-live="polite">
              {isActive && <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex size-3">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex size-3 rounded-full border-2 border-white bg-emerald-500 shadow-[0_0_0_1px_#6ee7a4]" />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-700">Worker active</span>
                </div>
                <div className="flex h-5 items-end gap-0.5" aria-hidden="true">
                  {[8, 14, 10, 18, 12, 16, 7, 13].map((height, index) => <span key={index} className="w-1 animate-pulse rounded-full bg-emerald-500" style={{ height, animationDelay: `${index * 110}ms` }} />)}
                </div>
              </div>}

              {isActive && <div className="mb-4 rounded-xl border border-emerald-100 bg-[#f2fbf5] px-3.5 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#6e8b7c]">Working on now</p>
                <div className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-[#194b35]">
                  <Loader2 className="size-4 animate-spin text-emerald-600" />
                  {activeStage?.label || (data.status === 'queued' ? 'Waiting for the next worker' : 'Preparing the next stage')}
                  <span className="ml-0.5 inline-flex gap-0.5" aria-hidden="true"><i className="size-1 animate-bounce rounded-full bg-emerald-500 [animation-delay:-300ms]" /><i className="size-1 animate-bounce rounded-full bg-emerald-500 [animation-delay:-150ms]" /><i className="size-1 animate-bounce rounded-full bg-emerald-500" /></span>
                </div>
              </div>}

              <div className="flex items-center justify-between text-sm"><span className="font-semibold text-[#365647]">Pipeline progress</span><span className="font-mono font-semibold text-[#176b43]">{progress}%</span></div>
              <div className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-[#dfebe2]">
                <div className={`relative h-full overflow-hidden rounded-full transition-all duration-700 ${isFailure ? 'bg-rose-500' : 'bg-[#1b8b57]'}`} style={{ width: `${progress}%` }}>
                  {isActive && <span className="absolute inset-y-0 w-16 animate-[status-scan_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/55 to-transparent" />}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-[#789084]"><span>{completedCount} stages completed</span><span>{isActive ? 'Updates automatically' : formatDuration(data.startedAt, data.completedAt || data.updatedAt)}</span></div>
              {isActive && <style jsx>{`@keyframes status-scan { from { transform: translateX(-100%); } to { transform: translateX(360px); } }`}</style>}
            </div>
          </div>
        </section>

        {error && <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><AlertCircle className="mt-0.5 size-4 shrink-0" /><p className="flex-1">{error}</p><button type="button" onClick={() => setError(null)} aria-label="Dismiss error"><X className="size-4" /></button></div>}

        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: 'Pages discovered', value: discoveredUrls.length || data.sources.length, note: `${successfulSources.length} captured`, icon: Globe2 },
            { label: 'Pipeline stages', value: `${completedCount}/${PIPELINE_STAGES.length}`, note: blockedSteps.length ? `${blockedSteps.length} need review` : 'Moving normally', icon: Activity },
            { label: 'Evidence issues', value: failedSources.length, note: failedSources.length ? 'Shown as limitations' : 'No fetch failures', icon: ShieldCheck },
            { label: 'Elapsed time', value: formatDuration(data.startedAt, data.completedAt || data.updatedAt), note: data.status === 'processing' ? 'Still working' : 'Latest run', icon: Clock3 },
          ].map((metric) => <div key={metric.label} className="rounded-2xl border border-[#dce8df] bg-white p-4 shadow-[0_8px_28px_rgba(34,74,53,0.04)] sm:p-5"><div className="flex items-center gap-2 text-xs font-medium text-[#789084]"><metric.icon className="size-4 text-[#1b8b57]" />{metric.label}</div><div className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#153d2b] sm:text-3xl">{metric.value}</div><p className="mt-1 text-xs text-[#8ca096]">{metric.note}</p></div>)}
        </section>

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,.75fr)]">
          <section className="overflow-hidden rounded-[26px] border border-[#d9e7dd] bg-white shadow-[0_18px_55px_rgba(34,74,53,0.06)]">
            <div className="flex items-center justify-between border-b border-[#e5eee7] px-5 py-5 sm:px-7"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#1b8b57]">Investigation timeline</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">From website to sales brief</h2></div><span className="hidden rounded-full bg-[#f0f6f2] px-3 py-1.5 text-xs font-medium text-[#607a6d] sm:inline">{PIPELINE_STAGES.length} durable stages</span></div>
            <div className="grid md:grid-cols-2">
              {stageRows.map((stage, index) => {
                const Icon = stage.icon;
                const reason = stage.stored?.error || String(stage.stored?.outputSummary?.reason || '');
                const tone = stage.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : stage.status === 'processing' ? 'bg-[#176b43] text-white border-[#176b43]' : stage.status === 'failed' ? 'bg-rose-50 text-rose-700 border-rose-200' : stage.status === 'skipped' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-[#f7faf8] text-[#8ca096] border-[#dfe9e2]';
                return <div key={stage.id} className={`flex gap-4 border-[#e8efea] px-5 py-4 sm:px-7 ${index < stageRows.length - 2 ? 'border-b' : ''} ${index % 2 === 0 ? 'md:border-r' : ''}`}>
                  <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border ${tone}`}>{stage.status === 'completed' ? <Check className="size-4" /> : stage.status === 'processing' ? <Loader2 className="size-4 animate-spin" /> : stage.status === 'failed' ? <AlertCircle className="size-4" /> : stage.status === 'skipped' ? <CircleDashed className="size-4" /> : <Icon className="size-4" />}</span>
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold text-[#294c3d]">{stage.label}</h3><span className={`text-[10px] font-bold uppercase tracking-[0.1em] ${stage.status === 'failed' ? 'text-rose-600' : stage.status === 'skipped' ? 'text-amber-700' : stage.status === 'processing' ? 'text-[#1b8b57]' : 'text-[#91a399]'}`}>{stage.status}</span></div><p className="mt-1 text-xs leading-5 text-[#789084]">{reason || stage.detail}</p></div>
                </div>;
              })}
            </div>
          </section>

          <div className="space-y-6">
            {(data.status === 'failed' || data.status === 'partial' || data.isStalled) && <section className={`rounded-[26px] border p-6 shadow-[0_18px_55px_rgba(34,74,53,0.06)] ${data.isStalled ? 'border-amber-200 bg-[#fffdf5]' : 'border-rose-200 bg-[#fffafa]'}`}>
              <span className={`grid size-11 place-items-center rounded-2xl ${data.isStalled ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>{data.isStalled ? <Clock3 className="size-5" /> : <TriangleAlert className="size-5" />}</span>
              <p className={`mt-5 text-[11px] font-bold uppercase tracking-[0.15em] ${data.isStalled ? 'text-amber-700' : 'text-rose-700'}`}>{data.failureCode || (data.isStalled ? 'Worker timeout' : 'Recovery available')}</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#294c3d]">{data.isStalled ? 'The worker stopped responding' : data.status === 'partial' ? 'Finish the missing sections' : 'Your evidence can be reused'}</h2>
              <p className="mt-2 text-sm leading-6 text-[#607a6d]">{data.isStalled ? 'No progress was recorded for more than eight minutes. Return this job to the queue safely.' : data.failureMessage || 'Retry only the incomplete stages. Successful work will not be repeated.'}</p>
              {blockedSteps.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{blockedSteps.slice(0, 5).map((step) => <span key={step.key} className="rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-medium text-rose-700">{step.key.replaceAll('_', ' ')}</span>)}</div>}
              <button type="button" disabled={isActing} onClick={() => void performAction(data.isStalled ? 'restart' : 'retry')} className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#176b43] px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(23,107,67,0.2)] transition hover:-translate-y-0.5 hover:bg-[#115636] disabled:cursor-not-allowed disabled:opacity-60">{isActing ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}{isActing ? 'Preparing retry…' : data.isStalled ? 'Return to queue' : 'Retry incomplete stages'}</button>
            </section>}

            {hasReport && <button type="button" onClick={() => router.push(`/analyses/${data.id}/report`)} className="flex h-14 w-full items-center justify-between rounded-2xl bg-[#176b43] px-5 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,107,67,0.22)] transition hover:-translate-y-0.5 hover:bg-[#115636]">Open opportunity brief <ArrowRight className="size-4" /></button>}

            <section className="overflow-hidden rounded-[26px] border border-[#d9e7dd] bg-white shadow-[0_18px_55px_rgba(34,74,53,0.06)]">
              <div className="border-b border-[#e5eee7] px-6 py-5"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#1b8b57]">Evidence ledger</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">Pages reviewed</h2></div>
              <div className="max-h-[440px] divide-y divide-[#e8efea] overflow-y-auto">
                {data.sources.length ? data.sources.map((source) => <div key={source.id} className="flex items-start gap-3 px-5 py-4">
                  <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl ${source.errorCode ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{source.errorCode ? <TriangleAlert className="size-3.5" /> : <Check className="size-3.5" />}</span>
                  <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-sm font-semibold text-[#365647]">{source.title || hostFromUrl(source.url)}</p>{source.isPrimary && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-700">Primary</span>}</div><p className="mt-1 truncate text-xs text-[#8ca096]">{source.errorMessage || source.url}</p></div>
                  <a href={source.url} target="_blank" rel="noreferrer" aria-label={`Open ${source.url}`} className="text-[#8ca096] transition hover:text-[#176b43]"><ExternalLink className="size-4" /></a>
                </div>) : <div className="px-6 py-10 text-center"><Globe2 className="mx-auto size-6 text-[#9dafA5]" /><p className="mt-3 text-sm text-[#789084]">Evidence will appear as pages are captured.</p></div>}
              </div>
            </section>

            {(data.status === 'queued' || data.status === 'processing') && !data.isStalled && <button type="button" disabled={isActing} onClick={() => { if (window.confirm('Cancel this analysis?')) void performAction('cancel'); }} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#d4e2d8] bg-white text-xs font-semibold text-[#607a6d] transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"><X className="size-3.5" /> Cancel analysis</button>}
          </div>
        </div>
      </div>
    </main>
  );
}
