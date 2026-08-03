import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db, schema } from '@leadlens/database';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  const session = await getSession();
  if (!session?.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const organizationId = session.organization.id;
  const [services, caseStudies, profile, icp] = await Promise.all([
    db.query.agencyServices.findMany({ where: and(eq(schema.agencyServices.organizationId, organizationId), eq(schema.agencyServices.isActive, true)) }),
    db.query.caseStudies.findMany({ where: eq(schema.caseStudies.organizationId, organizationId) }),
    db.query.agencyProfiles.findFirst({ where: eq(schema.agencyProfiles.organizationId, organizationId) }),
    db.query.idealCustomerProfiles.findFirst({ where: eq(schema.idealCustomerProfiles.organizationId, organizationId) }),
  ]);
  return NextResponse.json({
    services: services.map(service => ({ name: service.name, description: service.summary || '', problemSolved: service.problemSolved || '', deliverables: service.deliverables || [], priceMin: service.priceMinCents ? service.priceMinCents / 100 : undefined, priceMax: service.priceMaxCents ? service.priceMaxCents / 100 : undefined, preferredIndustries: service.industries || [], disqualifiers: service.disqualifiers || [], priority: service.priority || 0, isActive: service.isActive ?? true })),
    caseStudies: caseStudies.map(item => ({ title: item.title, clientIndustry: item.clientIndustry || '', clientType: item.clientType || '', problem: item.problem || '', solution: item.solution || '', results: item.results || '', deliverables: item.deliverables || [], metrics: item.metrics || {}, serviceTags: [], caseStudyUrl: item.publicUrl || '', isPublic: item.visibility === 'public' })),
    profile,
    icp,
  });
}
