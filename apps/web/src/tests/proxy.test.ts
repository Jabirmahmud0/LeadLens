import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '../proxy';

describe('request proxy', () => {
  it('allows the cron route to perform its own authentication', () => {
    const response = proxy(new NextRequest('https://leadlens.example/api/cron/process', {
      method: 'POST',
      headers: { 'x-cron-secret': 'scheduler-secret' },
    }));

    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('allows the Stripe webhook route to verify its own signature', () => {
    const response = proxy(new NextRequest('https://leadlens.example/api/billing/webhook', {
      method: 'POST',
      headers: { 'stripe-signature': 'test-signature' },
    }));

    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('still rejects an unauthenticated protected API route', async () => {
    const response = proxy(new NextRequest('https://leadlens.example/api/reports/123', {
      method: 'GET',
    }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('allows a stale session cookie to reach login instead of redirect-looping', () => {
    const request = new NextRequest('https://leadlens.example/login', {
      headers: { cookie: 'leadlens_session=revoked-token' },
    });
    const response = proxy(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });
});
