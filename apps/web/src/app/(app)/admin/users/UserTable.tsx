'use client';

import { useState } from 'react';
import { MoreVertical, ShieldAlert, CheckCircle2, Trash2 } from 'lucide-react';
import { suspendUser, reactivateUser, deleteUser } from './actions';
import { showAdminToast } from '@/components/admin/AdminToast';

type User = {
  id: string;
  email: string;
  fullName: string | null;
  status: string;
  createdAt: Date;
  lastLoginAt: Date | null;
};

export function UserTable({ users, currentUserId }: { users: User[], currentUserId: string }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  const handleAction = async (action: 'suspend' | 'reactivate' | 'delete', userId: string, userEmail: string) => {
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
          loading: 'Reactivating user...',
          success: `Reactivated ${userEmail}`,
          error: (err) => err.message || 'Failed to reactivate user'
        });
      } else if (action === 'delete') {
        if (!window.confirm(`Are you sure you want to delete ${userEmail}?`)) {
          setLoadingId(null);
          return;
        }
        await showAdminToast.promise(deleteUser(userId), {
          loading: 'Deleting user...',
          success: `Deleted ${userEmail}`,
          error: (err) => err.message || 'Failed to delete user'
        });
      }
    } catch (e) {
      // Swallowed to prevent Next.js dev overlay, toast handles UI
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
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Joined</th>
              <th className="px-6 py-4 font-semibold">Last Login</th>
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
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    user.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                    user.status === 'suspended' ? 'bg-amber-50 text-amber-700' :
                    'bg-rose-50 text-rose-700'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-[#60766b]">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-xs text-[#60766b]">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-6 py-4 text-right">
                  {user.id !== currentUserId && user.status !== 'deleted' && (
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
                          onClick={() => handleAction('reactivate', user.id, user.email)}
                          disabled={loadingId === user.id}
                          className="rounded-lg p-2 text-[#789084] transition hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
                          title="Reactivate User"
                        >
                          <CheckCircle2 className="size-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleAction('delete', user.id, user.email)}
                        disabled={loadingId === user.id}
                        className="rounded-lg p-2 text-[#789084] transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
                        title="Delete User"
                      >
                        <Trash2 className="size-4" />
                      </button>
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
    </div>
  );
}
