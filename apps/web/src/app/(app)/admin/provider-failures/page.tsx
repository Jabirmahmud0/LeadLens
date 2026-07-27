import { desc, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { db, schema } from '@leadlens/database';
import { getSession } from '@/lib/auth/session';
import { isPlatformAdmin } from '@/lib/auth/admin';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Provider Failures | LeadLens Admin' };

export default async function AdminProviderFailuresPage() {
  const session = await getSession();
  if (!session?.user || !(await isPlatformAdmin(session.user.id))) notFound();

  const failedRuns = await db.query.aiRuns.findMany({
    where: eq(schema.aiRuns.status, 'failed'),
    orderBy: [desc(schema.aiRuns.createdAt)],
    limit: 100,
  });

  return (
    <main className="app-page-enter mx-auto max-w-[1480px] p-4 sm:p-7 lg:p-9">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/admin" className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#789084] transition-colors hover:text-amber-700">
            <ArrowLeft className="size-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <Sparkles className="size-5" />
            </span>
            <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#16352a]">Provider Failures</h1>
          </div>
        </div>
      </header>
      
      <div className="overflow-hidden rounded-2xl border border-[#dce7df] bg-white shadow-[0_8px_30px_-20px_rgba(20,83,45,0.3)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#16352a]">
            <thead className="bg-[#f7faf7] text-xs uppercase text-[#60766b]">
              <tr>
                <th className="px-6 py-4 font-semibold">Run ID</th>
                <th className="px-6 py-4 font-semibold">Provider</th>
                <th className="px-6 py-4 font-semibold">Model</th>
                <th className="px-6 py-4 font-semibold">Error</th>
                <th className="px-6 py-4 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3ebe5]">
              {failedRuns.map((run) => (
                <tr key={run.id} className="transition-colors hover:bg-[#fcfdfc]">
                  <td className="px-6 py-4 font-mono text-xs">{run.id}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase text-amber-700">
                      {run.provider}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-[#16352a]">{run.model}</td>
                  <td className="px-6 py-4 text-xs text-[#60766b]">
                    {run.errorCode || 'No error details recorded.'}
                  </td>
                  <td className="px-6 py-4 text-xs text-[#60766b]">
                    {new Date(run.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {failedRuns.length === 0 && (
            <div className="py-12 text-center text-sm text-[#789084]">
              No provider failures found.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
