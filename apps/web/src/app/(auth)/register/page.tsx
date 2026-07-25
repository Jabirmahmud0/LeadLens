'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, ShieldCheck, Zap, BarChart3 } from 'lucide-react';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  organizationName: z.string().min(2, 'Agency name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const INSIGHTS = [
  {
    icon: ShieldCheck,
    title: 'Enterprise-grade audits',
    description: 'Run deep technical SEO, performance, and security checks instantly.',
  },
  {
    icon: Zap,
    title: 'Instant deliverables',
    description: 'Generate client-ready PDFs with your agency branding in seconds.',
  },
  {
    icon: BarChart3,
    title: 'Data-driven closing',
    description: 'Use objective performance data to win enterprise retainers.',
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [activeInsight, setActiveInsight] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveInsight((prev) => (prev + 1) % INSIGHTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || 'Registration failed');
      } else {
        router.push('/verify-email');
      }
    } catch (err) {
      setServerError('An unexpected error occurred. Please try again.');
    }
  };

  const InsightIcon = INSIGHTS[activeInsight].icon;

  return (
    <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-neutral-800/50 bg-neutral-900/40 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row">
      
      {/* Form Section */}
      <div className="w-full md:w-1/2 p-8 sm:p-12 border-b md:border-b-0 md:border-r border-neutral-800/50">
        <div className="mb-8">
          <h2 className="text-3xl font-light tracking-tight text-white">Create account</h2>
          <p className="mt-2 text-sm text-neutral-400">Join LeadLens to scale your agency's client acquisition.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {serverError && (
            <div className="p-4 rounded-xl bg-red-950/50 border border-red-900/50 text-red-200 text-sm animate-in fade-in zoom-in-95 duration-300">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1" htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                placeholder="Jane Doe"
                className="block w-full appearance-none rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-3 text-neutral-100 placeholder-neutral-600 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-colors sm:text-sm"
                {...register('fullName')}
              />
              {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1" htmlFor="organizationName">Agency Name</label>
              <input
                id="organizationName"
                type="text"
                placeholder="Acme Digital"
                className="block w-full appearance-none rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-3 text-neutral-100 placeholder-neutral-600 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-colors sm:text-sm"
                {...register('organizationName')}
              />
              {errors.organizationName && <p className="mt-1 text-xs text-red-400">{errors.organizationName.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1" htmlFor="email">Work Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="jane@acmedigital.com"
              className="block w-full appearance-none rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-3 text-neutral-100 placeholder-neutral-600 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-colors sm:text-sm"
              {...register('email')}
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className="block w-full appearance-none rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-3 text-neutral-100 placeholder-neutral-600 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-colors sm:text-sm"
              {...register('password')}
            />
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full justify-center rounded-xl bg-white px-4 py-3 text-sm font-medium text-black hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Create account
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </div>
        </form>

        <p className="mt-6 text-sm text-center text-neutral-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-white hover:underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>

      {/* Editorial Split Screen */}
      <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-between relative bg-black/20 overflow-hidden">
        {/* Background abstract gradient matching the active insight */}
        <div className="absolute inset-0 opacity-20 transition-colors duration-1000 ease-in-out" 
             style={{ background: \`radial-gradient(circle at 70% 30%, \${activeInsight === 0 ? 'rgba(59,130,246,0.4)' : activeInsight === 1 ? 'rgba(16,185,129,0.4)' : 'rgba(139,92,246,0.4)'}, transparent 50%)\` }} />
        
        <div className="relative z-10">
          <div className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900/50 px-3 py-1 text-xs font-medium text-neutral-300 backdrop-blur-sm">
            LeadLens for Agencies
          </div>
        </div>

        <div className="relative z-10 mt-12 mb-8">
          <div className="h-48 relative">
            {INSIGHTS.map((insight, idx) => {
              const Icon = insight.icon;
              return (
                <div 
                  key={idx}
                  className={\`absolute inset-0 transition-all duration-700 ease-in-out \${activeInsight === idx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}\`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-neutral-800/50 border border-neutral-700/50 flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-light text-white mb-3">{insight.title}</h3>
                  <p className="text-neutral-400 leading-relaxed">{insight.description}</p>
                </div>
              );
            })}
          </div>

          {/* Progress dots */}
          <div className="flex gap-2 mt-8">
            {INSIGHTS.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveInsight(idx)}
                className={\`h-1.5 rounded-full transition-all duration-500 \${activeInsight === idx ? 'w-8 bg-white' : 'w-2 bg-neutral-700 hover:bg-neutral-600'}\`}
                aria-label={\`Go to slide \${idx + 1}\`}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 border-t border-neutral-800/50 pt-8 mt-4">
          <blockquote className="text-sm text-neutral-400 italic">
            "We closed three enterprise deals in our first month using the audit reports."
          </blockquote>
          <div className="mt-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700" />
            <div>
              <div className="text-xs font-medium text-neutral-200">Sarah Jenkins</div>
              <div className="text-[10px] text-neutral-500">Founder, GrowthOps</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
