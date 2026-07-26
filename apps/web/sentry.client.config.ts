import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || 0.1),

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  beforeBreadcrumb(breadcrumb, hint) {
    // Strip sensitive fields or raw LLM prompts before sending breadcrumbs
    if (breadcrumb.data && breadcrumb.data.prompt) {
      breadcrumb.data.prompt = '[REDACTED]';
    }
    return breadcrumb;
  }
});
