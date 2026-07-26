'use client';

import * as React from 'react';
import { cn } from '@leadlens/ui';
import { Crown, Briefcase, Brain, Users, ArrowRight, TrendingUp, SearchCode, Target, LineChart } from 'lucide-react';
import Link from 'next/link';

type Role = 'founder' | 'sales' | 'strategy' | 'account';

const ROLES = [
  { id: 'founder', label: 'Agency Founder', icon: Crown },
  { id: 'sales', label: 'Sales Rep', icon: Briefcase },
  { id: 'strategy', label: 'Strategist', icon: Brain },
  { id: 'account', label: 'Account Manager', icon: Users },
] as const;

const ROLE_CONTENT = {
  founder: {
    challenge: "Win rates are too low, sales cycles are too long, and your senior team is spending hours on free audits that never close.",
    workflow: "LeadLens systemizes your pitch process. It ensures every prospect gets a world-class, data-backed Opportunity Brief without burning your expensive senior talent.",
    feature: {
      title: "ROI Calculation & Positioning",
      icon: TrendingUp,
      description: "Automatically translates technical failures into lost revenue estimates, framing your agency as an investment rather than an expense."
    },
    quote: '"We cut our pre-sales research time by 80% while increasing our close rate from 20% to 35%."',
    cta: "Scale Your Agency"
  },
  sales: {
    challenge: "You're tired of sending generic cold emails and showing up to discovery calls with no unique insights into the prospect's business.",
    workflow: "Enter a URL 5 minutes before your call. Get a complete dossier on exactly what's broken and exactly which of your services will fix it.",
    feature: {
      title: "The Evidence Matrix",
      icon: SearchCode,
      description: "Hard proof of the prospect's problems. Stop saying 'we can help you grow' and start saying 'here are the 5 critical errors costing you money today.'"
    },
    quote: '"I no longer have to ask engineering for a site audit before a call. I have all the ammo I need instantly."',
    cta: "Close More Deals"
  },
  strategy: {
    challenge: "You spend hours manually checking Lighthouse scores, crawling competitors, and writing custom pitch decks from scratch.",
    workflow: "Let the AI handle the mechanical data collection and RAG-based case study matching. You focus on the high-level narrative and creative strategy.",
    feature: {
      title: "Service & Case Study Matching",
      icon: Target,
      description: "The engine automatically maps the diagnosed problems to your agency's service graph and pulls the most relevant past case studies as proof."
    },
    quote: '"LeadLens gives me a 90% finished strategy brief. I just add the creative magic and we are ready to pitch."',
    cta: "Streamline Strategy"
  },
  account: {
    challenge: "Clients constantly ask for 'quick reviews' of secondary sites or competitor domains, eating into your billable hours.",
    workflow: "Drop the competitor URL into LeadLens, generate a comparison brief in seconds, and send it to the client as a high-value upsell opportunity.",
    feature: {
      title: "Instant Upsell Generation",
      icon: LineChart,
      description: "Turn casual client requests into structured, data-backed proposals for new project work without taking time away from active accounts."
    },
    quote: '"We used it to audit a client\'s sister company on a whim, and it turned into a $40k retainer the next week."',
    cta: "Grow Accounts"
  }
};

export function RoleSwitcher() {
  const [activeRole, setActiveRole] = React.useState<Role>('founder');

  const content = ROLE_CONTENT[activeRole];

  return (
    <div className="w-full">
      {/* Segmented Tab Control */}
      <div className="flex overflow-x-auto pb-4 mb-8 sm:pb-0 sm:mb-12 hide-scrollbar">
        <div className="flex bg-neutral-900 border border-neutral-800 p-1 rounded-2xl mx-auto min-w-max">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isActive = activeRole === role.id;
            
            return (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id as Role)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all",
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg" 
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-blue-200" : "text-neutral-500")} />
                {role.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[400px]">
        
        {/* Left: Copy & CTA */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" key={`copy-\${activeRole}`}>
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-widest text-blue-400 uppercase">The Challenge</h3>
            <p className="text-xl text-neutral-300 leading-relaxed">
              {content.challenge}
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-widest text-green-400 uppercase">The LeadLens Solution</h3>
            <p className="text-lg text-neutral-400 leading-relaxed">
              {content.workflow}
            </p>
          </div>

          <div>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-neutral-200 transition-colors">
              {content.cta}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right: Visual Feature & Quote */}
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500" key={`visual-\${activeRole}`}>
          
          {/* Highlighted Feature Box */}
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
              <content.feature.icon className="w-7 h-7 text-blue-400" />
            </div>
            
            <h4 className="text-2xl font-bold text-white mb-4">{content.feature.title}</h4>
            <p className="text-neutral-400 leading-relaxed">
              {content.feature.description}
            </p>
          </div>

          {/* Social Proof Quote */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 relative">
            <div className="absolute -top-3 -left-2 text-6xl text-neutral-800 font-serif leading-none opacity-50 pointer-events-none">"</div>
            <p className="text-neutral-300 font-medium italic relative z-10">
              {content.quote}
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
