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
    <div className="flex flex-col gap-6 h-full min-h-[800px] max-w-5xl mx-auto w-full">
      
      {/* Toolbar / Actions */}
      <div className="flex items-center justify-end gap-3">
        <button 
          type="button" 
          disabled={saving} 
          onClick={async () => { 
            setSaving(true); 
            const result = await saveProposalContent(proposal.id, content); 
            setSaving(false); 
            if (result.success) toast.success('Proposal saved'); 
            else toast.error(result.error || 'Unable to save'); 
          }} 
          className="flex items-center gap-2 px-5 py-2.5 bg-[#e7f2e9] hover:bg-[#c8ddcd] border border-[#c8ddcd] disabled:opacity-50 text-[#16352a] rounded-xl text-[13px] font-bold transition-all shadow-sm"
        >
          {saving ? <Save className="w-4 h-4 text-[#16352a]" /> : <Save className="w-4 h-4 text-[#16352a]" />}
          {saving ? 'Saving…' : 'Save Draft'}
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#16352a] hover:bg-[#204a3b] text-[#ffffff] rounded-xl text-[13px] font-bold transition-all shadow-sm shadow-[#16352a]/10"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>

      {/* Document Content (The Paper) */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-[#d8e5db]/80 overflow-hidden flex flex-col transition-all focus-within:ring-4 focus-within:ring-[#8ca096]/10 focus-within:border-[#8ca096]">
        <textarea 
          aria-label="Proposal markdown" 
          value={content} 
          onChange={event => setContent(event.target.value)} 
          className="flex-1 w-full min-h-[700px] resize-none bg-transparent p-10 lg:p-16 font-sans text-[16px] leading-[2] text-[#2a4537] outline-none placeholder:text-[#8ca096]" 
          placeholder="Start drafting your proposal here..."
        />
      </div>
    </div>
  );
}
