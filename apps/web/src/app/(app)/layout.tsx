import { ClientAppShell } from './ClientAppShell';
import { ClientSidebarWrapper } from './ClientSidebarWrapper';
import { getSession } from '@/lib/auth/session';
import { isPlatformAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || !session.user || !session.organization) {
    redirect('/login');
  }

  if (!session.user.emailVerifiedAt) {
    redirect(`/verify-email?email=${encodeURIComponent(session.user.email)}`);
  }

  const agencyName = session.organization.name || 'Your Agency';
  const isAdmin = await isPlatformAdmin(session.user.id);

  return (
    <ClientAppShell
      sidebar={
        <ClientSidebarWrapper
          agencyName={agencyName}
          email={session.user.email}
          isAdmin={isAdmin}
        />
      }
    >
      {children}
    </ClientAppShell>
  );
}
