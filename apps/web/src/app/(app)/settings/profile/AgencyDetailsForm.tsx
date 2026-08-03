'use client';

import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, CheckCircle2, ChevronDown, Loader2, MapPin, Users } from 'lucide-react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import * as z from 'zod';
import type { SelectOption } from '@/lib/agency-profile-options';
import { PRIMARY_SERVICE_OPTIONS, TEAM_SIZE_OPTIONS } from '@/lib/agency-profile-options';
import { saveAgencyDetails } from './actions';

const identitySchema = z.object({
  name: z.string().trim().min(2, 'Enter your agency name'),
  website: z.string().trim().url('Enter a valid URL, including https://').or(z.literal('')),
  country: z.string().min(1, 'Select a country'),
  timezone: z.string().min(1, 'Select a timezone'),
  description: z.string().trim().max(500, 'Keep it under 500 characters'),
  teamSize: z.string().min(1, 'Select a team size'),
  primaryCategory: z.string().min(1, 'Select a primary service'),
});

export type AgencyDetailsFormValues = z.infer<typeof identitySchema>;

type Props = {
  initialValues: AgencyDetailsFormValues;
  countryOptions: SelectOption[];
  timeZoneOptions: SelectOption[];
  saved?: boolean;
};

const fieldClass = 'block h-12 w-full rounded-xl border border-[#cfddd3] bg-white px-4 text-[15px] text-[#10251d] outline-none transition focus:border-[#15803d] focus:ring-4 focus:ring-[#15803d]/10 placeholder:text-[#91a49a]';
const selectClass = `${fieldClass} appearance-none pr-10`;

function includeCurrent(options: SelectOption[], value: string, label = 'Current selection') {
  if (!value || options.some((o) => o.value === value)) return options;
  return [{ value, label: `${label} — ${value}` }, ...options];
}

function SelectField({ id, label, options, error, registration }: {
  id: keyof AgencyDetailsFormValues;
  label: string;
  options: SelectOption[];
  error?: string;
  registration: UseFormRegisterReturn;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[#29483b]" htmlFor={id}>{label}</label>
      <div className="relative">
        <select id={id} className={selectClass} {...registration} aria-invalid={Boolean(error)}>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6f887c]" />
      </div>
      {error && <p className="text-xs font-medium text-rose-700">{error}</p>}
    </div>
  );
}

export function AgencyDetailsForm({ initialValues, countryOptions, timeZoneOptions, saved }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<AgencyDetailsFormValues>({
    resolver: zodResolver(identitySchema),
    defaultValues: initialValues,
  });
  const formValues = watch();

  const countries = useMemo(() => includeCurrent(countryOptions, initialValues.country, 'Saved country'), [countryOptions, initialValues.country]);
  const timeZones = useMemo(() => includeCurrent(timeZoneOptions, initialValues.timezone, 'Saved timezone'), [timeZoneOptions, initialValues.timezone]);
  const teamSizes = useMemo(() => includeCurrent(TEAM_SIZE_OPTIONS, initialValues.teamSize, 'Saved team size'), [initialValues.teamSize]);
  const primaryServices = useMemo(() => includeCurrent(PRIMARY_SERVICE_OPTIONS, initialValues.primaryCategory, 'Saved category'), [initialValues.primaryCategory]);

  const selectedCountry = countries.find((o) => o.value === formValues.country)?.label ?? formValues.country;
  const selectedTeamSize = teamSizes.find((o) => o.value === formValues.teamSize)?.label ?? formValues.teamSize;

  const onSubmit = async (data: AgencyDetailsFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await saveAgencyDetails(data);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Could not save. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <div className="flex-1 py-6 lg:pr-10">
        <div className="mx-auto max-w-2xl">
          {saved && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              <CheckCircle2 className="size-4 shrink-0" />
              Agency details saved successfully.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7" noValidate>
            {submitError && (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{submitError}</div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#29483b]" htmlFor="name">Agency name</label>
                <input id="name" type="text" placeholder="Acme Digital" className={fieldClass} {...register('name')} aria-invalid={Boolean(errors.name)} />
                {errors.name && <p className="text-xs font-medium text-rose-700">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#29483b]" htmlFor="website">Website</label>
                <input id="website" type="url" placeholder="https://acmedigital.com" className={fieldClass} {...register('website')} aria-invalid={Boolean(errors.website)} />
                {errors.website && <p className="text-xs font-medium text-rose-700">{errors.website.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <label className="block text-sm font-semibold text-[#29483b]" htmlFor="description">Short description / tagline</label>
                <span className="text-xs text-[#789084]">{formValues.description?.length ?? 0}/500</span>
              </div>
              <textarea id="description" rows={3} placeholder="We help B2B SaaS teams grow through technical SEO and conversion-focused design." className={`${fieldClass} h-auto min-h-24 resize-y py-3`} {...register('description')} aria-invalid={Boolean(errors.description)} />
              {errors.description && <p className="text-xs font-medium text-rose-700">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <SelectField id="country" label="Country or territory" options={countries} registration={register('country')} error={errors.country?.message} />
              <SelectField id="timezone" label="Timezone" options={timeZones} registration={register('timezone')} error={errors.timezone?.message} />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <SelectField id="teamSize" label="Team size" options={teamSizes} registration={register('teamSize')} error={errors.teamSize?.message} />
              <SelectField id="primaryCategory" label="Primary service category" options={primaryServices} registration={register('primaryCategory')} error={errors.primaryCategory?.message} />
            </div>

            <div className="flex flex-col gap-4 border-t border-[#dce7df] pt-7 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-sm text-xs leading-5 text-[#789084]">Changes apply immediately to all future analyses and reports.</p>
              <button type="submit" disabled={isSubmitting} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#166534] px-7 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(22,101,52,0.18)] transition hover:-translate-y-0.5 hover:bg-[#14532d] disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? <><Loader2 className="size-4 animate-spin" /> Saving…</> : <><Check className="size-4" /> Save changes</>}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Live preview sidebar */}
      <aside className="w-full shrink-0 border-t border-[#dce7df] bg-[#f0f7f1] px-6 py-8 lg:w-[340px] lg:border-l lg:border-t-0 xl:w-[380px] xl:px-8 xl:py-10">
        <div className="lg:sticky lg:top-24">
          {/* Label row */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Live preview</p>
              <p className="mt-0.5 text-xs text-[#789084]">Updates as you type</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" /> Live
            </span>
          </div>

          {/* Report cover card */}
          <div className="overflow-hidden rounded-2xl border border-[#c8dece] bg-white shadow-[0_16px_48px_-16px_rgba(22,53,42,0.20)]">
            {/* Green header */}
            <div className="bg-gradient-to-br from-[#14532d] to-[#166634] px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/15 text-sm font-bold text-white">
                  {formValues.name ? formValues.name.slice(0, 2).toUpperCase() : 'LL'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-white leading-snug">{formValues.name || 'Your Agency Name'}</div>
                  <div className="truncate text-[10px] text-emerald-200 mt-0.5 leading-none">{formValues.primaryCategory || 'Digital growth partner'}</div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-5">
              <div className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">Growth intelligence report</div>
              <h3 className="mb-4 text-lg font-bold leading-tight tracking-[-0.03em] text-[#10251d]">
                Growth audit &amp;<br />opportunity roadmap
              </h3>
              <div className="space-y-2">
                {['Conversion bottleneck analysis', 'Search & content opportunity map', 'Source-backed next steps'].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="mt-[5px] size-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span className="text-[11px] leading-5 text-[#52675e]">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-[#eff8f1] px-3 py-2.5">
                  <MapPin className="mb-1 size-3 text-emerald-700" />
                  <div className="truncate text-[10px] font-semibold text-[#29483b]">{selectedCountry || 'Your market'}</div>
                </div>
                <div className="rounded-xl bg-[#fff8e8] px-3 py-2.5">
                  <Users className="mb-1 size-3 text-amber-600" />
                  <div className="truncate text-[10px] font-semibold text-[#5f4923]">{selectedTeamSize || 'Your team'}</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[#e5ece7] bg-[#f9fbf9] px-5 py-3">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#91a49a]">Prepared for</div>
                <div className="text-[11px] font-semibold text-[#10251d]">Prospect Company</div>
              </div>
              <div className="text-right max-w-[130px]">
                <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#91a49a]">Prepared by</div>
                <div className="truncate text-[11px] font-semibold text-[#10251d]">{formValues.name || 'Your Agency'}</div>
                <div className="truncate text-[9px] text-[#789084]">{formValues.website || 'youragency.com'}</div>
              </div>
            </div>
          </div>

          {/* Tagline preview */}
          {formValues.description && (
            <div className="mt-3 rounded-xl border border-[#dce7df] bg-white px-4 py-3">
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#789084]">Your tagline</p>
              <p className="text-[11px] text-[#3d5a4a] leading-relaxed line-clamp-3">{formValues.description}</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
