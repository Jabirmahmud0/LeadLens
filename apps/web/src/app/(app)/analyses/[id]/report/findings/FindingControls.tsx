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
  
  return (
    <div className="space-y-4" onClick={(event) => event.stopPropagation()}>
      <div className="flex flex-wrap items-center gap-2">
        <button 
          onClick={() => run({ findingId: finding.id, action: 'pin', value: !finding.isPinned })} 
          className="flex items-center gap-1.5 rounded-lg bg-white border border-[#d8e5db] px-3 py-1.5 text-[12px] font-medium text-[#486257] hover:bg-[#f4f8f3] hover:text-[#16352a] transition-colors shadow-sm"
        >
          <Pin className="h-3.5 w-3.5" />
          {finding.isPinned ? 'Unpin' : 'Pin'}
        </button>
        <button 
          onClick={() => run({ findingId: finding.id, action: 'hide', value: true })} 
          className="flex items-center gap-1.5 rounded-lg bg-white border border-[#d8e5db] px-3 py-1.5 text-[12px] font-medium text-[#486257] hover:bg-[#f4f8f3] hover:text-[#16352a] transition-colors shadow-sm"
        >
          <EyeOff className="h-3.5 w-3.5" />
          Hide
        </button>
        <div className="h-4 w-px bg-[#d8e5db]/80 mx-1"></div>
        <button 
          onClick={() => run({ findingId: finding.id, action: 'feedback', value: 'useful' })} 
          className="flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 text-[12px] font-medium text-emerald-700 hover:bg-emerald-100/80 transition-colors shadow-sm"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          Useful
        </button>
        <button 
          onClick={() => run({ findingId: finding.id, action: 'feedback', value: 'inaccurate' })} 
          className="flex items-center gap-1.5 rounded-lg bg-rose-50 border border-rose-200/60 px-3 py-1.5 text-[12px] font-medium text-rose-700 hover:bg-rose-100/80 transition-colors shadow-sm"
        >
          <TriangleAlert className="h-3.5 w-3.5" />
          Inaccurate
        </button>
      </div>
      
      <div className="flex items-stretch gap-2">
        <input 
          value={notes} 
          onChange={(event) => setNotes(event.target.value)} 
          placeholder="Add a private note..." 
          className="min-w-0 flex-1 rounded-lg border border-[#d8e5db] bg-[#fbfdfb] px-3.5 py-2 text-[13px] text-[#16352a] placeholder:text-[#8ca096] focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm" 
        />
        <button 
          onClick={() => run({ findingId: finding.id, action: 'notes', value: notes })} 
          className="flex items-center justify-center rounded-lg bg-[#16352a] px-3.5 text-white hover:bg-[#204a3b] transition-colors shadow-sm" 
          aria-label="Save private note"
        >
          <Save className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
