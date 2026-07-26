'use client';

import * as React from 'react';
import { Badge } from '@leadlens/ui';
import { Save, Check, Copy } from 'lucide-react';
import { saveOutreachBody } from './actions';

interface ClientEditorProps {
  outreach: any; // We'll pass the exact outreach object
}

export function ClientEditor({ outreach }: ClientEditorProps) {
  const [body, setBody] = React.useState(outreach.userEditedBody || outreach.body || '');
  const [isSaving, setIsSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const res = await saveOutreachBody(outreach.id, body);
    setIsSaving(false);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe parse subject options
  let subjects: string[] = [];
  if (Array.isArray(outreach.subjectLines)) {
    subjects = outreach.subjectLines;
  }

  return (
    <div className="flex-1 flex flex-col gap-6">
      
      {/* Settings / Controls */}
      <div className="flex flex-wrap items-center gap-4 bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <div>
          <span className="text-xs text-neutral-500 uppercase tracking-wider mb-1 block">Channel</span>
          <Badge variant="neutral" className="capitalize">{outreach.channel}</Badge>
        </div>
        <div>
          <span className="text-xs text-neutral-500 uppercase tracking-wider mb-1 block">Tone</span>
          <Badge variant="neutral" className="capitalize">{outreach.tone}</Badge>
        </div>
        <div className="ml-auto">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy Message'}
          </button>
        </div>
      </div>

      {/* Subjects */}
      {subjects.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-white">Subject Options</h3>
          <div className="flex flex-col gap-2">
            {subjects.map((subj, i) => (
              <div key={i} className="px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-300">
                {subj}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden min-h-[400px]">
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h3 className="text-sm font-medium text-white">Message Body</h3>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-md text-xs font-medium transition-colors"
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? 'Saved' : isSaving ? 'Saving...' : 'Save Draft'}
          </button>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="flex-1 w-full bg-transparent p-6 text-neutral-200 resize-none outline-none focus:ring-0 font-mono text-sm leading-relaxed"
          placeholder="Type your message here..."
        />
      </div>

    </div>
  );
}
