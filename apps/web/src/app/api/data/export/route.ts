import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@leadlens/database';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  const session = await getSession();
  if (!session?.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const organizationId = session.organization.id;
  const [profile, services, icps, caseStudies, prospects, reports] = await Promise.all([
    db.query.agencyProfiles.findFirst({ where: eq(schema.agencyProfiles.organizationId, organizationId) }),
    db.query.agencyServices.findMany({ where: eq(schema.agencyServices.organizationId, organizationId) }),
    db.query.idealCustomerProfiles.findMany({ where: eq(schema.idealCustomerProfiles.organizationId, organizationId) }),
    db.query.caseStudies.findMany({ where: eq(schema.caseStudies.organizationId, organizationId) }),
    db.query.prospects.findMany({ where: eq(schema.prospects.organizationId, organizationId) }),
    db.query.reports.findMany({ where: eq(schema.reports.organizationId, organizationId), with: { scores: true, findings: true, outreach: true, callQuestions: true, objections: true, proposalStarters: true } }),
  ]);
  const payload = { exportedAt: new Date().toISOString(), organization: session.organization, agency: { profile, services, icps, caseStudies }, prospects, reports };
  return NextResponse.json(payload, {
    headers: { 'content-disposition': `attachment; filename="leadlens-export-${organizationId}.json"` },
  });
}
