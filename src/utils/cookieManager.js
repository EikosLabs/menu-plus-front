/**
 * Cookie Manager - Utilidad para manejo seguro de cookies
 * Centraliza la configuración de cookies con flags de seguridad
 */

// Detectar si estamos en desarrollo (localhost o HTTP)
const isDevelopment = typeof window !== 'undefined' &&
	(window.location.hostname === 'localhost' ||
	 window.location.hostname === '127.0.0.1' ||
	 window.location.protocol === 'http:');

export const COOKIE_OPTIONS = {
	AUTH_TOKEN: {
		name: 'auth_token',
		maxAge: 7200, // 2 horas en segundos
		path: '/',
		secure: !isDevelopment, // Solo secure en producción con HTTPS
		sameSite: 'Strict'
	},
	TOKEN: {
		name: 'token',
		maxAge: 7200, // 2 horas en segundos (compatibilidad)
		path: '/',
		secure: !isDevelopment, // Solo secure en producción con HTTPS
		sameSite: 'Strict'
	},
	REFRESH_TOKEN: {
		name: 'refresh_token',
		maxAge: 604800, // 7 días en segundos
		path: '/',
		secure: !isDevelopment, // Solo secure en producción con HTTPS
		sameSite: 'Strict'
	}
};

/**
 * Establece una cookie con opciones de seguridad
 * @param {string} name - Nombre de la cookie
 * @param {string} value - Valor de la cookie
 * @param {Object} options - Opciones de la cookie
 */
export function setCookie(name, value, options = {}) {
	const {
		maxAge = 3600,
		path = '/',
		secure = !isDevelopment, // Por defecto, secure solo en producción
		sameSite = 'Strict'
	} = options;

	let cookieString = `${name}=${value}; path=${path}; max-age=${maxAge}; SameSite=${sameSite}`;

	if (secure) {
		cookieString += '; Secure';
	}

	document.cookie = cookieString;
}

/**
 * Obtiene el valor de una cookie
 * @param {string} name - Nombre de la cookie
 * @returns {string|null} Valor de la cookie o null si no existe
 */
export function getCookie(name) {
	const cookies = document.cookie.split(';');
	const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
	
	if (cookie) {
		return cookie.split('=')[1];
	}
	
	return null;
}

/**
 * Elimina una cookie
 * @param {string} name - Nombre de la cookie
 * @param {string} path - Path de la cookie
 */
export function deleteCookie(name, path = '/') {
	document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
}

/**
 * Limpia todas las cookies de autenticación
 */
export function clearAuthCookies() {
	deleteCookie(COOKIE_OPTIONS.AUTH_TOKEN.name);
	deleteCookie(COOKIE_OPTIONS.TOKEN.name);
	deleteCookie(COOKIE_OPTIONS.REFRESH_TOKEN.name);
}

export const cookieManager = {
	COOKIE_OPTIONS,
	set: setCookie,
	get: getCookie,
	delete: deleteCookie,
	clearAuthCookies
};

export default cookieManager;
