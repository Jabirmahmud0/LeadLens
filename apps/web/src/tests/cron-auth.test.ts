import { describe, expect, it } from 'vitest';
import { verifyCronRequest } from '../lib/auth/cron';

describe('cron request authorization', () => {
  it('accepts the custom cron header', () => {
    const request = new Request('https://example.com/api/cron/process', {
      headers: { 'x-cron-secret': 'shared-secret' },
    });
    expect(verifyCronRequest(request, 'shared-secret')).toEqual({ authorized: true });
  });

  it('accepts a bearer authorization header', () => {
    const request = new Request('https://example.com/api/cron/process', {
      headers: { authorization: 'Bearer shared-secret' },
    });
    expect(verifyCronRequest(request, 'shared-secret')).toEqual({ authorized: true });
  });

  it('distinguishes missing configuration, missing credentials, and mismatch', () => {
    const emptyRequest = new Request('https://example.com/api/cron/process');
    expect(verifyCronRequest(emptyRequest, '')).toEqual({ authorized: false, reason: 'server_secret_missing' });
    expect(verifyCronRequest(emptyRequest, 'shared-secret')).toEqual({ authorized: false, reason: 'credentials_missing' });
    const incorrectRequest = new Request('https://example.com/api/cron/process', {
      headers: { authorization: 'Bearer wrong-secret' },
    });
    expect(verifyCronRequest(incorrectRequest, 'shared-secret')).toEqual({ authorized: false, reason: 'credentials_mismatch' });
  });
});
