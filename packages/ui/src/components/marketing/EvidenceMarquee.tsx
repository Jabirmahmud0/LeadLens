import * as React from 'react';
import { cn } from '../../lib/utils';
import { AlertCircle, FileCode2, Gauge, Smartphone, Search, FileText } from 'lucide-react';

const EVIDENCE_CHIPS = [
  { icon: Gauge, text: 'LCP > 2.5s', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { icon: Smartphone, text: 'Not Mobile Responsive', color: 'text-red-500', bg: 'bg-red-500/10' },
  { icon: Search, text: 'Missing H1 Tags', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { icon: FileCode2, text: 'No Schema Markup', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { icon: FileText, text: 'Thin Content on Service Pages', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { icon: AlertCircle, text: 'Missing Primary CTA', color: 'text-red-500', bg: 'bg-red-500/10' },
  { icon: Gauge, text: 'High TTFB (1.2s)', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
];

interface EvidenceMarqueeProps {
  className?: string;
  speed?: 'fast' | 'normal' | 'slow';
  direction?: 'left' | 'right';
  lightMode?: boolean;
  fadeColor?: string;
}

export function EvidenceMarquee({ 
  className,
  speed = 'normal',
  direction = 'left',
  lightMode = false,
  fadeColor,
}: EvidenceMarqueeProps) {
  const fade = fadeColor ?? (lightMode ? '#ffffff' : '#000000');
  
  // Duplicate array for infinite scroll effect
  const items = [...EVIDENCE_CHIPS, ...EVIDENCE_CHIPS];

  return (
    <div className={cn(
      "w-full overflow-hidden flex relative group",
      className
    )}>
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none" style={{ background: `linear-gradient(to right, ${fade}, transparent)` }} />
      <div className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none" style={{ background: `linear-gradient(to left, ${fade}, transparent)` }} />
      
      <div 
        className={cn(
          "flex items-center gap-4 shrink-0",
          speed === 'fast' ? 'duration-[20s]' : speed === 'slow' ? 'duration-[60s]' : 'duration-[40s]',
          direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'
        )}
        style={{
          animationName: direction === 'left' ? 'scroll-left' : 'scroll-right',
          animationDuration: speed === 'fast' ? '20s' : speed === 'slow' ? '60s' : '40s',
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
        }}
      >
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div 
              key={i}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap", lightMode ? 'border-neutral-200 bg-white shadow-sm' : 'border-neutral-800 bg-neutral-900/50 backdrop-blur-sm')}
            >
              <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", item.bg)}>
                <Icon className={cn("w-3 h-3", item.color)} />
              </div>
              <span className={cn("text-sm font-medium", lightMode ? 'text-neutral-600' : 'text-neutral-300')}>{item.text}</span>
            </div>
          );
        })}
      </div>
      
      {/* Duplicate container to ensure seamless loop */}
      <div 
        className={cn(
          "flex items-center gap-4 shrink-0 pl-4",
          speed === 'fast' ? 'duration-[20s]' : speed === 'slow' ? 'duration-[60s]' : 'duration-[40s]',
          direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'
        )}
        style={{
          animationName: direction === 'left' ? 'scroll-left' : 'scroll-right',
          animationDuration: speed === 'fast' ? '20s' : speed === 'slow' ? '60s' : '40s',
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
        }}
      >
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div 
              key={`dup-${i}`}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap", lightMode ? 'border-neutral-200 bg-white shadow-sm' : 'border-neutral-800 bg-neutral-900/50 backdrop-blur-sm')}
            >
              <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", item.bg)}>
                <Icon className={cn("w-3 h-3", item.color)} />
              </div>
              <span className={cn("text-sm font-medium", lightMode ? 'text-neutral-600' : 'text-neutral-300')}>{item.text}</span>
            </div>
          );
        })}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% - 1rem)); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(calc(-100% - 1rem)); }
          100% { transform: translateX(0); }
        }
      `}} />
    </div>
  );
}
