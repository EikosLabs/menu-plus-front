import React, { useState, useEffect } from "react";
import menuService from "../services/menuService";
import { getCurrencySymbol } from "../utils/currencies";
import { useFormValidation } from "../hooks/useFormValidation";
import { useImageUpload } from "../hooks/useImageUpload";
import Modal from "./shared/Modal";
import ImageUploader from "./shared/ImageUploader";
import { FormField, TextAreaField, SelectField, CheckboxField } from "./shared/FormField";

const validationRules = {
	name: (value) => value?.trim() ? "" : "El nombre del plato es obligatorio",
	price: (value) => value && parseFloat(value) > 0 ? "" : "El precio debe ser mayor que cero"
};

export default function AddMenuItem({
	menuId,
	sectionId,
	businessCurrency = 0,
	onItemAdded,
	onCancel,
	existingItem,
	isEditing,
}) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [message, setMessage] = useState(null);
	const [categories, setCategories] = useState([]);
	const [loadingCategories, setLoadingCategories] = useState(false);
	const [sections, setSections] = useState([]);
	const [loadingSections, setLoadingSections] = useState(false);

	const { values, errors, touched, handleChange, handleBlur, validateAll, resetForm } = useFormValidation(
		{
			name: "",
			description: "",
			price: "",
			isAvailable: true,
			menuItemCategoryId: null,
			sectionId: sectionId || null,
			menuId: menuId,
		},
		validationRules
	);

	const {
		image,
		preview,
		error: imageError,
		fileInputRef,
		handleFileChange,
		clearImage,
		setExistingPreview
	} = useImageUpload();

	// Load categories and sections
	useEffect(() => {
		let mounted = true;

		async function fetchData() {
			try {
				setLoadingCategories(true);
				const categoriesData = await menuService.getMenuItemCategories();
				if (mounted) setCategories(categoriesData || []);
			} catch {
				if (mounted) setError("No se pudieron cargar las categorías");
			} finally {
				if (mounted) setLoadingCategories(false);
			}

			if (menuId) {
				try {
					setLoadingSections(true);
					const sectionsData = await menuService.getSections(menuId);
					if (mounted) setSections(sectionsData || []);
				} catch {
					// Silent fail
				} finally {
					if (mounted) setLoadingSections(false);
				}
			}
		}

		fetchData();
		return () => { mounted = false; };
	}, [menuId]);

	// Load existing item data
	useEffect(() => {
		if (isEditing && existingItem) {
			resetForm({
				name: existingItem.name || "",
				description: existingItem.description || "",
				price: existingItem.price?.toString() || "",
				isAvailable: existingItem.isAvailable !== undefined ? existingItem.isAvailable : true,
				menuItemCategoryId: existingItem.menuItemCategoryId || null,
				sectionId: existingItem.sectionId || sectionId || null,
				menuId: existingItem.menuId || menuId,
			});
			if (existingItem.imageUri) {
				setExistingPreview(existingItem.imageUri);
			}
		} else {
			resetForm({
				name: "",
				description: "",
				price: "",
				isAvailable: true,
				menuItemCategoryId: null,
				sectionId: sectionId || null,
				menuId: menuId,
			});
			clearImage();
		}
	}, [isEditing, existingItem, menuId, sectionId, resetForm, setExistingPreview, clearImage]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateAll()) {
			setError("Por favor, corrija los errores del formulario");
			return;
		}

		setLoading(true);
		setError(null);
		setMessage(null);

		try {
			const dataToSend = {
				name: values.name.trim(),
				description: values.description || "",
				price: parseFloat(values.price),
				currencyType: businessCurrency,
				menuId: menuId,
				isAvailable: values.isAvailable,
				menuItemCategoryId: values.menuItemCategoryId === "" ? null : values.menuItemCategoryId ? parseInt(values.menuItemCategoryId) : null,
				sectionId: values.sectionId === "" ? null : values.sectionId ? parseInt(values.sectionId) : null,
				image: image,
			};

			if (isEditing && existingItem) {
				const payload = {
					name: dataToSend.name,
					description: dataToSend.description,
					price: dataToSend.price,
					currencyType: dataToSend.currencyType,
					isAvailable: dataToSend.isAvailable,
					menuItemCategoryId: dataToSend.menuItemCategoryId,
					sectionId: dataToSend.sectionId,
					order: existingItem.order || 0,
				};

				await menuService.updateMenuItem(existingItem.id, payload);

				if (onItemAdded) {
					onItemAdded({
						...existingItem,
						...payload,
						id: existingItem.id,
						menuId: existingItem.menuId,
					});
				}

				setMessage("¡Plato actualizado correctamente!");
			} else {
				const result = await menuService.createMenuItem(dataToSend);
				if (onItemAdded) {
					onItemAdded(result);
				}
				setMessage("¡Plato agregado correctamente!");
			}

			setLoading(false);
			setTimeout(() => {
				if (onCancel) onCancel();
			}, 1500);
		} catch (err) {
			setLoading(false);
			setError(err.message || "Error al procesar el plato");
		}
	};

	const categoryOptions = categories.map(cat => ({
		value: cat.id,
		label: cat.name
	}));

	const sectionOptions = sections.map(sec => ({
		value: sec.id,
		label: sec.name
	}));

	const icon = isEditing ? (
		<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
				d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
		</svg>
	) : (
		<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
				d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
		</svg>
	);

	return (
		<Modal
			isOpen={true}
			onClose={onCancel}
			title={isEditing ? "Editar Plato" : "Agregar Nuevo Plato"}
			icon={icon}
			iconBgColor={isEditing ? "bg-neo-sunset" : "bg-neo-flame"}
			iconColor={isEditing ? "text-neo-sunset" : "text-neo-flame"}
			onEscapeKey={!loading}
		>
			{error && (
				<div className="mb-4 neo-alert neo-alert-error animate-fadeIn">
					<div className="flex items-center">
						<svg className="mr-2 h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span className="font-medium">Error:</span>&nbsp;
						<span>{error}</span>
					</div>
				</div>
			)}

			{message && (
				<div className="mb-4 neo-alert neo-alert-success animate-fadeIn">
					<div className="flex items-center">
						<svg className="mr-2 h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
						<span className="font-medium">Éxito:</span>&nbsp;
						<span>{message}</span>
					</div>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
				<div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
					<ImageUploader
						preview={preview}
						onFileChange={handleFileChange}
						onClearImage={clearImage}
						fileInputRef={fileInputRef}
						disabled={loading}
						error={imageError}
						label="Imagen del Plato"
					/>

					<div className="space-y-3">
						<FormField
							label="Nombre del Plato"
							name="name"
							value={values.name}
							onChange={handleChange}
							onBlur={handleBlur}
							error={touched.name ? errors.name : ""}
							required
							disabled={loading}
							placeholder="Ej: Pizza Margherita"
						/>

						<div>
							<label htmlFor="price" className="mb-1 block font-medium text-gray-700 text-sm">
								Precio *
							</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
									{getCurrencySymbol(businessCurrency)}
								</span>
								<input
									type="number"
									id="price"
									name="price"
									value={values.price}
									onChange={handleChange}
									onBlur={handleBlur}
									step="0.01"
									min="0"
									className={`neo-input pl-8 ${touched.price && errors.price ? 'border-red-500' : ''}`}
									placeholder="0.00"
									disabled={loading}
									required
								/>
							</div>
							{touched.price && errors.price && (
								<p className="mt-1 text-red-600 text-sm">{errors.price}</p>
							)}
						</div>

						<SelectField
							label="Categoría"
							name="menuItemCategoryId"
							value={values.menuItemCategoryId || ""}
							onChange={handleChange}
							options={categoryOptions}
							disabled={loading || loadingCategories}
							placeholder="Sin categoría"
						/>

						<SelectField
							label="Sección"
							name="sectionId"
							value={values.sectionId || ""}
							onChange={handleChange}
							options={sectionOptions}
							disabled={loading || loadingSections}
							placeholder="Sin sección"
						/>

						<CheckboxField
							label="Disponible"
							name="isAvailable"
							checked={values.isAvailable}
							onChange={handleChange}
							disabled={loading}
						/>
					</div>
				</div>

				<TextAreaField
					label="Descripción"
					name="description"
					value={values.description}
					onChange={handleChange}
					rows={3}
					disabled={loading}
					placeholder="Describe los ingredientes y características del plato..."
				/>

				<div className="flex flex-col-reverse gap-3 pt-2 sm:pt-4 sm:flex-row sm:justify-end">
					<button
						type="button"
						onClick={onCancel}
						className="neo-btn neo-btn-white w-full sm:w-auto"
						disabled={loading}
					>
						Cancelar
					</button>
					<button
						type="submit"
						className="neo-btn neo-btn-primary w-full sm:w-auto"
						disabled={loading || (touched.name && errors.name) || (touched.price && errors.price)}
					>
						{loading ? (
							<div className="flex items-center justify-center">
								<svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
									<path className="opacity-75" fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
								</svg>
								{isEditing ? "Actualizando..." : "Agregando..."}
							</div>
						) : (
							<span>{isEditing ? "Actualizar Plato" : "Agregar Plato"}</span>
						)}
					</button>
				</div>
			</form>
		</Modal>
	);
}
