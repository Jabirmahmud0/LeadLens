'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Loader2, ArrowRight, MailCheck, KeyRound } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setServerError(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || 'Failed to request reset link');
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      setServerError('An unexpected error occurred. Please try again.');
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md space-y-8 bg-neutral-900/50 p-8 sm:p-10 rounded-3xl border border-neutral-800/50 backdrop-blur-xl shadow-2xl text-center">
        <div className="mx-auto w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-6">
          <MailCheck className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-3xl font-light tracking-tight text-white">Check your email</h2>
        <p className="mt-4 text-sm text-neutral-400 leading-relaxed">
          If an account exists for that email, we've sent instructions to reset your password.
        </p>
        <div className="pt-6">
          <Link href="/login" className="text-sm font-medium text-white hover:underline underline-offset-4">
            Return to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8 bg-neutral-900/50 p-8 sm:p-10 rounded-3xl border border-neutral-800/50 backdrop-blur-xl shadow-2xl">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 border border-neutral-600 rounded-full animate-ping opacity-20" />
          <KeyRound className="w-8 h-8 text-neutral-300 relative z-10" />
        </div>
        <h2 className="mt-2 text-3xl font-light tracking-tight text-white">
          Reset password
        </h2>
        <p className="mt-2 text-sm text-neutral-400">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {serverError && (
          <div className="p-4 rounded-xl bg-red-950/50 border border-red-900/50 text-red-200 text-sm text-center animate-in fade-in zoom-in-95 duration-300">
            {serverError}
          </div>
        )}

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
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex w-full justify-center rounded-xl bg-white px-4 py-3 text-sm font-medium text-black hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Send reset link
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </div>
      </form>

      <div className="text-center">
        <p className="text-sm text-neutral-400">
          Remember your password?{' '}
          <Link href="/login" className="font-medium text-white hover:underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
