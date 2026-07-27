import { timingSafeEqual } from 'crypto';

export type CronAuthFailure = 'server_secret_missing' | 'credentials_missing' | 'credentials_mismatch';

export function verifyCronRequest(req: Request, configuredSecret = process.env.CRON_SECRET): {
  authorized: boolean;
  reason?: CronAuthFailure;
} {
  const secret = configuredSecret?.trim();
  if (!secret) return { authorized: false, reason: 'server_secret_missing' };

  const customHeader = req.headers.get('x-cron-secret')?.trim();
  const authorization = req.headers.get('authorization')?.trim();
  const bearerSecret = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  const candidate = customHeader || bearerSecret;
  if (!candidate) return { authorized: false, reason: 'credentials_missing' };

  try {
    const candidateBytes = Buffer.from(candidate);
    const secretBytes = Buffer.from(secret);
    return candidateBytes.length === secretBytes.length && timingSafeEqual(candidateBytes, secretBytes)
      ? { authorized: true }
      : { authorized: false, reason: 'credentials_mismatch' };
  } catch {
    return { authorized: false, reason: 'credentials_mismatch' };
  }
}
