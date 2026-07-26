'use client';

import * as React from 'react';
import { Copy, Check, Save } from 'lucide-react';
import { toast } from 'sonner';
import { saveProposalContent } from './actions';

interface Proposal {
  id: string;
  problemStatement: string | null;
  objectives: string | null;
  scope: string | null;
  phases: string | null;
  successMetrics: string | null;
  assumptions: string | null;
  nextStep: string | null;
  userEditedContent: string | null;
}

interface ClientProposalProps {
  proposal: Proposal;
}

export function ClientProposal({ proposal }: ClientProposalProps) {
  const [copied, setCopied] = React.useState(false);
  const generatedMarkdown = React.useMemo(() => {
    let md = '';
    if (proposal.problemStatement) md += `## 1. Problem Statement\n${proposal.problemStatement}\n\n`;
    if (proposal.objectives) md += `## 2. Proposed Objectives\n${proposal.objectives}\n\n`;
    if (proposal.scope) md += `## 3. Recommended Scope\n${proposal.scope}\n\n`;
    if (proposal.phases) md += `## 4. Execution Phases\n${proposal.phases}\n\n`;
    if (proposal.successMetrics) md += `## 5. Success Metrics\n${proposal.successMetrics}\n\n`;
    if (proposal.assumptions) md += `## 6. Assumptions & Requirements\n${proposal.assumptions}\n\n`;
    if (proposal.nextStep) md += `## 7. Next Steps\n${proposal.nextStep}\n\n`;
    return md;
  }, [proposal]);
  const [content, setContent] = React.useState(proposal.userEditedContent || generatedMarkdown);
  const [saving, setSaving] = React.useState(false);

  const generateMarkdown = () => {
    return content;
  };

  const handleCopy = () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 text-neutral-900 flex flex-col min-h-[800px] overflow-hidden">
      
      {/* Toolbar */}
      <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Proposal Outline</h2>
          <p className="text-sm text-neutral-500">Draft document for export</p>
        </div>
        <div className="flex gap-2"><button type="button" disabled={saving} onClick={async () => { setSaving(true); const result = await saveProposalContent(proposal.id, content); setSaving(false); if (result.success) toast.success('Proposal saved'); else toast.error(result.error || 'Unable to save'); }} className="flex items-center gap-2 px-4 py-2 border border-neutral-300 hover:bg-neutral-100 text-neutral-900 rounded-lg text-sm font-medium"><Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save'}</button><button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied to Clipboard' : 'Copy as Markdown'}
        </button></div>
      </div>

      {/* Document Content */}
      <div className="p-8 lg:p-12 max-w-4xl mx-auto flex-1 w-full"><textarea aria-label="Proposal markdown" value={content} onChange={event => setContent(event.target.value)} className="min-h-[650px] w-full resize-y rounded-lg border border-neutral-200 bg-white p-4 font-mono text-sm leading-7 text-neutral-900 outline-none focus:border-blue-500" /></div>
    </div>
  );
}
