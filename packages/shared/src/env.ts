import { z } from 'zod';

const envSchema = z.object({
  // Required in all environments
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // App
  NEXT_PUBLIC_APP_URL: z.string().url().optional(), // usually available, but might be dynamic in Vercel
  
  // Auth
  WORKER_SECRET: z.string().min(1, 'WORKER_SECRET is required'),

  // External APIs (Required for full functionality)
  SENTRY_DSN: z.string().min(1, 'SENTRY_DSN is required').optional(),
  POSTHOG_KEY: z.string().min(1, 'POSTHOG_KEY is required').optional(),
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required').optional(),
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required').optional(),
  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required').optional(),
  
  // Resend / Email
  RESEND_API_KEY: z.string().optional(),
});

export function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('Invalid environment variables');
  }
  
  return parsed.data;
}

// In Next.js we might run this file, so we can run validation eagerly if we import it
export const env = envSchema.parse(process.env);
