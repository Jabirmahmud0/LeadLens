'use client';

import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string().min(15, 'Use at least 15 characters').max(128, 'Password must be 128 characters or fewer'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don&apos;t match",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (!token) {
    return (
      <div className="w-full max-w-md space-y-6 bg-neutral-900/50 p-8 sm:p-10 rounded-3xl border border-neutral-800/50 backdrop-blur-xl shadow-2xl text-center">
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-900/50 text-red-200 text-sm">
          Invalid or missing reset token.
        </div>
        <Link href="/forgot-password" className="inline-block text-sm font-medium text-white hover:underline underline-offset-4">
          Request a new link
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordValues) => {
    setServerError(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || 'Failed to reset password');
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
      setServerError('An unexpected error occurred. Please try again.');
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md space-y-8 bg-neutral-900/50 p-8 sm:p-10 rounded-3xl border border-neutral-800/50 backdrop-blur-xl shadow-2xl text-center">
        <div className="mx-auto w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-3xl font-light tracking-tight text-white">Password reset successfully</h2>
        <p className="mt-4 text-sm text-neutral-400 leading-relaxed">
          Redirecting you to login...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8 bg-neutral-900/50 p-8 sm:p-10 rounded-3xl border border-neutral-800/50 backdrop-blur-xl shadow-2xl">
      <div className="text-center">
        <h2 className="mt-2 text-3xl font-light tracking-tight text-white">
          Create new password
        </h2>
        <p className="mt-2 text-sm text-neutral-400">
          Enter your new password below.
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
            <label className="block text-sm font-medium text-neutral-300 mb-1" htmlFor="password">
              New Password
            </label>
            <input
              id="password"
              type="password"
              minLength={15}
              maxLength={128}
              placeholder="••••••••"
              className="block w-full appearance-none rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-3 text-neutral-100 placeholder-neutral-600 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-colors sm:text-sm"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              minLength={15}
              maxLength={128}
              placeholder="••••••••"
              className="block w-full appearance-none rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-3 text-neutral-100 placeholder-neutral-600 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-colors sm:text-sm"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>
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
                Save password
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
