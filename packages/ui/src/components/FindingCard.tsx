'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface FindingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  evidence?: React.ReactNode;
}

export function FindingCard({
  title,
  description,
  severity,
  evidence,
  className,
  ...props
}: FindingCardProps) {
  const [expanded, setExpanded] = React.useState(false);

  const severityColor = {
    critical: 'bg-rose-500',
    warning: 'bg-amber-500',
    info: 'bg-emerald-500',
  }[severity];

  const severityBorder = {
    critical: 'ring-1 ring-rose-500/20 border-rose-500/20',
    warning: 'ring-1 ring-amber-500/20 border-amber-500/20',
    info: 'ring-1 ring-emerald-500/20 border-emerald-500/20',
  }[severity];

  return (
    <div className={cn("relative bg-white border rounded-[1.25rem] overflow-hidden transition-all duration-300 ease-out shadow-[0_4px_20px_rgba(31,67,46,0.03)] hover:shadow-[0_8px_30px_rgba(31,67,46,0.06)] hover:-translate-y-[1px]", expanded ? severityBorder : "border-[#d8e5db]/80", className)} {...props}>
      {/* Left severity rail */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", severityColor)} />
      
      <button
        type="button"
        className="w-full p-5 pl-7 cursor-pointer hover:bg-[#f4f8f3]/40 transition-colors flex items-start justify-between gap-4 text-left focus:outline-none focus-visible:bg-[#f4f8f3]/60"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="space-y-1.5 flex-1 min-w-0">
          <h4 className="text-[15px] font-semibold tracking-[-0.015em] text-[#16352a] not-italic">{title}</h4>
          <p className="text-[13px] leading-relaxed text-[#60766b] line-clamp-2 pr-4 not-italic">{description}</p>
        </div>
        
        {evidence && (
          <span className={cn("mt-1 shrink-0 transition-transform duration-300 ease-out", expanded ? "rotate-180 text-emerald-700" : "text-[#8ca096]")} aria-hidden="true">
            <ChevronDown className="size-5" />
          </span>
        )}
      </button>

      {expanded && evidence && (
        <div className="px-7 pb-6 pt-5 border-t border-[#d8e5db]/40 bg-[#f8fbf7]/50">
          <div className="text-sm text-[#486257] not-italic">
            {evidence}
          </div>
        </div>
      )}
    </div>
  );
}
