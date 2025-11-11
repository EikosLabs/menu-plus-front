import { cookieManager } from '../utils/cookieManager.js';
import { AppError } from '../utils/AppError.js';
import { ERROR_TYPES } from '../utils/errorTypes.js';
import { errorLogger } from '../utils/errorLogger.js';

const API_URL = import.meta.env.PUBLIC_API_URL || "/api";

export class TokenInterceptor {
	constructor(authService) {
		this.authService = authService;
		this._refreshPromise = null;
		this._isRefreshing = false;
	}

	async executeRequest(requestFn, options) {
		const opts = options || {};
		const maxRetries = opts.maxRetries !== undefined ? opts.maxRetries : 1;

		try {
			return await requestFn();
		} catch (error) {
			if (this.isAuthError(error) && maxRetries > 0) {
				errorLogger.info('Auth error detected, attempting token refresh', {
					errorType: error.type,
					errorMessage: error.message
				});

				try {
					await this.refreshToken();
					errorLogger.info('Token refreshed successfully, retrying original request');
					return await requestFn();
				} catch (refreshError) {
					errorLogger.error('Token refresh failed', refreshError);
					
					if (typeof window !== 'undefined') {
						window.location.href = '/login';
					}
					
					throw refreshError;
				}
			}

			throw error;
		}
	}

	async refreshToken() {
		if (this._isRefreshing && this._refreshPromise) {
			errorLogger.info('Token refresh already in progress, waiting...');
			return this._refreshPromise;
		}

		this._isRefreshing = true;
		this._refreshPromise = this._performRefresh();

		try {
			await this._refreshPromise;
		} finally {
			this._isRefreshing = false;
			this._refreshPromise = null;
		}
	}

	async _performRefresh() {
		const refreshToken = cookieManager.get(cookieManager.COOKIE_OPTIONS.REFRESH_TOKEN.name);

		if (!refreshToken) {
			errorLogger.warn('No refresh token found in cookies');
			throw new AppError(
				ERROR_TYPES.UNAUTHORIZED,
				'No se encontro el refresh token. Por favor inicia sesion nuevamente.'
			);
		}

		try {
			const url = API_URL + '/auth/refreshToken';
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ refreshToken: refreshToken }),
				credentials: 'include'
			});

			if (!response.ok) {
				if (response.status === 401 || response.status === 400) {
					throw new AppError(
						ERROR_TYPES.UNAUTHORIZED,
						'El refresh token ha expirado. Por favor inicia sesion nuevamente.'
					);
				}

				throw new AppError(
					ERROR_TYPES.SERVER_ERROR,
					'Error al renovar el token. Por favor intenta nuevamente.'
				);
			}

			const data = await response.json();
			const newToken = data.token || data.Token;
			const newRefreshToken = data.refreshToken || data.RefreshToken;

			if (!newToken) {
				throw new AppError(
					ERROR_TYPES.SERVER_ERROR,
					'El servidor no devolvio un token valido.'
				);
			}

			this._storeTokens(newToken, newRefreshToken);
			errorLogger.info('Tokens refreshed and stored successfully');
		} catch (error) {
			cookieManager.clearAuthCookies();

			if (error instanceof AppError) {
				throw error;
			}

			errorLogger.error('Network error during token refresh', error);
			throw new AppError(
				ERROR_TYPES.NETWORK_ERROR,
				'Error de conexion al renovar el token. Por favor verifica tu conexion.'
			);
		}
	}

	_storeTokens(token, refreshToken) {
		cookieManager.set(
			cookieManager.COOKIE_OPTIONS.AUTH_TOKEN.name,
			token,
			cookieManager.COOKIE_OPTIONS.AUTH_TOKEN
		);

		cookieManager.set(
			cookieManager.COOKIE_OPTIONS.TOKEN.name,
			token,
			cookieManager.COOKIE_OPTIONS.TOKEN
		);

		if (refreshToken) {
			cookieManager.set(
				cookieManager.COOKIE_OPTIONS.REFRESH_TOKEN.name,
				refreshToken,
				cookieManager.COOKIE_OPTIONS.REFRESH_TOKEN
			);
		}
	}

	isAuthError(error) {
		if (!error) {
			return false;
		}

		if (error instanceof AppError && error.type === ERROR_TYPES.UNAUTHORIZED) {
			return true;
		}

		if (error.status === 401) {
			return true;
		}

		const errorMessage = error.message ? error.message.toLowerCase() : '';
		const authErrorMessages = [
			'unauthorized',
			'token expired',
			'invalid token',
			'authentication failed'
		];

		return authErrorMessages.some(function(msg) {
			return errorMessage.includes(msg);
		});
	}
}
