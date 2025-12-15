import { useState, useEffect, useCallback } from "react";
import authService from "../services/authService";
import menuService from "../services/menuService";
import { AppError } from "../utils/AppError";
import { ERROR_TYPES } from "../utils/errorTypes";

export const useAuth = () => {
	const [userData, setUserData] = useState(null);
	const [loading, setLoading] = useState(true);

	const loadUserData = useCallback(async () => {
		// Verificar autenticación
		if (!authService.isAuthenticated()) {
			window.location.href = "/login";
			return;
		}

		// Verificar que el token no esté expirado
		if (authService.isTokenExpired()) {
			console.log('[useAuth] Token expired, redirecting to login');
			authService.logout();
			window.location.href = "/login";
			return;
		}

		const currentUserId = authService.getUserId();

		if (!currentUserId) {
			console.log('[useAuth] No userId found in token, redirecting to login');
			authService.logout();
			window.location.href = "/login";
			return;
		}

		try {
			// Obtener información del rol del token
			const currentRole = authService.getRoleFromToken();
			const isSuperAdmin = authService.isSuperAdmin();

			if (isSuperAdmin) {
				// Para SuperAdmin, no necesita información de negocio
				setUserData({
					id: currentUserId,
					name: "Super Administrator",
					email: `superadmin@menusesqr.online`,
					role: currentRole || "Super Admin",
					isSuperAdmin: true,
				});
			} else {
				// Para usuarios normales, obtener información del negocio
				const userBusinesses = await menuService.getUserBusinesses();
				const businessName = userBusinesses.length > 0 ? userBusinesses[0].name : "Mi Negocio";

				setUserData({
					id: currentUserId,
					name: businessName,
					email: `user_${currentUserId}@example.com`,
					role: currentRole || "Owner",
					isSuperAdmin: false,
				});
			}
		} catch (error) {
			// Si es error de autenticación, redirigir a login
			if (error instanceof AppError && error.type === ERROR_TYPES.UNAUTHORIZED) {
				console.log('[useAuth] Unauthorized error, redirecting to login');
				authService.logout();
				window.location.href = "/login";
				return;
			}

			// Para otros errores, usar nombre por defecto
			console.warn('[useAuth] Error loading user data, using defaults', error);
			setUserData({
				id: currentUserId,
				name: "Mi Negocio",
				email: `user_${currentUserId}@example.com`,
				role: "Owner",
			});
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadUserData();
	}, [loadUserData]);

	const logout = () => {
		authService.logout();
		setUserData(null);
		window.location.href = "/login";
	};

	return { userData, setUserData, loading, logout, refreshUserData: loadUserData };
};