import { addCsrfHeader } from '../utils/security.js';
import { AppError } from '../utils/AppError';
import { ERROR_TYPES } from '../utils/errorTypes';
import { errorLogger } from '../utils/errorLogger';
import { validateEmail, validateRequired } from '../utils/validation';
import { cookieManager } from '../utils/cookieManager.js';
import { jwtHelper } from '../utils/jwtHelper.js';

// En desarrollo local, forzar localhost si no está definido
const isDev = import.meta.env.DEV;
const API_URL = 'http://localhost:5000/api'; // HARDCODED FOR DEBUG

export const authService = {
	async login(email, password) {
		// Validación de entrada
		const emailError = validateEmail(email);
		if (emailError) {
			throw new AppError(ERROR_TYPES.INVALID_EMAIL, emailError);
		}

		const passwordError = validateRequired(password, 'La contraseña');
		if (passwordError) {
			throw new AppError(ERROR_TYPES.REQUIRED_FIELD, passwordError);
		}

		const requestBody = { Email: email.trim(), Password: password };

		try {
			const response = await fetch(`${API_URL}/auth/login`, {
				method: "POST",
				headers: addCsrfHeader({
					"Content-Type": "application/json",
				}),
				body: JSON.stringify(requestBody),
				credentials: "include",
			});

			// Manejar respuesta no exitosa
			if (!response.ok) {
				// Casos específicos por código de estado
				if (response.status === 401) {
					throw await AppError.fromResponse(
						response,
						'Email o contraseña incorrectos. Por favor verifica tus datos.'
					);
				}

				if (response.status === 423) {
					throw new AppError(
						ERROR_TYPES.ACCOUNT_LOCKED,
						'Tu cuenta ha sido bloqueada. Contacta a soporte.'
					);
				}

				// Error genérico del servidor
				throw await AppError.fromResponse(response);
			}

			// Extraer token de la respuesta
			const contentType = response.headers.get("content-type");
			let token;
			let refreshToken;

			if (contentType?.includes("application/json")) {
				const data = await response.json();
				if (typeof data === "object") {
					token = data.token || data.Token || data.accessToken || data.access_token;
					refreshToken = data.refreshToken || data.RefreshToken;
				} else {
					token = data;
				}
			} else {
				token = await response.text();
			}

			if (!token || token.trim() === "") {
				errorLogger.error(new AppError(
					ERROR_TYPES.SERVER_ERROR,
					'El servidor no devolvió un token válido'
				), { endpoint: '/auth/login' });

				throw new AppError(
					ERROR_TYPES.SERVER_ERROR,
					'Error en la autenticación. Por favor intenta nuevamente.'
				);
			}

			token = token.trim();

			// Guardar tokens usando el método centralizado
			this._storeTokens(token, refreshToken);

			errorLogger.info('Login successful', { email });

			return { success: true, token, refreshToken };

		} catch (error) {
			// Si ya es AppError, re-lanzar
			if (error instanceof AppError) {
				errorLogger.error(error, { endpoint: '/auth/login', email });
				throw error;
			}

			// Error de red
			errorLogger.error(error, { endpoint: '/auth/login', email });
			// Forzar mensaje de error de conexión si es un error de red
			if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
				throw new AppError(ERROR_TYPES.NO_INTERNET, 'No se pudo conectar al servidor. Verifica que el backend esté corriendo en http://localhost:5000');
			}
			throw AppError.fromNetworkError(error, { endpoint: '/auth/login' });
		}
	},

	async register(fullName, email, userName, password) {
		// Validación de entrada
		const fullNameError = validateRequired(fullName, 'El nombre completo');
		if (fullNameError) {
			throw new AppError(ERROR_TYPES.REQUIRED_FIELD, fullNameError);
		}

		const emailError = validateEmail(email);
		if (emailError) {
			throw new AppError(ERROR_TYPES.INVALID_EMAIL, emailError);
		}

		const passwordError = validateRequired(password, 'La contraseña');
		if (passwordError) {
			throw new AppError(ERROR_TYPES.REQUIRED_FIELD, passwordError);
		}

		const requestBody = {
			FullName: fullName.trim(),
			Email: email.trim(),
			UserName: userName ? userName.trim() : email.split("@")[0],
			Password: password,
		};

		try {
			const response = await fetch(`${API_URL}/users/owner`, {
				method: "POST",
				headers: addCsrfHeader({
					"Content-Type": "application/json",
				}),
				body: JSON.stringify(requestBody),
				credentials: "include",
			});

			if (!response.ok) {
				// Email duplicado
				if (response.status === 409) {
					throw new AppError(
						ERROR_TYPES.DUPLICATE_EMAIL,
						'Este email ya está registrado. ¿Olvidaste tu contraseña?'
					);
				}

				// Error de validación
				if (response.status === 400) {
					const error = await AppError.fromResponse(response);

					// Si hay errores de campo, crear error de validación
					if (error.details.serverData?.errors) {
						throw error;
					}

					throw new AppError(
						ERROR_TYPES.VALIDATION_ERROR,
						'Por favor verifica los datos ingresados.',
						error.details
					);
				}

				// Error genérico
				throw await AppError.fromResponse(response);
			}

			const userData = await response.json();

			errorLogger.info('Registration successful', { email });

			return userData;

		} catch (error) {
			if (error instanceof AppError) {
				errorLogger.error(error, { endpoint: '/users/owner', email });
				throw error;
			}

			errorLogger.error(error, { endpoint: '/users/owner', email });
			throw AppError.fromNetworkError(error, { endpoint: '/users/owner' });
		}
	},

	async refreshToken() {
		const refreshToken = this.getRefreshToken();

		if (!refreshToken) {
			errorLogger.warn('No refresh token found');
			throw new AppError(
				ERROR_TYPES.UNAUTHORIZED,
				'No se encontró el refresh token. Por favor inicia sesión nuevamente.'
			);
		}

		try {
			const response = await fetch(`${API_URL}/auth/refreshToken`, {
				method: 'POST',
				headers: addCsrfHeader({
					'Content-Type': 'application/json'
				}),
				body: JSON.stringify({ RefreshToken: refreshToken }),
				credentials: 'include'
			});

			if (!response.ok) {
				if (response.status === 401 || response.status === 400) {
					// Limpiar cookies si el refresh token es inválido
					cookieManager.clearAuthCookies();
					throw new AppError(
						ERROR_TYPES.UNAUTHORIZED,
						'El refresh token ha expirado. Por favor inicia sesión nuevamente.'
					);
				}

				throw await AppError.fromResponse(response);
			}

			const data = await response.json();
			const newToken = data.token || data.Token;
			const newRefreshToken = data.refreshToken || data.RefreshToken;

			if (!newToken) {
				throw new AppError(
					ERROR_TYPES.SERVER_ERROR,
					'El servidor no devolvió un token válido.'
				);
			}

			// Almacenar los nuevos tokens
			this._storeTokens(newToken, newRefreshToken);

			errorLogger.info('Token refreshed successfully');

			return { token: newToken, refreshToken: newRefreshToken };
		} catch (error) {
			if (error instanceof AppError) {
				errorLogger.error(error, { endpoint: '/auth/refreshToken' });
				throw error;
			}

			errorLogger.error(error, { endpoint: '/auth/refreshToken' });
			throw AppError.fromNetworkError(error, { endpoint: '/auth/refreshToken' });
		}
	},

	logout() {
		// Limpiar todas las cookies de autenticación
		cookieManager.clearAuthCookies();

		// Limpiar localStorage si hay datos relacionados con auth
		try {
			localStorage.removeItem('userBusinesses');
		} catch (error) {
			errorLogger.warn('Error clearing localStorage', error);
		}

		errorLogger.info('Logout successful');
	},

	getToken() {
		return cookieManager.get(cookieManager.COOKIE_OPTIONS.AUTH_TOKEN.name);
	},

	getRefreshToken() {
		return cookieManager.get(cookieManager.COOKIE_OPTIONS.REFRESH_TOKEN.name);
	},

		_storeTokens(token, refreshToken) {
			cookieManager.set(
				cookieManager.COOKIE_OPTIONS.AUTH_TOKEN.name,
				token,
				cookieManager.COOKIE_OPTIONS.AUTH_TOKEN
			);

			// Almacenar refresh_token si existe
			if (refreshToken) {
				cookieManager.set(
					cookieManager.COOKIE_OPTIONS.REFRESH_TOKEN.name,
					refreshToken,
					cookieManager.COOKIE_OPTIONS.REFRESH_TOKEN
				);
			}
		},

	getBusinessIdFromToken() {
		const token = this.getToken();
		if (!token) return null;

		// Usar jwtHelper para extraer el claim correcto: FoodBusinessId
		const businessId = jwtHelper.getBusinessIdFromToken(token);
		
		if (!businessId) {
			errorLogger.warn('FoodBusinessId not found in token');
		}

		return businessId;
	},

	getUserIdFromToken() {
		const token = this.getToken();
		if (!token) return null;

		// Usar jwtHelper para extraer el claim correcto: UserId
		const userId = jwtHelper.getUserIdFromToken(token);
		
		if (!userId) {
			errorLogger.warn('UserId not found in token');
		}

		return userId;
	},

	isTokenExpired() {
		const token = this.getToken();
		if (!token) return true;

		return jwtHelper.isTokenExpired(token);
	},

	getAuthHeaders() {
		const token = this.getToken();
		if (!token) {
			throw new AppError(
				ERROR_TYPES.UNAUTHORIZED,
				'Por favor inicia sesión para continuar'
			);
		}
		return addCsrfHeader({
			'Authorization': `Bearer ${token}`,
			'Content-Type': 'application/json'
		});
	},

	isAuthenticated() {
		return !!this.getToken();
	},

	getUserId() {
		const userId = this.getUserIdFromToken();
		
		if (userId) {
			const numericUserId = Number.parseInt(userId, 10);
			if (!Number.isNaN(numericUserId)) {
				return numericUserId;
			}
		}

		return null;
	},
};

export default authService;
