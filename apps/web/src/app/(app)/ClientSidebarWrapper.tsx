'use client';

import { Sidebar } from '@leadlens/ui';
import type { SidebarProps } from '@leadlens/ui';
import { Activity, Building2, CreditCard, LayoutDashboard, ReceiptText, Settings, ShieldCheck, User, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface ClientSidebarWrapperProps {
  agencyName: string;
  email: string;
  isAdmin: boolean;
}

export function ClientSidebarWrapper({ agencyName, email, isAdmin }: ClientSidebarWrapperProps) {
  const pathname = usePathname();

  const navGroups: SidebarProps['navGroups'] = [
    {
      label: 'Main',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Prospects', href: '/prospects', icon: Users },
        { label: 'Analyses', href: '/analyses', icon: Activity },
      ],
    },
    {
      label: 'Configuration',
      items: [
        { label: 'Agency Profile', href: '/settings', icon: Settings },
      ],
    },
    {
      label: 'Account',
      items: [
        { label: 'My Account', href: '/account', icon: User },
        { label: 'Billing', href: '/billing', icon: CreditCard },
      ],
    },
  ];

  if (isAdmin) {
    navGroups.push({
      label: 'Administration',
      items: [
        { label: 'Platform overview', href: '/admin', icon: ShieldCheck },
        { label: 'Platform users', href: '/admin/users', icon: Users },
        { label: 'Organizations', href: '/admin/organizations', icon: Building2 },
        { label: 'Billing operations', href: '/admin/billing', icon: ReceiptText },
      ],
    });
  }

  // Inject isActive state based on current pathname
  const activeNavGroups = navGroups.map(group => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      isActive: item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/'),
    }))
  }));

  return (
    <Sidebar
      agencyName={agencyName}
      navGroups={activeNavGroups}
      tone="light"
      userProfile={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <User className="h-5 w-5 text-emerald-700" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#16352a]">{email}</p>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="text-xs text-[#789084] transition-colors hover:text-emerald-700">
                Sign out
              </button>
            </form>
          </div>
        </div>
      }
    />
  );
}
