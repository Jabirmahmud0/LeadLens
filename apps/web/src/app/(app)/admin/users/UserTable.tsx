'use client';

import { useState } from 'react';
import { ShieldAlert, CheckCircle2, Trash2, Save, Building2 } from 'lucide-react';
import { suspendUser, reactivateUser, deleteUser, setUserPlanOverride, clearUserPlanOverride } from './actions';
import { showAdminToast } from '@/components/admin/AdminToast';
import type { BillingPlanKey } from '@leadlens/shared';

type User = {
  id: string;
  email: string;
  fullName: string | null;
  status: string;
  createdAt: Date;
  lastLoginAt: Date | null;
  organizationId: string | null;
  organizationName: string | null;
  workspaceRole: string | null;
  workspaceCount: number;
  planKey: BillingPlanKey;
  planName: string;
  planSource: 'override' | 'stripe' | 'hobby';
  adminPlanOverride: string | null;
  subscriptionStatus: string | null;
};

export function UserTable({ users, currentUserId }: { users: User[], currentUserId: string }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; email: string } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [planDrafts, setPlanDrafts] = useState<Record<string, 'billing' | 'free' | 'solo' | 'agency'>>({});
  
  const handleAction = async (action: 'suspend' | 'reactivate', userId: string, userEmail: string, wasDeleted = false) => {
    setLoadingId(userId);
    try {
      if (action === 'suspend') {
        await showAdminToast.promise(suspendUser(userId), {
          loading: 'Suspending user...',
          success: `Suspended ${userEmail}`,
          error: (err) => err.message || 'Failed to suspend user'
        });
      } else if (action === 'reactivate') {
        await showAdminToast.promise(reactivateUser(userId), {
          loading: wasDeleted ? 'Restoring user...' : 'Reactivating user...',
          success: wasDeleted ? `Restored ${userEmail}. A fresh login is required.` : `Reactivated ${userEmail}. A fresh login is required.`,
          error: (err) => err.message || (wasDeleted ? 'Failed to restore user' : 'Failed to reactivate user')
        });
      }
    } catch {
      // Swallowed to prevent Next.js dev overlay, toast handles UI
    } finally {
      setLoadingId(null);
    }
  };

  const handlePlanChange = async (user: User) => {
    if (!user.organizationId) return;
    const selected = planDrafts[user.id] ?? (user.adminPlanOverride as 'free' | 'solo' | 'agency' | null) ?? 'billing';
    setLoadingId(user.id);
    try {
      const request = selected === 'billing'
        ? clearUserPlanOverride({ userId: user.id, organizationId: user.organizationId })
        : setUserPlanOverride({ userId: user.id, organizationId: user.organizationId, planKey: selected });
      await showAdminToast.promise(request, {
        loading: 'Updating workspace access...',
        success: selected === 'billing'
          ? `${user.organizationName} now follows its Stripe or Hobby plan.`
          : `${user.organizationName} now has ${selected === 'free' ? 'Hobby' : selected[0].toUpperCase() + selected.slice(1)} access.`,
        error: (error) => error.message || 'Failed to update the plan',
      });
    } catch {
      // The custom toast owns the visible error state.
    } finally {
      setLoadingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleteConfirmation !== deleteTarget.email) return;
    setLoadingId(deleteTarget.id);
    try {
      await showAdminToast.promise(deleteUser(deleteTarget.id), {
        loading: 'Removing account access...',
        success: `Removed ${deleteTarget.email}`,
        error: (err) => err.message || 'Failed to remove user',
      });
      setDeleteTarget(null);
      setDeleteConfirmation('');
    } catch {
      // The custom toast owns the visible error state.
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[#dce7df] bg-white shadow-[0_8px_30px_-20px_rgba(20,83,45,0.3)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#16352a]">
          <thead className="bg-[#f7faf7] text-xs uppercase text-[#60766b]">
            <tr>
              <th className="px-6 py-4 font-semibold">User</th>
              <th className="px-6 py-4 font-semibold">Workspace</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Plan & access</th>
              <th className="px-6 py-4 font-semibold">Activity</th>
              <th className="px-6 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e3ebe5]">
            {users.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-[#fcfdfc]">
                <td className="px-6 py-4">
                  <p className="font-semibold">{user.fullName || 'No name'}</p>
                  <p className="mt-0.5 text-xs text-[#789084]">{user.email}</p>
                </td>
                <td className="px-6 py-4">
                  {user.organizationName ? <><p className="flex items-center gap-1.5 font-semibold"><Building2 className="size-3.5 text-emerald-700" />{user.organizationName}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-[#789084]">{user.workspaceRole}{user.workspaceCount > 1 ? ` · +${user.workspaceCount - 1} more` : ''}</p></> : <span className="text-xs text-[#9aaba1]">No workspace</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    user.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                    user.status === 'suspended' ? 'bg-amber-50 text-amber-700' :
                    'bg-rose-50 text-rose-700'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="min-w-[260px] px-6 py-4">
                  <div className="mb-2 flex items-center gap-2"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">{user.planName}</span><span className="text-[10px] uppercase tracking-wide text-[#789084]">{user.planSource === 'override' ? 'Owner override' : user.planSource === 'stripe' ? `Stripe · ${user.subscriptionStatus}` : 'Hobby fallback'}</span></div>
                  {user.organizationId && <div className="flex items-center gap-2"><select aria-label={`Plan access for ${user.email}`} value={planDrafts[user.id] ?? (user.adminPlanOverride as 'free' | 'solo' | 'agency' | null) ?? 'billing'} onChange={(event) => setPlanDrafts((current) => ({ ...current, [user.id]: event.target.value as 'billing' | 'free' | 'solo' | 'agency' }))} disabled={loadingId === user.id} className="h-9 min-w-0 flex-1 rounded-lg border border-[#d6e3da] bg-white px-2 text-xs font-semibold text-[#365246] outline-none focus:border-emerald-500"><option value="billing">Use billing plan</option><option value="free">Hobby · 5</option><option value="solo">Solo · 50</option><option value="agency">Agency · 200</option></select><button type="button" onClick={() => void handlePlanChange(user)} disabled={loadingId === user.id || (planDrafts[user.id] ?? (user.adminPlanOverride ?? 'billing')) === (user.adminPlanOverride ?? 'billing')} title="Apply access plan" className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#176b3a] text-white transition hover:bg-[#145a32] disabled:cursor-not-allowed disabled:opacity-35"><Save className="size-3.5" /></button></div>}
                  <p className="mt-2 text-[10px] leading-4 text-[#8a9d92]">Access override only. Stripe charges and invoices are unchanged.</p>
                </td>
                <td className="px-6 py-4 text-xs text-[#60766b]">
                  <p>Joined {new Date(user.createdAt).toLocaleDateString()}</p><p className="mt-1 text-[#789084]">Last login {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'never'}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  {user.id !== currentUserId && (
                    <div className="flex items-center justify-end gap-2">
                      {user.status === 'active' ? (
                        <button 
                          onClick={() => handleAction('suspend', user.id, user.email)}
                          disabled={loadingId === user.id}
                          className="rounded-lg p-2 text-[#789084] transition hover:bg-amber-50 hover:text-amber-700 disabled:opacity-50"
                          title="Suspend User"
                        >
                          <ShieldAlert className="size-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleAction('reactivate', user.id, user.email, user.status === 'deleted')}
                          disabled={loadingId === user.id}
                          className="rounded-lg p-2 text-[#789084] transition hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
                          title={user.status === 'deleted' ? 'Restore User' : 'Reactivate User'}
                        >
                          <CheckCircle2 className="size-4" />
                        </button>
                      )}
                      {user.status !== 'deleted' && (
                        <button 
                          onClick={() => { setDeleteTarget({ id: user.id, email: user.email }); setDeleteConfirmation(''); }}
                          disabled={loadingId === user.id}
                          className="rounded-lg p-2 text-[#789084] transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
                          title="Delete User"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="py-12 text-center text-sm text-[#789084]">
            No users found.
          </div>
        )}
      </div>
      {deleteTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#10251d]/35 p-4 backdrop-blur-sm">
          <section role="alertdialog" aria-modal="true" aria-labelledby="delete-user-title" aria-describedby="delete-user-description" className="w-full max-w-md rounded-[24px] border border-rose-100 bg-white p-6 shadow-[0_30px_90px_-35px_rgba(15,35,24,.55)]">
            <span className="grid size-11 place-items-center rounded-2xl bg-rose-50 text-rose-700"><Trash2 className="size-5" /></span>
            <h2 id="delete-user-title" className="mt-5 text-xl font-bold tracking-[-0.03em] text-[#16352a]">Remove this platform account?</h2>
            <p id="delete-user-description" className="mt-2 text-sm leading-6 text-[#60766b]">This soft-deletes <strong className="text-[#16352a]">{deleteTarget.email}</strong>, revokes every session, and reserves the email so it cannot be registered again. A Platform Owner can restore it later.</p>
            <label htmlFor="delete-user-confirmation" className="mt-5 block text-xs font-semibold text-[#365246]">Type the email to confirm</label>
            <input suppressHydrationWarning id="delete-user-confirmation" autoFocus value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#d6e3da] px-3 text-sm text-[#16352a] outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100" />
            <div className="mt-6 flex gap-3"><button type="button" onClick={() => { setDeleteTarget(null); setDeleteConfirmation(''); }} disabled={loadingId === deleteTarget.id} className="h-11 flex-1 rounded-xl border border-[#d6e3da] bg-white text-sm font-semibold text-[#365246] hover:bg-[#f7faf7] disabled:opacity-50">Cancel</button><button type="button" onClick={() => void confirmDelete()} disabled={deleteConfirmation !== deleteTarget.email || loadingId === deleteTarget.id} className="h-11 flex-1 rounded-xl bg-rose-600 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40">Remove user</button></div>
          </section>
        </div>
      )}
    </div>
  );
}
