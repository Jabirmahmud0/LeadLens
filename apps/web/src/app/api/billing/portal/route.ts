import { NextResponse } from 'next/server';
import { db, schema } from '@leadlens/database';
import { eq } from 'drizzle-orm';
import { checkRateLimit, RATE_LIMITS } from '@leadlens/auth';
import { requireBillingOwner } from '@/lib/billing/auth';
import { getApplicationUrl, getPublicBillingError, getStripe } from '@/lib/billing/stripe';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const auth = await requireBillingOwner();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const organizationId = auth.session.organization.id;
    const isAllowed = await checkRateLimit(ip, organizationId, 'billing_portal', RATE_LIMITS.billingPortal.limit, RATE_LIMITS.billingPortal.windowMinutes);
    if (!isAllowed) return NextResponse.json({ error: 'Too many billing portal requests. Please wait and try again.' }, { status: 429 });
    const billingAccount = await db.query.organizationBillingAccounts.findFirst({
      where: eq(schema.organizationBillingAccounts.organizationId, organizationId),
    });
    if (!billingAccount) return NextResponse.json({ error: 'No billing account exists yet' }, { status: 404 });

    const portal = await getStripe().billingPortal.sessions.create({
      customer: billingAccount.stripeCustomerId,
      return_url: `${getApplicationUrl()}/billing`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (error) {
    console.error('[billing-portal]', error);
    return NextResponse.json({ error: getPublicBillingError(error, 'Unable to open the billing portal') }, { status: 503 });
  }
}
