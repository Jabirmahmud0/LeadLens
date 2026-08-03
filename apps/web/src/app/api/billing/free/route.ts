import { NextResponse } from 'next/server';
import { db, schema } from '@leadlens/database';
import { eq } from 'drizzle-orm';
import { requireBillingOwner } from '@/lib/billing/auth';

export async function POST() {
  const auth = await requireBillingOwner();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  await db.update(schema.organizations).set({
    pendingBillingPlan: null,
    billingOnboardingCompleted: true,
    updatedAt: new Date(),
  }).where(eq(schema.organizations.id, auth.session.organization.id));

  return NextResponse.json({ url: '/onboarding/identity' });
}
