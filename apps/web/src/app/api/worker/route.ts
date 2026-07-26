import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const workerUrl = process.env.WORKER_URL;
  const workerSecret = process.env.WORKER_SECRET;
  if (!workerUrl || !workerSecret) {
    return NextResponse.json({ error: 'Worker service is not configured' }, { status: 503 });
  }

  try {
    const response = await fetch(`${workerUrl.replace(/\/$/, '')}/internal/jobs/claim`, {
      method: 'POST',
      headers: { 'x-worker-secret': workerSecret },
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => ({ error: 'Invalid worker response' }));
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Worker service unavailable' },
      { status: 502 },
    );
  }
}
