import { desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { db, schema } from '@leadlens/database';
import { getSession } from '@/lib/auth/session';
import { isPlatformAdmin } from '@/lib/auth/admin';
import { Users } from 'lucide-react';
import { UserTable } from './UserTable';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Manage Users | LeadLens Admin' };

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session?.user || !(await isPlatformAdmin(session.user.id))) notFound();

  const users = await db.query.users.findMany({
    columns: { id: true, email: true, fullName: true, status: true, createdAt: true, lastLoginAt: true },
    orderBy: [desc(schema.users.createdAt)],
    limit: 100,
  });

  return (
    <main className="app-page-enter mx-auto max-w-[1480px] p-4 sm:p-7 lg:p-9">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/admin" className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#789084] transition-colors hover:text-emerald-700">
            <ArrowLeft className="size-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <Users className="size-5" />
            </span>
            <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#16352a]">Platform Users</h1>
          </div>
        </div>
      </header>
      
      <UserTable users={users} currentUserId={session.user.id} />
    </main>
  );
}
