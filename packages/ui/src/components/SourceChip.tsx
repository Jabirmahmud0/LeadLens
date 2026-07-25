import * as React from 'react';
import { cn } from '../lib/utils';
import { ExternalLink, Clock } from 'lucide-react';
import { Badge } from './Badge';

export interface SourceChipProps extends React.HTMLAttributes<HTMLDivElement> {
  url: string;
  accessedAt?: string;
  confidence?: 'high' | 'medium' | 'low';
}

export function SourceChip({
  url,
  accessedAt,
  confidence,
  className,
  ...props
}: SourceChipProps) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    const path = urlObj.pathname.length > 15 ? urlObj.pathname.substring(0, 15) + '...' : urlObj.pathname;
    
    return (
      <div className={cn("inline-flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-sm", className)} {...props}>
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-neutral-300 hover:text-white transition-colors group">
          <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white" />
          <span className="font-medium">{domain}</span>
          <span className="text-neutral-500">{path}</span>
        </a>
        
        {(accessedAt || confidence) && (
          <div className="flex items-center gap-2 pl-3 border-l border-neutral-800">
            {accessedAt && (
              <span className="flex items-center gap-1 text-xs text-neutral-500">
                <Clock className="w-3 h-3" />
                {accessedAt}
              </span>
            )}
            {confidence === 'high' && <Badge variant="success">High Confidence</Badge>}
            {confidence === 'medium' && <Badge variant="warning">Med Confidence</Badge>}
            {confidence === 'low' && <Badge variant="error">Low Confidence</Badge>}
          </div>
        )}
      </div>
    );
  } catch (e) {
    // Fallback if URL is invalid
    return (
      <div className={cn("inline-flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-sm text-neutral-400", className)} {...props}>
        {url}
      </div>
    );
  }
}
