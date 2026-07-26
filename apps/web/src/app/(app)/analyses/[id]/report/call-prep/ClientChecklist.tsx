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
          <h2 className="text-lg font-medium text-white flex items-center gap-2 border-b border-neutral-800 pb-2 capitalize">
            {category} Questions
            <Badge variant="neutral">{qs.length}</Badge>
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
    <div className={`bg-neutral-900 border rounded-xl overflow-hidden transition-colors ${isChecked ? 'border-blue-500/30' : 'border-neutral-800'}`}>
      <div className="p-4 flex gap-4">
        <button 
          onClick={toggleCheck}
          className="mt-0.5 text-neutral-400 hover:text-white transition-colors shrink-0"
        >
          {isChecked ? <CheckSquare className="w-5 h-5 text-blue-400" /> : <Square className="w-5 h-5" />}
        </button>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h4 className={`text-base font-medium transition-colors ${isChecked ? 'text-neutral-300' : 'text-white'}`}>
              {question.question}
            </h4>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-neutral-500 hover:text-white flex items-center gap-1 text-xs uppercase tracking-wider shrink-0"
            >
              <MessageSquare className="w-4 h-4" />
              Notes
            </button>
          </div>
          
          {question.rationale && (
            <p className="text-sm text-neutral-400">
              <span className="font-semibold text-neutral-500 mr-2">Rationale:</span>
              {question.rationale}
            </p>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/50">
          <div className="flex gap-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Take notes during the call..."
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-sm text-neutral-200 resize-none outline-none focus:border-neutral-600 min-h-[80px]"
            />
            <div className="shrink-0">
              <button 
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="flex items-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors h-full"
              >
                {saved ? <Check className="w-4 h-4 text-green-400" /> : <Save className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
