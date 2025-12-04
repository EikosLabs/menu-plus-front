import * as Sentry from '@sentry/browser';

/**
 * Utilidad para probar la configuración de Sentry
 * Llamar a esta función en desarrollo para verificar que Sentry está funcionando
 */
export const testSentryIntegration = () => {
  if (import.meta.env.DEV) {
    console.log('🔍 Testing Sentry integration...');

    // Test breadcrumb
    Sentry.addBreadcrumb({
      message: 'Sentry test breadcrumb',
      category: 'test',
      level: 'info',
    });

    // Test user identification
    Sentry.setUser({
      id: 'test-user-123',
      email: 'test@example.com',
      username: 'testuser',
    });

    // Test custom tags
    Sentry.setTag('test_mode', true);
    Sentry.setTag('environment', import.meta.env.MODE);

    // Test message capture
    Sentry.captureMessage('Test message from menu-plus-front', 'info');

    // Test error capture (solo en desarrollo)
    try {
      throw new Error('Test error for Sentry integration');
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          test: true,
          component: 'SentryTest',
        },
        extra: {
          testDetails: 'This is a test error to verify Sentry integration',
          timestamp: new Date().toISOString(),
        },
      });
    }

    console.log('✅ Sentry test completed. Check your Sentry dashboard for test events.');
  }
};

/**
 * Función para capturar errores de red específicos del API
 */
export const captureApiError = (error, endpoint, method, statusCode = null) => {
  Sentry.captureException(error, {
    tags: {
      error_type: 'api_error',
      endpoint,
      method,
      status_code: statusCode,
    },
    extra: {
      request_details: {
        url: endpoint,
        method,
        status: statusCode,
        timestamp: new Date().toISOString(),
      },
    },
  });
};

/**
 * Función para registrar eventos de usuario importantes
 */
export const trackUserEvent = (eventName, properties = {}) => {
  Sentry.addBreadcrumb({
    message: `User event: ${eventName}`,
    category: 'user',
    level: 'info',
    data: properties,
  });

  // También podemos enviarlo como un mensaje para asegurar que se capture
  Sentry.captureMessage(`User event: ${eventName}`, 'info', {
    tags: {
      user_event: eventName,
    },
    extra: properties,
  });
};