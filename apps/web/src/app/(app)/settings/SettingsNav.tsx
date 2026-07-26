'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@leadlens/ui';

export function SettingsNav() {
  const pathname = usePathname();

  const tabs = [
    { label: 'Profile Dossier', href: '/settings' },
    { label: 'Services', href: '/settings/services' },
    { label: 'Case Studies', href: '/settings/case-studies' },
  ];

  return (
    <div className="border-b border-neutral-800 mb-8">
      <nav className="-mb-px flex gap-6 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors",
                isActive 
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-neutral-400 hover:text-white hover:border-neutral-600"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
