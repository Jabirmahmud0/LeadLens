'use client';
import { Trash2, Pencil, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteAgencyServiceById } from './actions';

export function ServiceRowActions({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteAgencyServiceById(id);
      toast.success(`"${name}" deleted`);
      router.refresh();
    } catch {
      toast.error('Unable to delete service');
      setLoading(false);
    }
  };

  if (confirming) {
    return (
      <div className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 bg-neutral-950 px-2 py-1">
        <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
        <span className="text-xs text-red-400 whitespace-nowrap">Delete?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="ml-1 rounded px-2 py-0.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-50"
        >Yes</button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded px-2 py-0.5 text-xs font-semibold text-neutral-400 hover:bg-neutral-700"
        >No</button>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1">
      <a
        href={`/settings/services/${id}`}
        aria-label={`Edit ${name}`}
        className="inline-flex p-2 text-neutral-500 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <Pencil className="w-4 h-4" />
      </a>
      <button
        type="button"
        aria-label={`Delete ${name}`}
        onClick={(e) => { e.stopPropagation(); setConfirming(true); }}
        className="inline-flex p-2 text-neutral-500 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
