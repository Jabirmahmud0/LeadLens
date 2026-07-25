import * as React from 'react';
import { cn } from '../lib/utils';
import { AlertTriangle, CheckCircle2, Info, AlertCircle } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  icon?: boolean;
}

export function Badge({
  className,
  variant = 'neutral',
  icon = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    success: 'bg-green-500/10 text-green-500 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-500 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    neutral: 'bg-neutral-800 text-neutral-300 border-neutral-700',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icon && variant === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
      {icon && variant === 'warning' && <AlertTriangle className="w-3.5 h-3.5" />}
      {icon && variant === 'error' && <AlertCircle className="w-3.5 h-3.5" />}
      {icon && variant === 'info' && <Info className="w-3.5 h-3.5" />}
      {children}
    </span>
  );
}
