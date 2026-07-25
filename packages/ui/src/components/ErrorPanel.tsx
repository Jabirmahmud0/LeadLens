import * as React from 'react';
import { cn } from '../lib/utils';
import { AlertCircle, RefreshCw } from 'lucide-react';

export interface ErrorPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message: string;
  succeededText?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function ErrorPanel({
  title = "Something went wrong",
  message,
  succeededText,
  onRetry,
  isRetrying = false,
  className,
  ...props
}: ErrorPanelProps) {
  return (
    <div className={cn("rounded-xl border border-red-900/50 bg-red-950/20 p-6", className)} {...props}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-red-500" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="text-base font-medium text-red-200">{title}</h4>
            <p className="text-sm text-red-300/80 mt-1 leading-relaxed">
              {message}
            </p>
          </div>

          {succeededText && (
            <div className="text-sm text-neutral-400 border-t border-red-900/30 pt-3">
              <span className="font-medium text-neutral-300">Partial Success:</span> {succeededText}
            </div>
          )}

          {onRetry && (
            <div className="pt-2">
              <button
                onClick={onRetry}
                disabled={isRetrying}
                className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn("w-4 h-4", isRetrying && "animate-spin")} />
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
