'use client';

import { Download, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function DangerActions({ email, canDelete }: { email: string; canDelete: boolean }) {
  const [confirmEmail, setConfirmEmail] = useState('');
  const router = useRouter();
  return (
    <div className="space-y-4">
      <a href="/api/data/export" className="inline-flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-sm text-white hover:bg-neutral-700">
        <Download className="h-4 w-4" /> Export account data
      </a>
      {canDelete && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-4">
          <p className="text-sm font-medium text-white">Delete workspace and account</p>
          <p className="mt-1 text-xs text-neutral-400">Type {email} to permanently delete all workspace data.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input value={confirmEmail} onChange={(event) => setConfirmEmail(event.target.value)} className="rounded-lg border border-red-900 bg-neutral-950 px-3 py-2 text-sm text-white" aria-label="Confirm account email" />
            <button
              type="button"
              disabled={confirmEmail.toLowerCase() !== email.toLowerCase()}
              onClick={async () => {
                if (!window.confirm('This permanently deletes the workspace, reports, and account. Continue?')) return;
                const response = await fetch('/api/data/account', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ confirmEmail }) });
                if (!response.ok) return toast.error('Unable to delete account');
                router.push('/');
                router.refresh();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            ><Trash2 className="h-4 w-4" /> Delete permanently</button>
          </div>
        </div>
      )}
    </div>
  );
}
