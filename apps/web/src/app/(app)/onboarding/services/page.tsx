'use client';

import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ArrowRight, Plus, Trash2, GripVertical, Copy, Tag, CheckCircle2 } from 'lucide-react';
import { saveAgencyServices } from '../actions';

const serviceSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 chars'),
  problemSolved: z.string().optional(),
  deliverables: z.array(z.string()).optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  preferredIndustries: z.array(z.string()).optional(),
  disqualifiers: z.array(z.string()).optional(),
  priority: z.number().optional(),
  isActive: z.boolean().optional(),
});

const servicesSchema = z.object({
  services: z.array(serviceSchema).min(1, 'Add at least one service'),
});

type ServicesFormValues = z.infer<typeof servicesSchema>;

export default function ServicesStep() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ServicesFormValues>({
    resolver: zodResolver(servicesSchema),
    defaultValues: {
      services: [
        {
          name: 'Technical SEO Audit',
          description: 'Deep dive into site architecture, indexability, and performance.',
          problemSolved: 'Poor organic visibility due to technical blockers.',
          deliverables: ['Audit PDF', 'Prioritized Roadmap'],
          priceMin: 2500,
          priceMax: 5000,
          isActive: true,
          priority: 0,
          preferredIndustries: [],
          disqualifiers: [],
        }
      ]
    }
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'services',
  });

  const onSubmit = async (data: ServicesFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await saveAgencyServices(data.services.map(svc => ({
        ...svc,
        deliverables: svc.deliverables ?? [],
        preferredIndustries: svc.preferredIndustries ?? [],
        disqualifiers: svc.disqualifiers ?? [],
        priority: svc.priority ?? 0,
        isActive: svc.isActive ?? true,
      })));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err) || 'Failed to save');
      setIsSubmitting(false);
    }
  };

  const handleDuplicate = (index: number) => {
    const currentValues = watch(`services.\${index}`);
    append({ ...currentValues, name: `\${currentValues.name} (Copy)` });
  };

  return (
    <div className="flex-1 bg-neutral-950 flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 lg:p-16 max-w-5xl mx-auto w-full">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light text-white">Service Architecture</h1>
            <p className="mt-2 text-neutral-400 max-w-xl">
              Define the core services you offer. AI uses this to match technical issues found in prospect sites to your specific solutions and pricing.
            </p>
          </div>
          <button
            type="button"
            onClick={() => append({ name: '', description: '', deliverables: [], isActive: true, priority: fields.length })}
            className="flex items-center gap-2 rounded-xl bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-950/50 border border-red-900/50 text-red-200 text-sm">
              {error}
            </div>
          )}

          {errors.services?.root && (
            <div className="p-4 rounded-xl bg-red-950/50 border border-red-900/50 text-red-200 text-sm">
              {errors.services.root.message}
            </div>
          )}

          <div className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="relative group bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl transition-all hover:border-neutral-700">
                {/* Header bar */}
                <div className="bg-neutral-800/50 px-4 py-3 flex items-center justify-between border-b border-neutral-800">
                  <div className="flex items-center gap-3">
                    <button type="button" className="cursor-grab text-neutral-500 hover:text-white" aria-label="Reorder">
                      <GripVertical className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium text-white">Service {index + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => handleDuplicate(index)} className="p-1.5 text-neutral-500 hover:text-white rounded-md hover:bg-neutral-800" title="Duplicate">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => remove(index)} className="p-1.5 text-neutral-500 hover:text-red-400 rounded-md hover:bg-neutral-800" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1">Service Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Technical SEO Audit"
                        className="block w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-white focus:border-white focus:ring-1 focus:ring-white transition-colors"
                        {...register(`services.\${index}.name` as const)}
                      />
                      {errors.services?.[index]?.name && <p className="text-xs text-red-400 mt-1">{errors.services[index].name?.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1">Description</label>
                      <textarea
                        rows={3}
                        placeholder="Describe what this service entails..."
                        className="block w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-white focus:border-white focus:ring-1 focus:ring-white transition-colors resize-none"
                        {...register(`services.\${index}.description` as const)}
                      />
                      {errors.services?.[index]?.description && <p className="text-xs text-red-400 mt-1">{errors.services[index].description?.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1">Problem Solved</label>
                      <input
                        type="text"
                        placeholder="e.g. Low conversion rate"
                        className="block w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-white focus:border-white focus:ring-1 focus:ring-white transition-colors"
                        {...register(`services.\${index}.problemSolved` as const)}
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">Min Price ($)</label>
                        <input
                          type="number"
                          placeholder="2500"
                          className="block w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-white focus:border-white focus:ring-1 focus:ring-white transition-colors"
                          {...register(`services.\${index}.priceMin` as const, { valueAsNumber: true })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">Max Price ($)</label>
                        <input
                          type="number"
                          placeholder="5000"
                          className="block w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-white focus:border-white focus:ring-1 focus:ring-white transition-colors"
                          {...register(`services.\${index}.priceMax` as const, { valueAsNumber: true })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1">Deliverables (comma separated)</label>
                      <input
                        type="text"
                        placeholder="Audit PDF, Strategy Call, Keyword List"
                        className="block w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-white focus:border-white focus:ring-1 focus:ring-white transition-colors"
                        onChange={(e) => {
                          const val = e.target.value;
                          setValue(`services.\${index}.deliverables`, val.split(',').map(s => s.trim()).filter(Boolean));
                        }}
                        defaultValue={watch(`services.\${index}.deliverables`)?.join(', ')}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-white focus:ring-white focus:ring-offset-neutral-950" {...register(`services.\${index}.isActive` as const)} />
                        <span className="text-sm font-medium text-neutral-300">Active Service</span>
                      </label>
                      
                      <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-950 px-2.5 py-1 rounded-full border border-neutral-800">
                        <Tag className="w-3 h-3" />
                        AI Matched
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 flex justify-end sticky bottom-0 bg-neutral-950/80 backdrop-blur-xl py-6 border-t border-neutral-800">
            <button
              type="submit"
              disabled={isSubmitting || fields.length === 0}
              className="group relative flex items-center justify-center rounded-xl bg-white px-8 py-3 text-sm font-medium text-black hover:bg-neutral-200 focus:outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Continue to ICP
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
