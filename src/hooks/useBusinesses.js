import { useState, useEffect, useCallback } from "react";
import menuService from "../services/menuService";

export const useBusinesses = () => {
	const [businesses, setBusinesses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [hasFetchError, setHasFetchError] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const fetchBusinesses = useCallback(async () => {
		setLoading(true);
		try {
			// El backend obtiene el userId del token
			const userBusinesses = await menuService.getUserBusinesses();
			setBusinesses(userBusinesses);
			setError(null);
			setHasFetchError(false);
		} catch (error) {
			setError("No se pudieron cargar los datos del dashboard. Por favor, verifique su conexión e intente de nuevo.");
			setBusinesses([]);
			setHasFetchError(true);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchBusinesses();
	}, [fetchBusinesses]);

	// Función para refrescar datos manualmente
	const refreshBusinesses = async () => {
		console.log('🔄 refreshBusinesses called - Function exists!');
		try {
			setIsRefreshing(true);
			console.log('Refrescando negocios en dashboard...');

			const userBusinesses = await menuService.getUserBusinesses();
			setBusinesses(userBusinesses);
			setError(null);
			setHasFetchError(false);

			console.log('Negocios del dashboard actualizados');
		} catch (error) {
			console.error('Error al refrescar negocios:', error);
			setError("No se pudieron actualizar los datos. Por favor, intente de nuevo.");
			setHasFetchError(true);
		} finally {
			setIsRefreshing(false);
		}
	};

	// Sin polling automático - las actualizaciones ocurren solo cuando el usuario realiza acciones

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

	const addMenu = async (newMenu) => {
		try {
			// Re-load businesses from backend to ensure state is consistent
			await fetchBusinesses();
			setError(null);
			return newMenu;
		} catch (error) {
			setError("Se agregó el menú pero ocurrió un error al actualizar la vista. Por favor, recarga la página.");
			// Fallback: if there is at least one business, mark the first as having a menu
			setBusinesses(prev => prev.length > 0 ? prev.map((b, idx) => idx === 0 ? { ...b, menus: [newMenu], hasMenu: true } : b) : prev);
			throw error;
		}
	};

	return {
		businesses,
		setBusinesses,
		loading,
		error,
		setError,
		isRefreshing,
		hasFetchError,
		addBusiness,
		addMenu,
		fetchBusinesses,
		refreshBusinesses
	};
};
