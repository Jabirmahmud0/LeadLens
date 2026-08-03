'use client';
import { Archive, Pin, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { updateProspectState, deleteProspect } from './actions';

export function ProspectControls({ id, pinned, archived }: { id: string; pinned: boolean; archived: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const act = async (action: 'pin' | 'unpin' | 'archive' | 'restore') => {
    try {
      await updateProspectState(id, action);
      const msg = action === 'pin' ? 'Prospect pinned' : action === 'unpin' ? 'Prospect unpinned' : action === 'archive' ? 'Prospect archived' : 'Prospect restored';
      toast.success(msg);
    } catch {
      toast.error('Unable to update prospect');
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteProspect(id);
      toast.success('Prospect deleted');
    } catch {
      toast.error('Unable to delete prospect');
      setLoading(false);
    }
  };

  return (
    <div className="absolute right-3 top-3 z-10 flex gap-1">
      <button
        type="button"
        onClick={() => act(pinned ? 'unpin' : 'pin')}
        aria-label={pinned ? 'Unpin prospect' : 'Pin prospect'}
        className="rounded-lg border border-neutral-700 bg-neutral-800 p-2 text-neutral-400 transition-colors hover:border-emerald-500 hover:bg-emerald-900/40 hover:text-emerald-400"
      >
        <Pin className={`h-4 w-4 ${pinned ? 'fill-current text-emerald-400' : ''}`} />
      </button>

      <button
        type="button"
        onClick={() => act(archived ? 'restore' : 'archive')}
        aria-label={archived ? 'Restore prospect' : 'Archive prospect'}
        className="rounded-lg border border-neutral-700 bg-neutral-800 p-2 text-neutral-400 transition-colors hover:border-emerald-500 hover:bg-emerald-900/40 hover:text-emerald-400"
      >
        <Archive className="h-4 w-4" />
      </button>

      {confirming ? (
        <div className="flex items-center gap-1 rounded-lg border border-red-500/40 bg-neutral-900 px-2">
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
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          aria-label="Delete prospect"
          className="rounded-lg border border-neutral-700 bg-neutral-800 p-2 text-neutral-400 transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
