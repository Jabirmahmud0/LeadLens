import * as React from 'react';
import { ProductTimeline } from './Timeline';
import { ArrowRight, SearchCode } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Product Tour | LeadLens',
};

export default function ProductPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-8 shadow-[0_0_30px_rgba(37,99,235,0.2)]">
            <SearchCode className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            The Investigative Timeline
          </h1>
          <p className="text-xl text-neutral-400 leading-relaxed mb-10 max-w-2xl mx-auto">
            LeadLens doesn't just scrape websites. It performs a deep-dive investigation, diagnoses root causes, and aligns the findings perfectly with your agency's capabilities.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-medium transition-colors">
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Scroll-driven Timeline */}
      <section className="border-t border-neutral-800 bg-neutral-950/50">
        <div className="max-w-7xl mx-auto px-6">
          <ProductTimeline />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 border-t border-neutral-800 bg-black">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">See what LeadLens finds on your next prospect</h2>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-black px-8 py-3 rounded-xl font-medium hover:bg-neutral-200 transition-colors">
            Analyze a website now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
