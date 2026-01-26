import { addCsrfHeader } from '../utils/security.js';
import { AppError } from '../utils/AppError';
import { ERROR_TYPES } from '../utils/errorTypes';
import { errorLogger } from '../utils/errorLogger';
import { validateEmail, validateRequired } from '../utils/validation';
import { cookieManager } from '../utils/cookieManager.js';
import { jwtHelper } from '../utils/jwtHelper.js';

// Usar la URL de la API desde las variables de entorno
const API_URL = import.meta.env.PUBLIC_API_URL || '/api';

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
				throw new AppError(ERROR_TYPES.NO_INTERNET, 'No se pudo conectar al servidor. Por favor verifica tu conexión a internet e intenta nuevamente.');
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

	async registerFantasy() {
		const requestBody = {
			FullName: null,
			Email: null,
			UserName: null,
			Password: null,
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
				if (response.status === 409) {
					throw new AppError(
						ERROR_TYPES.CONFLICT,
						'Ya existe un usuario con este correo'
					);
				}
				throw await AppError.fromResponse(response);
			}

			const data = await response.json();
			errorLogger.info('Fantasy user registered', { userId: data?.userId });
			return data;
		} catch (error) {
			if (error instanceof AppError) {
				errorLogger.error(error, { endpoint: '/users/owner' });
				throw error;
			}
			errorLogger.error(error, { endpoint: '/users/owner' });
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
		} else {
			cookieManager.delete(
				cookieManager.COOKIE_OPTIONS.REFRESH_TOKEN.name,
				cookieManager.COOKIE_OPTIONS.REFRESH_TOKEN.path
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

	getRoleFromToken() {
		const token = this.getToken();
		if (!token) return null;

		// Extraer el claim de rol
		const role = jwtHelper.getRoleFromToken(token);

		if (!role) {
			errorLogger.warn('Role not found in token');
		}

		return role;
	},

	isSuperAdmin() {
		const role = this.getRoleFromToken();
		return role === 'Super Admin';
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

	/**
	 * Request a magic link for passwordless registration/login
	 * @param {string} email - User's email address
	 * @param {string|null} fullName - Optional full name for new users
	 */
	async requestMagicLink(email, fullName = null) {
		const emailError = validateEmail(email);
		if (emailError) {
			throw new AppError(ERROR_TYPES.INVALID_EMAIL, emailError);
		}

		const requestBody = {
			Email: email.trim(),
			FullName: fullName?.trim() || null
		};

		try {
			const response = await fetch(`${API_URL}/auth/magic-link/register`, {
				method: 'POST',
				headers: addCsrfHeader({
					'Content-Type': 'application/json'
				}),
				body: JSON.stringify(requestBody),
				credentials: 'include'
			});

			if (!response.ok) {
				if (response.status === 400) {
					throw await AppError.fromResponse(response);
				}
				throw await AppError.fromResponse(response);
			}

			const data = await response.json();
			errorLogger.info('Magic link requested', { email });
			return data;

		} catch (error) {
			if (error instanceof AppError) {
				errorLogger.error(error, { endpoint: '/auth/magic-link/register', email });
				throw error;
			}
			errorLogger.error(error, { endpoint: '/auth/magic-link/register', email });
			throw AppError.fromNetworkError(error, { endpoint: '/auth/magic-link/register' });
		}
	},

	async getSubscription() {
		try {
			// Try to get from local storage first to be fast
			const stored = localStorage.getItem('userSubscription');
			if (stored) {
				const parsed = JSON.parse(stored);
				// If not expired (check timestamp if added), use it. For now just fetch fresh.
			}

			const response = await fetch(`${API_URL}/billing/subscription`, {
				headers: this.getAuthHeaders()
			});

			if (!response.ok) {
				// Fallback to free plan structure if endpoint fails (e.g. not implemented yet)
				return { planType: 'free', isPro: false };
			}

			const data = await response.json();
			localStorage.setItem('userSubscription', JSON.stringify(data));
			return data;
		} catch (error) {
			console.warn('Could not fetch subscription', error);
			return { planType: 'free', isPro: false };
		}
	},

	/**
	 * Request a password reset link
	 * @param {string} email - User's email address
	 * @returns {Promise<{success: boolean, message: string}>}
	 */
	async requestPasswordReset(email) {
		// Validación de entrada
		const emailError = validateEmail(email);
		if (emailError) {
			throw new AppError(ERROR_TYPES.INVALID_EMAIL, emailError);
		}

		try {
			const response = await fetch(`${API_URL}/auth/request-password-reset`, {
				method: "POST",
				headers: addCsrfHeader({
					"Content-Type": "application/json",
				}),
				body: JSON.stringify({ email: email.trim() }),
				credentials: "include",
			});

			if (!response.ok) {
				throw await AppError.fromResponse(response);
			}

			const data = await response.json();
			
			errorLogger.info('Password reset requested', { email });

			return data;

		} catch (error) {
			if (error instanceof AppError) {
				errorLogger.error(error, { endpoint: '/auth/request-password-reset', email });
				throw error;
			}

			errorLogger.error(error, { endpoint: '/auth/request-password-reset', email });
			throw AppError.fromNetworkError(error, { endpoint: '/auth/request-password-reset' });
		}
	},

	/**
	 * Reset password with token
	 * @param {string} token - Password reset token from email
	 * @param {string} newPassword - New password
	 * @returns {Promise<{success: boolean, message: string}>}
	 */
	async resetPassword(token, newPassword) {
		// Validación de entrada
		const tokenError = validateRequired(token, 'El token');
		if (tokenError) {
			throw new AppError(ERROR_TYPES.REQUIRED_FIELD, tokenError);
		}

		const passwordError = validateRequired(newPassword, 'La contraseña');
		if (passwordError) {
			throw new AppError(ERROR_TYPES.REQUIRED_FIELD, passwordError);
		}

		try {
			const response = await fetch(`${API_URL}/auth/reset-password`, {
				method: "POST",
				headers: addCsrfHeader({
					"Content-Type": "application/json",
				}),
				body: JSON.stringify({ 
					token: token.trim(), 
					newPassword: newPassword 
				}),
				credentials: "include",
			});

			if (!response.ok) {
				// Handle specific error cases
				if (response.status === 400) {
					const errorData = await response.json().catch(() => ({}));
					const message = errorData.message || 'Token inválido o expirado. Por favor solicita un nuevo enlace.';
					throw new AppError(ERROR_TYPES.VALIDATION_ERROR, message);
				}

				throw await AppError.fromResponse(response);
			}

			const data = await response.json();
			
			errorLogger.info('Password reset successful');

			return data;

		} catch (error) {
			if (error instanceof AppError) {
				errorLogger.error(error, { endpoint: '/auth/reset-password' });
				throw error;
			}

			errorLogger.error(error, { endpoint: '/auth/reset-password' });
			throw AppError.fromNetworkError(error, { endpoint: '/auth/reset-password' });
		}
	},

	/**
	 * Login with fantasy token (for anonymous users)
	 * @param {string} email - Fantasy user email
	 * @returns {Promise<{success: boolean, token: string, refreshToken: string}>}
	 */
	async fantasyTokenLogin(email) {
		// Validación de entrada
		const emailError = validateEmail(email);
		if (emailError) {
			throw new AppError(ERROR_TYPES.INVALID_EMAIL, emailError);
		}

		try {
			const response = await fetch(`${API_URL}/auth/login/fantasy-token`, {
				method: "POST",
				headers: addCsrfHeader({
					"Content-Type": "application/json",
				}),
				body: JSON.stringify({ email: email.trim() }),
				credentials: "include",
			});

			if (!response.ok) {
				throw await AppError.fromResponse(response);
			}

			const data = await response.json();
			
			// Store tokens
			this._storeTokens(data.token, data.refreshToken);
			
			errorLogger.info('Fantasy token login successful', { email });

			return { success: true, token: data.token, refreshToken: data.refreshToken };

		} catch (error) {
			if (error instanceof AppError) {
				errorLogger.error(error, { endpoint: '/auth/login/fantasy-token', email });
				throw error;
			}

			errorLogger.error(error, { endpoint: '/auth/login/fantasy-token', email });
			throw AppError.fromNetworkError(error, { endpoint: '/auth/login/fantasy-token' });
		}
	}
};

export default authService;
