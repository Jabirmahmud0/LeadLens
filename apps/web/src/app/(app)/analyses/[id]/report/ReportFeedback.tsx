'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { saveReportFeedback } from './feedback-actions';

export function ReportFeedback({ reportId }: { reportId: string }) {
  const [rating, setRating] = useState(8);
  const [timeSaved, setTimeSaved] = useState('20 minutes');
  const [uses, setUses] = useState({ outreach: false, call: false, proposal: false });
  const [comments, setComments] = useState('');
  return <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
    <h2 className="text-lg font-medium text-white">Was this brief useful?</h2>
    <p className="mt-1 text-sm text-neutral-400">This feedback improves report quality and measures real sales use.</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className="text-sm text-neutral-300">Usefulness: {rating}/10<input type="range" min="1" max="10" value={rating} onChange={(event) => setRating(Number(event.target.value))} className="mt-2 w-full" /></label>
      <label className="text-sm text-neutral-300">Estimated time saved<input value={timeSaved} onChange={(event) => setTimeSaved(event.target.value)} className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" /></label>
    </div>
    <div className="mt-4 flex flex-wrap gap-4 text-sm text-neutral-300">{(['outreach', 'call', 'proposal'] as const).map((use) => <label key={use}><input type="checkbox" checked={uses[use]} onChange={(event) => setUses({ ...uses, [use]: event.target.checked })} className="mr-2" />Used for {use}</label>)}</div>
    <textarea value={comments} onChange={(event) => setComments(event.target.value)} placeholder="Optional comment" className="mt-4 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-sm text-white" />
    <button onClick={async () => { const result = await saveReportFeedback({ reportId, overallUsefulness: rating, timeSavedEstimate: timeSaved, usedForOutreach: uses.outreach, usedForCall: uses.call, usedForProposal: uses.proposal, comments }); if (result.success) toast.success('Feedback saved'); else toast.error(result.error); }} className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black">Save feedback</button>
  </section>;
}
