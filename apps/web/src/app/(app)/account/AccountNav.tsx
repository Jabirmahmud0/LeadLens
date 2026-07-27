'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@leadlens/ui';

export function AccountNav() {
  const pathname = usePathname();

  const tabs = [
    { label: 'Profile', href: '/account' },
    { label: 'Security', href: '/account/security' },
    { label: 'Notifications', href: '/account/notifications' },
  ];

  return (
    <div className="mb-8 overflow-x-auto rounded-2xl border border-[#dce7df] bg-white p-1.5 shadow-sm">
      <nav className="flex min-w-max gap-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "whitespace-nowrap rounded-xl px-4 py-2.5 font-medium text-sm transition-colors",
                isActive 
                  ? "bg-emerald-100 text-emerald-800 shadow-[inset_0_0_0_1px_#cce6d3]"
                  : "text-[#60766b] hover:bg-[#f1f7f2] hover:text-[#16352a]"
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
