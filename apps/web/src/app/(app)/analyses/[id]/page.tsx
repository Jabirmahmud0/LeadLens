'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  AlertCircle,
  Globe,
  FileText,
  Search,
  Zap,
  Server,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

type StepStatus = 'queued' | 'processing' | 'completed' | 'skipped' | 'failed' | 'partial';

interface JobStep {
  key: string;
  status: StepStatus;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  outputSummary: any;
}

interface JobProgress {
  id: string;
  status: StepStatus;
  progressPercent: number;
  currentStep: string | null;
  startedAt: string | null;
  completedAt: string | null;
  failureCode?: string | null;
  failureMessage?: string | null;
  steps: JobStep[];
  error?: string;
}

const UI_STAGES = [
  { id: 'discover_pages', label: 'Discovering Pages', icon: Globe },
  { id: 'fetch_pages', label: 'Reading Content', icon: FileText },
  { id: 'technical_checks', label: 'Running Technical Checks', icon: ShieldCheck },
  { id: 'pagespeed', label: 'Analyzing Performance', icon: Zap },
  { id: 'technology_detection', label: 'Detecting Stack', icon: Server },
  { id: 'save_report', label: 'Finalizing Report', icon: CheckCircle2 },
];

export default function AnalysisProcessingPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<JobProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/analyses/${params.id}`);
        if (!res.ok) {
          throw new Error(await res.text());
        }
        const json: JobProgress = await res.json();
        setData(json);

        if (json.status === 'completed' || json.status === 'failed' || json.status === 'partial') {
          clearInterval(interval);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch status');
        clearInterval(interval);
      }
    };

    fetchProgress(); // initial fetch
    interval = setInterval(fetchProgress, 3000); // Poll every 3s

    return () => clearInterval(interval);
  }, [params.id]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-950 p-6">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">Error Loading Analysis</h2>
          <p className="text-neutral-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-950">
        <Loader2 className="w-8 h-8 text-neutral-500 animate-spin" />
      </div>
    );
  }

  const hasReport = data.status === 'completed' || data.status === 'partial';
  const isFinished = hasReport || data.status === 'failed';

  // Helper to determine stage status
  const getStageStatus = (stageId: string) => {
    const step = data.steps.find(s => s.key === stageId);
    if (!step) return data.status === 'queued' ? 'queued' : (data.currentStep === stageId ? 'processing' : 'queued');
    return step.status;
  };

  return (
    <div className="flex-1 bg-neutral-950 flex flex-col md:flex-row overflow-hidden">
      
      {/* Left Panel: Timeline */}
      <div className="w-full md:w-1/3 xl:w-1/4 bg-neutral-900/50 border-r border-neutral-800 p-6 md:p-10 flex flex-col overflow-y-auto">
        <h1 className="text-2xl font-light text-white mb-2">Analysis in Progress</h1>
        <p className="text-sm text-neutral-400 mb-8">
          We are analyzing the prospect's digital footprint to build your report.
        </p>

        <div className="relative flex-1">
          {/* Vertical progress line */}
          <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-neutral-800" />
          
          <div className="space-y-8 relative">
            {UI_STAGES.map((stage, idx) => {
              const status = getStageStatus(stage.id);
              const isActive = status === 'processing';
              const isCompleted = status === 'completed';
              const isFailed = status === 'failed';
              const isPending = status === 'queued' || !status;
              
              const Icon = stage.icon;

              return (
                <div key={stage.id} className="flex gap-4 items-start">
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-500
                    ${isCompleted ? 'bg-blue-600 text-white' : 
                      isActive ? 'bg-neutral-800 border border-blue-500 text-blue-400' :
                      isFailed ? 'bg-red-900/50 border border-red-500 text-red-400' :
                      'bg-neutral-900 border border-neutral-700 text-neutral-500'
                    }`}
                  >
                    {isActive ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isFailed ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className={`pt-1 transition-opacity duration-500 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
                    <h3 className={`text-sm font-medium ${isActive ? 'text-blue-400' : 'text-neutral-200'}`}>
                      {stage.label}
                    </h3>
                    {isActive && <p className="text-xs text-neutral-400 mt-1 animate-pulse">Processing...</p>}
                    {isFailed && <p className="text-xs text-red-400 mt-1">Failed</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {hasReport && (
          <div className="mt-8 pt-6 border-t border-neutral-800 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <button
              onClick={() => router.push(`/analyses/${data.id}/report`)}
              className="w-full group relative flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-medium text-black hover:bg-neutral-200 transition-all"
            >
              View Full Report
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}
        {(data.status === 'failed' || data.status === 'partial') && (
          <div className="mt-8 rounded-xl border border-red-900/60 bg-red-950/30 p-4">
            <p className="text-sm font-medium text-red-300">{data.status === 'partial' ? 'Report is partial' : 'Analysis could not create a report'}</p>
            <p className="mt-1 text-xs text-red-200/70">{data.failureMessage || `Missing or skipped: ${data.steps.filter(step => step.status === 'failed' || step.status === 'skipped').map(step => step.key.replaceAll('_', ' ')).join(', ') || 'unknown sections'}.`}</p>
            <button
              type="button"
              disabled={isRetrying}
              onClick={async () => {
                setIsRetrying(true);
                try {
                  const response = await fetch(`/api/analyses/${data.id}`, {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ action: 'retry' }),
                  });
                  if (!response.ok) throw new Error('Unable to retry analysis');
                  window.location.reload();
                } catch (retryError) {
                  setError(retryError instanceof Error ? retryError.message : 'Unable to retry analysis');
                } finally {
                  setIsRetrying(false);
                }
              }}
              className="mt-3 rounded-lg bg-red-200 px-3 py-2 text-xs font-semibold text-red-950 disabled:opacity-50"
            >
              {isRetrying ? 'Retrying…' : 'Retry failed stages'}
            </button>
          </div>
        )}
        {(data.status === 'queued' || data.status === 'processing') && <button type="button" onClick={async () => { if (!window.confirm('Cancel this analysis?')) return; const response = await fetch(`/api/analyses/${data.id}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'cancel' }) }); if (response.ok) window.location.reload(); else setError('Unable to cancel analysis'); }} className="mt-6 rounded-lg border border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800">Cancel analysis</button>}
      </div>

      {/* Right Panel: Live Evidence */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-neutral-950">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-lg font-medium text-white mb-6">Live Evidence</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Pages Discovered */}
            {(() => {
              const discStep = data.steps.find(s => s.key === 'discover_pages');
              if (!discStep) return null;
              const urls = discStep.outputSummary?.urls || [];
              
              return (
                <div className="bg-neutral-900/40 border border-neutral-800/60 p-5 rounded-2xl animate-in fade-in zoom-in-95 duration-500">
                  <div className="flex items-center gap-3 mb-3">
                    <Globe className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-medium text-neutral-300">Pages Discovered</h3>
                  </div>
                  <div className="text-3xl font-light text-white mb-2">{urls.length}</div>
                  <div className="text-xs text-neutral-500 truncate">
                    {urls[0] && new URL(urls[0]).hostname}
                  </div>
                </div>
              );
            })()}

            {/* Performance Score */}
            {(() => {
              const psStep = data.steps.find(s => s.key === 'pagespeed');
              const summary = psStep?.outputSummary?.primary || psStep?.outputSummary;
              if (!summary?.scores?.performance && summary?.scores?.performance !== 0) return null;
              const rawScore = summary.scores.performance;
              const score = Math.round(rawScore);
              
              return (
                <div className="bg-neutral-900/40 border border-neutral-800/60 p-5 rounded-2xl animate-in fade-in zoom-in-95 duration-500">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-sm font-medium text-neutral-300">Performance</h3>
                  </div>
                  <div className="flex items-end gap-2 mb-2">
                    <div className={`text-3xl font-light ${score >= 90 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {score}
                    </div>
                    <div className="text-sm text-neutral-500 mb-1">/ 100</div>
                  </div>
                  <div className="text-xs text-neutral-500">PageSpeed Insights (Mobile)</div>
                </div>
              );
            })()}

            {/* Technologies Detected */}
            {(() => {
              const techStep = data.steps.find(s => s.key === 'technology_detection');
              if (!techStep || !techStep.outputSummary?.detected) return null;
              const techs = techStep.outputSummary.detected || [];
              
              return (
                <div className="bg-neutral-900/40 border border-neutral-800/60 p-5 rounded-2xl animate-in fade-in zoom-in-95 duration-500 col-span-1 md:col-span-2">
                  <div className="flex items-center gap-3 mb-3">
                    <Server className="w-5 h-5 text-purple-400" />
                    <h3 className="text-sm font-medium text-neutral-300">Tech Stack</h3>
                  </div>
                  {techs.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {techs.map((t: any, i: number) => (
                        <span key={i} className="px-3 py-1 bg-neutral-800 text-neutral-300 rounded-full text-xs border border-neutral-700">
                          {t.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-neutral-500 mt-2">No distinctive frameworks detected.</div>
                  )}
                </div>
              );
            })()}

          </div>
        </div>
      </div>
    </div>
  );
}
