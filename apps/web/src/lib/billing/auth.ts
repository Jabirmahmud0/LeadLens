import 'server-only';

import { getSession } from '@/lib/auth/session';

export async function requireBillingOwner() {
  const session = await getSession();
  if (!session?.user || !session.organization) {
    return { error: 'Unauthorized', status: 401 as const };
  }
  if (session.role !== 'owner') {
    return { error: 'Only an organization owner can manage billing', status: 403 as const };
  }
  return { session: { ...session, organization: session.organization } };
}
