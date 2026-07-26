import { AppShell } from '@leadlens/ui';
import { ClientSidebarWrapper } from './ClientSidebarWrapper';
import { LayoutDashboard, Users, Activity, Settings, User } from 'lucide-react';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { db, schema } from '@leadlens/database';
import { eq } from 'drizzle-orm';
import Link from 'next/link';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || !session.user || !session.organization) {
    redirect('/login');
  }

  // Get agency profile
  const profiles = await db
    .select({ name: schema.agencyProfiles.name })
    .from(schema.agencyProfiles)
    .where(eq(schema.agencyProfiles.organizationId, session.organization.id))
    .limit(1);
    
  const agencyName = profiles.length > 0 ? profiles[0].name : 'Your Agency';

  const navGroups = [
    {
      label: 'Main',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Prospects', href: '/prospects', icon: Users },
        { label: 'Analyses', href: '/analyses', icon: Activity },
      ]
    },
    {
      label: 'Configuration',
      items: [
        { label: 'Agency Profile', href: '/settings', icon: Settings },
      ]
    }
  ];

  const userProfileNode = (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
        <User className="w-5 h-5 text-neutral-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{session.user.email}</p>
        <Link href="/logout" className="text-xs text-neutral-500 hover:text-white transition-colors">Sign out</Link>
      </div>
    </div>
  );

  return (
    <AppShell
      sidebar={
        <ClientSidebarWrapper
          agencyName={agencyName}
          navGroups={navGroups}
          userProfile={userProfileNode}
        />
      }
    >
      {children}
    </AppShell>
  );
}
