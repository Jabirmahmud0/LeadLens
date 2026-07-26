'use client';

import * as React from 'react';
import { Sidebar } from '@leadlens/ui';
import { usePathname } from 'next/navigation';

interface ClientSidebarWrapperProps {
  agencyName: string;
  userProfile: React.ReactNode;
  navGroups: any[];
}

export function ClientSidebarWrapper({ agencyName, userProfile, navGroups }: ClientSidebarWrapperProps) {
  const pathname = usePathname();

  // Inject isActive state based on current pathname
  const activeNavGroups = navGroups.map(group => ({
    ...group,
    items: group.items.map((item: any) => ({
      ...item,
      isActive: pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/'),
    }))
  }));

  return (
    <Sidebar
      agencyName={agencyName}
      navGroups={activeNavGroups}
      userProfile={userProfile}
    />
  );
}
