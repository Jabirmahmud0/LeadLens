import { desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { db, schema } from '@leadlens/database';
import { getSession } from '@/lib/auth/session';
import { isPlatformAdmin } from '@/lib/auth/admin';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Security Events | LeadLens Admin' };

export default async function AdminSecurityEventsPage() {
  const session = await getSession();
  if (!session?.user || !(await isPlatformAdmin(session.user.id))) notFound();

  const events = await db.query.auditLogs.findMany({
    orderBy: [desc(schema.auditLogs.createdAt)],
    limit: 100,
  });

  return (
    <main className="app-page-enter mx-auto max-w-[1480px] p-4 sm:p-7 lg:p-9">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/admin" className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#789084] transition-colors hover:text-red-700">
            <ArrowLeft className="size-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-red-50 text-red-700">
              <ShieldAlert className="size-5" />
            </span>
            <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#16352a]">Security Events</h1>
          </div>
        </div>
      </header>
      
      <div className="overflow-hidden rounded-2xl border border-[#dce7df] bg-white shadow-[0_8px_30px_-20px_rgba(20,83,45,0.3)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#16352a]">
            <thead className="bg-[#f7faf7] text-xs uppercase text-[#60766b]">
              <tr>
                <th className="px-6 py-4 font-semibold">Event ID</th>
                <th className="px-6 py-4 font-semibold">User ID</th>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Details</th>
                <th className="px-6 py-4 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3ebe5]">
              {events.map((event) => (
                <tr key={event.id} className="transition-colors hover:bg-[#fcfdfc]">
                  <td className="px-6 py-4 font-mono text-xs">{event.id}</td>
                  <td className="px-6 py-4 font-mono text-xs">{event.userId}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold uppercase text-red-700">
                      {event.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-[#60766b] break-all max-w-xs">
                    {JSON.stringify(event.details)}
                  </td>
                  <td className="px-6 py-4 text-xs text-[#60766b]">
                    {new Date(event.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {events.length === 0 && (
            <div className="py-12 text-center text-sm text-[#789084]">
              No security events found.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
