import * as React from 'react';
import { RoleSwitcher } from './RoleSwitcher';
import { ArrowRight, Users } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Use Cases | LeadLens',
};

export default function UseCasesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-900/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 mb-8 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
            <Users className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Built for the entire agency.
          </h1>
          <p className="text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto">
            LeadLens isn't just a sales tool. It's a growth engine that eliminates busywork for strategists, provides endless ammo for sales reps, and scales revenue for founders.
          </p>
        </div>
      </section>

      {/* Interactive Role Switcher */}
      <section className="pb-32 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <RoleSwitcher />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 border-t border-neutral-800 bg-neutral-950/50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Empower your team today</h2>
          <p className="text-neutral-400 mb-8">
            Give your agency the unfair advantage of AI-powered technical research and automated brief generation.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/25">
            Start Your Free Trial
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
