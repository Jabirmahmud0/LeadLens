import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { db, schema } from '@leadlens/database';
import { eq } from 'drizzle-orm';
import { ComposerClient } from './ComposerClient';

export const metadata = {
  title: 'New Analysis | LeadLens',
};

export const maxDuration = 300;

export default async function NewAnalysisPage() {
  const session = await getSession();
  if (!session || !session.organization) redirect('/login');

  const services = await db.query.agencyServices.findMany({
    where: eq(schema.agencyServices.organizationId, session.organization.id)
  });

  const caseStudies = await db.query.caseStudies.findMany({
    where: eq(schema.caseStudies.organizationId, session.organization.id)
  });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen">
      <div className="p-6 sm:p-8 max-w-6xl mx-auto w-full flex-1 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white tracking-tight">New Analysis</h1>
          <p className="text-sm text-neutral-400 mt-1">Configure and launch a deep scan on a prospect.</p>
        </div>
        
        <ComposerClient services={services} caseStudies={caseStudies} />
      </div>
    </div>
  );
}
