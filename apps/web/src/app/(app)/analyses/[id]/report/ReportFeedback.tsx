'use client';

import { ChevronDown, Heart, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { saveReportFeedback } from './feedback-actions';

export function ReportFeedback({ reportId }: { reportId: string }) {
  const [rating, setRating] = useState(8);
  const [timeSaved, setTimeSaved] = useState('20 minutes');
  const [uses, setUses] = useState({ outreach: false, call: false, proposal: false });
  const [comments, setComments] = useState('');

  return (
    <details className="report-reveal group rounded-2xl border border-[#d8e5db] bg-white/68 shadow-[0_12px_38px_rgba(31,67,46,0.055)] backdrop-blur">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><Heart className="size-4" /></span>
          <span><span className="block text-sm font-semibold text-[#16352a]">Was this brief useful?</span><span className="mt-0.5 block text-xs text-[#71877b]">A quick rating helps improve future reports.</span></span>
        </div>
        <ChevronDown className="size-4 text-[#71877b] transition-transform duration-300 ease-out group-open:rotate-180" />
      </summary>
      <div className="border-t border-[#e1ebe3] p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-xs font-semibold text-[#365246]">
            Usefulness <span className="float-right font-bold text-emerald-700">{rating}/10</span>
            <input type="range" min="1" max="10" value={rating} onChange={(event) => setRating(Number(event.target.value))} className="mt-3 w-full accent-emerald-700" />
          </label>
          <label className="text-xs font-semibold text-[#365246]">
            Estimated time saved
            <input value={timeSaved} onChange={(event) => setTimeSaved(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e5db] bg-white px-3 py-2.5 text-sm text-[#16352a] outline-none transition-all duration-300 ease-out focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10" />
          </label>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {(['outreach', 'call', 'proposal'] as const).map((use) => (
            <label key={use} className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-300 ease-out ${uses[use] ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-[#d8e5db] bg-white text-[#60766b] hover:border-[#bcd1c1]'}`}>
              <input type="checkbox" checked={uses[use]} onChange={(event) => setUses({ ...uses, [use]: event.target.checked })} className="sr-only" />
              Used for {use}
            </label>
          ))}
        </div>
        <textarea value={comments} onChange={(event) => setComments(event.target.value)} placeholder="Optional comment" className="mt-4 min-h-24 w-full resize-y rounded-xl border border-[#d8e5db] bg-white p-3 text-sm text-[#16352a] outline-none transition-all duration-300 ease-out placeholder:text-[#9aada2] focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10" />
        <button
          type="button"
          onClick={async () => {
            const result = await saveReportFeedback({ reportId, overallUsefulness: rating, timeSavedEstimate: timeSaved, usedForOutreach: uses.outreach, usedForCall: uses.call, usedForProposal: uses.proposal, comments });
            if (result.success) toast.success('Feedback saved');
            else toast.error(result.error);
          }}
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#166534] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_8px_22px_rgba(22,101,52,0.18)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#14532d]"
        >
          <Send className="size-3.5" />Save feedback
        </button>
      </div>
    </details>
  );
}
