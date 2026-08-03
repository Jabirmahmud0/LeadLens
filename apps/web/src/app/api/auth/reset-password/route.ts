import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resetPassword } from '@leadlens/auth';

const resetPasswordSchema = z.object({
  token: z.string().min(1).max(256),
  password: z.string().min(15).max(128),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { token, password } = parsed.data;

    const success = await resetPassword(token, password);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
