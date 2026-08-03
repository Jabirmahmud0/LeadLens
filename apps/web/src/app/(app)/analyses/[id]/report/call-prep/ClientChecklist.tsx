'use client';

import * as React from 'react';
import { updateCallQuestion } from './actions';
import { CheckSquare, Square, MessageSquare, Save, Check } from 'lucide-react';
import { Badge } from '@leadlens/ui';

interface Question {
  id: string;
  category: string | null;
  question: string | null;
  rationale: string | null;
  isChecked: boolean | null;
  notes: string | null;
}

interface ClientChecklistProps {
  questions: Question[];
}

export function ClientChecklist({ questions }: ClientChecklistProps) {
  // Group questions by category
  const grouped: Record<string, Question[]> = {};
  questions.forEach(q => {
    const cat = q.category || 'General';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(q);
  });

  return (
    <div className="space-y-12">
      {Object.entries(grouped).map(([category, qs]) => (
        <section key={category} className="space-y-4">
          <h2 className="text-[14px] font-bold text-[#10251d] flex items-center gap-2 border-b border-[#d8e5db]/60 pb-2 capitalize">
            {category} Questions
            <Badge variant="neutral" className="bg-[#f4f8f3] text-[#60766b] shadow-none border-[#d8e5db] px-2 py-0.5">{qs.length}</Badge>
          </h2>

          <div className="space-y-3">
            {qs.map(q => (
              <QuestionItem key={q.id} question={q} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function QuestionItem({ question }: { question: Question }) {
  const [isChecked, setIsChecked] = React.useState(question.isChecked || false);
  const [notes, setNotes] = React.useState(question.notes || '');
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const toggleCheck = async () => {
    const newVal = !isChecked;
    setIsChecked(newVal);
    await updateCallQuestion(question.id, newVal, notes);
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    const res = await updateCallQuestion(question.id, isChecked, notes);
    setIsSaving(false);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className={`bg-white border rounded-xl overflow-hidden transition-all shadow-sm ${isChecked ? 'border-[#8ca096] ring-1 ring-[#8ca096]/20 bg-[#fafdfa]/50' : 'border-[#d8e5db]/60'}`}>
      <div className="p-4 flex gap-4">
        <button 
          onClick={toggleCheck}
          className="mt-0.5 text-[#8ca096] hover:text-[#16352a] transition-colors shrink-0"
        >
          {isChecked ? <CheckSquare className="w-5 h-5 text-emerald-600" /> : <Square className="w-5 h-5" />}
        </button>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h4 className={`text-[14px] font-medium transition-colors ${isChecked ? 'text-[#60766b] line-through' : 'text-[#10251d]'}`}>
              {question.question}
            </h4>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center gap-1 text-[11px] uppercase tracking-wider shrink-0 transition-colors font-bold ${isExpanded ? 'text-[#16352a]' : 'text-[#8ca096] hover:text-[#16352a]'}`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Notes
            </button>
          </div>
          
          {question.rationale && (
            <p className="text-[13px] text-[#486257] leading-relaxed">
              <span className="font-semibold text-[#60766b] mr-2">Rationale:</span>
              {question.rationale}
            </p>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-[#d8e5db]/60 bg-[#fafdfa]">
          <div className="flex gap-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Take notes during the call..."
              className="flex-1 bg-white border border-[#d8e5db]/60 shadow-inner rounded-lg p-3 text-[14px] text-[#2a4537] resize-none outline-none focus:border-[#8ca096] min-h-[80px]"
            />
            <div className="shrink-0">
              <button 
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="flex items-center justify-center w-10 px-0 bg-[#e7f2e9] hover:bg-[#c8ddcd] border border-[#c8ddcd] disabled:opacity-50 text-[#16352a] rounded-lg transition-colors h-full shadow-sm"
              >
                {saved ? <Check className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4 text-[#16352a]" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
