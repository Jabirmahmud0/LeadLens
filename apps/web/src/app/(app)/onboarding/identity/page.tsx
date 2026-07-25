'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ArrowRight } from 'lucide-react';
import { saveAgencyIdentity } from '../actions';

const identitySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  website: z.string().url('Must be a valid URL').or(z.literal('')),
  country: z.string().min(1, 'Country is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  description: z.string().max(500, 'Keep it under 500 characters'),
  teamSize: z.string().min(1, 'Team size is required'),
  primaryCategory: z.string().min(1, 'Primary category is required'),
});

type IdentityFormValues = z.infer<typeof identitySchema>;

export default function IdentityStep() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<IdentityFormValues>({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      name: '',
      website: '',
      country: 'US',
      timezone: 'UTC',
      description: '',
      teamSize: '1-10',
      primaryCategory: 'SEO',
    }
  });

  const formValues = watch();

  const onSubmit = async (data: IdentityFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await saveAgencyIdentity(data);
    } catch (err: any) {
      setError(err.message || 'Failed to save');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-neutral-950">
      
      {/* Form Section */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 lg:p-16">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-light text-white">Agency Identity</h1>
            <p className="mt-2 text-neutral-400">Tell us about your agency. This information will be used to personalize the audits you generate for prospects.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {error && (
              <div className="p-4 rounded-xl bg-red-950/50 border border-red-900/50 text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300" htmlFor="name">Agency Name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Acme Digital"
                  className="block w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white placeholder-neutral-600 focus:border-white focus:ring-1 focus:ring-white transition-colors"
                  {...register('name')}
                />
                {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300" htmlFor="website">Website</label>
                <input
                  id="website"
                  type="text"
                  placeholder="https://acmedigital.com"
                  className="block w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white placeholder-neutral-600 focus:border-white focus:ring-1 focus:ring-white transition-colors"
                  {...register('website')}
                />
                {errors.website && <p className="text-xs text-red-400">{errors.website.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300" htmlFor="description">Short Description / Tagline</label>
              <input
                id="description"
                type="text"
                placeholder="We scale b2b saas using technical SEO."
                className="block w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white placeholder-neutral-600 focus:border-white focus:ring-1 focus:ring-white transition-colors"
                {...register('description')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300" htmlFor="country">Country</label>
                <select
                  id="country"
                  className="block w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-white focus:ring-1 focus:ring-white transition-colors appearance-none"
                  {...register('country')}
                >
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300" htmlFor="timezone">Timezone</label>
                <select
                  id="timezone"
                  className="block w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-white focus:ring-1 focus:ring-white transition-colors appearance-none"
                  {...register('timezone')}
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">EST</option>
                  <option value="PST">PST</option>
                  <option value="GMT">GMT</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300" htmlFor="teamSize">Team Size</label>
                <select
                  id="teamSize"
                  className="block w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-white focus:ring-1 focus:ring-white transition-colors appearance-none"
                  {...register('teamSize')}
                >
                  <option value="1">Solo</option>
                  <option value="2-5">2 - 5</option>
                  <option value="6-10">6 - 10</option>
                  <option value="11-50">11 - 50</option>
                  <option value="50+">50+</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300" htmlFor="primaryCategory">Primary Service Category</label>
                <select
                  id="primaryCategory"
                  className="block w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-white focus:ring-1 focus:ring-white transition-colors appearance-none"
                  {...register('primaryCategory')}
                >
                  <option value="SEO">SEO</option>
                  <option value="PPC">Paid Advertising</option>
                  <option value="WebDev">Web Development</option>
                  <option value="Content">Content Marketing</option>
                  <option value="FullService">Full Service / General</option>
                </select>
              </div>
            </div>

            <div className="pt-8 border-t border-neutral-800 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex items-center justify-center rounded-xl bg-white px-8 py-3 text-sm font-medium text-black hover:bg-neutral-200 focus:outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Continue to Services
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Live Preview Section */}
      <div className="w-full md:w-[400px] lg:w-[500px] border-t md:border-t-0 md:border-l border-neutral-800 bg-neutral-950 p-6 sm:p-10 flex flex-col items-center">
        <div className="w-full max-w-sm sticky top-10">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-6 text-center">
            Live Audit Cover Preview
          </div>
          
          {/* Mock Audit Cover Component */}
          <div className="aspect-[1/1.4] w-full bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col relative transform transition-all hover:scale-[1.02] duration-500">
            {/* Header / Brand Bar */}
            <div className="h-16 bg-black flex items-center px-6">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center font-bold text-black text-xs mr-3">
                {formValues.name ? formValues.name.substring(0,2).toUpperCase() : 'LL'}
              </div>
              <div className="font-bold text-white tracking-wide truncate">
                {formValues.name || 'Your Agency Name'}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-8 flex flex-col justify-center">
              <div className="text-neutral-400 font-medium tracking-widest text-xs uppercase mb-2">Technical Analysis</div>
              <h2 className="text-3xl font-black text-black leading-none mb-6">
                Growth Audit & Opportunity Roadmap
              </h2>
              
              <div className="space-y-4 text-sm text-neutral-600">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Performance bottleneck analysis
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  SEO architecture review
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Security vulnerability sweep
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-neutral-100 flex justify-between items-end">
              <div>
                <div className="text-[10px] text-neutral-400 font-medium uppercase mb-1">Prepared For</div>
                <div className="text-sm font-bold text-black">Prospect Company</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-neutral-400 font-medium uppercase mb-1">Prepared By</div>
                <div className="text-sm font-bold text-black truncate max-w-[120px]">{formValues.name || 'Your Agency'}</div>
                <div className="text-[10px] text-neutral-500 truncate max-w-[120px]">{formValues.website || 'website.com'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
