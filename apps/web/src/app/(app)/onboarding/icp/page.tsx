'use client';

import React, { useState, ComponentType } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ArrowRight, Target, AlertTriangle, Lightbulb, Users, DollarSign } from 'lucide-react';
import { saveAgencyICP } from '../actions';

const icpSchema = z.object({
  companySizeRange: z.array(z.string()).optional(),
  targetIndustries: z.array(z.string()).optional(),
  targetLocations: z.array(z.string()).optional(),
  minBudget: z.number().min(0).optional(),
  preferredWebsiteCondition: z.array(z.string()).optional(),
  decisionMakers: z.array(z.string()).optional(),
  buyingSignals: z.array(z.string()).optional(),
  disqualifyingFactors: z.array(z.string()).optional(),
  commonProblems: z.array(z.string()).optional(),
});

type ICPFormValues = z.infer<typeof icpSchema>;

function MultiSelect({ value, onChange, options, icon: Icon }: { value: string[], onChange: (v: string[]) => void, options: string[], icon: ComponentType<{ className?: string }> }) {
  const toggle = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter(v => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map(opt => {
        const isSelected = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors border flex items-center gap-2 \${
              isSelected 
                ? 'bg-white text-black border-white' 
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-600'
            }`}
          >
            {isSelected && <Icon className="w-3.5 h-3.5" />}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export default function ICPStep() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, control, handleSubmit, formState: { errors } } = useForm<ICPFormValues>({
    resolver: zodResolver(icpSchema),
    defaultValues: {
      companySizeRange: ['10-50'],
      targetIndustries: ['B2B SaaS'],
      targetLocations: ['North America'],
      minBudget: 5000,
      preferredWebsiteCondition: ['Outdated Design', 'Slow Performance'],
      decisionMakers: ['CMO', 'CEO'],
      buyingSignals: ['Recent Funding', 'Hiring Marketing Roles'],
      disqualifyingFactors: ['B2C E-commerce', 'No Budget'],
      commonProblems: ['Low Traffic', 'Poor Conversion Rate'],
    }
  });

  const onSubmit = async (data: ICPFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await saveAgencyICP({
        ...data,
        companySizeRange: data.companySizeRange ?? [],
        targetIndustries: data.targetIndustries ?? [],
        targetLocations: data.targetLocations ?? [],
        preferredWebsiteCondition: data.preferredWebsiteCondition ?? [],
        decisionMakers: data.decisionMakers ?? [],
        buyingSignals: data.buyingSignals ?? [],
        disqualifyingFactors: data.disqualifyingFactors ?? [],
        commonProblems: data.commonProblems ?? [],
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err) || 'Failed to save');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-neutral-950 flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 lg:p-16 max-w-4xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="text-3xl font-light text-white">Ideal Customer Profile</h1>
          <p className="mt-2 text-neutral-400">
            Tell LeadLens who your best clients are. The AI will use these signals to qualify or disqualify prospects during analysis.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {error && (
            <div className="p-4 rounded-xl bg-red-950/50 border border-red-900/50 text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Demographics */}
          <section className="space-y-6 bg-neutral-900/50 p-6 sm:p-8 rounded-2xl border border-neutral-800">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
              <Users className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-medium text-white">Firmographics</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-300">Company Size</label>
              <Controller
                control={control}
                name="companySizeRange"
                render={({ field }) => (
                  <MultiSelect 
                    value={field.value} 
                    onChange={field.onChange} 
                    icon={Target}
                    options={['1-10', '10-50', '50-200', '200-500', '500-1000', '1000+']} 
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300">Target Industries</label>
              <Controller
                control={control}
                name="targetIndustries"
                render={({ field }) => (
                  <MultiSelect 
                    value={field.value} 
                    onChange={field.onChange} 
                    icon={Target}
                    options={['B2B SaaS', 'E-commerce', 'Healthcare', 'Finance', 'Real Estate', 'Local Services', 'Manufacturing', 'Legal']} 
                  />
                )}
              />
            </div>
          </section>

          {/* Technical Qualification */}
          <section className="space-y-6 bg-neutral-900/50 p-6 sm:p-8 rounded-2xl border border-neutral-800">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-medium text-white">Technical Qualification</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-300">Preferred Website Condition</label>
              <p className="text-xs text-neutral-500 mt-1 mb-2">What website traits indicate a good prospect for you?</p>
              <Controller
                control={control}
                name="preferredWebsiteCondition"
                render={({ field }) => (
                  <MultiSelect 
                    value={field.value} 
                    onChange={field.onChange} 
                    icon={Target}
                    options={['Outdated Design', 'Slow Performance', 'No SSL', 'Poor Mobile Score', 'Missing Core Web Vitals', 'Thin Content', 'No Schema Markup']} 
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300">Common Problems Solved</label>
              <Controller
                control={control}
                name="commonProblems"
                render={({ field }) => (
                  <MultiSelect 
                    value={field.value} 
                    onChange={field.onChange} 
                    icon={Target}
                    options={['Low Traffic', 'Poor Conversion Rate', 'High Bounce Rate', 'Stagnant Growth', 'Lost Rankings', 'Technical Debt']} 
                  />
                )}
              />
            </div>
          </section>

          {/* Disqualifiers */}
          <section className="space-y-6 bg-neutral-900/50 p-6 sm:p-8 rounded-2xl border border-neutral-800">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-medium text-white">Red Flags & Disqualifiers</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-300">Minimum Budget ($)</label>
              <div className="mt-2 relative rounded-xl shadow-sm max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-4 w-4 text-neutral-500" />
                </div>
                <input
                  type="number"
                  className="block w-full pl-10 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-white focus:border-white focus:ring-1 focus:ring-white transition-colors"
                  placeholder="5000"
                  {...register('minBudget', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300">Disqualifying Factors</label>
              <p className="text-xs text-neutral-500 mt-1 mb-2">What signals make you immediately reject a lead?</p>
              <Controller
                control={control}
                name="disqualifyingFactors"
                render={({ field }) => (
                  <MultiSelect 
                    value={field.value} 
                    onChange={field.onChange} 
                    icon={AlertTriangle}
                    options={['B2C E-commerce', 'No Budget', 'Do-it-yourself mentality', 'Pre-revenue Startups', 'Non-profits', 'Adult/Gambling']} 
                  />
                )}
              />
            </div>
          </section>

          <div className="pt-4 flex justify-between items-center sticky bottom-0 bg-neutral-950/80 backdrop-blur-xl py-6 border-t border-neutral-800">
            <button
              type="button"
              className="text-neutral-400 hover:text-white text-sm font-medium transition-colors"
            >
              Skip for now
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
                  Continue to Case Studies
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
