import { useState, useEffect } from "react";
import menuService from "../services/menuService";

export const useBusinessForm = (onBusinessAdded, onCancel) => {
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		slogan: "",
		address: "",
		phoneNumber: "",
		email: "",
	});

	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [loadingCategories, setLoadingCategories] = useState(true);

	const [logoFile, setLogoFile] = useState(null);
	const [logoPreview, setLogoPreview] = useState(null);
	const [uploadingLogo, setUploadingLogo] = useState(false);

	useEffect(() => {
		const fetchCategories = async () => {
			setLoadingCategories(true);
			setCategories([]);
			setFormData(prev => ({ ...prev, businessCategoryId: "" }));

			try {
				const backendCategories = await menuService.getBusinessCategories();
				setCategories(backendCategories);

				if (backendCategories && backendCategories.length > 0) {
					setFormData(prev => ({
						...prev,
						businessCategoryId: backendCategories[0].id.toString(),
					}));
				} else {
					setError("No hay categorías disponibles");
				}
			} catch (error) {
				setError("Error al cargar categorías. No hay categorías disponibles");
				setCategories([]);
			} finally {
				setLoadingCategories(false);
			}
		};

		fetchCategories();
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleLogoChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				setError("El archivo es demasiado grande. El tamaño máximo es 5MB.");
				return;
			}

			if (!file.type.startsWith("image/")) {
				setError("Por favor selecciona un archivo de imagen válido.");
				return;
			}

			setLogoFile(file);
			const reader = new FileReader();
			reader.onload = (e) => setLogoPreview(e.target.result);
			reader.readAsDataURL(file);
			setError(null);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const businessData = {
				...formData,
				businessCategoryId: parseInt(formData.businessCategoryId),
			};

			const newBusiness = await menuService.createFoodBusiness(businessData);

			if (logoFile) {
				setUploadingLogo(true);
				try {
					await menuService.uploadBusinessLogo(newBusiness.id, logoFile);
				} catch (logoError) {
					console.warn("Error al subir logo:", logoError);
				} finally {
					setUploadingLogo(false);
				}
			}

			onBusinessAdded(newBusiness);
		} catch (error) {
			setError(error.message || "Error al crear el negocio. Por favor, intenta de nuevo.");
		} finally {
			setLoading(false);
		}
	};

	return {
		formData,
		categories,
		loading,
		error,
		loadingCategories,
		logoFile,
		logoPreview,
		uploadingLogo,
		handleChange,
		handleLogoChange,
		handleSubmit,
		onCancel
	};
};