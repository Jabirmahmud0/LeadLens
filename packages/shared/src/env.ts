import { z } from 'zod';

const commonEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  SENTRY_DSN: z.string().url().or(z.literal('')).optional(),
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).optional(),
  SENTRY_PROFILES_SAMPLE_RATE: z.coerce.number().min(0).max(1).optional(),
});

const webEnvSchema = commonEnvSchema.extend({
  WORKER_URL: z.string().url().optional(),
  WORKER_SECRET: z.string().min(16).optional(),
  CRON_SECRET: z.string().min(16).optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  MONTHLY_ANALYSIS_LIMIT: z.coerce.number().int().positive().optional(),
  ADMIN_EMAILS: z.string().refine(
    (value) => value.split(',').every((email) => z.email().safeParse(email.trim()).success),
    'ADMIN_EMAILS must be a comma-separated list of valid email addresses',
  ).optional(),
});

const workerEnvSchema = commonEnvSchema.extend({
  WORKER_SECRET: z.string().min(16, 'WORKER_SECRET must be at least 16 characters'),
  GEMINI_API_KEYS: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().optional(),
  PAGESPEED_API_KEY: z.string().optional(),
  WORKER_POLL_INTERVAL_MS: z.coerce.number().int().positive().optional(),
  WORKER_HEARTBEAT_INTERVAL_MS: z.coerce.number().int().positive().optional(),
  CRAWL_MAX_PAGES: z.coerce.number().int().min(1).max(20).optional(),
  CRAWL_FETCH_TIMEOUT_MS: z.coerce.number().int().min(1000).max(30000).optional(),
  CRAWL_MAX_DURATION_MS: z.coerce.number().int().min(5000).max(300000).optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
}).refine(
  (env) => Boolean(env.GEMINI_API_KEYS || env.GEMINI_API_KEY),
  { message: 'GEMINI_API_KEYS or GEMINI_API_KEY is required', path: ['GEMINI_API_KEYS'] }
);

export type EnvironmentScope = 'common' | 'web' | 'worker';

export function validateEnv(scope: EnvironmentScope = 'common') {
  const schema = scope === 'worker' ? workerEnvSchema : scope === 'web' ? webEnvSchema : commonEnvSchema;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
    throw new Error(`Invalid ${scope} environment variables`);
  }
  return parsed.data;
}
