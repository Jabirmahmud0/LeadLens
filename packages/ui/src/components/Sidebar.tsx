import * as React from 'react';
import { cn } from '../lib/utils';
import { LucideIcon } from 'lucide-react';

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  agencyName?: string;
  logo?: React.ReactNode;
  tone?: 'dark' | 'light';
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

export function Sidebar({ agencyName, logo, navGroups, userProfile, tone = 'dark', className, ...props }: SidebarProps) {
  const isLight = tone === 'light';
  return (
    <div className={cn("flex h-full flex-col", isLight ? "bg-[#fbfcf8]" : "bg-neutral-950", className)} {...props}>
      {/* Header */}
      <div className={cn("flex h-16 shrink-0 items-center gap-3 border-b px-6", isLight ? "border-[#dce7df]" : "border-neutral-800")}>
        {logo ? (
          logo
        ) : (
          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold", isLight ? "bg-[#166534] text-white" : "bg-white text-black")}>
            {agencyName ? agencyName.substring(0,2).toUpperCase() : 'LL'}
          </div>
        )}
        <span className={cn("truncate font-semibold", isLight ? "text-[#10251d]" : "text-white")}>
          {agencyName || 'LeadLens'}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
        {navGroups.map((group, i) => (
          <div key={i}>
            {group.label && (
              <h3 className={cn("mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.16em]", isLight ? "text-[#8ba096]" : "text-neutral-500")}>
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
                        ? isLight ? "bg-[#e6f4e9] text-[#14532d] shadow-[inset_0_0_0_1px_#cce6d3]" : "bg-neutral-800 text-white"
                        : isLight ? "text-[#60766b] hover:bg-[#f0f6f1] hover:text-[#16352a]" : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 shrink-0 transition-colors",
                      item.isActive ? isLight ? "text-emerald-700" : "text-white" : isLight ? "text-[#8ca096] group-hover:text-emerald-700" : "text-neutral-500 group-hover:text-neutral-300"
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
        <div className={cn("shrink-0 border-t p-4", isLight ? "border-[#dce7df]" : "border-neutral-800")}>
          {userProfile}
        </div>
      )}
    </div>
  );
}
