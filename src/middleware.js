import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
	const publicRoutes = ["/login", "/register"];

	const currentPath = context.url.pathname;

	const isPublicRoute = publicRoutes.some(
		(route) => currentPath === route || currentPath.startsWith(`${route}/`),
	);

	const token = context.cookies.get("auth_token")?.value;

	if (!(isPublicRoute || token)) {
		return context.redirect("/login");
	}

	if (currentPath === "/" && token) {
		return context.redirect("/dashboard");
	}

	if (isPublicRoute && token) {
		return next();
	}

	return next();
});
