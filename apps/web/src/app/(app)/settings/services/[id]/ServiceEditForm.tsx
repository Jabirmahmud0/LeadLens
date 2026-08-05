'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { updateAgencyService } from '../actions';

const schema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  summary: z.string().trim().min(10, 'Description must be at least 10 characters'),
  problemSolved: z.string().trim().optional(),
  deliverables: z.string().optional(),
  priceMin: z.coerce.number().min(0).optional().or(z.literal('')),
  priceMax: z.coerce.number().min(0).optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

export type ServiceFormInitialValues = {
  id: string;
  name: string;
  summary: string;
  problemSolved?: string;
  deliverables: string[];
  priceMin?: number;
  priceMax?: number;
  isActive: boolean;
};

const fieldClass = 'block w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 transition-colors';

export function ServiceEditForm({ initial }: { initial: ServiceFormInitialValues }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial.name,
      summary: initial.summary,
      problemSolved: initial.problemSolved ?? '',
      deliverables: initial.deliverables.join(', '),
      priceMin: initial.priceMin ?? '',
      priceMax: initial.priceMax ?? '',
      isActive: initial.isActive,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await updateAgencyService(initial.id, {
        name: data.name,
        summary: data.summary,
        problemSolved: data.problemSolved || undefined,
        deliverables: data.deliverables
          ? data.deliverables.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        priceMin: data.priceMin !== '' && data.priceMin != null ? Number(data.priceMin) : undefined,
        priceMax: data.priceMax !== '' && data.priceMax != null ? Number(data.priceMax) : undefined,
        isActive: data.isActive,
      });
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'NEXT_REDIRECT') throw e;
      setError(e instanceof Error ? e.message : 'Could not save. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/settings/services" className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Services
        </Link>
      </div>

      <h2 className="text-xl font-medium text-white mb-6">Edit Service</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div role="alert" className="rounded-xl border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-200">{error}</div>
        )}

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">Service Name</label>
            <input type="text" className={fieldClass} placeholder="e.g. Technical SEO Audit" {...register('name')} />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">Description</label>
            <textarea rows={4} className={`${fieldClass} resize-none`} placeholder="Describe what this service entails…" {...register('summary')} />
            {errors.summary && <p className="mt-1 text-xs text-red-400">{errors.summary.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">Problem Solved</label>
            <input type="text" className={fieldClass} placeholder="e.g. Poor organic visibility due to technical blockers" {...register('problemSolved')} />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">Deliverables <span className="text-neutral-600">(comma separated)</span></label>
            <input type="text" className={fieldClass} placeholder="Audit PDF, Prioritized Roadmap, Strategy Call" {...register('deliverables')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Min Price ($)</label>
              <input type="number" className={fieldClass} placeholder="2500" {...register('priceMin')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Max Price ($)</label>
              <input type="number" className={fieldClass} placeholder="5000" {...register('priceMax')} />
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input type="checkbox" className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-neutral-900" {...register('isActive')} />
            <span className="text-sm font-medium text-neutral-300">Active service <span className="text-neutral-600">(included in AI matching)</span></span>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/settings/services" className="inline-flex h-10 items-center rounded-xl border border-neutral-700 px-5 text-sm font-medium text-neutral-300 hover:bg-neutral-800 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={isSubmitting} className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-black hover:bg-neutral-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Check className="w-4 h-4" /> Save changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
