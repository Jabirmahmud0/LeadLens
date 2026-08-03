'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isPurchasablePlanKey } from '@leadlens/shared';

export function PendingPlanRedirect({ pendingPlan, completed }: { pendingPlan: string | null; completed: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    const hasPendingPaidPlan = isPurchasablePlanKey(pendingPlan ?? '');
    if (completed && !hasPendingPaidPlan) return;
    if (pathname === '/onboarding/plan') return;
    router.replace('/onboarding/plan');
  }, [completed, pathname, pendingPlan, router]);
  return null;
}
