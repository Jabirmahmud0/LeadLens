'use client';

import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Check, ChevronDown, Loader2, MapPin, Users } from 'lucide-react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import * as z from 'zod';
import type { SelectOption } from '@/lib/agency-profile-options';
import { PRIMARY_SERVICE_OPTIONS, TEAM_SIZE_OPTIONS } from '@/lib/agency-profile-options';
import { saveAgencyIdentity } from '../actions';

const identitySchema = z.object({
  name: z.string().trim().min(2, 'Enter your agency name'),
  website: z.string().trim().url('Enter a valid URL, including https://').or(z.literal('')),
  country: z.string().min(1, 'Select a country'),
  timezone: z.string().min(1, 'Select a timezone'),
  description: z.string().trim().max(500, 'Keep it under 500 characters'),
  teamSize: z.string().min(1, 'Select a team size'),
  primaryCategory: z.string().min(1, 'Select a primary service'),
});

export type IdentityFormValues = z.infer<typeof identitySchema>;

type IdentityFormProps = {
  initialValues: IdentityFormValues;
  countryOptions: SelectOption[];
  timeZoneOptions: SelectOption[];
};

const fieldClass = 'block h-12 w-full rounded-xl border border-[#cfddd3] bg-white px-4 text-[15px] text-[#10251d] outline-none transition focus:border-[#15803d] focus:ring-4 focus:ring-[#15803d]/10 placeholder:text-[#91a49a]';
const selectClass = `${fieldClass} appearance-none pr-10`;

function includeCurrent(options: SelectOption[], value: string, label = 'Current selection') {
  if (!value || options.some((option) => option.value === value)) return options;
  return [{ value, label: `${label} — ${value}` }, ...options];
}

function SelectField({
  id,
  label,
  options,
  error,
  registration,
}: {
  id: keyof IdentityFormValues;
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
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6f887c]" />
      </div>
      {error && <p className="text-xs font-medium text-rose-700">{error}</p>}
    </div>
  );
}

export function IdentityForm({ initialValues, countryOptions, timeZoneOptions }: IdentityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<IdentityFormValues>({
    resolver: zodResolver(identitySchema),
    defaultValues: initialValues,
  });
  const formValues = watch();

  const countries = useMemo(
    () => includeCurrent(countryOptions, initialValues.country, 'Saved country'),
    [countryOptions, initialValues.country],
  );
  const timeZones = useMemo(
    () => includeCurrent(timeZoneOptions, initialValues.timezone, 'Saved timezone'),
    [timeZoneOptions, initialValues.timezone],
  );
  const teamSizes = useMemo(
    () => includeCurrent(TEAM_SIZE_OPTIONS, initialValues.teamSize, 'Saved team size'),
    [initialValues.teamSize],
  );
  const primaryServices = useMemo(
    () => includeCurrent(PRIMARY_SERVICE_OPTIONS, initialValues.primaryCategory, 'Saved category'),
    [initialValues.primaryCategory],
  );

  const selectedCountry = countries.find((option) => option.value === formValues.country)?.label ?? formValues.country;
  const selectedTeamSize = teamSizes.find((option) => option.value === formValues.teamSize)?.label ?? formValues.teamSize;

  const onSubmit = async (data: IdentityFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await saveAgencyIdentity(data);
    } catch (submissionError: unknown) {
      setError(submissionError instanceof Error ? submissionError.message : 'We could not save your agency details. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col bg-[#f6f9f5] lg:flex-row">
      <div className="flex-1 px-5 py-9 sm:px-10 lg:px-12 lg:py-14 xl:px-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-9">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#cfe4d5] bg-[#ecf8ef] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#15803d]">
              <Check className="size-3" /> Profile foundation
            </div>
            <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[#10251d] sm:text-4xl">Agency identity</h1>
            <p className="mt-3 max-w-xl text-[15px] leading-6 text-[#60766b]">These details personalize every audit, recommendation, and client-ready document you create.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7" noValidate>
            {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}

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
              <p className="max-w-sm text-xs leading-5 text-[#789084]">You can return and change these details whenever your positioning evolves.</p>
              <button type="submit" disabled={isSubmitting} className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#166534] px-7 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(22,101,52,0.18)] transition hover:-translate-y-0.5 hover:bg-[#14532d] disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? <><Loader2 className="size-4 animate-spin" /> Saving…</> : <>Continue to services <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></>}
              </button>
            </div>
          </form>
        </div>
      </div>

      <aside className="w-full border-t border-[#dce7df] bg-[#eef5ef] px-5 py-9 lg:w-[430px] lg:border-l lg:border-t-0 xl:w-[500px] xl:px-10 xl:py-12">
        <div className="mx-auto max-w-sm lg:sticky lg:top-24">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#15803d]">Live audit cover</p>
              <p className="mt-1 text-xs text-[#789084]">Updates as you type</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-[#cfe4d5] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#52675e]"><span className="size-1.5 animate-pulse rounded-full bg-emerald-500" /> Live</span>
          </div>

          <div className="flex aspect-[1/1.35] w-full flex-col overflow-hidden rounded-[20px] border border-[#d7e3da] bg-white shadow-[0_24px_65px_rgba(22,53,42,0.14)] transition duration-500 hover:-translate-y-1">
            <div className="flex h-[76px] items-center bg-gradient-to-r from-[#14532d] to-[#15803d] px-6">
              <div className="mr-3 flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/15 text-xs font-bold text-[#ffffff] shadow-inner">
                {formValues.name ? formValues.name.slice(0, 2).toUpperCase() : 'LL'}
              </div>
              <div className="min-w-0">
                <div className="truncate text-[15px] font-bold tracking-[-0.01em] text-[#ffffff]">{formValues.name || 'Your Agency Name'}</div>
                <div className="mt-0.5 truncate text-[10px] font-medium text-[#d9fbe4]">{formValues.primaryCategory || 'Digital growth partner'}</div>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col justify-center px-8 py-9">
              <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#15803d]">Growth intelligence report</div>
              <h2 className="mb-6 text-[clamp(1.65rem,3vw,2rem)] font-bold leading-[0.98] tracking-[-0.045em] text-[#10251d]">Growth audit &amp;<br />opportunity roadmap</h2>
              <div className="space-y-3 text-xs leading-5 text-[#52675e]">
                {['Conversion bottleneck analysis', 'Search and content opportunity map', 'Source-backed recommended next steps'].map((item) => (
                  <div key={item} className="flex items-start gap-2.5"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#22a55b]" />{item}</div>
                ))}
              </div>
              <div className="mt-7 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-[#eff8f1] p-3"><MapPin className="mb-2 size-3.5 text-[#15803d]" /><div className="truncate text-[10px] font-semibold text-[#29483b]">{selectedCountry || 'Your market'}</div></div>
                <div className="rounded-xl bg-[#fff8e8] p-3"><Users className="mb-2 size-3.5 text-[#b7791f]" /><div className="truncate text-[10px] font-semibold text-[#5f4923]">{selectedTeamSize || 'Your team'}</div></div>
              </div>
            </div>

            <div className="flex items-end justify-between border-t border-[#e5ece7] bg-[#fbfcfa] px-8 py-5">
              <div><div className="mb-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#91a49a]">Prepared for</div><div className="text-xs font-bold text-[#10251d]">Prospect Company</div></div>
              <div className="max-w-[135px] text-right"><div className="mb-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#91a49a]">Prepared by</div><div className="truncate text-xs font-bold text-[#10251d]">{formValues.name || 'Your Agency'}</div><div className="truncate text-[9px] text-[#789084]">{formValues.website || 'youragency.com'}</div></div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
