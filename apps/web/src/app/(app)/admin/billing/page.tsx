import Link from 'next/link';
import { notFound } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { ArrowLeft, CheckCircle2, CircleAlert, CreditCard, RefreshCw, Webhook } from 'lucide-react';
import { db, schema } from '@leadlens/database';
import { BILLING_PLANS } from '@leadlens/shared';
import { getSession } from '@/lib/auth/session';
import { isPlatformAdmin } from '@/lib/auth/admin';

export const metadata = { title: 'Billing Operations | LeadLens Admin' };

const PAID_ACCESS_STATUSES = new Set(['active', 'trialing', 'past_due']);
const MRR_STATUSES = new Set(['active', 'trialing']);

export default async function AdminBillingPage() {
  const session = await getSession();
  if (!session?.user || !(await isPlatformAdmin(session.user.id))) notFound();

  const [organizations, subscriptions, webhookEvents] = await Promise.all([
    db.select({ id: schema.organizations.id, name: schema.organizations.name }).from(schema.organizations),
    db.select({
      id: schema.organizationSubscriptions.id,
      organizationId: schema.organizationSubscriptions.organizationId,
      organizationName: schema.organizations.name,
      planKey: schema.organizationSubscriptions.planKey,
      status: schema.organizationSubscriptions.status,
      stripeCustomerId: schema.organizationSubscriptions.stripeCustomerId,
      currentPeriodEnd: schema.organizationSubscriptions.currentPeriodEnd,
      cancelAtPeriodEnd: schema.organizationSubscriptions.cancelAtPeriodEnd,
      updatedAt: schema.organizationSubscriptions.updatedAt,
    }).from(schema.organizationSubscriptions)
      .innerJoin(schema.organizations, eq(schema.organizationSubscriptions.organizationId, schema.organizations.id))
      .orderBy(desc(schema.organizationSubscriptions.updatedAt)),
    db.query.stripeBillingEvents.findMany({ orderBy: [desc(schema.stripeBillingEvents.receivedAt)], limit: 50 }),
  ]);

  const paidSubscriptions = subscriptions.filter((item) => PAID_ACCESS_STATUSES.has(item.status));
  const paidOrganizationIds = new Set(paidSubscriptions.map((item) => item.organizationId));
  const hobbyCount = Math.max(0, organizations.length - paidOrganizationIds.size);
  const soloCount = paidSubscriptions.filter((item) => item.planKey === 'solo').length;
  const agencyCount = paidSubscriptions.filter((item) => item.planKey === 'agency').length;
  const monthlyRecurringRevenue = subscriptions.reduce((total, item) => {
    if (!MRR_STATUSES.has(item.status) || (item.planKey !== 'solo' && item.planKey !== 'agency')) return total;
    return total + (BILLING_PLANS[item.planKey].monthlyPriceCents ?? 0);
  }, 0);
  const failedWebhooks = webhookEvents.filter((event) => event.status === 'failed');
  const pendingWebhooks = webhookEvents.filter((event) => event.status === 'received' || event.status === 'processing');

  const cards = [
    { label: 'Estimated MRR', value: `$${(monthlyRecurringRevenue / 100).toLocaleString()}`, detail: 'Active and trialing subscriptions', tone: 'emerald' },
    { label: 'Hobby workspaces', value: hobbyCount.toLocaleString(), detail: 'No paid access', tone: 'slate' },
    { label: 'Solo workspaces', value: soloCount.toLocaleString(), detail: BILLING_PLANS.solo.priceLabel + ' per month', tone: 'teal' },
    { label: 'Agency workspaces', value: agencyCount.toLocaleString(), detail: BILLING_PLANS.agency.priceLabel + ' per month', tone: 'amber' },
  ];

  return (
    <main className="app-page-enter min-h-screen bg-[#f5f8f6] p-4 sm:p-7 lg:p-9">
      <div className="mx-auto max-w-[1480px] space-y-6">
        <header className="rounded-[28px] border border-[#dce7df] bg-white p-7 shadow-[0_18px_50px_-38px_rgba(20,83,45,.4)] sm:flex sm:items-end sm:justify-between sm:gap-8">
          <div><Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#789084] hover:text-emerald-700"><ArrowLeft className="size-3.5" />Platform overview</Link><div className="mt-4 flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><CreditCard className="size-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Revenue operations</p><h1 className="mt-1 text-3xl font-semibold tracking-[-0.045em] text-[#16352a]">Billing & subscriptions</h1></div></div><p className="mt-4 max-w-2xl text-sm leading-6 text-[#60766b]">Monitor paid access, renewal state, and Stripe webhook delivery without exposing payment details.</p></div>
          <div className={`mt-5 rounded-2xl border px-4 py-3 sm:mt-0 ${failedWebhooks.length ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}><p className="flex items-center gap-2 text-sm font-semibold">{failedWebhooks.length ? <CircleAlert className="size-4" /> : <CheckCircle2 className="size-4" />}{failedWebhooks.length ? `${failedWebhooks.length} webhook failures` : 'Webhook delivery healthy'}</p><p className="mt-1 text-[10px] opacity-75">{pendingWebhooks.length} currently pending</p></div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <article key={card.label} className="rounded-2xl border border-white bg-white p-6 shadow-[0_10px_30px_-24px_rgba(20,83,45,.35)]"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#91a49a]">{card.label}</p><p className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-[#10251d]">{card.value}</p><p className="mt-2 text-xs text-[#789084]">{card.detail}</p></article>)}</section>

        <section className="overflow-hidden rounded-2xl border border-[#dce7df] bg-white">
          <div className="flex items-center justify-between border-b border-[#e6eee8] px-6 py-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Subscription ledger</p><h2 className="mt-1 text-lg font-semibold text-[#16352a]">Workspace access</h2></div><span className="text-xs text-[#789084]">{subscriptions.length} records</span></div>
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-[#f7faf7] text-[10px] uppercase tracking-wide text-[#789084]"><tr><th className="px-6 py-4">Organization</th><th className="px-6 py-4">Plan</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Renews / ends</th><th className="px-6 py-4">Stripe customer</th></tr></thead><tbody className="divide-y divide-[#edf2ee]">{subscriptions.map((item) => <tr key={item.id}><td className="px-6 py-4 font-semibold text-[#16352a]">{item.organizationName}</td><td className="px-6 py-4 text-[#60766b]">{item.planKey}</td><td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${PAID_ACCESS_STATUSES.has(item.status) ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{item.status}</span></td><td className="px-6 py-4 text-xs text-[#60766b]">{item.currentPeriodEnd.toLocaleDateString()}{item.cancelAtPeriodEnd ? ' · cancelling' : ''}</td><td className="px-6 py-4 font-mono text-[10px] text-[#789084]">{item.stripeCustomerId}</td></tr>)}</tbody></table>{subscriptions.length === 0 && <div className="py-12 text-center text-sm text-[#789084]">No Stripe subscriptions yet.</div>}</div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#dce7df] bg-white">
          <div className="flex items-center justify-between border-b border-[#e6eee8] px-6 py-5"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-teal-50 text-teal-700"><Webhook className="size-4" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-700">Stripe delivery</p><h2 className="mt-1 text-lg font-semibold text-[#16352a]">Recent webhook events</h2></div></div><RefreshCw className="size-4 text-[#91a49a]" /></div>
          <div className="divide-y divide-[#edf2ee]">{webhookEvents.slice(0, 12).map((event) => <div key={event.stripeEventId} className="grid gap-2 px-6 py-4 sm:grid-cols-[minmax(180px,1fr)_160px_100px_180px] sm:items-center"><div><p className="truncate font-mono text-xs text-[#365246]">{event.stripeEventId}</p><p className="mt-1 text-[10px] text-[#91a49a]">{event.eventType}</p></div><p className="truncate font-mono text-[10px] text-[#789084]">{event.stripeObjectId || 'No object'}</p><span className={`w-fit rounded-full px-2 py-1 text-[9px] font-bold uppercase ${event.status === 'processed' ? 'bg-emerald-50 text-emerald-700' : event.status === 'failed' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{event.status}</span><p className="text-xs text-[#789084]">{event.receivedAt.toLocaleString()}</p>{event.lastError && <p className="sm:col-span-4 text-xs text-rose-700">{event.lastError}</p>}</div>)}{webhookEvents.length === 0 && <div className="py-12 text-center text-sm text-[#789084]">No webhook events received yet.</div>}</div>
        </section>
      </div>
    </main>
  );
}
