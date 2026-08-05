import { asc, desc, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { db, schema } from '@leadlens/database';
import { getSession } from '@/lib/auth/session';
import { isPlatformAdmin } from '@/lib/auth/admin';
import { Users } from 'lucide-react';
import { UserTable } from './UserTable';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BILLING_PLANS, type BillingPlanKey } from '@leadlens/shared';

export const metadata = { title: 'Manage Users | LeadLens Admin' };

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session?.user || !(await isPlatformAdmin(session.user.id))) notFound();

  const [users, memberships] = await Promise.all([
    db.query.users.findMany({
      columns: { id: true, email: true, emailVerifiedAt: true, fullName: true, status: true, createdAt: true, lastLoginAt: true },
      orderBy: [desc(schema.users.createdAt)],
    }),
    db.select({
      userId: schema.organizationMembers.userId,
      organizationId: schema.organizations.id,
      organizationName: schema.organizations.name,
      workspaceRole: schema.organizationMembers.role,
      memberStatus: schema.organizationMembers.status,
      adminPlanOverride: schema.organizations.adminPlanOverride,
      adminPlanOverrideExpiresAt: schema.organizations.adminPlanOverrideExpiresAt,
      stripePlanKey: schema.organizationSubscriptions.planKey,
      subscriptionStatus: schema.organizationSubscriptions.status,
      subscriptionPeriodEnd: schema.organizationSubscriptions.currentPeriodEnd,
      billingOnboardingCompleted: schema.organizations.billingOnboardingCompleted,
    }).from(schema.organizationMembers)
      .innerJoin(schema.organizations, eq(schema.organizationMembers.organizationId, schema.organizations.id))
      .leftJoin(schema.organizationSubscriptions, eq(schema.organizationSubscriptions.organizationId, schema.organizations.id))
      .orderBy(asc(schema.organizationMembers.joinedAt)),
  ]);

  const firstWorkspaceByUser = new Map<string, (typeof memberships)[number]>();
  const workspaceCountByUser = new Map<string, number>();
  for (const membership of memberships) {
    if (!membership.billingOnboardingCompleted) continue;
    workspaceCountByUser.set(membership.userId, (workspaceCountByUser.get(membership.userId) ?? 0) + 1);
    if (!firstWorkspaceByUser.has(membership.userId)) firstWorkspaceByUser.set(membership.userId, membership);
  }

  // This is a server-request snapshot used to resolve expiring entitlements.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const userRows = users.filter((user) => firstWorkspaceByUser.has(user.id)).map((user) => {
    const workspace = firstWorkspaceByUser.get(user.id);
    const overridePlan = workspace?.adminPlanOverride;
    const overrideActive = (overridePlan === 'free' || overridePlan === 'solo' || overridePlan === 'agency')
      && (!workspace?.adminPlanOverrideExpiresAt || workspace.adminPlanOverrideExpiresAt.getTime() > now);
    const stripePlan = workspace?.stripePlanKey;
    const paidStatus = workspace?.subscriptionStatus && ['active', 'trialing', 'past_due'].includes(workspace.subscriptionStatus);
    const stripeActive = (stripePlan === 'solo' || stripePlan === 'agency')
      && paidStatus
      && Boolean(workspace?.subscriptionPeriodEnd && workspace.subscriptionPeriodEnd.getTime() + (3 * 24 * 60 * 60 * 1000) > now);
    const planKey: BillingPlanKey = overrideActive ? overridePlan : stripeActive ? stripePlan : 'free';

    return {
      ...user,
      organizationId: workspace?.organizationId ?? null,
      organizationName: workspace?.organizationName ?? null,
      workspaceRole: workspace?.workspaceRole ?? null,
      workspaceCount: workspaceCountByUser.get(user.id) ?? 0,
      planKey,
      planName: BILLING_PLANS[planKey].name,
      planSource: overrideActive ? 'override' as const : stripeActive ? 'stripe' as const : 'hobby' as const,
      adminPlanOverride: overrideActive ? overridePlan : null,
      subscriptionStatus: workspace?.subscriptionStatus ?? null,
    };
  });

  return (
    <main className="app-page-enter mx-auto max-w-[1480px] p-4 sm:p-7 lg:p-9">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/admin" className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#789084] transition-colors hover:text-emerald-700">
            <ArrowLeft className="size-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <Users className="size-5" />
            </span>
            <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#16352a]">Platform Users</h1>
          </div>
        </div>
      </header>
      
      <UserTable users={userRows} currentUserId={session.user.id} />
    </main>
  );
}
