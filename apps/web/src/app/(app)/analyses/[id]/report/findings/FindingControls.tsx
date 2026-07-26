'use client';

import { useState } from 'react';
import { EyeOff, Pin, Save, ThumbsUp, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { updateFinding } from './actions';

export function FindingControls({ finding }: { finding: { id: string; isPinned: boolean | null; privateNotes: string | null } }) {
  const [notes, setNotes] = useState(finding.privateNotes || '');
  const run = async (input: Parameters<typeof updateFinding>[0]) => {
    const result = await updateFinding(input);
    if (result.success) toast.success('Finding updated');
    else toast.error(result.error || 'Unable to update finding');
  };
  return <div className="mt-4 space-y-3 border-t border-neutral-800 pt-4" onClick={(event) => event.stopPropagation()}>
    <div className="flex flex-wrap gap-2">
      <button onClick={() => run({ findingId: finding.id, action: 'pin', value: !finding.isPinned })} className="flex items-center gap-1 rounded-md bg-neutral-800 px-2 py-1 text-xs text-neutral-300"><Pin className="h-3 w-3" />{finding.isPinned ? 'Unpin' : 'Pin'}</button>
      <button onClick={() => run({ findingId: finding.id, action: 'hide', value: true })} className="flex items-center gap-1 rounded-md bg-neutral-800 px-2 py-1 text-xs text-neutral-300"><EyeOff className="h-3 w-3" />Hide</button>
      <button onClick={() => run({ findingId: finding.id, action: 'feedback', value: 'useful' })} className="flex items-center gap-1 rounded-md bg-green-950 px-2 py-1 text-xs text-green-300"><ThumbsUp className="h-3 w-3" />Useful</button>
      <button onClick={() => run({ findingId: finding.id, action: 'feedback', value: 'inaccurate' })} className="flex items-center gap-1 rounded-md bg-red-950 px-2 py-1 text-xs text-red-300"><TriangleAlert className="h-3 w-3" />Inaccurate</button>
    </div>
    <div className="flex gap-2"><input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Private note" className="min-w-0 flex-1 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white" /><button onClick={() => run({ findingId: finding.id, action: 'notes', value: notes })} className="rounded-md bg-neutral-800 px-3 text-neutral-200" aria-label="Save private note"><Save className="h-3.5 w-3.5" /></button></div>
  </div>;
}
