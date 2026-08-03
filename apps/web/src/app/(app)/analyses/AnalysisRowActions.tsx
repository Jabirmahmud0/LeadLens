'use client';
import { Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { deleteAnalysis } from './actions';

export function AnalysisRowActions({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteAnalysis(id);
      toast.success('Analysis deleted');
    } catch {
      toast.error('Unable to delete analysis');
      setLoading(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1 rounded-lg border border-red-500/40 bg-neutral-900 px-2 shrink-0">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400" />
        <span className="text-xs text-red-400 whitespace-nowrap">Delete?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="ml-1 rounded px-2 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-50"
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded px-2 py-1 text-xs font-semibold text-neutral-400 hover:bg-neutral-700"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label="Delete analysis"
      className="shrink-0 rounded-lg border border-neutral-200 bg-white p-2 text-neutral-400 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-500"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
