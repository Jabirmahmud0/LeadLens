import * as React from 'react';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { db, schema } from '@leadlens/database';
import { eq, desc } from 'drizzle-orm';
import { EmptyState } from '@leadlens/ui';
import { Plus, Briefcase, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { ServiceTableRow } from './ServiceTableRow';

export const metadata = {
  title: 'Services | Settings | LeadLens',
};

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const session = await getSession();
  if (!session || !session.organization) redirect('/login');
  
  const orgId = session.organization.id;
  const params = await searchParams;

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

      {params.saved === '1' && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-800/50 bg-emerald-950/40 px-4 py-3 text-sm font-medium text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Service saved successfully.
        </div>
      )}

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
                <ServiceTableRow
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  priceMinCents={service.priceMinCents}
                  summary={service.summary}
                  problemSolved={service.problemSolved}
                  isActive={service.isActive}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
