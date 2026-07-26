'use client';

import * as React from 'react';
import { cn } from '@leadlens/ui';
import { CheckCircle2, Info, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';

type PlanTier = 'free' | 'solo' | 'agency' | 'growth';

export function PricingSimulator() {
  const [prospects, setProspects] = React.useState<number>(10);
  const [teamSize, setTeamSize] = React.useState<number>(1);
  const [needsExport, setNeedsExport] = React.useState<boolean>(false);

  // Determine recommended plan based on inputs
  const recommendedPlan: PlanTier = React.useMemo(() => {
    if (teamSize > 10 || prospects > 200) return 'growth';
    if (teamSize > 3 || prospects > 50 || needsExport) return 'agency';
    if (teamSize > 1 || prospects > 10) return 'solo';
    return 'free';
  }, [teamSize, prospects, needsExport]);

  return (
    <div className="w-full space-y-16">
      
      {/* 1. Simulator Controls */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 lg:p-10 shadow-2xl max-w-4xl mx-auto">
        <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
          Calculate your Needs
          <div className="group relative">
            <Info className="w-4 h-4 text-neutral-500 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-black border border-neutral-700 rounded-xl text-xs text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
              We recommend plans based on your monthly prospecting volume and team collaboration requirements.
            </div>
          </div>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Prospects Slider */}
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium text-neutral-300">
                Analyses / Month
              </label>
              <span className="text-2xl font-bold text-white tabular-nums">
                {prospects === 500 ? '500+' : prospects}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="10"
              value={prospects}
              onChange={(e) => setProspects(parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-neutral-500">
              <span>0</span>
              <span>250</span>
              <span>500+</span>
            </div>
          </div>

          {/* Team Size Slider */}
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium text-neutral-300">
                Team Size
              </label>
              <span className="text-2xl font-bold text-white tabular-nums">
                {teamSize === 50 ? '50+' : teamSize} {teamSize === 1 ? 'Seat' : 'Seats'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={teamSize}
              onChange={(e) => setTeamSize(parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-neutral-500">
              <span>1</span>
              <span>25</span>
              <span>50+</span>
            </div>
          </div>
        </div>

        {/* Export Toggle */}
        <div className="mt-12 pt-8 border-t border-neutral-800 flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-white block mb-1">
              Need White-labeled PDF Exports?
            </label>
            <p className="text-xs text-neutral-500">
              Remove LeadLens branding from the generated Opportunity Briefs.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={needsExport}
            onClick={() => setNeedsExport(!needsExport)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900",
              needsExport ? "bg-blue-600" : "bg-neutral-700"
            )}
          >
            <span
              className={cn(
                "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
                needsExport ? "translate-x-2.5" : "-translate-x-2.5"
              )}
            />
          </button>
        </div>
      </div>

      {/* 2. Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Free Plan */}
        <div className={cn(
          "rounded-3xl p-6 border transition-all duration-300 relative flex flex-col",
          recommendedPlan === 'free' 
            ? "bg-neutral-900 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.15)] scale-105 z-10" 
            : "bg-black border-neutral-800 hover:border-neutral-700 opacity-70 hover:opacity-100"
        )}>
          {recommendedPlan === 'free' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Star className="w-3 h-3" /> Recommended
            </div>
          )}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-white mb-2">Hobby</h4>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-neutral-500">/mo</span>
            </div>
            <p className="text-sm text-neutral-400 mt-3 h-10">
              For freelancers wanting to test the waters.
            </p>
          </div>
          
          <ul className="space-y-3 mb-8 flex-1">
            <li className="flex items-start gap-3 text-sm text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
              10 Analyses / month
            </li>
            <li className="flex items-start gap-3 text-sm text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
              1 Team Seat
            </li>
            <li className="flex items-start gap-3 text-sm text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
              Standard Web Export
            </li>
          </ul>
          
          <Link href="/signup" className={cn(
            "w-full py-2.5 rounded-xl text-sm font-medium text-center transition-colors",
            recommendedPlan === 'free' ? "bg-white text-black hover:bg-neutral-200" : "bg-neutral-800 text-white hover:bg-neutral-700"
          )}>
            Get Started
          </Link>
        </div>

        {/* Solo Plan */}
        <div className={cn(
          "rounded-3xl p-6 border transition-all duration-300 relative flex flex-col",
          recommendedPlan === 'solo' 
            ? "bg-neutral-900 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.15)] scale-105 z-10" 
            : "bg-black border-neutral-800 hover:border-neutral-700 opacity-70 hover:opacity-100"
        )}>
          {recommendedPlan === 'solo' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Star className="w-3 h-3" /> Recommended
            </div>
          )}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-white mb-2">Solo</h4>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">$49</span>
              <span className="text-neutral-500">/mo</span>
            </div>
            <p className="text-sm text-neutral-400 mt-3 h-10">
              For independent consultants pitching actively.
            </p>
          </div>
          
          <ul className="space-y-3 mb-8 flex-1">
            <li className="flex items-start gap-3 text-sm text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              50 Analyses / month
            </li>
            <li className="flex items-start gap-3 text-sm text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
              Up to 3 Team Seats
            </li>
            <li className="flex items-start gap-3 text-sm text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
              Standard Web Export
            </li>
            <li className="flex items-start gap-3 text-sm text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              Basic Case Study RAG
            </li>
          </ul>
          
          <Link href="/signup" className={cn(
            "w-full py-2.5 rounded-xl text-sm font-medium text-center transition-colors",
            recommendedPlan === 'solo' ? "bg-white text-black hover:bg-neutral-200" : "bg-neutral-800 text-white hover:bg-neutral-700"
          )}>
            Start Free Trial
          </Link>
        </div>

        {/* Agency Plan */}
        <div className={cn(
          "rounded-3xl p-6 border transition-all duration-300 relative flex flex-col",
          recommendedPlan === 'agency' 
            ? "bg-neutral-900 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.15)] scale-105 z-10" 
            : "bg-black border-neutral-800 hover:border-neutral-700 opacity-70 hover:opacity-100"
        )}>
          {recommendedPlan === 'agency' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Star className="w-3 h-3" /> Recommended
            </div>
          )}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-white mb-2">Agency</h4>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">$199</span>
              <span className="text-neutral-500">/mo</span>
            </div>
            <p className="text-sm text-neutral-400 mt-3 h-10">
              For growing agencies with dedicated sales teams.
            </p>
          </div>
          
          <ul className="space-y-3 mb-8 flex-1">
            <li className="flex items-start gap-3 text-sm text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              200 Analyses / month
            </li>
            <li className="flex items-start gap-3 text-sm text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              Up to 10 Team Seats
            </li>
            <li className="flex items-start gap-3 text-sm text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              White-labeled PDF Export
            </li>
            <li className="flex items-start gap-3 text-sm text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              Advanced Service Matching
            </li>
          </ul>
          
          <Link href="/signup" className={cn(
            "w-full py-2.5 rounded-xl text-sm font-medium text-center transition-colors",
            recommendedPlan === 'agency' ? "bg-white text-black hover:bg-neutral-200" : "bg-neutral-800 text-white hover:bg-neutral-700"
          )}>
            Start Free Trial
          </Link>
        </div>

        {/* Growth Plan */}
        <div className={cn(
          "rounded-3xl p-6 border transition-all duration-300 relative flex flex-col",
          recommendedPlan === 'growth' 
            ? "bg-neutral-900 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.15)] scale-105 z-10" 
            : "bg-black border-neutral-800 hover:border-neutral-700 opacity-70 hover:opacity-100"
        )}>
          {recommendedPlan === 'growth' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Star className="w-3 h-3" /> Recommended
            </div>
          )}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-white mb-2">Growth</h4>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">Custom</span>
            </div>
            <p className="text-sm text-neutral-400 mt-3 h-10">
              For large organizations with complex needs.
            </p>
          </div>
          
          <ul className="space-y-3 mb-8 flex-1">
            <li className="flex items-start gap-3 text-sm text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              Unlimited Analyses
            </li>
            <li className="flex items-start gap-3 text-sm text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              Unlimited Seats
            </li>
            <li className="flex items-start gap-3 text-sm text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              Custom Integrations (CRM)
            </li>
            <li className="flex items-start gap-3 text-sm text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              Dedicated Success Manager
            </li>
          </ul>
          
          <Link href="/contact" className={cn(
            "w-full py-2.5 rounded-xl text-sm font-medium text-center transition-colors",
            recommendedPlan === 'growth' ? "bg-white text-black hover:bg-neutral-200" : "bg-neutral-800 text-white hover:bg-neutral-700"
          )}>
            Contact Sales
          </Link>
        </div>

      </div>
    </div>
  );
}
