import { AppError } from './AppError';
import { ERROR_TYPES } from './errorTypes';
import { errorLogger } from './errorLogger';

/**
 * Retry helper con exponential backoff para operaciones de red
 */
export async function retryOperation(operation, options = {}) {
	const {
		maxRetries = 3,
		initialDelay = 1000,
		maxDelay = 5000,
		shouldRetry = (error) => error.type === ERROR_TYPES.NETWORK_ERROR || error.type === ERROR_TYPES.TIMEOUT_ERROR,
	} = options;

	let lastError;

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			return await operation();
		} catch (error) {
			lastError = error instanceof AppError ? error : AppError.fromError(error);

			// No reintentar si no es un error de red/timeout o es el último intento
			if (!shouldRetry(lastError) || attempt === maxRetries - 1) {
				throw lastError;
			}

			// Calcular delay con exponential backoff
			const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
			errorLogger.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`, {
				error: lastError.type,
				message: lastError.message,
			});

			await new Promise(resolve => setTimeout(resolve, delay));
		}
	}

	throw lastError;
}
