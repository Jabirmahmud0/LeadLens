import { desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { db, schema } from '@leadlens/database';
import { getSession } from '@/lib/auth/session';
import { isPlatformAdmin } from '@/lib/auth/admin';
import { MessageSquareText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Feedback Entries | LeadLens Admin' };

export default async function AdminFeedbackPage() {
  const session = await getSession();
  if (!session?.user || !(await isPlatformAdmin(session.user.id))) notFound();

  const feedback = await db.query.reportFeedback.findMany({
    orderBy: [desc(schema.reportFeedback.createdAt)],
    limit: 100,
  });

  return (
    <main className="app-page-enter mx-auto max-w-[1480px] p-4 sm:p-7 lg:p-9">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/admin" className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#789084] transition-colors hover:text-orange-700">
            <ArrowLeft className="size-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-orange-50 text-orange-700">
              <MessageSquareText className="size-5" />
            </span>
            <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#16352a]">Feedback Entries</h1>
          </div>
        </div>
      </header>
      
      <div className="overflow-hidden rounded-2xl border border-[#dce7df] bg-white shadow-[0_8px_30px_-20px_rgba(20,83,45,0.3)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#16352a]">
            <thead className="bg-[#f7faf7] text-xs uppercase text-[#60766b]">
              <tr>
                <th className="px-6 py-4 font-semibold">Report ID</th>
                <th className="px-6 py-4 font-semibold">User ID</th>
                <th className="px-6 py-4 font-semibold">Feedback</th>
                <th className="px-6 py-4 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3ebe5]">
              {feedback.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-[#fcfdfc]">
                  <td className="px-6 py-4 font-mono text-xs">{item.reportId}</td>
                  <td className="px-6 py-4 font-mono text-xs">{item.userId || 'Anonymous'}</td>
                  <td className="px-6 py-4 text-xs font-medium text-[#16352a]">{item.comments || 'No text'}</td>
                  <td className="px-6 py-4 text-xs text-[#60766b]">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {feedback.length === 0 && (
            <div className="py-12 text-center text-sm text-[#789084]">
              No feedback entries found.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
