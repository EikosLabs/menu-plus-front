/**
 * Sentry DSN Validation Utility
 * Validates Sentry DSN format and provides helpful error messages
 */

/**
 * @typedef {Object} DSNValidationResult
 * @property {boolean} isValid - Whether the DSN is valid
 * @property {string} [error] - Error message if invalid
 * @property {string} [normalizedDsn] - Normalized DSN if valid
 * @property {string[]} [suggestions] - Suggestions for fixing the DSN
 */

/**
 * Validates a Sentry DSN format
 * Expected format: https://public-key@domain/path/project-id
 */
export function validateSentryDSN(dsn) {
  if (!dsn || typeof dsn !== 'string') {
    return {
      isValid: false,
      error: 'DSN is required and must be a string',
      suggestions: [
        'Get your DSN from Sentry dashboard',
        'Format: https://public-key@domain/path/project-id'
      ]
    };
  }

  // Trim whitespace
  dsn = dsn.trim();

  // Check if it starts with https://
  if (!dsn.startsWith('https://')) {
    return {
      isValid: false,
      error: 'DSN must start with https://',
      suggestions: [
        'Ensure your DSN uses HTTPS for security',
        'Example: https://public-key@domain/path/project-id'
      ]
    };
  }

  // Parse the DSN URL
  let parsed;
  try {
    parsed = new URL(dsn);
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid URL format',
      suggestions: [
        'Check that the DSN is a valid URL',
        'Format: https://public-key@domain/path/project-id'
      ]
    };
  }

  // Check if username (public key) is present
  if (!parsed.username) {
    return {
      isValid: false,
      error: 'Missing public key in DSN',
      suggestions: [
        'The DSN should include a public key before @',
        'Current DSN appears to be missing authentication',
        'Get complete DSN from your Sentry project settings'
      ]
    };
  }

  // Check if pathname includes project ID
  const pathParts = parsed.pathname.split('/').filter(part => part);
  if (pathParts.length < 1) {
    return {
      isValid: false,
      error: 'Missing project ID in DSN path',
      suggestions: [
        'DSN should end with project ID',
        'Example: https://public-key@domain/sentry/1234567'
      ]
    };
  }

  // Check if DSN contains placeholder text
  if (dsn.includes('menusesqr.online/sentry') && !parsed.username) {
    return {
      isValid: false,
      error: 'DSN appears to be incomplete template',
      suggestions: [
        'Replace placeholder with actual DSN from Sentry dashboard',
        'Access: https://menusesqr.online/sentry',
        'Create new project "menu-plus-front" to get complete DSN',
        'Expected format: https://PUBLIC_KEY@menusesqr.online/sentry/PROJECT_ID'
      ]
    };
  }

  // Validate public key format (should be alphanumeric)
  const publicKeyRegex = /^[a-zA-Z0-9]+$/;
  if (!publicKeyRegex.test(parsed.username)) {
    return {
      isValid: false,
      error: 'Public key contains invalid characters',
      suggestions: [
        'Public key should be alphanumeric',
        'Copy DSN directly from Sentry dashboard'
      ]
    };
  }

  // Validate project ID format (should be numeric)
  const projectId = pathParts[pathParts.length - 1];
  const projectIdRegex = /^\d+$/;
  if (!projectIdRegex.test(projectId)) {
    return {
      isValid: false,
      error: 'Project ID should be numeric',
      suggestions: [
        'Project ID is usually a number',
        'Verify project ID from Sentry dashboard'
      ]
    };
  }

  return {
    isValid: true,
    normalizedDsn: dsn,
    suggestions: [
      'DSN format is correct',
      'Ensure the project exists and is active',
      'Test connectivity before deploying'
    ]
  };
}

/**
 * Checks if Sentry DSN is properly configured for current environment
 */
export function validateEnvironmentDSN() {
  // Check for browser environment
  if (typeof window !== 'undefined') {
    const publicDSN = import.meta.env?.PUBLIC_SENTRY_DSN;
    const result = validateSentryDSN(publicDSN || '');

    if (!result.isValid) {
      return {
        ...result,
        error: `Public DSN Error: ${result.error}`,
        suggestions: [
          'Check your .env or .env.production file',
          'Ensure PUBLIC_SENTRY_DSN is set correctly',
          ...(result.suggestions || [])
        ]
      };
    }
  }

  // Check for server environment
  else {
    const serverDSN = process.env?.SENTRY_DSN || process.env?.PUBLIC_SENTRY_DSN;
    const result = validateSentryDSN(serverDSN || '');

    if (!result.isValid) {
      return {
        ...result,
        error: `Server DSN Error: ${result.error}`,
        suggestions: [
          'Check your server environment variables',
          'Ensure SENTRY_DSN is set correctly',
          ...(result.suggestions || [])
        ]
      };
    }
  }

  return { isValid: true };
}

/**
 * Gets Sentry dashboard URL for the configured DSN
 */
export function getSentryDashboardURL(dsn) {
  const targetDSN = dsn ||
    (typeof window !== 'undefined'
      ? import.meta.env?.PUBLIC_SENTRY_DSN
      : process.env?.SENTRY_DSN || process.env?.PUBLIC_SENTRY_DSN);

  if (!targetDSN) {
    return import.meta.env?.PUBLIC_FRONTEND_URL || 'https://menusesqr.online';
  }

  try {
    const parsed = new URL(targetDSN);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return import.meta.env?.PUBLIC_FRONTEND_URL || 'https://menusesqr.online';
  }
}

/**
 * Creates a test Sentry configuration without actually initializing Sentry
 */
export function createTestSentryConfig(dsn) {
  const validation = validateSentryDSN(dsn);

  if (!validation.isValid) {
    return {
      isValid: false,
      error: validation.error,
      config: null
    };
  }

  return {
    isValid: true,
    config: {
      dsn: validation.normalizedDsn,
      environment: process.env?.NODE_ENV || import.meta.env?.MODE || 'development',
      tracesSampleRate: 1.0,
      debug: process.env?.NODE_ENV === 'development' || import.meta.env?.DEV,
    }
  };
}