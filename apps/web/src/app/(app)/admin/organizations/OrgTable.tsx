'use client';

import { useState } from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { suspendOrganization, reactivateOrganization } from './actions';
import { showAdminToast } from '@/components/admin/AdminToast';

type Organization = {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: Date;
  websiteUrl: string | null;
};

export function OrgTable({ orgs }: { orgs: Organization[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  const handleAction = async (action: 'suspend' | 'reactivate', orgId: string, orgName: string) => {
    setLoadingId(orgId);
    try {
      if (action === 'suspend') {
        await showAdminToast.promise(suspendOrganization(orgId), {
          loading: 'Suspending organization...',
          success: `Suspended ${orgName}`,
          error: (err) => err.message || 'Failed to suspend organization'
        });
      } else if (action === 'reactivate') {
        await showAdminToast.promise(reactivateOrganization(orgId), {
          loading: 'Reactivating organization...',
          success: `Reactivated ${orgName}`,
          error: (err) => err.message || 'Failed to reactivate organization'
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
              <th className="px-6 py-4 font-semibold">Organization</th>
              <th className="px-6 py-4 font-semibold">Website</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Created</th>
              <th className="px-6 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e3ebe5]">
            {orgs.map((org) => (
              <tr key={org.id} className="transition-colors hover:bg-[#fcfdfc]">
                <td className="px-6 py-4">
                  <p className="font-semibold">{org.name}</p>
                  <p className="mt-0.5 text-xs text-[#789084]">{org.slug}</p>
                </td>
                <td className="px-6 py-4 text-xs text-[#60766b]">
                  {org.websiteUrl ? (
                    <a href={org.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-700 hover:underline">
                      {org.websiteUrl.replace(/^https?:\/\//, '')}
                    </a>
                  ) : '—'}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    org.status === 'active' ? 'bg-teal-50 text-teal-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>
                    {org.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-[#60766b]">
                  {new Date(org.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {org.status === 'active' ? (
                      <button 
                        onClick={() => handleAction('suspend', org.id, org.name)}
                        disabled={loadingId === org.id}
                        className="rounded-lg p-2 text-[#789084] transition hover:bg-amber-50 hover:text-amber-700 disabled:opacity-50"
                        title="Suspend Organization"
                      >
                        <ShieldAlert className="size-4" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleAction('reactivate', org.id, org.name)}
                        disabled={loadingId === org.id}
                        className="rounded-lg p-2 text-[#789084] transition hover:bg-teal-50 hover:text-teal-700 disabled:opacity-50"
                        title="Reactivate Organization"
                      >
                        <CheckCircle2 className="size-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orgs.length === 0 && (
          <div className="py-12 text-center text-sm text-[#789084]">
            No organizations found.
          </div>
        )}
      </div>
    </div>
  );
}
