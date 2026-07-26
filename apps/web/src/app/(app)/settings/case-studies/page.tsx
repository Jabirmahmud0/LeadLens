import * as React from 'react';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { db, schema } from '@leadlens/database';
import { eq, desc } from 'drizzle-orm';
import { Badge, EmptyState } from '@leadlens/ui';
import { Plus, FileText, ArrowUpRight, Lock, Globe } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Case Studies | Settings | LeadLens',
};

export default async function CaseStudiesPage() {
  const session = await getSession();
  if (!session || !session.organization) redirect('/login');
  
  const orgId = session.organization.id;

  const caseStudies = await db.query.caseStudies.findMany({
    where: eq(schema.caseStudies.organizationId, orgId),
    orderBy: [desc(schema.caseStudies.createdAt)]
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-white">Proof Library</h2>
        <Link href="/onboarding/case-studies" className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Case Study
        </Link>
      </div>

      {caseStudies.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No case studies yet"
          description="Build your proof library so LeadLens can automatically cite past results in proposals."
          action={
            <Link href="/onboarding/case-studies" className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 mt-4 inline-block">
              Add First Case Study
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {caseStudies.map(cs => (
            <div key={cs.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition-all group flex flex-col h-full shadow-sm">
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {cs.visibility === 'public' ? (
                      <Badge variant="neutral" className="flex items-center gap-1"><Globe className="w-3 h-3" /> Public</Badge>
                    ) : (
                      <Badge variant="neutral" className="flex items-center gap-1"><Lock className="w-3 h-3" /> Private</Badge>
                    )}
                  </div>
                  <Link href="/onboarding/case-studies" className="text-neutral-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                    Edit
                  </Link>
                </div>
                
                <h3 className="text-lg font-medium text-white mb-2 line-clamp-2">{cs.title}</h3>
                
                <p className="text-sm text-neutral-400 mb-4 line-clamp-3 flex-1">
                  {cs.results || cs.solution || 'No details provided.'}
                </p>
                
                <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-sm">
                  <div className="text-neutral-500 truncate max-w-[150px]">
                    {cs.clientIndustry || 'General'} {cs.clientType && `• ${cs.clientType}`}
                  </div>
                  {cs.publicUrl && (
                    <a href={cs.publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium">
                      View
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
