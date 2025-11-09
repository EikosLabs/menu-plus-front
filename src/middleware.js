import { defineMiddleware } from "astro:middleware";

/**
 * Valida el formato y expiración de un JWT
 * @param {string} token - Token JWT a validar
 * @returns {boolean} True si el token es válido
 */
function validateJwtToken(token) {
	if (!token || typeof token !== 'string') {
		return false;
	}

	// Verificar formato JWT (3 partes separadas por puntos)
	const parts = token.split('.');
	if (parts.length !== 3) {
		return false;
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
				return false; // Token expirado
			}
		}

		return true;
	} catch (error) {
		// Error al decodificar o parsear el token
		return false;
	}
}

export const onRequest = defineMiddleware(async (context, next) => {
	const currentPath = context.url.pathname;

	// Rutas públicas que no requieren autenticación
	const isPublicRoute =
		currentPath === "/login" ||
		currentPath === "/register" ||
		currentPath.startsWith("/login/") ||
		currentPath.startsWith("/register/") ||
		currentPath.startsWith("/menu/");

	const token = context.cookies.get("auth_token")?.value;

	// Si no es ruta pública
	if (!isPublicRoute) {
		// Verificar que exista el token y sea válido
		if (!token || !validateJwtToken(token)) {
			// Token inválido o expirado, limpiar cookies y redirigir a login
			context.cookies.delete("auth_token", { path: "/" });
			context.cookies.delete("token", { path: "/" });
			return context.redirect("/login");
		}
	}

	// Si está en la raíz y tiene token válido, ir al dashboard
	if (currentPath === "/" && token && validateJwtToken(token)) {
		return context.redirect("/dashboard");
	}

	// Si está en login/register y tiene token válido, redirigir a dashboard
	if ((currentPath === "/login" || currentPath === "/register") && token && validateJwtToken(token)) {
		return context.redirect("/dashboard");
	}

	return next();
});
