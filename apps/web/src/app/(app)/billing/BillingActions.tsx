'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, CreditCard, Loader2 } from 'lucide-react';
import type { PurchasablePlanKey } from '@leadlens/shared';

async function openBillingEndpoint(endpoint: string, body?: object) {
  const requestBody = endpoint === '/api/billing/checkout'
    ? { ...body, requestId: crypto.randomUUID() }
    : body;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: requestBody ? { 'Content-Type': 'application/json' } : undefined,
    body: requestBody ? JSON.stringify(requestBody) : undefined,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Billing request failed');
  if (!result.url) throw new Error('Billing provider did not return a destination');
  if (endpoint === '/api/billing/checkout') window.localStorage.removeItem('leadlens_selected_plan');
  window.location.assign(result.url);
}

export function CheckoutButton({ plan, children, disabled = false }: { plan: PurchasablePlanKey; children: React.ReactNode; disabled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <button type="button" disabled={disabled || loading} onClick={async () => {
        setLoading(true); setError(null);
        try { await openBillingEndpoint('/api/billing/checkout', { plan }); }
        catch (err) { setError(err instanceof Error ? err.message : 'Unable to start checkout'); setLoading(false); }
      }} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#166534] px-5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#14532d] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowUpRight className="size-4" />}{children}
      </button>
      {error && <p role="alert" className="mt-2 text-xs leading-5 text-rose-700">{error}</p>}
    </div>
  );
}

export function PortalButton({ disabled = false }: { disabled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <button type="button" disabled={disabled || loading} onClick={async () => {
        setLoading(true); setError(null);
        try { await openBillingEndpoint('/api/billing/portal'); }
        catch (err) { setError(err instanceof Error ? err.message : 'Unable to open billing portal'); setLoading(false); }
      }} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#c9dbce] bg-white px-5 text-sm font-semibold text-[#16352a] transition-all hover:-translate-y-0.5 hover:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4 text-emerald-700" />}Manage billing
      </button>
      {error && <p role="alert" className="mt-2 text-xs text-rose-700">{error}</p>}
    </div>
  );
}

export function AutomaticCheckout({ plan }: { plan?: PurchasablePlanKey }) {
  const started = useRef(false);
  useEffect(() => {
    if (!plan || started.current) return;
    started.current = true;
    void openBillingEndpoint('/api/billing/checkout', { plan }).catch(() => { started.current = false; });
  }, [plan]);
  return null;
}
