import { useState, useEffect, useCallback } from "react";
import authService from "../services/authService";
import menuService from "../services/menuService";

export const useAuth = () => {
	const [userData, setUserData] = useState(null);
	const [loading, setLoading] = useState(true);

	const loadUserData = useCallback(async () => {
		if (!authService.isAuthenticated()) {
			window.location.href = "/login";
			return;
		}

		const currentUserId = authService.getUserId();

		if (!currentUserId) {
			window.location.href = "/login";
			return;
		}

		try {
			// El backend obtiene el userId del token
			const userBusinesses = await menuService.getUserBusinesses();
			const businessName = userBusinesses.length > 0 ? userBusinesses[0].name : "Mi Negocio";

			setUserData({
				id: currentUserId,
				name: businessName,
				email: `user_${currentUserId}@example.com`,
				role: "Owner",
			});
		} catch (error) {
			// Usar nombre por defecto si hay error al cargar
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