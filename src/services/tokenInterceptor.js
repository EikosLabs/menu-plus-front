import { AppError } from '../utils/AppError.js';
import { ERROR_TYPES } from '../utils/errorTypes.js';
import { errorLogger } from '../utils/errorLogger.js';

const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:5000/api";

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
		this._refreshPromise = this.authService.refreshToken();

		try {
			await this._refreshPromise;
		} finally {
			this._isRefreshing = false;
			this._refreshPromise = null;
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
