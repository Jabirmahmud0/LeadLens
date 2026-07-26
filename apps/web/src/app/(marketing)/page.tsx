import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Search, Zap, CheckCircle2, SearchCode, LineChart } from 'lucide-react';
import { EvidenceMarquee } from '@leadlens/ui';

export const metadata = {
  title: 'LeadLens | Stop guessing. Start closing.',
};

export default function MarketingHomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Abstract Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Hero Left: Copy & CTA */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium">
              <Zap className="w-4 h-4" />
              <span>The AI analysis pipeline for agencies</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
              Stop guessing.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Start closing.</span>
            </h1>
            
            <p className="text-lg text-neutral-400 max-w-xl leading-relaxed">
              Instantly turn any prospect&apos;s website into a heavily researched, highly persuasive Opportunity Brief. Pitch with proof, not promises.
            </p>
            
            <form action="/signup" method="GET" className="relative max-w-lg group mt-4">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-blue-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="url"
                name="url"
                required
                className="block w-full pl-12 pr-40 rounded-2xl border border-neutral-800 bg-neutral-900/80 px-4 py-5 text-white placeholder-neutral-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-xl backdrop-blur-xl"
                placeholder="https://prospect-website.com"
              />
              <div className="absolute inset-y-2 right-2">
                <button type="submit" className="h-full px-6 bg-white text-black rounded-xl font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2">
                  Analyze
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
            
            <div className="flex items-center gap-6 text-sm text-neutral-500 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>10 free analyses</span>
              </div>
            </div>
          </div>
          
          {/* Hero Right: Lens Visualization */}
          <div className="relative aspect-square lg:aspect-[4/3] rounded-3xl border border-neutral-800 bg-neutral-900/50 overflow-hidden shadow-2xl flex items-center justify-center p-8 backdrop-blur-md">
            {/* Abstract visual of turning a website wireframe into a document */}
            <div className="w-full h-full relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-48 h-64 border-2 border-neutral-800 rounded-xl bg-neutral-950 p-4 opacity-50 transform -rotate-12 transition-transform duration-1000 hover:rotate-0">
                <div className="w-full h-4 bg-neutral-800 rounded-sm mb-4" />
                <div className="w-2/3 h-4 bg-neutral-800 rounded-sm mb-2" />
                <div className="w-3/4 h-4 bg-neutral-800 rounded-sm mb-8" />
                <div className="w-full h-24 bg-neutral-800 rounded-sm" />
              </div>
              
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-56 h-72 border border-blue-500/30 rounded-xl bg-black p-5 shadow-[0_0_50px_rgba(37,99,235,0.2)] transform rotate-6 z-10">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg mb-6 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <div className="w-3/4 h-3 bg-white/80 rounded-sm mb-3" />
                <div className="w-full h-2 bg-neutral-600 rounded-sm mb-2" />
                <div className="w-5/6 h-2 bg-neutral-600 rounded-sm mb-6" />
                
                <div className="flex gap-2 mb-2">
                  <div className="w-full h-8 bg-green-500/20 rounded-md border border-green-500/30" />
                  <div className="w-full h-8 bg-red-500/20 rounded-md border border-red-500/30" />
                </div>
              </div>
              
              {/* Connecting line / Lens */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-24 h-24 rounded-full border border-blue-500/50 bg-blue-500/10 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                  <SearchCode className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* 2. Evidence Marquee */}
      <section className="py-10 border-y border-neutral-800 bg-neutral-950/50">
        <div className="max-w-7xl mx-auto px-6 mb-6">
          <p className="text-sm font-medium text-neutral-500 text-center uppercase tracking-widest">
            Automatically detecting hundreds of signals
          </p>
        </div>
        <EvidenceMarquee speed="normal" direction="left" />
        <div className="h-4" />
        <EvidenceMarquee speed="slow" direction="right" />
      </section>

      {/* 3. Pipeline Narrative */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">How it works</h2>
            <p className="text-lg text-neutral-400">
              LeadLens handles the heavy lifting of prospect research, so your team can focus on selling.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
                <SearchCode className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">1. Collect Evidence</h3>
              <p className="text-neutral-400 leading-relaxed">
                Enter a URL, and our engine instantly crawls the site, analyzing performance, structure, content, and hidden meta signals.
              </p>
            </div>
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
                <LineChart className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">2. Match Services</h3>
              <p className="text-neutral-400 leading-relaxed">
                The AI cross-references the detected problems against your agency&apos;s specific service offerings and past case studies.
              </p>
            </div>
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-6 border border-green-500/20">
                <Zap className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">3. Generate Brief</h3>
              <p className="text-neutral-400 leading-relaxed">
                Output a ready-to-present Opportunity Brief featuring undeniable proof of the prospect&apos;s problems and your solution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom CTA */}
      <section className="py-32 relative overflow-hidden border-t border-neutral-800">
        <div className="absolute inset-0 bg-blue-900/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
            Ready to win more pitches?
          </h2>
          <p className="text-xl text-blue-200/60 mb-10 max-w-2xl mx-auto">
            Join top agencies using AI to research faster, pitch smarter, and close bigger deals.
          </p>
          
          <form action="/signup" method="GET" className="relative max-w-lg mx-auto group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-blue-400" />
            </div>
            <input
              type="url"
              name="url"
              required
              className="block w-full pl-12 pr-40 rounded-2xl border border-white/10 bg-black/50 px-4 py-5 text-white placeholder-neutral-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-xl backdrop-blur-xl"
              placeholder="Enter a prospect's website..."
            />
            <div className="absolute inset-y-2 right-2">
              <button type="submit" className="h-full px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/25">
                Analyze Free
              </button>
            </div>
          </form>
        </div>
      </section>
      
    </div>
  );
}
