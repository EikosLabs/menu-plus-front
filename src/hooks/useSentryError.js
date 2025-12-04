import * as Sentry from '@sentry/browser';

export const useSentryError = () => {
  const captureException = (error, context = {}) => {
    Sentry.captureException(error, {
      contexts: {
        custom: context,
      },
    });
  };

  const captureMessage = (message, level = 'info', context = {}) => {
    Sentry.captureMessage(message, level, {
      contexts: {
        custom: context,
      },
    });
  };

  const setUser = (user) => {
    Sentry.setUser(user);
  };

  const setTag = (key, value) => {
    Sentry.setTag(key, value);
  };

  const addBreadcrumb = (breadcrumb) => {
    Sentry.addBreadcrumb(breadcrumb);
  };

  return {
    captureException,
    captureMessage,
    setUser,
    setTag,
    addBreadcrumb,
  };
};