/**
 * JWT Helper - Utilidades para decodificar y validar tokens JWT
 */

/**
 * Decodifica el payload de un JWT token
 * @param {string} token - Token JWT
 * @returns {Object|null} Payload decodificado o null si hay error
 */
export function decodeJwtPayload(token) {
	if (!token || typeof token !== 'string') {
		return null;
	}

	try {
		const parts = token.split('.');
		if (parts.length !== 3) {
			return null;
		}

		const base64Url = parts[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split('')
				.map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
				.join('')
		);

		return JSON.parse(jsonPayload);
	} catch (error) {
		console.error('Error decoding JWT token:', error);
		return null;
	}
}

/**
 * Valida el formato de un JWT token
 * @param {string} token - Token JWT
 * @returns {boolean} True si el formato es válido
 */
export function isValidJwtFormat(token) {
	if (!token || typeof token !== 'string') {
		return false;
	}

	const parts = token.split('.');
	return parts.length === 3;
}

/**
 * Verifica si un JWT token está expirado
 * @param {string} token - Token JWT
 * @returns {boolean} True si el token está expirado
 */
export function isTokenExpired(token) {
	const payload = decodeJwtPayload(token);
	
	if (!payload || !payload.exp) {
		return true;
	}

	const currentTime = Date.now() / 1000;
	return payload.exp < currentTime;
}

/**
 * Obtiene el tiempo restante hasta la expiración del token en segundos
 * @param {string} token - Token JWT
 * @returns {number} Segundos hasta la expiración, 0 si ya expiró
 */
export function getTokenTimeToExpiry(token) {
	const payload = decodeJwtPayload(token);
	
	if (!payload || !payload.exp) {
		return 0;
	}

	const currentTime = Date.now() / 1000;
	const timeRemaining = payload.exp - currentTime;
	
	return Math.max(0, timeRemaining);
}

/**
 * Extrae un claim específico del JWT token
 * @param {string} token - Token JWT
 * @param {string} claimName - Nombre del claim a extraer
 * @returns {any} Valor del claim o null si no existe
 */
export function getClaimFromToken(token, claimName) {
	const payload = decodeJwtPayload(token);
	
	if (!payload) {
		return null;
	}

	return payload[claimName] || null;
}

/**
 * Extrae el UserId del JWT token
 * @param {string} token - Token JWT
 * @returns {string|null} UserId o null si no existe
 */
export function getUserIdFromToken(token) {
	return getClaimFromToken(token, 'UserId');
}

/**
 * Extrae el FoodBusinessId del JWT token
 * @param {string} token - Token JWT
 * @returns {string|null} FoodBusinessId o null si no existe
 */
export function getBusinessIdFromToken(token) {
	return getClaimFromToken(token, 'FoodBusinessId');
}

/**
 * Extrae el role del JWT token
 * @param {string} token - Token JWT
 * @returns {string|null} Role o null si no existe
 */
export function getRoleFromToken(token) {
	return getClaimFromToken(token, 'role');
}

export const jwtHelper = {
	decodeJwtPayload,
	isValidJwtFormat,
	isTokenExpired,
	getTokenTimeToExpiry,
	getClaimFromToken,
	getUserIdFromToken,
	getBusinessIdFromToken,
	getRoleFromToken
};

export default jwtHelper;
