import { useState, useEffect, useCallback } from "react";
import authService from "../services/authService";
import menuService from "../services/menuService";

export const useAuth = () => {
	const [userData, setUserData] = useState(null);
	const [loading, setLoading] = useState(true);

	const loadUserData = useCallback(async () => {
		console.log("🔍 Dashboard - iniciando verificación de autenticación");

		if (!authService.isAuthenticated()) {
			console.log("🔍 Dashboard - no autenticado, redirigiendo a login");
			window.location.href = "/login";
			return;
		}

		const currentUserId = authService.getUserId();
		console.log("🔍 Dashboard - userId obtenido:", currentUserId);

		if (!currentUserId) {
			console.log("🔍 Dashboard - no se pudo obtener userId del token, redirigiendo a login");
			window.location.href = "/login";
			return;
		}

		try {
			const userBusinesses = await menuService.getUserBusinesses(currentUserId);
			const businessName = userBusinesses.length > 0 ? userBusinesses[0].name : "Mi Negocio";
			
			setUserData({
				id: currentUserId,
				name: businessName,
				email: `user_${currentUserId}@example.com`,
				role: "Owner",
			});
		} catch (error) {
			console.log("🔍 Dashboard - error al cargar nombre del negocio, usando nombre por defecto");
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