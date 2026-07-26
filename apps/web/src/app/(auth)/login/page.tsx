'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight, CheckCircle2, FileSearch, Loader2, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import styles from '../auth.module.css';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) setServerError(result.error || 'Failed to login');
      else { router.push('/dashboard'); router.refresh(); }
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
    }
  };

  const inputClass = 'block h-12 w-full rounded-xl border border-[#cfddd3] bg-[#fbfdfb] pl-11 pr-4 text-sm text-[#10251d] outline-none transition placeholder:text-[#91a49a] focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100';

  return (
    <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#cfe0d3] bg-white shadow-[0_38px_90px_-56px_rgba(20,83,45,0.55)] lg:grid-cols-[0.88fr_1.12fr]">
      <section className={`${styles.enter} p-6 sm:p-9 lg:p-12`}>
        <div className="max-w-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Workspace access</p>
          <h1 className={`${styles.display} mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl`}>Welcome back.</h1>
          <p className="mt-3 text-sm leading-6 text-[#60766b]">Sign in to continue your prospect research and briefs.</p>

          <form className="mt-9 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            {serverError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">{serverError}</div>}
            <div>
              <label className="mb-2 block text-xs font-semibold text-[#365246]" htmlFor="email">Email address</label>
              <div className="relative"><Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#789084]" /><input suppressHydrationWarning id="email" type="email" autoComplete="email" placeholder="name@agency.com" aria-invalid={Boolean(errors.email)} className={inputClass} {...register('email')} /></div>
              {errors.email && <p className="mt-1.5 text-xs text-rose-600">{errors.email.message}</p>}
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between"><label className="text-xs font-semibold text-[#365246]" htmlFor="password">Password</label><Link href="/forgot-password" className="text-xs font-semibold text-emerald-700 hover:text-emerald-900">Forgot password?</Link></div>
              <div className="relative"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#789084]" /><input id="password" type="password" autoComplete="current-password" placeholder="Enter your password" aria-invalid={Boolean(errors.password)} className={inputClass} {...register('password')} /></div>
              {errors.password && <p className="mt-1.5 text-xs text-rose-600">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#166534] text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#14532d] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : <>Sign in <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></>}
            </button>
          </form>

          <p className="mt-7 text-sm text-[#60766b]">New to LeadLens? <Link href="/register" className="font-semibold text-emerald-800 hover:text-emerald-600">Create an account</Link></p>
          <div className="mt-8 flex items-center gap-2 border-t border-[#e0e9e2] pt-6 text-[10px] font-medium text-[#789084]"><ShieldCheck className="size-3.5 text-emerald-600" /> Secure session and hashed credentials</div>
        </div>
      </section>

      <section className={`${styles.enter} ${styles.delay} relative hidden min-h-[650px] overflow-hidden border-l border-[#cfe0d3] bg-[#edf7f0] p-10 lg:block`} aria-label="LeadLens workspace preview">
        <div className={styles.scan} />
        <div className="flex items-center justify-between"><div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700"><span className="size-1.5 rounded-full bg-emerald-500" />Workspace recovered</div><span className="text-[10px] font-semibold text-[#789084]">Last active today</span></div>
        <div className={`${styles.float} mx-auto mt-16 max-w-lg overflow-hidden rounded-[1.5rem] border border-[#cfddd3] bg-white shadow-[0_30px_70px_-44px_rgba(20,83,45,0.55)]`}>
          <div className="flex items-center justify-between border-b border-[#e1e9e3] px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#16352a] text-white"><FileSearch className="size-4" /></span><div><p className="text-xs font-semibold">Your research queue</p><p className="mt-0.5 text-[9px] text-[#789084]">3 briefs need attention</p></div></div><Sparkles className="size-4 text-emerald-600" /></div>
          <div className="bg-[#f7faf7] p-4">
            <div className="grid grid-cols-3 gap-2">{[['12','Findings'],['4','Matches'],['3','Briefs']].map(([value,label]) => <div key={label} className="rounded-xl border border-[#dce6df] bg-white p-3"><p className="text-xl font-semibold">{value}</p><p className="mt-1 text-[9px] uppercase tracking-wider text-[#789084]">{label}</p></div>)}</div>
            <div className="mt-3 space-y-2">
              {[
                ['Northstar Studio', 'Brief ready', true],
                ['Evergreen Labs', 'Evidence review', false],
                ['Form & Field', 'Service matching', false],
              ].map(([name,status,ready]) => <div key={name as string} className="flex items-center gap-3 rounded-xl border border-[#dce6df] bg-white p-3"><span className={`grid size-8 place-items-center rounded-lg ${ready ? 'bg-emerald-50 text-emerald-600' : 'bg-[#f0f4f1] text-[#789084]'}`}>{ready ? <CheckCircle2 className="size-4" /> : <FileSearch className="size-4" />}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{name as string}</p><p className="mt-0.5 text-[9px] text-[#789084]">{status as string}</p></div><ArrowRight className="size-3.5 text-[#91a49a]" /></div>)}
            </div>
          </div>
        </div>
        <p className="absolute bottom-10 left-10 right-10 text-center text-xs leading-5 text-[#60766b]">Pick up exactly where your team left the evidence trail.</p>
      </section>
    </div>
  );
}
