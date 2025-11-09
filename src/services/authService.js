import { addCsrfHeader } from '../utils/security.js';
import { AppError } from '../utils/AppError';
import { ERROR_TYPES } from '../utils/errorTypes';
import { errorLogger } from '../utils/errorLogger';
import { validateEmail, validateRequired } from '../utils/validation';

const API_URL = import.meta.env.PUBLIC_API_URL || "/api";

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

		const requestBody = { email: email.trim(), password };

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

			if (contentType?.includes("application/json")) {
				const data = await response.json();
				token =
					typeof data === "object"
						? data.token || data.accessToken || data.access_token
						: data;
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

			// Guardar solo en cookies con flags de seguridad
			document.cookie = `auth_token=${token}; path=/; max-age=7200; SameSite=Strict; Secure`;
			document.cookie = `token=${token}; path=/; max-age=7200; SameSite=Strict; Secure`;

			errorLogger.info('Login successful', { email });

			return { success: true, token };

		} catch (error) {
			// Si ya es AppError, re-lanzar
			if (error instanceof AppError) {
				errorLogger.error(error, { endpoint: '/auth/login', email });
				throw error;
			}

			// Error de red
			errorLogger.error(error, { endpoint: '/auth/login', email });
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
			fullName: fullName.trim(),
			email: email.trim(),
			userName: userName ? userName.trim() : email.split("@")[0],
			password,
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

	logout() {
		// Limpiar cookies de autenticación
		document.cookie =
			"auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
		document.cookie =
			"token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

		errorLogger.info('Logout successful');
	},

	getToken() {
		// Obtener token solo de cookies (más seguro)
		const cookies = document.cookie.split(";");
		const authCookie = cookies.find((cookie) =>
			cookie.trim().startsWith("auth_token="),
		);
		if (authCookie) {
			return authCookie.split("=")[1];
		}
		return null;
	},

	isAuthenticated() {
		return !!this.getToken();
	},

	getUserId() {
		try {
			const token = this.getToken();
			if (!token) {
				return null;
			}

			const base64Url = token.split(".")[1];
			if (!base64Url) {
				errorLogger.warn('Invalid token format: missing payload');
				return null;
			}

			const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
			const payload = JSON.parse(window.atob(base64));

			const userIdFromToken = payload["UserId"] || payload.userId || payload.sub;

			if (userIdFromToken) {
				const numericUserId = Number.parseInt(userIdFromToken, 10);
				if (!Number.isNaN(numericUserId)) {
					return numericUserId;
				}
			}

			errorLogger.warn('UserId not found in token payload', { payload });
			return null;
		} catch (error) {
			errorLogger.error(error, { context: 'getUserId' });
			return null;
		}
	},
};

export default authService;
