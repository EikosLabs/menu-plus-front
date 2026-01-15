import * as Sentry from '@sentry/browser';

// Initialize Sentry
Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  environment: import.meta.env.PUBLIC_SENTRY_ENVIRONMENT || 'development',

  // Set tracesSampleRate to capture performance
  tracesSampleRate: 1.0,

  // Capture Replay for errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

export { Sentry };