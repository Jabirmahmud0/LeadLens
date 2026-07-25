'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || 'Failed to login');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setServerError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 bg-neutral-900/50 p-8 sm:p-10 rounded-3xl border border-neutral-800/50 backdrop-blur-xl shadow-2xl">
      <div className="text-center">
        {/* Animated Lens Scan Visual */}
        <div className="mx-auto w-16 h-16 relative mb-6 group">
          <div className="absolute inset-0 border-2 border-neutral-700 rounded-full" />
          <div className="absolute inset-2 border-2 border-dashed border-neutral-500 rounded-full animate-[spin_10s_linear_infinite]" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/40 -translate-y-1/2 animate-[scan_2s_ease-in-out_infinite_alternate]" />
          <style jsx>{`
            @keyframes scan {
              0% { transform: translateY(-16px); opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { transform: translateY(16px); opacity: 0; }
            }
          `}</style>
        </div>
        <h2 className="mt-2 text-3xl font-light tracking-tight text-white">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-neutral-400">
          Enter your details to access your dashboard.
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {serverError && (
          <div className="p-4 rounded-xl bg-red-950/50 border border-red-900/50 text-red-200 text-sm text-center animate-in fade-in zoom-in-95 duration-300">
            {serverError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@agency.com"
              className="block w-full appearance-none rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-3 text-neutral-100 placeholder-neutral-600 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-colors sm:text-sm"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-neutral-300" htmlFor="password">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-neutral-400 hover:text-white transition-colors">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="block w-full appearance-none rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-3 text-neutral-100 placeholder-neutral-600 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-colors sm:text-sm"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex w-full justify-center rounded-xl bg-white px-4 py-3 text-sm font-medium text-black hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Sign in
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </div>
      </form>

      <div className="text-center">
        <p className="text-sm text-neutral-400">
          don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-white hover:underline underline-offset-4">
            Request access
          </Link>
        </p>
      </div>
    </div>
  );
}
