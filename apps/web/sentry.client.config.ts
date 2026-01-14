import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.SENTRY_ENABLED === 'true' && !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.05'),
  // Don't send PII
  sendDefaultPii: false,
  // Scrub sensitive data
  beforeSend(event) {
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['Authorization'];
      delete event.request.headers['cookie'];
    }

    // Remove request body
    if (event.request?.data) {
      delete event.request.data;
    }

    return event;
  },
});
