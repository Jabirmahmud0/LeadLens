'use client';
import { Archive, Pin } from 'lucide-react';
import { toast } from 'sonner';
import { updateProspectState } from './actions';

export function ProspectControls({ id, pinned, archived }: { id: string; pinned: boolean; archived: boolean }) {
  const act = async (action: 'pin' | 'unpin' | 'archive' | 'restore') => { try { await updateProspectState(id, action); toast.success(`Prospect ${action === 'unpin' ? 'unpinned' : action === 'pin' ? 'pinned' : action === 'archive' ? 'archived' : 'restored'}`); } catch { toast.error('Unable to update prospect'); } };
  return <div className="absolute right-3 top-3 z-10 flex gap-1"><button type="button" onClick={() => act(pinned ? 'unpin' : 'pin')} aria-label={pinned ? 'Unpin prospect' : 'Pin prospect'} className="rounded-lg border border-[#dce7df] bg-[#f7faf7] p-2 text-[#789084] transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"><Pin className={`h-4 w-4 ${pinned ? 'fill-current text-emerald-600' : ''}`} /></button><button type="button" onClick={() => act(archived ? 'restore' : 'archive')} aria-label={archived ? 'Restore prospect' : 'Archive prospect'} className="rounded-lg border border-[#dce7df] bg-[#f7faf7] p-2 text-[#789084] transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"><Archive className="h-4 w-4" /></button></div>;
}
