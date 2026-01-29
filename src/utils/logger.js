/**
 * Logger utility for development/production logging
 * Replaces 100+ console.log statements with conditional logging
 * 
 * In production, only errors are logged (to Sentry via errorLogger)
 * In development, all logs are shown in console
 */

const isDev = import.meta.env.DEV;

/**
 * Logging levels
 */
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Current log level (can be adjusted)
const currentLevel = isDev ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;

/**
 * Format log message with timestamp and context
 */
const formatMessage = (level, message, context) => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;
  
  if (context) {
    return { prefix, message, context };
  }
  return { prefix, message };
};

export const logger = {
  /**
   * Debug level - only shown in development
   * Use for detailed debugging information
   */
  debug: (message, context) => {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      const { prefix } = formatMessage('DEBUG', message, context);
      if (context) {
        console.log(prefix, message, context);
      } else {
        console.log(prefix, message);
      }
    }
  },

  /**
   * Info level - general information
   * Use for important flow information
   */
  info: (message, context) => {
    if (currentLevel <= LOG_LEVELS.INFO) {
      const { prefix } = formatMessage('INFO', message, context);
      if (context) {
        console.info(prefix, message, context);
      } else {
        console.info(prefix, message);
      }
    }
  },

  /**
   * Warning level - potential issues
   * Use for recoverable errors or deprecation warnings
   */
  warn: (message, context) => {
    if (currentLevel <= LOG_LEVELS.WARN) {
      const { prefix } = formatMessage('WARN', message, context);
      if (context) {
        console.warn(prefix, message, context);
      } else {
        console.warn(prefix, message);
      }
    }
  },

  /**
   * Error level - always logged
   * Use for actual errors that need attention
   */
  error: (message, error, context) => {
    const { prefix } = formatMessage('ERROR', message, context);
    console.error(prefix, message, error, context);
    
    // In production, errors should also go to Sentry
    // This is handled by errorLogger.js which wraps Sentry
  },

  /**
   * Group related logs together (dev only)
   */
  group: (label, fn) => {
    if (isDev) {
      console.group(label);
      try {
        fn();
      } finally {
        console.groupEnd();
      }
    } else {
      fn();
    }
  },

  /**
   * Measure execution time (dev only)
   */
  time: (label) => {
    if (isDev) {
      console.time(label);
    }
  },

  timeEnd: (label) => {
    if (isDev) {
      console.timeEnd(label);
    }
  },

  /**
   * Table output for arrays/objects (dev only)
   */
  table: (data) => {
    if (isDev) {
      console.table(data);
    }
  },
};

// Convenience exports for direct imports
export const debugLogger = (...args) => logger.debug(...args);
export const infoLogger = (...args) => logger.info(...args);
export const warnLogger = (...args) => logger.warn(...args);
export const errorLogger = (...args) => logger.error(...args);

export default logger;
