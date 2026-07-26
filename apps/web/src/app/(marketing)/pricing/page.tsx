import * as React from 'react';
import { PricingSimulator } from './PricingSimulator';

export const metadata = {
  title: 'Pricing | LeadLens',
};

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-16 relative">
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Simple, transparent pricing.
          </h1>
          <p className="text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto">
            Get early access to LeadLens today. Start for free, and upgrade as your agency scales its outbound motion.
          </p>
        </div>
      </section>

      {/* Simulator & Pricing Cards */}
      <section className="pb-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <PricingSimulator />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 border-t border-neutral-800 bg-neutral-950/50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-neutral-400">Everything you need to know about the product and billing.</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-black border border-neutral-800 rounded-2xl p-6">
              <h4 className="text-lg font-medium text-white mb-2">What counts as an "Analysis"?</h4>
              <p className="text-neutral-400 leading-relaxed">
                An analysis is counted every time you submit a unique prospect URL to generate an Opportunity Brief. Reprocessing the same URL within 24 hours does not consume additional credits.
              </p>
            </div>
            
            <div className="bg-black border border-neutral-800 rounded-2xl p-6">
              <h4 className="text-lg font-medium text-white mb-2">Can I cancel my subscription at any time?</h4>
              <p className="text-neutral-400 leading-relaxed">
                Yes, you can upgrade, downgrade, or cancel your subscription at any time right from your dashboard. There are no long-term contracts unless you are on a custom enterprise plan.
              </p>
            </div>
            
            <div className="bg-black border border-neutral-800 rounded-2xl p-6">
              <h4 className="text-lg font-medium text-white mb-2">Are the PDFs really white-labeled?</h4>
              <p className="text-neutral-400 leading-relaxed">
                Yes. On the Agency and Growth tiers, all LeadLens branding is completely removed from the final exported Opportunity Briefs, ensuring your agency takes full credit for the research.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
