/**
 * Logger Utility
 * Centralized logging service with environment-based controls
 * In production, logging can be disabled or sent to external service
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Log levels
 */
const LogLevel = {
	DEBUG: 'debug',
	INFO: 'info',
	WARN: 'warn',
	ERROR: 'error',
};

/**
 * Logger class for consistent logging across the application
 */
class Logger {
	/**
	 * Log debug message (only in development)
	 * @param {string} message - Message to log
	 * @param {any} data - Additional data to log
	 */
	static debug(message, ...data) {
		if (isDevelopment) {
			console.log(`[DEBUG] ${message}`, ...data);
		}
	}

	/**
	 * Log informational message
	 * @param {string} message - Message to log
	 * @param {any} data - Additional data to log
	 */
	static info(message, ...data) {
		if (isDevelopment) {
			console.info(`[INFO] ${message}`, ...data);
		}
	}

	/**
	 * Log warning message
	 * @param {string} message - Message to log
	 * @param {any} data - Additional data to log
	 */
	static warn(message, ...data) {
		console.warn(`[WARN] ${message}`, ...data);
	}

	/**
	 * Log error message
	 * @param {string} message - Message to log
	 * @param {Error|any} error - Error object or additional data
	 */
	static error(message, error) {
		console.error(`[ERROR] ${message}`, error);

		// In production, you could send to error tracking service like Sentry
		// if (!isDevelopment) {
		//   Sentry.captureException(error, { message });
		// }
	}

	/**
	 * Log network request
	 * @param {string} method - HTTP method
	 * @param {string} url - Request URL
	 * @param {any} data - Request/response data
	 */
	static request(method, url, data) {
		if (isDevelopment) {
			console.log(`[HTTP ${method}] ${url}`, data);
		}
	}
}

export default Logger;
export { LogLevel };
