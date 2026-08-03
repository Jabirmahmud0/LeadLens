'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight, BarChart3, Check, FileCheck2, Loader2, LockKeyhole, Mail, ShieldCheck, Sparkles, UserRound, UsersRound } from 'lucide-react';
import { BILLING_PLANS } from '@leadlens/shared';
import styles from '../auth.module.css';

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  organizationName: z.string().trim().min(2, 'Agency name must be at least 2 characters').max(120, 'Agency name is too long'),
  email: z.string().trim().email('Please enter a valid email address').max(254, 'Email is too long'),
  password: z.string().min(15, 'Use at least 15 characters').max(128, 'Password must be 128 characters or fewer'),
  plan: z.enum(['free', 'solo', 'agency']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const INSIGHTS = [
  { icon: ShieldCheck, eyebrow: 'Evidence integrity', title: 'Sources stay attached.', description: 'Review what was observed, what was inferred, and what could not be verified.' },
  { icon: FileCheck2, eyebrow: 'Team control', title: 'Everything stays editable.', description: 'Shape the brief with your judgment before it reaches a prospect or client.' },
  { icon: BarChart3, eyebrow: 'Commercial context', title: 'Match findings to your services.', description: 'Turn website signals into an opportunity grounded in what your agency can deliver.' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [activeInsight, setActiveInsight] = useState(0);
  const [paused, setPaused] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { plan: 'free' },
  });
  const selectedPlan = watch('plan');

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const initialUrl = searchParams.get('url');
    if (initialUrl) window.localStorage.setItem('leadlens_initial_url', initialUrl);
    const requestedPlan = searchParams.get('plan');
    if (requestedPlan === 'solo' || requestedPlan === 'agency') setValue('plan', requestedPlan);
  }, [setValue]);

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => setActiveInsight((current) => (current + 1) % INSIGHTS.length), 4500);
    return () => window.clearTimeout(timer);
  }, [activeInsight, paused]);

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);
    try {
      const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) setServerError(result.error || 'Registration failed');
      else {
        window.localStorage.removeItem('leadlens_selected_plan');
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
    }
  };

  const inputClass = 'block h-12 w-full rounded-xl border border-[#cfddd3] bg-[#fbfdfb] pl-11 pr-4 text-sm text-[#10251d] outline-none transition placeholder:text-[#91a49a] focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100';
  const active = INSIGHTS[activeInsight];
  const InsightIcon = active.icon;

  return (
    <div className="mx-auto grid w-full max-w-7xl overflow-hidden rounded-[2rem] border border-[#cfe0d3] bg-white shadow-[0_38px_90px_-56px_rgba(20,83,45,0.55)] lg:grid-cols-[0.88fr_1.12fr]">
      <section
        className={`${styles.enter} relative order-2 min-h-[520px] overflow-hidden border-t border-[#cfe0d3] bg-[#eaf5ed] p-7 sm:p-10 lg:order-1 lg:min-h-[700px] lg:border-r lg:border-t-0 lg:p-12`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        aria-label="Why agencies use LeadLens"
      >
        <div className={styles.scan} />
        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700"><Sparkles className="size-3.5" />Your first brief starts here</span><span className="text-[10px] font-semibold text-[#789084]">0{activeInsight + 1} / 03</span></div>

          <div key={activeInsight} className={`${styles.enter} my-auto py-14`}>
            <span className="grid size-14 place-items-center rounded-2xl bg-[#16352a] text-emerald-300 shadow-lg"><InsightIcon className="size-6" /></span>
            <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">{active.eyebrow}</p>
            <h2 className={`${styles.display} mt-3 max-w-lg text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-5xl`}>{active.title}</h2>
            <p className="mt-5 max-w-md text-base leading-7 text-[#587066]">{active.description}</p>
          </div>

          <div>
            <div className="flex gap-2">{INSIGHTS.map((insight, index) => <button key={insight.title} type="button" aria-label={`Show ${insight.title}`} onClick={() => setActiveInsight(index)} className={`relative h-1.5 overflow-hidden rounded-full transition-all ${index === activeInsight ? 'w-14 bg-emerald-200' : 'w-5 bg-[#c9dbce]'}`}>{index === activeInsight && <span className={`${styles.progress} absolute inset-0 bg-emerald-600`} style={{ animationPlayState: paused ? 'paused' : 'running', animationDuration: '4.5s' }} />}</button>)}</div>
            <div className="mt-7 grid grid-cols-3 gap-2">{[['01','Create'],['02','Verify'],['03','Analyze']].map(([number,label],index) => <div key={number} className={`rounded-xl border p-3 ${index === 0 ? 'border-emerald-300 bg-white' : 'border-[#d2e2d6] bg-white/50'}`}><p className="font-mono text-[9px] text-emerald-700">{number}</p><p className="mt-3 text-xs font-semibold">{label}</p></div>)}</div>
          </div>
        </div>
      </section>

      <section className={`${styles.enter} ${styles.delay} order-1 p-6 sm:p-9 lg:order-2 lg:p-12`}>
        <div className="mx-auto max-w-xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Create your workspace</p>
          <h1 className={`${styles.display} mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl`}>Build your first brief.</h1>
          <p className="mt-3 text-sm leading-6 text-[#60766b]">Set up your agency workspace, then analyze a real prospect.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            {serverError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">{serverError}</div>}
            <div className="grid gap-5 sm:grid-cols-2">
              <div><label className="mb-2 block text-xs font-semibold text-[#365246]" htmlFor="fullName">Full name</label><div className="relative"><UserRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#789084]" /><input id="fullName" type="text" autoComplete="name" maxLength={100} placeholder="Jane Doe" aria-invalid={Boolean(errors.fullName)} className={inputClass} {...register('fullName')} /></div>{errors.fullName && <p className="mt-1.5 text-xs text-rose-600">{errors.fullName.message}</p>}</div>
              <div><label className="mb-2 block text-xs font-semibold text-[#365246]" htmlFor="organizationName">Agency name</label><div className="relative"><UsersRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#789084]" /><input id="organizationName" type="text" autoComplete="organization" maxLength={120} placeholder="Acme Digital" aria-invalid={Boolean(errors.organizationName)} className={inputClass} {...register('organizationName')} /></div>{errors.organizationName && <p className="mt-1.5 text-xs text-rose-600">{errors.organizationName.message}</p>}</div>
            </div>
              <div><label className="mb-2 block text-xs font-semibold text-[#365246]" htmlFor="email">Work email</label><div className="relative"><Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#789084]" /><input suppressHydrationWarning id="email" type="email" autoComplete="email" maxLength={254} placeholder="jane@agency.com" aria-invalid={Boolean(errors.email)} className={inputClass} {...register('email')} /></div>{errors.email && <p className="mt-1.5 text-xs text-rose-600">{errors.email.message}</p>}</div>
            <div><div className="mb-2 flex items-center justify-between"><label className="text-xs font-semibold text-[#365246]" htmlFor="password">Password</label><span className="text-[10px] font-medium text-[#789084]">15–128 characters</span></div><div className="relative"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#789084]" /><input id="password" type="password" autoComplete="new-password" minLength={15} maxLength={128} placeholder="Create a secure passphrase" aria-invalid={Boolean(errors.password)} className={inputClass} {...register('password')} /></div>{errors.password && <p className="mt-1.5 text-xs text-rose-600">{errors.password.message}</p>}</div>
            <input type="hidden" {...register('plan')} />
            {selectedPlan !== 'free' && (
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Selected from pricing</p>
                  <p className="mt-1 text-sm font-semibold text-[#16352a]">{BILLING_PLANS[selectedPlan].name} · {BILLING_PLANS[selectedPlan].priceLabel}/month</p>
                  <p className="mt-0.5 text-[10px] text-[#60766b]">You’ll review and confirm this after email verification.</p>
                </div>
                <button type="button" onClick={() => setValue('plan', 'free')} className="shrink-0 text-xs font-semibold text-emerald-800 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-600">Choose later</button>
              </div>
            )}
            <button type="submit" disabled={isSubmitting} className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#166534] text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#14532d] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? <Loader2 className="size-5 animate-spin" /> : <>Create account <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></>}</button>
          </form>

          <p className="mt-5 text-[10px] leading-5 text-[#789084]">By creating an account, you agree to the <Link href="/terms" className="font-semibold text-emerald-800">Terms</Link> and acknowledge the <Link href="/privacy" className="font-semibold text-emerald-800">Privacy Policy</Link>.</p>
          <p className="mt-6 text-sm text-[#60766b]">Already have an account? <Link href="/login" className="font-semibold text-emerald-800 hover:text-emerald-600">Sign in</Link></p>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#e0e9e2] pt-6 text-[10px] font-medium text-[#789084]">{['No card for Hobby', 'Public data only', 'Editable output'].map((item) => <span key={item} className="flex items-center gap-1.5"><Check className="size-3.5 text-emerald-600" />{item}</span>)}</div>
        </div>
      </section>
    </div>
  );
}
