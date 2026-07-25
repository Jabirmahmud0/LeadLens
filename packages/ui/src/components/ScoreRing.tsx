import * as React from 'react';
import { cn } from '../lib/utils';

export interface ScoreRingProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  animate?: boolean;
}

export function ScoreRing({
  score,
  size = 120,
  strokeWidth = 8,
  label,
  animate = true,
  className,
  ...props
}: ScoreRingProps) {
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let colorClass = 'text-green-500';
  if (normalizedScore < 50) colorClass = 'text-red-500';
  else if (normalizedScore < 80) colorClass = 'text-yellow-500';

  return (
    <div className={cn("relative inline-flex flex-col items-center justify-center", className)} {...props}>
      <svg
        height={size}
        width={size}
        className="transform -rotate-90"
      >
        {/* Background ring */}
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-neutral-800"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress ring */}
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={cn(
            colorClass,
            animate && "transition-all duration-1000 ease-out"
          )}
          style={{ strokeDasharray: circumference, strokeDashoffset }}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{Math.round(normalizedScore)}</span>
        {label && <span className="text-xs text-neutral-400 mt-1 uppercase tracking-wider">{label}</span>}
      </div>
    </div>
  );
}
