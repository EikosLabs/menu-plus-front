import * as Sentry from '@sentry/astro';

Sentry.init({
  dsn: 'https://menusesqr.online/sentry',
  environment: import.meta.env.PUBLIC_SENTRY_ENVIRONMENT || 'development',

  // Configure sampling for performance monitoring
  tracesSampleRate: 1.0,

  // Set debug mode for development
  debug: import.meta.env.DEV,

  // Configure session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Configure integrations
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes here
      // for example: maskAllText: true
    }),
  ],

  // Configure beforeSend to filter out unwanted errors
  beforeSend(event) {
    // Filter out errors from certain extensions or sources
    if (event.exception && event.exception.values) {
      const error = event.exception.values[0];

      // Filter out errors from browser extensions
      if (error.stacktrace && error.stacktrace.frames) {
        const frames = error.stacktrace.frames;
        const hasExtensionFrame = frames.some(frame =>
          frame.filename && (
            frame.filename.includes('extension://') ||
            frame.filename.includes('chrome-extension://') ||
            frame.filename.includes('moz-extension://')
          )
        );

        if (hasExtensionFrame) {
          return null;
        }
      }
    }

    return event;
  },
});