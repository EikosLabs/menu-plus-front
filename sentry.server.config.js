import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'https://menusesqr.online/sentry',
  environment: process.env.SENTRY_ENVIRONMENT || 'development',

  // Configure sampling for performance monitoring
  tracesSampleRate: 1.0,

  // Set debug mode for development
  debug: process.env.NODE_ENV === 'development',

  // Configure integrations
  integrations: [
    // Enable HTTP calls tracing
    Sentry.httpIntegration({
      // Capture headers for debugging
      captureHeaders: true,
    }),

    // Enable Express.js tracing if applicable
    // Sentry.expressIntegration({
    //   app: app, // Your express app
    // }),
  ],

  // Configure beforeSend to filter out unwanted errors
  beforeSend(event) {
    // Filter out health check errors
    if (event.request && event.request.url) {
      const url = event.request.url;
      if (url.includes('/health') || url.includes('/ping')) {
        return null;
      }
    }

    // Filter out certain error types
    if (event.exception && event.exception.values) {
      const error = event.exception.values[0];

      // Filter out validation errors from certain libraries
      if (error.type && error.type.includes('ValidationError')) {
        return null;
      }
    }

    return event;
  },
});