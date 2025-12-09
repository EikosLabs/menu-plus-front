import { AppError } from '../utils/AppError';
import { ERROR_TYPES } from '../utils/errorTypes';
import { errorLogger } from '../utils/errorLogger';
import { addCsrfHeader } from '../utils/security';

/**
 * Generic API Client for handling HTTP requests
 */
export class ApiClient {
	constructor(baseUrl, authService = null, tokenInterceptor = null) {
		this.baseUrl = baseUrl;
		this.authService = authService;
		this.tokenInterceptor = tokenInterceptor;
	}

	getAuthToken() {
		if (!this.authService) return null;
		const token = this.authService.getToken();
		if (!token) {
			throw new AppError(
				ERROR_TYPES.UNAUTHORIZED,
				'Por favor inicia sesión para continuar'
			);
		}
		return token;
	}

	async makeRequest(endpoint, options = {}) {
		const { method = "GET", body = null, timeout = 10000, requiresAuth = true } = options;

		// Función que ejecuta el request real
		const executeRequest = async () => {
			const url = `${this.baseUrl}${endpoint}`;
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), timeout);

			try {
				const headers = addCsrfHeader({
					...(body && { "Content-Type": "application/json" }),
				});

				if (requiresAuth && this.authService) {
					const token = this.getAuthToken();
					headers.Authorization = `Bearer ${token}`;
				}

				const fetchOptions = {
					method,
					headers,
					credentials: "include",
					signal: controller.signal,
					...(body && { body: JSON.stringify(body) }),
				};

				const response = await fetch(url, fetchOptions);
				clearTimeout(timeoutId);

				const responseText = await response.text();
				let data = null;

				// Mejorar manejo de respuestas vacías
				if (responseText?.trim()) {
					try {
						data = JSON.parse(responseText);
					} catch (_error) {
						// Si no es JSON válido, usar el texto tal cual
						data = responseText;
					}
				} else if (response.ok) {
					// Respuesta vacía pero exitosa
					errorLogger.warn('Empty response from server', { endpoint, method, status: response.status });
				}

				if (!response.ok) {
					// Crear error con status para que el interceptor lo detecte
					const error = await AppError.fromResponse(response, data, { endpoint, method, responseText });
					error.status = response.status;
					throw error;
				}

				return {
					data,
					status: response.status,
					isEmpty: !responseText || responseText.trim() === "",
				};
			} catch (error) {
				clearTimeout(timeoutId);

				// Si ya es AppError, re-lanzar con logging (excepto 404 que son esperados)
				if (error instanceof AppError) {
					// No logear 404 en endpoints de menú - es normal que no existan
					const isExpected404 = error.type === ERROR_TYPES.NOT_FOUND && 
						(endpoint.includes('/menus/food-business') || endpoint.includes('/menus/'));
					
					if (!isExpected404) {
						errorLogger.error(error, { endpoint, method });
					}
					throw error;
				}

				// Timeout error
				if (error.name === "AbortError") {
					const timeoutError = new AppError(
						ERROR_TYPES.TIMEOUT_ERROR,
						'La operación excedió el tiempo límite. Por favor intenta nuevamente.'
					);
					errorLogger.error(timeoutError, { endpoint, method, timeout });
					throw timeoutError;
				}

				// Network error
				const networkError = AppError.fromNetworkError(error, { endpoint, method });
				errorLogger.error(networkError, { endpoint, method });
				throw networkError;
			}
		};

		// Si hay interceptor, usarlo para manejar renovación automática de tokens
		if (this.tokenInterceptor && requiresAuth) {
			return this.tokenInterceptor.executeRequest(executeRequest);
		}

		// Si no hay interceptor, ejecutar directamente
		return executeRequest();
	}

	async get(endpoint, options = {}) {
		return this.makeRequest(endpoint, { ...options, method: "GET" });
	}

	async post(endpoint, data, options = {}) {
		return this.makeRequest(endpoint, {
			...options,
			method: "POST",
			body: data,
		});
	}

	async put(endpoint, data, options = {}) {
		return this.makeRequest(endpoint, {
			...options,
			method: "PUT",
			body: data,
		});
	}

	async patch(endpoint, data, options = {}) {
		return this.makeRequest(endpoint, {
			...options,
			method: "PATCH",
			body: data,
		});
	}

	async delete(endpoint, options = {}) {
		return this.makeRequest(endpoint, { ...options, method: "DELETE" });
	}

	async fetchBinary(endpoint, options = {}) {
		const { timeout = 15000, requiresAuth = true } = options;

		// Función que ejecuta el request binario
		const executeRequest = async () => {
			const url = `${this.baseUrl}${endpoint}`;
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), timeout);

			try {
				const headers = {};
				if (requiresAuth && this.authService) {
					const token = this.getAuthToken();
					headers.Authorization = `Bearer ${token}`;
				}

				const response = await fetch(url, {
					headers,
					credentials: "include",
					signal: controller.signal,
				});

				clearTimeout(timeoutId);

				if (!response.ok) {
					const error = await AppError.fromResponse(response, null, { endpoint, method: 'GET' });
					error.status = response.status;
					throw error;
				}

				return await response.blob();
			} catch (error) {
				clearTimeout(timeoutId);

				if (error instanceof AppError) {
					errorLogger.error(error, { endpoint, method: 'GET', isBinary: true });
					throw error;
				}

				if (error.name === "AbortError") {
					const timeoutError = new AppError(
						ERROR_TYPES.TIMEOUT_ERROR,
						'La descarga excedió el tiempo límite.'
					);
					errorLogger.error(timeoutError, { endpoint, timeout });
					throw timeoutError;
				}

				const networkError = AppError.fromNetworkError(error, { endpoint, isBinary: true });
				errorLogger.error(networkError, { endpoint });
				throw networkError;
			}
		};

		// Si hay interceptor, usarlo
		if (this.tokenInterceptor && requiresAuth) {
			return this.tokenInterceptor.executeRequest(executeRequest);
		}

		return executeRequest();
	}
}
