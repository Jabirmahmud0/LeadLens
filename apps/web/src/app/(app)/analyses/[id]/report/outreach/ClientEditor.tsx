'use client';

import * as React from 'react';
import { Badge } from '@leadlens/ui';
import { Save, Check, Copy, MessageSquare, Lightbulb, Mail } from 'lucide-react';
import { saveOutreachBody } from './actions';

interface ClientEditorProps {
  outreach: any; // We'll pass the exact outreach object
  recommendedCta?: string | null;
}

export function ClientEditor({ outreach, recommendedCta }: ClientEditorProps) {
  const [body, setBody] = React.useState(outreach.userEditedBody || outreach.body || '');
  const [isSaving, setIsSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [copiedSubjectIndex, setCopiedSubjectIndex] = React.useState<number | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    const res = await saveOutreachBody(outreach.id, body);
    setIsSaving(false);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySubject = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedSubjectIndex(index);
    setTimeout(() => setCopiedSubjectIndex(null), 2000);
  };

  // Safe parse subject options
  let subjects: string[] = [];
  if (Array.isArray(outreach.subjectLines)) {
    subjects = outreach.subjectLines;
  }

  return (
    <div className="flex flex-col gap-4">
      
      {/* Settings / Controls */}
      <div className="flex flex-wrap items-center gap-4 bg-white border border-[#d8e5db]/60 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#f4f8f3]">
          {outreach.channel?.toLowerCase().includes('email') ? <Mail className="h-5 w-5 text-[#60766b]" /> : <MessageSquare className="h-5 w-5 text-[#60766b]" />}
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-[#10251d] capitalize">
            {outreach.channel || 'Message'} Draft
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="neutral" className="bg-[#f4f8f3] text-[#60766b] shadow-none border-transparent capitalize text-[10px] font-medium px-2 py-0.5">
              Tone: {outreach.tone}
            </Badge>
          </div>
        </div>
        <div className="ml-auto">
          <button 
            onClick={handleCopyBody}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#d8e5db] hover:bg-[#f4f8f3] text-[#16352a] rounded-xl text-[13px] font-medium transition-colors shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#60766b]" />}
            {copied ? 'Copied' : 'Copy Message'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Subject Options & CTA */}
        <div className="lg:col-span-4 space-y-6">
          {subjects.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#71877b]">Subject Ideas</h3>
              <ul className="flex flex-col gap-2">
                {subjects.map((subj, i) => (
                  <li 
                    key={i} 
                    onClick={() => handleCopySubject(subj, i)}
                    className="group relative flex items-center justify-between px-4 py-3 bg-white border border-[#d8e5db]/60 hover:border-[#c8ddcd] rounded-xl cursor-pointer transition-all shadow-sm"
                  >
                    <span className="text-[13px] text-[#486257] leading-snug pr-6">{subj}</span>
                    <button className="absolute right-4 text-[#8ca096] group-hover:text-[#16352a] transition-colors">
                      {copiedSubjectIndex === i ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recommendedCta && (
            <div className="space-y-3 pt-2">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#71877b]">Recommended CTA</h3>
              <div className="p-4 bg-emerald-50/50 border border-emerald-200/50 rounded-xl">
                <div className="flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-[13px] text-emerald-800 leading-relaxed font-medium">
                    {recommendedCta}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Editor */}
        <div className="lg:col-span-8 flex flex-col bg-white border border-[#d8e5db]/60 rounded-2xl overflow-hidden min-h-[500px] shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-[#d8e5db]/60 bg-[#fbfdfb]">
            <h3 className="text-[13px] font-semibold text-[#10251d]">Message Body</h3>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#e7f2e9] hover:bg-[#c8ddcd] border border-[#c8ddcd] disabled:opacity-50 text-[#16352a] rounded-xl text-[12px] font-bold transition-colors shadow-sm"
            >
              {saved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5 text-[#16352a]" />}
              {saved ? 'Saved' : isSaving ? 'Saving...' : 'Save Draft'}
            </button>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="flex-1 w-full bg-transparent p-6 lg:p-8 text-[#2a4537] resize-none outline-none focus:ring-0 text-[15px] leading-relaxed font-sans"
            placeholder="Type your message here..."
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}
