'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { grantPlatformOwner, revokePlatformOwner } from './actions';
import { showAdminToast } from '@/components/admin/AdminToast';

export function RevokeOwnerForm({ userId, email }: { userId: string, email: string }) {
  const [loading, setLoading] = useState(false);

  const action = async (formData: FormData) => {
    setLoading(true);
    try {
      await showAdminToast.promise(revokePlatformOwner(formData), {
        loading: 'Revoking access...',
        success: `Revoked platform owner access for ${email}`,
        error: (err) => err.message || 'Failed to revoke access'
      });
    } catch (e) {
      // Swallowed to prevent Next.js dev overlay, toast handles UI
    } finally {
      setLoading(false);
    }
  };

  return (
    <form action={action} className="flex w-full gap-2 sm:w-auto">
      <input type="hidden" name="userId" value={userId} />
      <input suppressHydrationWarning required minLength={8} maxLength={300} name="reason" aria-label={`Reason to revoke ${email}`} placeholder="Reason for revocation" className="h-9 min-w-0 flex-1 rounded-lg border border-[#d6e3da] px-3 text-xs text-[#16352a] outline-none focus:border-rose-400 sm:w-48" disabled={loading} />
      <button disabled={loading} className="h-9 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50">
        Revoke
      </button>
    </form>
  );
}

export function GrantOwnerForm() {
  const [loading, setLoading] = useState(false);

  const action = async (formData: FormData) => {
    setLoading(true);
    try {
      await showAdminToast.promise(grantPlatformOwner(formData), {
        loading: 'Granting access...',
        success: `Granted platform owner access`,
        error: (err) => err.message || 'Failed to grant access'
      });
    } catch (e) {
      // Swallowed to prevent Next.js dev overlay, toast handles UI
    } finally {
      setLoading(false);
    }
  };

  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label htmlFor="owner-email" className="text-xs font-semibold text-[#365246]">Account email</label>
        <input suppressHydrationWarning disabled={loading} id="owner-email" name="email" type="email" required placeholder="owner@example.com" className="mt-2 h-11 w-full rounded-xl border border-[#d6e3da] px-3 text-sm text-[#16352a] outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
      </div>
      <div>
        <label htmlFor="owner-reason" className="text-xs font-semibold text-[#365246]">Reason</label>
        <textarea suppressHydrationWarning disabled={loading} id="owner-reason" name="reason" required minLength={8} maxLength={300} rows={3} placeholder="Why this person requires full platform access" className="mt-2 w-full resize-y rounded-xl border border-[#d6e3da] px-3 py-3 text-sm text-[#16352a] outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
      </div>
      <button disabled={loading} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#166534] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#14532d] disabled:opacity-50 disabled:hover:translate-y-0">
        <UserPlus className="size-4" /> Grant platform owner
      </button>
    </form>
  );
}
