'use client';

import * as React from 'react';
import { Copy, Check } from 'lucide-react';

interface Proposal {
  id: string;
  problemStatement: string | null;
  objectives: string | null;
  scope: string | null;
  phases: string | null;
  successMetrics: string | null;
  assumptions: string | null;
  nextStep: string | null;
}

interface ClientProposalProps {
  proposal: Proposal;
}

export function ClientProposal({ proposal }: ClientProposalProps) {
  const [copied, setCopied] = React.useState(false);

  const generateMarkdown = () => {
    let md = '';
    
    if (proposal.problemStatement) {
      md += `## 1. Problem Statement\n${proposal.problemStatement}\n\n`;
    }
    if (proposal.objectives) {
      md += `## 2. Proposed Objectives\n${proposal.objectives}\n\n`;
    }
    if (proposal.scope) {
      md += `## 3. Recommended Scope\n${proposal.scope}\n\n`;
    }
    if (proposal.phases) {
      md += `## 4. Execution Phases\n${proposal.phases}\n\n`;
    }
    if (proposal.successMetrics) {
      md += `## 5. Success Metrics\n${proposal.successMetrics}\n\n`;
    }
    if (proposal.assumptions) {
      md += `## 6. Assumptions & Requirements\n${proposal.assumptions}\n\n`;
    }
    if (proposal.nextStep) {
      md += `## 7. Next Steps\n${proposal.nextStep}\n\n`;
    }

    return md;
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
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied to Clipboard' : 'Copy as Markdown'}
        </button>
      </div>

      {/* Document Content */}
      <div className="p-8 lg:p-12 prose prose-neutral max-w-4xl mx-auto flex-1 font-serif">
        
        {proposal.problemStatement && (
          <>
            <h3>1. Problem Statement</h3>
            <p>{proposal.problemStatement}</p>
          </>
        )}

        {proposal.objectives && (
          <>
            <h3>2. Proposed Objectives</h3>
            <p>{proposal.objectives}</p>
          </>
        )}

        {proposal.scope && (
          <>
            <h3>3. Recommended Scope</h3>
            <p>{proposal.scope}</p>
          </>
        )}

        {proposal.phases && (
          <>
            <h3>4. Execution Phases</h3>
            <p>{proposal.phases}</p>
          </>
        )}

        {proposal.successMetrics && (
          <>
            <h3>5. Success Metrics</h3>
            <p>{proposal.successMetrics}</p>
          </>
        )}

        {proposal.assumptions && (
          <>
            <h3>6. Assumptions & Requirements</h3>
            <p>{proposal.assumptions}</p>
          </>
        )}

        {proposal.nextStep && (
          <>
            <h3>7. Next Steps</h3>
            <p>{proposal.nextStep}</p>
          </>
        )}

      </div>
    </div>
  );
}
