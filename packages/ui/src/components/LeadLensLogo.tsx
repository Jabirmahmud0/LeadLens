import * as React from 'react';
import { cn } from '../lib/utils';

export interface LeadLensLogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'icon' | 'full';
  theme?: 'light' | 'dark';
  size?: number;
}

export function LeadLensLogo({
  variant = 'full',
  theme = 'light',
  size = 32,
  className,
  ...props
}: LeadLensLogoProps) {
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-950';

  return (
    <span
      className={cn("inline-flex items-center gap-2.5", className)}
      {...props}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="ll-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        {/* Dotted Optical Lens Ring */}
        <circle
          cx="16"
          cy="16"
          r="7.5"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 2"
          className={theme === 'dark' ? 'text-emerald-500/35' : 'text-emerald-800/25'}
        />
        {/* L-bracket 1 (Top-Left) */}
        <path
          d="M10 6v14a2 2 0 002 2h14"
          stroke="url(#ll-logo-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* L-bracket 2 (Bottom-Right) */}
        <path
          d="M22 26V12a2 2 0 00-2-2H6"
          stroke="url(#ll-logo-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Central Intelligence Spark */}
        <path
          d="M16 11c0 2.5-2.5 5-5 5 2.5 0 5 2.5 5 5 0-2.5 2.5-5 5-5-2.5 0-5-2.5-5-5z"
          fill="#10b981"
        />
      </svg>

      {variant === 'full' && (
        <span
          className={cn(
            "text-base font-semibold tracking-[-0.03em] select-none",
            textColor
          )}
        >
          LeadLens
        </span>
      )}
    </span>
  );
}
