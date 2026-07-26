'use client';

import { Download, Printer, Trash2, Copy, RefreshCw, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function ReportActions({ reportId, analysisId }: { reportId: string; analysisId: string }) {
  const router = useRouter();
  const runAction = async (path: string, body: object, success: string) => {
    const response = await fetch(`/api/reports/${reportId}/${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (!response.ok) return toast.error((await response.json().catch(() => null))?.error || 'Action failed');
    toast.success(success);
    router.push(path === 'regenerate' ? `/analyses/${analysisId}` : `/analyses/${analysisId}/report`);
    router.refresh();
  };
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-wrap gap-2 rounded-xl border border-neutral-800 bg-neutral-950/90 p-2 shadow-xl backdrop-blur">
      <button type="button" onClick={async () => { const response = await fetch(`/api/reports/${reportId}/export?action=copy`); if (!response.ok) return toast.error('Unable to copy report'); await navigator.clipboard.writeText(await response.text()); toast.success('Whole report copied'); }} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800"><Copy className="h-4 w-4" /> Copy all</button>
      <button type="button" onClick={() => runAction('regenerate', { section: 'all' }, 'Regeneration queued')} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800"><RefreshCw className="h-4 w-4" /> Regenerate</button>
      <button type="button" onClick={() => runAction('restore', { section: 'summary' }, 'Original summary restored')} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800"><RotateCcw className="h-4 w-4" /> Restore original</button>
      <a href={`/api/reports/${reportId}/export`} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-neutral-200">
        <Download className="h-4 w-4" /> Export Markdown
      </a>
      <button type="button" onClick={() => window.print()} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800">
        <Printer className="h-4 w-4" /> Print
      </button>
      <button
        type="button"
        onClick={async () => {
          if (!window.confirm('Delete this report and its analysis data? This cannot be undone.')) return;
          const response = await fetch(`/api/reports/${reportId}`, { method: 'DELETE' });
          if (!response.ok) return toast.error('Unable to delete report');
          toast.success('Report deleted');
          router.push('/analyses');
          router.refresh();
        }}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-950"
      >
        <Trash2 className="h-4 w-4" /> Delete
      </button>
    </div>
  );
}
