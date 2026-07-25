'use client';

import { useState } from 'react';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ArrowRight, Plus, Trash2, BookOpen, Target, TrendingUp, Lightbulb, CheckCircle2 } from 'lucide-react';
import { saveAgencyCaseStudies } from '../actions';

const caseStudySchema = z.object({
  title: z.string().min(2, 'Title is required'),
  clientIndustry: z.string().optional(),
  clientType: z.string().optional(),
  problem: z.string().min(10, 'Describe the problem'),
  solution: z.string().min(10, 'Describe the solution'),
  results: z.string().min(10, 'Describe the result'),
  deliverables: z.array(z.string()).default([]),
  metrics: z.record(z.string(), z.string()).optional(),
  serviceTags: z.array(z.string()).default([]),
  caseStudyUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  isPublic: z.boolean().default(true),
});

const formSchema = z.object({
  caseStudies: z.array(caseStudySchema).default([]),
});

type FormValues = z.infer<typeof formSchema>;

export default function CaseStudiesStep() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caseStudies: [
        {
          title: 'SaaS organic traffic +300%',
          clientIndustry: 'B2B SaaS',
          problem: 'Traffic plateaued due to severe canonicalization issues and crawl waste.',
          solution: 'Implemented programmatic technical SEO fixes and consolidated duplicated tags.',
          results: 'Increased non-branded organic traffic by 300% in 4 months.',
          deliverables: ['Technical SEO', 'Indexation Fixes'],
          isPublic: true,
        }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'caseStudies',
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await saveAgencyCaseStudies(data.caseStudies);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err) || 'Failed to save');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-neutral-950 flex flex-col md:flex-row">
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 lg:p-16">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-light text-white">Case Studies & Proof</h1>
              <p className="mt-2 text-neutral-400 max-w-xl">
                Add case studies to allow the AI to automatically inject highly relevant past results into prospect audits.
              </p>
            </div>
            <button
              type="button"
              onClick={() => append({ title: '', problem: '', solution: '', results: '', isPublic: true, deliverables: [], serviceTags: [] })}
              className="flex items-center gap-2 rounded-xl bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Case Study
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {error && (
              <div className="p-4 rounded-xl bg-red-950/50 border border-red-900/50 text-red-200 text-sm">
                {error}
              </div>
            )}

            {fields.length === 0 && (
              <div className="text-center py-16 bg-neutral-900/50 rounded-2xl border border-neutral-800 border-dashed">
                <BookOpen className="w-8 h-8 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-white font-medium mb-1">No case studies yet</h3>
                <p className="text-sm text-neutral-400 mb-4">You can skip this step and add them later.</p>
                <button
                  type="button"
                  onClick={() => append({ title: '', problem: '', solution: '', results: '', isPublic: true, deliverables: [], serviceTags: [] })}
                  className="inline-flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add your first case study
                </button>
              </div>
            )}

            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="bg-neutral-800/50 px-6 py-4 flex items-center justify-between border-b border-neutral-800">
                    <h3 className="text-white font-medium">Case Study {index + 1}</h3>
                    <button type="button" onClick={() => remove(index)} className="p-1.5 text-neutral-500 hover:text-red-400 rounded-md hover:bg-neutral-800" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Scaling Acme Corp SEO"
                          className="block w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-white focus:border-white transition-colors"
                          {...register(`caseStudies.\${index}.title` as const)}
                        />
                        {errors.caseStudies?.[index]?.title && <p className="text-xs text-red-400 mt-1">{errors.caseStudies[index].title?.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">Client Industry</label>
                        <input
                          type="text"
                          placeholder="e.g. Fintech"
                          className="block w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-white focus:border-white transition-colors"
                          {...register(`caseStudies.\${index}.clientIndustry` as const)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-2.5 before:w-px before:bg-neutral-800">
                      
                      {/* Problem */}
                      <div className="relative pl-8">
                        <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                          <Target className="w-3 h-3 text-red-400" />
                        </div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">The Problem</label>
                        <textarea
                          rows={2}
                          placeholder="What challenge was the client facing?"
                          className="block w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-white focus:border-white transition-colors resize-none"
                          {...register(`caseStudies.\${index}.problem` as const)}
                        />
                      </div>

                      {/* Solution */}
                      <div className="relative pl-8">
                        <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Lightbulb className="w-3 h-3 text-blue-400" />
                        </div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">The Solution</label>
                        <textarea
                          rows={2}
                          placeholder="How did you fix it?"
                          className="block w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-white focus:border-white transition-colors resize-none"
                          {...register(`caseStudies.\${index}.solution` as const)}
                        />
                      </div>

                      {/* Result */}
                      <div className="relative pl-8">
                        <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                          <TrendingUp className="w-3 h-3 text-green-400" />
                        </div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">The Result</label>
                        <textarea
                          rows={2}
                          placeholder="What was the business impact?"
                          className="block w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-white focus:border-white transition-colors resize-none"
                          {...register(`caseStudies.\${index}.results` as const)}
                        />
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 flex justify-between items-center border-t border-neutral-800">
              <button
                type="submit"
                onClick={() => {
                  if (fields.length === 0) {
                    setIsSubmitting(true);
                    // allow skip
                    const f = async () => {
                       await saveAgencyCaseStudies([]);
                    };
                    f().catch(console.error);
                  }
                }}
                className="text-neutral-400 hover:text-white text-sm font-medium transition-colors"
              >
                Skip / Skip for now
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex items-center justify-center rounded-xl bg-white px-8 py-3 text-sm font-medium text-black hover:bg-neutral-200 focus:outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Complete Profile
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Live Proof Card Preview */}
      <div className="w-full md:w-[400px] border-t md:border-t-0 md:border-l border-neutral-800 bg-neutral-950 p-6 sm:p-10 hidden md:block">
        <div className="w-full sticky top-10">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-6 text-center">
            AI Injection Preview
          </div>
          
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
             <div className="flex items-center gap-2 mb-3 text-xs font-medium text-blue-400">
               <BookOpen className="w-3.5 h-3.5" />
               Relevant Case Study
             </div>
             
             <h4 className="text-white font-medium leading-tight mb-2">
               {watch('caseStudies.0.title') || 'SaaS organic traffic +300%'}
             </h4>
             
             <p className="text-sm text-neutral-400 mb-4 line-clamp-3">
               {watch('caseStudies.0.results') || 'Increased non-branded organic traffic by 300% in 4 months by fixing severe canonicalization issues.'}
             </p>
             
             <div className="flex flex-wrap gap-2">
               {watch('caseStudies.0.clientIndustry') && (
                 <span className="px-2 py-1 bg-neutral-800 text-neutral-300 text-[10px] uppercase tracking-wider rounded font-medium">
                   {watch('caseStudies.0.clientIndustry')}
                 </span>
               )}
             </div>
          </div>
          <p className="text-xs text-neutral-500 mt-4 text-center">
            This card is dynamically injected into audit reports when the AI detects a prospect with similar traits.
          </p>
        </div>
      </div>
    </div>
  );
}
