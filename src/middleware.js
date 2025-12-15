import { defineMiddleware } from "astro:middleware";
import { proxyApiRequest } from './api-proxy.js';

const API_URL = import.meta.env.PUBLIC_API_URL || "import.meta.env.PUBLIC_API_URL || '/api'";

/**
 * Valida el formato y expiración de un JWT
 * @param {string} token - Token JWT a validar
 * @returns {{ valid: boolean, expired: boolean, payload: object|null }} Resultado de la validación
 */
function validateJwtToken(token) {
	if (!token || typeof token !== 'string') {
		return { valid: false, expired: false, payload: null };
	}

	// Verificar formato JWT (3 partes separadas por puntos)
	const parts = token.split('.');
	if (parts.length !== 3) {
		return { valid: false, expired: false, payload: null };
	}

	try {
		// Decodificar payload (segunda parte)
		const base64Url = parts[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const payload = JSON.parse(atob(base64));

		// Verificar expiración
		if (payload.exp) {
			const expirationTime = payload.exp * 1000; // Convertir a milisegundos
			const currentTime = Date.now();

			if (currentTime >= expirationTime) {
				console.log('[Middleware] Token expired', { exp: payload.exp, current: currentTime / 1000 });
				return { valid: false, expired: true, payload };
			}
		}

		return { valid: true, expired: false, payload };
	} catch (error) {
		// Error al decodificar o parsear el token
		console.error('[Middleware] Error validating token:', error);
		return { valid: false, expired: false, payload: null };
	}
}

/**
 * Intenta renovar el token usando el refresh token
 * @param {string} refreshToken - Refresh token
 * @param {object} context - Contexto de Astro
 * @returns {Promise<boolean>} True si la renovación fue exitosa
 */
async function tryRefreshToken(refreshToken, context) {
	if (!refreshToken) {
		console.log('[Middleware] No refresh token available');
		return false;
	}

	try {
		console.log('[Middleware] Attempting token refresh');
		
		const response = await fetch(`${API_URL}/auth/refreshToken`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ RefreshToken: refreshToken })
		});

		if (!response.ok) {
			console.log('[Middleware] Token refresh failed', { status: response.status });
			return false;
		}

		const data = await response.json();
		const newToken = data.token || data.Token;
		const newRefreshToken = data.refreshToken || data.RefreshToken;

		if (!newToken) {
			console.log('[Middleware] No token in refresh response');
			return false;
		}

		// Actualizar cookies con los nuevos tokens
		context.cookies.set('auth_token', newToken, {
			path: '/',
			maxAge: 7200, // 2 horas
			sameSite: 'strict',
			secure: true
		});

		context.cookies.set('token', newToken, {
			path: '/',
			maxAge: 7200,
			sameSite: 'strict',
			secure: true
		});

		if (newRefreshToken) {
			context.cookies.set('refresh_token', newRefreshToken, {
				path: '/',
				maxAge: 604800, // 7 días
				sameSite: 'strict',
				secure: true
			});
		}

		console.log('[Middleware] Token refreshed successfully');
		return true;
	} catch (error) {
		console.error('[Middleware] Error refreshing token:', error);
		return false;
	}
}

export const onRequest = defineMiddleware(async (context, next) => {
	// Proxy API requests to backend
	const proxyResponse = await proxyApiRequest(context.request);
	if (proxyResponse) {
		return proxyResponse;
	}

	const currentPath = context.url.pathname;

	// Skip middleware for static assets (CSS, JS, images, fonts)
	if (currentPath.startsWith('/_astro/') ||
		currentPath.startsWith('/_imaginary/') ||
		currentPath.startsWith('/_src/') ||
		currentPath.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
		return next();
	}

	// Rutas públicas que no requieren autenticación
	const reserved = ["dashboard", "login", "register", "admin", "api", "404", "menu", "admin-super"];
	const singleSegment = /^\/[^/]+$/.test(currentPath);
	const segment = singleSegment ? currentPath.slice(1) : null;
	const isRootLanding = singleSegment && segment && !reserved.includes(segment);
	const isPublicRoute =
		currentPath === "/login" ||
		currentPath === "/register" ||
		currentPath.startsWith("/login/") ||
		currentPath.startsWith("/register/") ||
		currentPath.startsWith("/menu/") ||
		currentPath.startsWith("/business/") ||
		isRootLanding;

	// /admin-super requiere autenticación de SuperAdmin específica
	const isSuperAdminRoute = currentPath === "/admin-super";

	const token = context.cookies.get("auth_token")?.value;
	const refreshToken = context.cookies.get("refresh_token")?.value;

	// Manejar rutas de SuperAdmin
	if (isSuperAdminRoute) {
		const validation = validateJwtToken(token);

		// Si no hay token o es inválido, redirigir a login
		if (!token || !validation.valid) {
			console.log('[Middleware] No valid token for SuperAdmin route, redirecting to login');
			context.cookies.delete("auth_token", { path: "/" });
			context.cookies.delete("token", { path: "/" });
			context.cookies.delete("refresh_token", { path: "/" });
			return context.redirect("/login");
		}

		// Si el token está expirado, intentar renovarlo
		if (validation.expired) {
			console.log('[Middleware] SuperAdmin token expired, attempting refresh');
			const refreshed = await tryRefreshToken(refreshToken, context);

			if (!refreshed) {
				console.log('[Middleware] SuperAdmin refresh failed, redirecting to login');
				context.cookies.delete("auth_token", { path: "/" });
				context.cookies.delete("token", { path: "/" });
				context.cookies.delete("refresh_token", { path: "/" });
				return context.redirect("/login");
			}
		}

		// Verificar que sea SuperAdmin
		const finalValidation = validateJwtToken(context.cookies.get("auth_token")?.value);
		if (!finalValidation.valid || finalValidation.payload?.role !== "Super Admin") {
			console.log('[Middleware] Not a SuperAdmin, redirecting to login');
			return context.redirect("/login");
		}

		// Si es SuperAdmin válido, permitir acceso
		console.log('[Middleware] SuperAdmin access granted');
		return next();
	}

	// Si no es ruta pública
	if (!isPublicRoute) {
		const validation = validateJwtToken(token);

		// Si no hay token o es inválido (no solo expirado)
		if (!token || (!validation.valid && !validation.expired)) {
			console.log('[Middleware] Invalid token, redirecting to login');
			// Limpiar cookies y redirigir a login
			context.cookies.delete("auth_token", { path: "/" });
			context.cookies.delete("token", { path: "/" });
			context.cookies.delete("refresh_token", { path: "/" });
			return context.redirect("/login");
		}

		// Si el token está expirado, intentar renovarlo
		if (validation.expired) {
			console.log('[Middleware] Token expired, attempting refresh');
			const refreshed = await tryRefreshToken(refreshToken, context);

			if (!refreshed) {
				// Si la renovación falla, limpiar cookies y redirigir a login
				console.log('[Middleware] Refresh failed, redirecting to login');
				context.cookies.delete("auth_token", { path: "/" });
				context.cookies.delete("token", { path: "/" });
				context.cookies.delete("refresh_token", { path: "/" });
				return context.redirect("/login");
			}

			// Si la renovación fue exitosa, continuar con el request
			console.log('[Middleware] Token refreshed, continuing request');
		}
	}

	// Si está en la raíz y tiene token válido, ir al dashboard
	if (currentPath === "/") {
		const validation = validateJwtToken(token);
		if (token && validation.valid) {
			// Si es SuperAdmin, ir a SuperAdmin dashboard
			if (validation.payload?.role === "Super Admin") {
				return context.redirect("/admin-super");
			}
			return context.redirect("/dashboard");
		}
	}

	// Si está en login/register y tiene token válido, redirigir a dashboard
	if ((currentPath === "/login" || currentPath === "/register") && currentPath !== "/admin-super") {
		const validation = validateJwtToken(token);
		if (token && validation.valid) {
			// Si es SuperAdmin, ir a SuperAdmin dashboard
			if (validation.payload?.role === "Super Admin") {
				return context.redirect("/admin-super");
			}
			return context.redirect("/dashboard");
		}
	}

	// Si es SuperAdmin pero está en onboarding, redirigir a SuperAdmin dashboard
	if (currentPath === "/onboarding" || currentPath === "/dashboard") {
		const validation = validateJwtToken(token);
		if (token && validation.valid && validation.payload?.role === "Super Admin") {
			return context.redirect("/admin-super");
		}
	}

	return next();
});
