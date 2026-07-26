'use client';

import * as React from 'react';
import { cn } from '@leadlens/ui';
import { Search, BrainCircuit, Activity, HeartHandshake, BookOpen, Presentation, CheckCircle2 } from 'lucide-react';

const STAGES = [
  {
    id: 'stage-1',
    title: 'Enter website',
    description: 'Simply paste any prospect URL into LeadLens. Our crawler respects robots.txt and gracefully navigates the site just like a human visitor would, but much faster.',
    details: [
      'No complex configuration required',
      'Works with any modern CMS or framework',
      'Secures temporary data storage in memory'
    ],
    icon: Search,
  },
  {
    id: 'stage-2',
    title: 'Collect evidence',
    description: 'The engine gathers hundreds of data points: performance metrics, missing meta tags, broken layouts, accessibility failures, and thin content.',
    details: [
      'Lighthouse performance analysis',
      'On-page SEO auditing',
      'Mobile responsiveness checks'
    ],
    icon: Activity,
  },
  {
    id: 'stage-3',
    title: 'Diagnose problems',
    description: 'Raw data is fed into our specialized AI models to interpret what these technical failures mean for the prospect’s business (e.g. "Slow checkout = lost revenue").',
    details: [
      'Context-aware LLM processing',
      'Business impact translation',
      'Severity scoring (High, Medium, Low)'
    ],
    icon: BrainCircuit,
  },
  {
    id: 'stage-4',
    title: 'Match services',
    description: 'LeadLens cross-references the diagnosed problems against your agency’s specific services and past case studies to find the perfect pitch angle.',
    details: [
      'Automatic service alignment',
      'Case study retrieval (RAG)',
      'Identifies upsell opportunities'
    ],
    icon: HeartHandshake,
  },
  {
    id: 'stage-5',
    title: 'Prepare outreach',
    description: 'An Opportunity Brief is generated. It includes a personalized executive summary, the evidence matrix, and tailored talking points in your brand voice.',
    details: [
      'Exports to PDF or shareable link',
      'Follows your configured tone of voice',
      'Fully editable before sending'
    ],
    icon: BookOpen,
  },
  {
    id: 'stage-6',
    title: 'Enter the call',
    description: 'You walk into your discovery call or pitch meeting armed with undeniable proof of their problems and a clear roadmap of how you will solve them.',
    details: [
      'Higher conversion rates',
      'Immediate expert positioning',
      'Shorter sales cycles'
    ],
    icon: Presentation,
  },
];

export function ProductTimeline() {
  const [activeStage, setActiveStage] = React.useState<string>(STAGES[0].id);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveStage(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0,
      }
    );

    STAGES.forEach((stage) => {
      const element = document.getElementById(stage.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start relative">
      
      {/* Left Column: Scrollable Narrative */}
      <div className="space-y-32 py-10 pb-64">
        {STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = activeStage === stage.id;
          
          return (
            <div 
              key={stage.id} 
              id={stage.id}
              className={cn(
                "transition-all duration-500",
                isActive ? "opacity-100" : "opacity-30"
              )}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center font-mono font-medium text-blue-400">
                  0{index + 1}
                </div>
                <h3 className="text-2xl font-bold text-white">{stage.title}</h3>
              </div>
              
              <p className="text-lg text-neutral-400 leading-relaxed mb-8">
                {stage.description}
              </p>
              
              <ul className="space-y-3">
                {stage.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-neutral-300">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Right Column: Sticky Visual */}
      <div className="hidden lg:block sticky top-32 h-[calc(100vh-16rem)] max-h-[800px]">
        <div className="w-full h-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl transition-colors duration-1000">
          
          {/* Abstract Visual States based on active stage */}
          <div className="absolute inset-0 flex items-center justify-center p-12">
            
            {/* Stage 1: URL Input */}
            <div className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-700 transform",
              activeStage === 'stage-1' ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-8 pointer-events-none"
            )}>
              <div className="w-full max-w-sm bg-black border border-neutral-800 rounded-2xl p-4 shadow-2xl flex items-center gap-3">
                <Search className="w-5 h-5 text-neutral-500" />
                <div className="flex-1 h-4 bg-neutral-800 rounded-sm w-3/4" />
                <div className="w-16 h-8 bg-blue-600 rounded-lg" />
              </div>
            </div>

            {/* Stage 2: Collecting Evidence */}
            <div className={cn(
              "absolute inset-0 flex flex-col items-center justify-center gap-4 transition-all duration-700 transform",
              activeStage === 'stage-2' ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-8 pointer-events-none"
            )}>
              <div className="w-full max-w-sm space-y-3">
                <div className="h-12 bg-neutral-950 border border-red-500/30 rounded-xl flex items-center px-4 gap-3 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="h-2 bg-neutral-800 rounded-sm w-1/2" />
                </div>
                <div className="h-12 bg-neutral-950 border border-yellow-500/30 rounded-xl flex items-center px-4 gap-3 animate-pulse" style={{ animationDelay: '200ms' }}>
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="h-2 bg-neutral-800 rounded-sm w-2/3" />
                </div>
                <div className="h-12 bg-neutral-950 border border-blue-500/30 rounded-xl flex items-center px-4 gap-3 animate-pulse" style={{ animationDelay: '400ms' }}>
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <div className="h-2 bg-neutral-800 rounded-sm w-1/3" />
                </div>
              </div>
            </div>
            
            {/* Stage 3: Diagnose */}
            <div className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-700 transform",
              activeStage === 'stage-3' ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-8 pointer-events-none"
            )}>
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 rounded-full border border-neutral-700 animate-spin-slow" />
                <div className="absolute inset-4 rounded-full border border-blue-500/30 animate-spin-reverse-slow" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <BrainCircuit className="w-16 h-16 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Stage 4: Match */}
            <div className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-700 transform",
              activeStage === 'stage-4' ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-8 pointer-events-none"
            )}>
              <div className="flex items-center gap-4">
                <div className="w-24 h-32 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-center">
                  <div className="w-8 h-2 bg-red-500/50 rounded-sm" />
                </div>
                <HeartHandshake className="w-8 h-8 text-neutral-500" />
                <div className="w-24 h-32 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-center">
                  <div className="w-8 h-2 bg-green-500/50 rounded-sm" />
                </div>
              </div>
            </div>

            {/* Stage 5: Prepare */}
            <div className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-700 transform",
              activeStage === 'stage-5' ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-8 pointer-events-none"
            )}>
              <div className="w-64 h-80 bg-white border border-neutral-200 rounded-xl p-6 shadow-2xl flex flex-col transform rotate-2">
                <div className="w-1/2 h-4 bg-neutral-200 rounded-sm mb-6" />
                <div className="w-full h-2 bg-neutral-100 rounded-sm mb-2" />
                <div className="w-full h-2 bg-neutral-100 rounded-sm mb-2" />
                <div className="w-3/4 h-2 bg-neutral-100 rounded-sm mb-8" />
                <div className="w-full flex-1 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-blue-300" />
                </div>
              </div>
            </div>

            {/* Stage 6: Enter the Call */}
            <div className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-700 transform",
              activeStage === 'stage-6' ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-8 pointer-events-none"
            )}>
              <div className="w-48 h-48 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <Presentation className="w-16 h-16 text-green-400" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
