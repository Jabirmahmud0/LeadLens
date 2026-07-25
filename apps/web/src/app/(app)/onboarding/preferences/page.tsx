'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ArrowRight, Settings, MessageSquare, FileText, CheckCircle2 } from 'lucide-react';
import { saveOutputPreferences } from '../actions';

const preferencesSchema = z.object({
  brandVoice: z.string().min(1),
  outreachTone: z.string().min(1),
  preferredOutreachChannel: z.string().min(1),
  reportDepth: z.string().min(1),
  technicalDetailLevel: z.string().min(1),
  proposalStyle: z.string().min(1),
  avoidedPhrases: z.array(z.string()).default([]),
  ctaPreference: z.string().min(1),
});

type PreferencesFormValues = z.infer<typeof preferencesSchema>;

export default function PreferencesStep() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      brandVoice: 'Professional & Direct',
      outreachTone: 'Consultative',
      preferredOutreachChannel: 'Email',
      reportDepth: 'Comprehensive',
      technicalDetailLevel: 'Moderate',
      proposalStyle: 'Value-based',
      avoidedPhrases: ['Cheap', 'Guarantee', 'Quick Fix'],
      ctaPreference: 'Book a Strategy Call',
    }
  });

  const onSubmit = async (data: PreferencesFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await saveOutputPreferences(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-neutral-950 flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 lg:p-16 max-w-4xl mx-auto w-full">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Settings className="w-8 h-8 text-neutral-400" />
          </div>
          <h1 className="text-3xl font-light text-white">Output Preferences</h1>
          <p className="mt-4 text-neutral-400 max-w-xl mx-auto leading-relaxed">
            Configure how LeadLens writes reports and emails on your behalf. We&apos;ll mirror your agency&apos;s brand voice and style.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {error && (
            <div className="p-4 rounded-xl bg-red-950/50 border border-red-900/50 text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Tone & Voice */}
            <div className="space-y-6 bg-neutral-900/50 p-6 sm:p-8 rounded-2xl border border-neutral-800">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-medium text-white">Brand Voice & Tone</h2>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300">Brand Voice</label>
                <select className="block w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-white focus:border-white transition-colors appearance-none" {...register('brandVoice')}>
                  <option value="Professional & Direct">Professional & Direct</option>
                  <option value="Casual & Friendly">Casual & Friendly</option>
                  <option value="Authoritative & Data-driven">Authoritative & Data-driven</option>
                  <option value="Empathetic & Consultative">Empathetic & Consultative</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300">Cold Outreach Tone</label>
                <select className="block w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-white focus:border-white transition-colors appearance-none" {...register('outreachTone')}>
                  <option value="Consultative">Consultative (Helpful)</option>
                  <option value="Direct">Direct (Cut to the chase)</option>
                  <option value="Curious">Curious (Asking questions)</option>
                  <option value="Provocative">Provocative (Challenging)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300">Call to Action Preference</label>
                <input type="text" className="block w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-white focus:border-white transition-colors" placeholder="e.g. Book a Strategy Call" {...register('ctaPreference')} />
              </div>
            </div>

            {/* Reports & Deliverables */}
            <div className="space-y-6 bg-neutral-900/50 p-6 sm:p-8 rounded-2xl border border-neutral-800">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
                <FileText className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-medium text-white">Audit Formatting</h2>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300">Report Depth</label>
                <select className="block w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-white focus:border-white transition-colors appearance-none" {...register('reportDepth')}>
                  <option value="Comprehensive">Comprehensive (Detailed analysis)</option>
                  <option value="Executive Summary">Executive Summary (High-level only)</option>
                  <option value="Action-oriented">Action-oriented (Checklists & Next Steps)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300">Technical Detail Level</label>
                <select className="block w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-white focus:border-white transition-colors appearance-none" {...register('technicalDetailLevel')}>
                  <option value="Low">Low (Explain to a layman)</option>
                  <option value="Moderate">Moderate (Balance of business + tech)</option>
                  <option value="High">High (For internal devs/CTOs)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300">Preferred Channel</label>
                <select className="block w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-white focus:border-white transition-colors appearance-none" {...register('preferredOutreachChannel')}>
                  <option value="Email">Email</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Cold Call Script">Cold Call Script</option>
                </select>
              </div>
            </div>

          </div>

          <div className="pt-8 flex justify-center mt-12">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex items-center justify-center rounded-full bg-white px-12 py-4 text-base font-medium text-black hover:bg-neutral-200 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)]"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5" />
                  Complete Setup & Go to Dashboard
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
