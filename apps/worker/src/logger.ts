import pino from 'pino';

// Define which keys should be automatically redacted from logs
const redactedKeys = [
  'password',
  'token',
  'secret',
  'authorization',
  'cookie',
  'apiKey',
  'session',
  '*.password',
  '*.token',
  '*.secret'
];

/**
 * Pino logger instance configured for the worker.
 * - In local development (non-production), logs are pretty-printed.
 * - In production, logs are emitted as structured JSON.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: redactedKeys,
    censor: '[REDACTED]',
  },
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
});
