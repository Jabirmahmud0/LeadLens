import { redirect } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { Key, MonitorSmartphone, Shield } from 'lucide-react';
import { db, schema } from '@leadlens/database';
import { getSession } from '@/lib/auth/session';
import { changePassword, logoutOtherSessions, revokeSessionAction } from './actions';
import { DangerActions } from './DangerActions';

export const metadata = { title: 'Security | Account | LeadLens' };

export default async function SecurityPage() {
  const session = await getSession();
  if (!session?.user) redirect('/login');
  const sessions = await db.query.sessions.findMany({
    where: eq(schema.sessions.userId, session.user.id),
    orderBy: [desc(schema.sessions.lastSeenAt)],
  });
  const activeSessions = sessions.filter((item) => !item.revokedAt && item.expiresAt > new Date());

  return <div className="space-y-8">
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3"><Key className="h-5 w-5 text-neutral-400" /><div><h2 className="text-xl text-white">Password</h2><p className="text-sm text-neutral-400">Changing it signs out every other device.</p></div></div>
      <form action={changePassword} className="max-w-md space-y-4">
        <label className="block text-sm text-neutral-300">Current password<input name="currentPassword" type="password" autoComplete="current-password" required className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-white" /></label>
        <label className="block text-sm text-neutral-300">New password<input name="newPassword" type="password" autoComplete="new-password" minLength={12} required className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-white" /></label>
        <button className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black">Update password</button>
      </form>
    </section>

    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4"><div className="flex items-center gap-3"><MonitorSmartphone className="h-5 w-5 text-neutral-400" /><div><h2 className="text-xl text-white">Active sessions</h2><p className="text-sm text-neutral-400">Device details come from the recorded user agent; IP values are stored only as hashes.</p></div></div><form action={logoutOtherSessions}><button className="text-sm text-red-300">Log out other devices</button></form></div>
      <div className="space-y-3">{activeSessions.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4"><div><p className="max-w-xl truncate text-sm text-white">{item.userAgent || 'Unknown device'} {item.id === session.session.id && <span className="text-green-400">· Current</span>}</p><p className="mt-1 text-xs text-neutral-500">Last active {item.lastSeenAt.toLocaleString()} · Created {item.createdAt.toLocaleDateString()}</p></div>{item.id !== session.session.id && <form action={revokeSessionAction}><input type="hidden" name="sessionId" value={item.id} /><button className="text-xs text-neutral-300 hover:text-white">Revoke</button></form>}</div>)}</div>
    </section>

    <section className="rounded-2xl border border-red-900/30 bg-neutral-900 p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3"><Shield className="h-5 w-5 text-red-400" /><div><h2 className="text-xl text-white">Data and danger zone</h2><p className="text-sm text-neutral-400">Export your data before deleting it.</p></div></div>
      <DangerActions email={session.user.email} canDelete={session.role === 'owner'} />
    </section>
  </div>;
}
