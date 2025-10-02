import { defineMiddleware } from "astro:middleware";

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

	// Si no es ruta pública y no tiene token, redirigir a login
	if (!isPublicRoute && !token) {
		return context.redirect("/login");
	}

	// Si está en la raíz y tiene token, ir al dashboard
	if (currentPath === "/" && token) {
		return context.redirect("/dashboard");
	}

	return next();
});
