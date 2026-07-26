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
    critical: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }[severity];

  const severityBorder = {
    critical: 'border-red-500/20',
    warning: 'border-yellow-500/20',
    info: 'border-blue-500/20',
  }[severity];

  return (
    <div className={cn("relative bg-neutral-900 border rounded-xl overflow-hidden transition-colors", expanded ? severityBorder : "border-neutral-800", className)} {...props}>
      {/* Left severity rail */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", severityColor)} />
      
      <button
        type="button"
        className="w-full p-5 pl-6 cursor-pointer hover:bg-neutral-800/50 transition-colors flex items-start justify-between gap-4 text-left"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="space-y-1 flex-1">
          <h4 className="text-base font-medium text-white">{title}</h4>
          <p className="text-sm text-neutral-400 line-clamp-2">{description}</p>
        </div>
        
        {evidence && (
          <span className="text-neutral-500 mt-1 shrink-0" aria-hidden="true">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </span>
        )}
      </button>

      {expanded && evidence && (
        <div className="px-6 pb-5 pt-2 border-t border-neutral-800/50 bg-neutral-950/50">
          <div className="text-sm text-neutral-300">
            {evidence}
          </div>
        </div>
      )}
    </div>
  );
}
