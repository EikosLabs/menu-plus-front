import { useState, useEffect } from "react";
import menuService from "../services/menuService";

export const useBusinesses = (userId) => {
	const [businesses, setBusinesses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchBusinesses = async () => {
		if (!userId) return;
		
		setLoading(true);
		try {
			console.log("🔍 Dashboard - obteniendo negocios para userId:", userId);
			const userBusinesses = await menuService.getUserBusinesses(userId);
			console.log("🔍 Dashboard - negocios obtenidos:", userBusinesses);
			setBusinesses(userBusinesses);
			setError(null);
		} catch (error) {
			console.log("🔍 Dashboard - error al cargar datos:", error.message);
			setError("No se pudieron cargar los datos del dashboard. Por favor, verifique su conexión e intente de nuevo.");
			setBusinesses([]);
		} finally {
			setLoading(false);
			console.log("🔍 Dashboard - carga completada");
		}
	};

	useEffect(() => {
		fetchBusinesses();
	}, [userId]);

	const addBusiness = async (newBusiness) => {
		try {
			await fetchBusinesses();
			return newBusiness;
		} catch (error) {
			setError("Se agregó el negocio pero no se pudo actualizar la lista. Por favor, recarga la página.");
			setBusinesses(prev => [...prev, { ...newBusiness, menus: [] }]);
			throw error;
		}
	};

	const addMenu = (newMenu) => {
		try {
			setBusinesses(prevBusinesses =>
				prevBusinesses.map(business =>
					business.id === newMenu.foodBusinessId
						? { ...business, menus: [newMenu], hasMenu: true }
						: business
				)
			);
			setError(null);
		} catch (error) {
			setError("Se agregó el menú pero ocurrió un error al actualizar la vista. Por favor, recarga la página.");
		}
	};

	return {
		businesses,
		setBusinesses,
		loading,
		error,
		setError,
		addBusiness,
		addMenu
	};
};