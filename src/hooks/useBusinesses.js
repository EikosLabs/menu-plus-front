import { useState, useEffect } from "react";
import menuService from "../services/menuService";

export const useBusinesses = () => {
	const [businesses, setBusinesses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchBusinesses = async () => {
		setLoading(true);
		try {
			// El backend obtiene el userId del token
			const userBusinesses = await menuService.getUserBusinesses();
			setBusinesses(userBusinesses);
			setError(null);
		} catch (error) {
			setError("No se pudieron cargar los datos del dashboard. Por favor, verifique su conexión e intente de nuevo.");
			setBusinesses([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchBusinesses();
	}, []);

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
		addBusiness,
		addMenu,
		fetchBusinesses
	};
};