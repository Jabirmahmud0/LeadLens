import * as React from 'react';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { db, schema } from '@leadlens/database';
import { eq, desc } from 'drizzle-orm';
import { EmptyState } from '@leadlens/ui';
import { Plus, Briefcase, MoreHorizontal, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Services | Settings | LeadLens',
};

export default async function ServicesPage() {
  const session = await getSession();
  if (!session || !session.organization) redirect('/login');
  
  const orgId = session.organization.id;

  const services = await db.query.agencyServices.findMany({
    where: eq(schema.agencyServices.organizationId, orgId),
    orderBy: [desc(schema.agencyServices.createdAt)]
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-white">Service Portfolio</h2>
        <Link href="/onboarding/services" className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Service
        </Link>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No services configured"
          description="Add your core service offerings so LeadLens can match them to prospect issues."
          action={
            <Link href="/onboarding/services" className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 mt-4 inline-block">
              Create Service
            </Link>
          }
        />
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/50">
                <th className="py-4 px-6 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Service Name</th>
                <th className="py-4 px-6 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Description</th>
                <th className="py-4 px-6 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-neutral-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {services.map(service => (
                <tr key={service.id} className="hover:bg-neutral-800/20 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5 text-neutral-400 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{service.name}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{service.priceMinCents ? `$${(service.priceMinCents / 100).toLocaleString()}+` : 'Custom Pricing'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-neutral-400 line-clamp-2 max-w-sm">
                      {service.summary || service.problemSolved || 'No description provided.'}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    {service.isActive ? (
                      <div className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Active
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                        <XCircle className="w-4 h-4" />
                        Inactive
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link href="/onboarding/services" aria-label={`Edit ${service.name}`} className="inline-flex p-2 text-neutral-500 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
