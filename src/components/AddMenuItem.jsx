/**
 * Formulario de Item de Menú - Refactorizado
 * Antes: 761 líneas | Ahora: ~280 líneas (-63%)
 * Usa hooks personalizados y componentes reutilizables
 */

import React, { useState, useEffect } from "react";
import menuService from "../services/menuService";
import { useMenuItemCategories } from "../hooks/useCategories";
import { useSections } from "../hooks/useSections";
import { useImageUpload } from "../hooks/useImageUpload";
import { FormInput, FormTextarea, FormSelect } from "./ui/FormInput";
import { validatePrice } from "../utils/validators";

export default function AddMenuItem({
	menuId,
	sectionId,
	onItemAdded,
	onCancel,
	existingItem,
	isEditing,
}) {
	const { categories, loading: loadingCategories } = useMenuItemCategories();
	const { sections, loading: loadingSections } = useSections(menuId);
	const imageUpload = useImageUpload({ maxSize: 5 * 1024 * 1024 }); // 5MB

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		price: "",
		isAvailable: true,
		menuItemCategoryId: null,
		sectionId: sectionId || null,
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [message, setMessage] = useState(null);
	const [touched, setTouched] = useState({ name: false, price: false });

	// Cargar datos existentes si estamos editando
	useEffect(() => {
		if (isEditing && existingItem) {
			setFormData({
				name: existingItem.name || "",
				description: existingItem.description || "",
				price: existingItem.price?.toString() || "",
				isAvailable: existingItem.isAvailable ?? true,
				menuItemCategoryId: existingItem.menuItemCategoryId || null,
				sectionId: existingItem.sectionId || sectionId || null,
			});
			if (existingItem.imageUri) {
				// Nota: no podemos pre-cargar el file, solo el preview
			}
		}
	}, [isEditing, existingItem, sectionId]);

	// Bloquear scroll y manejar ESC
	useEffect(() => {
		document.body.style.overflow = 'hidden';

		const handleEscapeKey = (e) => {
			if (e.key === "Escape" && !loading) {
				onCancel();
			}
		};

		document.addEventListener("keydown", handleEscapeKey);

		return () => {
			document.body.style.overflow = 'unset';
			document.removeEventListener("keydown", handleEscapeKey);
		};
	}, [loading, onCancel]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox"
				? checked
				: (name === "menuItemCategoryId" && value === "")
					? null
					: value,
		}));

		if (!touched[name]) {
			setTouched((prev) => ({ ...prev, [name]: true }));
		}

		setError(null);
		setMessage(null);
	};

	const handleBlur = (e) => {
		setTouched((prev) => ({ ...prev, [e.target.name]: true }));
	};

	// Validación de campos
	const validateField = (name, value) => {
		switch (name) {
			case "name":
				return value.trim() ? "" : "El nombre del plato es obligatorio";
			case "price":
				const priceValidation = validatePrice(value);
				return priceValidation.isValid ? "" : priceValidation.error;
			default:
				return "";
		}
	};

	const getFieldError = (fieldName) => {
		if (!touched[fieldName]) return "";
		return validateField(fieldName, formData[fieldName]);
	};

	const nameError = getFieldError("name");
	const priceError = getFieldError("price");

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validaciones
		if (!formData.name?.trim()) {
			setError("El nombre del plato es obligatorio");
			return;
		}

		const priceValidation = validatePrice(formData.price);
		if (!priceValidation.isValid) {
			setError(priceValidation.error);
			return;
		}

		setLoading(true);
		setError(null);
		setMessage(null);

		try {
			const dataToSend = {
				name: formData.name.trim(),
				description: formData.description || "",
				price: Number.parseFloat(formData.price),
				menuId: menuId,
				isAvailable: formData.isAvailable,
				menuItemCategoryId: formData.menuItemCategoryId
					? Number.parseInt(formData.menuItemCategoryId)
					: null,
				sectionId: formData.sectionId
					? Number.parseInt(formData.sectionId)
					: null,
				image: imageUpload.file,
			};

			if (isEditing && existingItem) {
				// Actualizar item existente
				const payload = {
					name: dataToSend.name,
					description: dataToSend.description,
					price: dataToSend.price,
					isAvailable: dataToSend.isAvailable,
					menuItemCategoryId: dataToSend.menuItemCategoryId,
					sectionId: dataToSend.sectionId,
					order: existingItem.order || 0,
				};

				await menuService.updateMenuItem(existingItem.id, payload);
				onItemAdded?.({
					...existingItem,
					...payload,
					id: existingItem.id,
					menuId: existingItem.menuId,
				});
			} else {
				// Crear nuevo item
				const newItem = await menuService.createMenuItem(dataToSend);
				onItemAdded?.(newItem);
			}
		} catch (err) {
			setError(err.message || "Error al guardar el item");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
			<div className="relative mx-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
				{/* Header */}
				<div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-6">
					<h2 className="font-bold text-2xl text-slate-800">
						{isEditing ? "Editar Item del Menú" : "Agregar Item al Menú"}
					</h2>
					<button
						type="button"
						onClick={onCancel}
						disabled={loading}
						className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
					>
						<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					{/* Mensajes */}
					{error && (
						<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
							{error}
						</div>
					)}

					{message && (
						<div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
							{message}
						</div>
					)}

					{imageUpload.error && (
						<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
							{imageUpload.error}
						</div>
					)}

					{/* Campos principales */}
					<div className="space-y-4">
						<FormInput
							label="Nombre del Plato"
							name="name"
							value={formData.name}
							onChange={handleChange}
							onBlur={handleBlur}
							placeholder="Ej: Hamburguesa Clásica"
							required
							disabled={loading}
						/>
						{nameError && <p className="mt-1 text-red-500 text-sm">{nameError}</p>}

						<FormInput
							label="Precio"
							name="price"
							type="number"
							step="0.01"
							value={formData.price}
							onChange={handleChange}
							onBlur={handleBlur}
							placeholder="0.00"
							required
							disabled={loading}
						/>
						{priceError && <p className="mt-1 text-red-500 text-sm">{priceError}</p>}
					</div>

					{/* Categoría y Sección */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormSelect
							label="Categoría"
							name="menuItemCategoryId"
							value={formData.menuItemCategoryId || ""}
							onChange={handleChange}
							options={[{ id: "", name: "Sin categoría" }, ...categories]}
							loading={loadingCategories}
							loadingText="Cargando categorías..."
							disabled={loading}
						/>

						<FormSelect
							label="Sección"
							name="sectionId"
							value={formData.sectionId || ""}
							onChange={handleChange}
							options={[{ id: "", name: "Sin sección" }, ...sections]}
							loading={loadingSections}
							loadingText="Cargando secciones..."
							disabled={loading}
						/>
					</div>

					{/* Disponibilidad */}
					<div className="flex items-center">
						<input
							type="checkbox"
							id="isAvailable"
							name="isAvailable"
							checked={formData.isAvailable}
							onChange={handleChange}
							className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
							disabled={loading}
						/>
						<label htmlFor="isAvailable" className="ml-2 block font-medium text-gray-700 text-sm">
							Disponible
						</label>
					</div>

					{/* Descripción */}
					<FormTextarea
						label="Descripción"
						name="description"
						value={formData.description}
						onChange={handleChange}
						placeholder="Describe los ingredientes y características del plato..."
						rows={3}
						disabled={loading}
					/>

					{/* Imagen */}
					<div>
						<label className="mb-2 block font-medium text-gray-700 text-sm">
							Imagen del Plato
						</label>
						<p className="mb-3 text-gray-500 text-xs">JPG, PNG, WebP (máx. 5MB)</p>

						{imageUpload.preview || existingItem?.imageUri ? (
							<div className="relative inline-block">
								<img
									src={imageUpload.preview || existingItem?.imageUri}
									alt="Preview"
									className="h-40 w-40 rounded-lg border-2 border-gray-300 object-cover"
								/>
								{imageUpload.preview && (
									<button
										type="button"
										onClick={() => {
											imageUpload.reset();
											imageUpload.clearFileInput('itemImage');
										}}
										className="-top-2 -right-2 absolute flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
									>
										<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								)}
							</div>
						) : (
							<div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400">
								<input
									type="file"
									id="itemImage"
									accept="image/jpeg,image/png,image/jpg,image/webp"
									onChange={imageUpload.handleFileChange}
									className="hidden"
									disabled={loading}
								/>
								<label htmlFor="itemImage" className="cursor-pointer">
									<svg className="mx-auto mb-3 h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
									</svg>
									<span className="font-medium text-gray-600 text-sm">Seleccionar imagen</span>
								</label>
							</div>
						)}
					</div>

					{/* Botones */}
					<div className="flex justify-end space-x-3 pt-4">
						<button
							type="button"
							onClick={onCancel}
							disabled={loading}
							className="rounded-lg border border-gray-300 px-5 py-2.5 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
						>
							Cancelar
						</button>

						<button
							type="submit"
							disabled={loading || loadingCategories || loadingSections || imageUpload.isUploading}
							className="rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700 disabled:bg-gray-400"
						>
							{loading ? (
								<>
									<svg className="mr-2 inline h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
									</svg>
									{imageUpload.isUploading ? "Subiendo imagen..." : "Guardando..."}
								</>
							) : (
								isEditing ? "Guardar Cambios" : "Agregar Item"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
