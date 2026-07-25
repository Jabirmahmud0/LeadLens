import * as React from 'react';
import { cn } from '../lib/utils';
import { LucideIcon } from 'lucide-react';

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  agencyName?: string;
  logo?: React.ReactNode;
  navGroups: {
    label?: string;
    items: {
      label: string;
      href: string;
      icon: LucideIcon;
      isActive?: boolean;
    }[];
  }[];
  userProfile?: React.ReactNode;
}

export function Sidebar({ agencyName, logo, navGroups, userProfile, className, ...props }: SidebarProps) {
  return (
    <div className={cn("flex flex-col h-full bg-neutral-950", className)} {...props}>
      {/* Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-neutral-800 shrink-0">
        {logo ? (
          logo
        ) : (
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-black text-sm shrink-0">
            {agencyName ? agencyName.substring(0,2).toUpperCase() : 'LL'}
          </div>
        )}
        <span className="font-semibold text-white truncate">
          {agencyName || 'LeadLens'}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
        {navGroups.map((group, i) => (
          <div key={i}>
            {group.label && (
              <h3 className="px-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                {group.label}
              </h3>
            )}
            <ul className="space-y-1">
              {group.items.map((item, j) => (
                <li key={j}>
                  <a
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-colors group",
                      item.isActive 
                        ? "bg-neutral-800 text-white" 
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 shrink-0 transition-colors",
                      item.isActive ? "text-white" : "text-neutral-500 group-hover:text-neutral-300"
                    )} />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer / User Profile */}
      {userProfile && (
        <div className="p-4 border-t border-neutral-800 shrink-0">
          {userProfile}
        </div>
      )}
    </div>
  );
}
