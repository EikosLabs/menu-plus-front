import React, { useState, useEffect, useRef } from "react";
import menuService from "../services/menuService";

export default function AddMenuItem({
	menuId,
	sectionId,
	onItemAdded,
	onCancel,
	existingItem,
	isEditing,
}) {
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		price: "",
		isAvailable: true,
		menuItemCategoryId: null,
		menuId: menuId,
		sectionId: sectionId || null,
		image: null,
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [message, setMessage] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);
	const [categories, setCategories] = useState([]);
	const [loadingCategories, setLoadingCategories] = useState(false);
	const [sections, setSections] = useState([]);
	const [loadingSections, setLoadingSections] = useState(false);
	const fileInputRef = useRef(null);
	const formRef = useRef(null);
	const [touched, setTouched] = useState({
		name: false,
		price: false,
	});

	const isMounted = useRef(true);

	useEffect(() => {
		const handleEscapeKey = (e) => {
			if (e.key === "Escape" && !loading) {
				onCancel();
			}
		};

		document.addEventListener("keydown", handleEscapeKey);
		return () => {
			document.removeEventListener("keydown", handleEscapeKey);
		};
	}, [loading, onCancel]);

	// Bloquear scroll cuando el modal está abierto
	useEffect(() => {
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, []);

	useEffect(() => {
		async function fetchCategories() {
			if (!isMounted.current) {
				return;
			}
			setLoadingCategories(true);
			try {
				const categoriesData = await menuService.getMenuItemCategories();
				if (isMounted.current) {
					setCategories(categoriesData || []);
				}
			} catch (_err) {
				if (isMounted.current) {
					setError("No se pudieron cargar las categorías. Intente nuevamente.");
				}
			} finally {
				if (isMounted.current) {
					setLoadingCategories(false);
				}
			}
		}

		async function fetchSections() {
			if (!(isMounted.current && menuId)) {
				return;
			}
			setLoadingSections(true);
			try {
				const sectionsData = await menuService.getSections(menuId);
				if (isMounted.current) {
					setSections(sectionsData || []);
				}
			} catch (_err) {
				if (isMounted.current) {
				}
			} finally {
				if (isMounted.current) {
					setLoadingSections(false);
				}
			}
		}

		fetchCategories();
		fetchSections();
	}, [menuId]);

	useEffect(() => {
		if (!isMounted.current) {
			return;
		}

		if (isEditing && existingItem) {
			setFormData({
				name: existingItem.name || "",
				description: existingItem.description || "",
				price: existingItem.price?.toString() || "",
				isAvailable:
					existingItem.isAvailable !== undefined
						? existingItem.isAvailable
						: true,
				menuItemCategoryId: existingItem.menuItemCategoryId || null,
				sectionId: existingItem.sectionId || sectionId || null,
				menuId: existingItem.menuId || menuId,
				image: null,
			});
			setImagePreview(existingItem.imageUri || null);
		} else {
			setFormData({
				name: "",
				description: "",
				price: "",
				isAvailable: true,
				menuItemCategoryId: null,
				sectionId: sectionId || null,
				menuId: menuId,
				image: null,
			});
			setImagePreview(null);
		}
	}, [isEditing, existingItem, menuId, sectionId]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]:
				type === "checkbox"
					? checked
					: name === "menuItemCategoryId" && value === ""
						? null
						: value,
		}));

		if (!touched[name]) {
			setTouched((prev) => ({
				...prev,
				[name]: true,
			}));
		}

		setError(null);
		setMessage(null);
	};

	const handleBlur = (e) => {
		const { name } = e.target;
		setTouched((prev) => ({
			...prev,
			[name]: true,
		}));
	};

	const validateField = (name, value) => {
		switch (name) {
			case "name":
				return value.trim() ? "" : "El nombre del plato es obligatorio";
			case "price":
				return value && Number.parseFloat(value) > 0
					? ""
					: "El precio debe ser mayor que cero";
			default:
				return "";
		}
	};

	const getFieldError = (fieldName) => {
		if (!touched[fieldName]) {
			return "";
		}
		return validateField(fieldName, formData[fieldName]);
	};

	const nameError = getFieldError("name");
	const priceError = getFieldError("price");

	const handleFileChange = (e) => {
		if (!isMounted.current) {
			return;
		}

		const file = e.target.files[0];
		setImagePreview(null);
		setFormData((prev) => ({ ...prev, image: null }));
		if (fileInputRef.current) {
			fileInputRef.current.value = null;
		}

		if (!file) {
			return;
		}

		const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
		if (!validTypes.includes(file.type)) {
			setError("El archivo debe ser una imagen (JPEG, PNG, WebP).");
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			setError("La imagen no debe exceder 5MB.");
			return;
		}

		const reader = new FileReader();
		reader.onloadend = () => {
			if (isMounted.current) {
				setImagePreview(reader.result);
			}
		};
		reader.readAsDataURL(file);

		setFormData((prev) => ({
			...prev,
			image: file,
		}));
		setError(null);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.name?.trim()) {
			setError("El nombre del plato es obligatorio");
			return;
		}

		if (!formData.price || Number.parseFloat(formData.price) <= 0) {
			setError("El precio debe ser mayor que cero");
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
				menuItemCategoryId:
					formData.menuItemCategoryId === ""
						? null
						: formData.menuItemCategoryId
							? Number.parseInt(formData.menuItemCategoryId)
							: null,
				sectionId:
					formData.sectionId === ""
						? null
						: formData.sectionId
							? Number.parseInt(formData.sectionId)
							: null,
				image: formData.image,
			};

			if (isEditing && existingItem) {
				const payload = {
					name: dataToSend.name,
					description: dataToSend.description,
					price: dataToSend.price,
					isAvailable: dataToSend.isAvailable,
					menuItemCategoryId: dataToSend.menuItemCategoryId,
					sectionId: dataToSend.sectionId,
					order: existingItem.order || 0,
				};

				const updatedItem = await menuService.updateMenuItem(existingItem.id, payload);

				if (onItemAdded) {
					try {
						// Usar el resultado de la API o combinar con el existingItem
						onItemAdded({
							...existingItem,
							...payload,
							id: existingItem.id,
							menuId: existingItem.menuId,
						});
					} catch (_e) {}
				}

				setLoading(false);
				setMessage("¡Plato actualizado correctamente!");

				setTimeout(() => {
					try {
						if (onCancel) {
							onCancel();
						}
					} catch (_e) {}
				}, 1500);
			} else {
				try {
					const result = await menuService.createMenuItem(dataToSend);

					if (onItemAdded) {
						try {
							onItemAdded(result);
						} catch (_e) {}
					}

					setLoading(false);
					setMessage("¡Plato agregado correctamente!");

					setTimeout(() => {
						try {
							if (onCancel) {
								onCancel();
							}
						} catch (_e) {}
					}, 1500);
				} catch (createError) {
					setLoading(false);
					setError(
						createError.message ||
							"Error al crear el plato. Inténtelo nuevamente.",
					);
				}
			}
		} catch (err) {
			setLoading(false);
			setError(
				err.message ||
					"Ha ocurrido un error inesperado. Por favor, inténtelo nuevamente.",
			);
		}
	};

	const handleModalClick = (e) => {
		e.stopPropagation();
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-neo-black transition-all duration-300 p-2 sm:p-4"
			onClick={onCancel}
		>
			<div
				className="w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] transform animate-fadeInUp overflow-y-auto neo-surface neo-border neo-shadow-lg transition-all duration-300"
				onClick={handleModalClick}
			>
				<div className="relative p-4 sm:p-6 md:p-8">
					<button
						onClick={() => {
							if (!loading) {
								onCancel();
							}
						}}
						className="absolute top-4 right-4 neo-btn neo-btn-sm bg-neo-lavender hover:bg-neo-lavender-dark"
						aria-label="Cerrar modal"
						disabled={loading}
					>
						<svg
							className="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>

					<div className="mb-6 flex items-center">
						<div
							className={`${isEditing ? "bg-neo-sunset" : "bg-neo-flame"} mr-4 flex-shrink-0 rounded-lg bg-opacity-10 p-3.5`}
						>
							<svg
								className={`h-7 w-7 ${isEditing ? "text-neo-sunset" : "text-neo-flame"}`}
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								{isEditing ? (
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
									/>
								) : (
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 6v6m0 0v6m0-6h6m-6 0H6"
									/>
								)}
							</svg>
						</div>
						<h2 className="neo-heading neo-h3">
							{isEditing ? "Editar Plato" : "Agregar Nuevo Plato"}
						</h2>
					</div>

					{error && (
						<div className="mb-6 neo-alert neo-alert-error animate-fadeIn">
							<div className="flex items-center">
								<svg
									className="mr-2 h-5 w-5 flex-shrink-0"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<span className="font-medium">Error:</span>&nbsp;
								<span>{error}</span>
							</div>
						</div>
					)}

					{message && (
						<div className="mb-6 neo-alert neo-alert-success animate-fadeIn">
							<div className="flex items-center">
								<svg
									className="mr-2 h-5 w-5 flex-shrink-0"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
								<span className="font-medium">Éxito:</span>&nbsp;
								<span>{message}</span>
							</div>
						</div>
					)}

					<form
						ref={formRef}
						onSubmit={handleSubmit}
						className="space-y-4 sm:space-y-5 md:space-y-6"
					>
						<div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
							<div className="space-y-4">
								<div>
									<label className="mb-1 block font-medium text-gray-700 text-sm">
										Imagen del Plato
									</label>

									<div
										className="group mt-1 flex cursor-pointer justify-center rounded-lg border-2 border-gray-300 border-dashed px-6 pt-5 pb-6 transition-colors hover:bg-gray-50"
										onClick={() =>
											!loading &&
											fileInputRef.current &&
											fileInputRef.current.click()
										}
									>
										<div className="space-y-1 text-center">
											{imagePreview ? (
												<div className="relative">
													<img
														src={imagePreview}
														alt="Vista previa"
														className="mx-auto h-40 rounded-lg object-cover shadow-md transition-transform group-hover:scale-105"
													/>
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															setImagePreview(null);
															if (fileInputRef.current) {
																fileInputRef.current.value = null;
															}
															setFormData((prev) => ({ ...prev, image: null }));
														}}
														className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
														disabled={loading}
														aria-label="Eliminar imagen"
													>
														<svg
															className="h-4 w-4"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M6 18L18 6M6 6l12 12"
															/>
														</svg>
													</button>
												</div>
											) : (
												<>
													<svg
														className="mx-auto h-12 w-12 text-gray-400 transition-colors group-hover:text-gray-500"
														stroke="currentColor"
														fill="none"
														viewBox="0 0 48 48"
														aria-hidden="true"
													>
														<path
															d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
														/>
													</svg>
													<div className="flex justify-center text-gray-600 text-sm">
														<span className="relative rounded-md font-medium text-[#1a1a1a] transition-colors hover:text-[#404040] focus:outline-none">
															Subir una imagen
														</span>
														<p className="pl-1">o arrastrar y soltar</p>
													</div>
													<p className="text-gray-500 text-xs">
														PNG, JPG, WebP hasta 5MB
													</p>
												</>
											)}
										</div>
									</div>
									<input
										ref={fileInputRef}
										type="file"
										accept="image/*"
										onChange={handleFileChange}
										className="hidden"
										disabled={loading}
									/>
								</div>
							</div>

							<div className="space-y-4">
								<div>
									<label
										htmlFor="name"
										className="mb-1 block font-medium text-gray-700 text-sm"
									>
										Nombre del Plato *
									</label>
									<input
										type="text"
										id="name"
										name="name"
										value={formData.name}
										onChange={handleChange}
										onBlur={handleBlur}
										className={`neo-input ${
											nameError
												? "border-red-500"
												: ""
										}`}
										placeholder="Ej: Pizza Margherita"
										disabled={loading}
										required
									/>
									{nameError && (
										<p className="mt-1 text-red-600 text-sm">{nameError}</p>
									)}
								</div>

								<div>
									<label
										htmlFor="price"
										className="mb-1 block font-medium text-gray-700 text-sm"
									>
										Precio *
									</label>
									<div className="relative">
										<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
											$
										</span>
										<input
											type="number"
											id="price"
											name="price"
											value={formData.price}
											onChange={handleChange}
											onBlur={handleBlur}
											step="0.01"
											min="0"
											className={`neo-input pl-8 ${
												priceError
													? "border-red-500"
													: ""
											}`}
											placeholder="0.00"
											disabled={loading}
											required
										/>
									</div>
									{priceError && (
										<p className="mt-1 text-red-600 text-sm">{priceError}</p>
									)}
								</div>

								<div>
									<label
										htmlFor="menuItemCategoryId"
										className="mb-1 block font-medium text-gray-700 text-sm"
									>
										Categoría
									</label>
									<select
										id="menuItemCategoryId"
										name="menuItemCategoryId"
										value={formData.menuItemCategoryId || ""}
										onChange={handleChange}
										className="neo-input neo-select"
										disabled={loading || loadingCategories}
									>
										<option value="">Sin categoría</option>
										{categories.map((category) => (
											<option key={category.id} value={category.id}>
												{category.name}
											</option>
										))}
									</select>
								</div>

								<div>
									<label
										htmlFor="sectionId"
										className="mb-1 block font-medium text-gray-700 text-sm"
									>
										Sección
									</label>
									<select
										id="sectionId"
										name="sectionId"
										value={formData.sectionId || ""}
										onChange={handleChange}
										className="neo-input neo-select"
										disabled={loading || loadingSections}
									>
										<option value="">Sin sección</option>
										{sections.map((section) => (
											<option key={section.id} value={section.id}>
												{section.name}
											</option>
										))}
									</select>
								</div>

								<div className="flex items-center">
									<input
										type="checkbox"
										id="isAvailable"
										name="isAvailable"
										checked={formData.isAvailable}
										onChange={handleChange}
										className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
										disabled={loading}
									/>
									<label
										htmlFor="isAvailable"
										className="ml-2 block font-medium text-gray-700 text-sm"
									>
										Disponible
									</label>
								</div>
							</div>
						</div>

						<div>
							<label
								htmlFor="description"
								className="mb-1 block font-medium text-gray-700 text-sm"
							>
								Descripción
							</label>
							<textarea
								id="description"
								name="description"
								value={formData.description}
								onChange={handleChange}
								rows={3}
								className="neo-input neo-textarea"
								placeholder="Describe los ingredientes y características del plato..."
								disabled={loading}
							/>
						</div>

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
								disabled={loading || !!nameError || !!priceError}
							>
								{loading ? (
									<div className="flex items-center justify-center">
										<svg
											className="mr-2 h-4 w-4 animate-spin"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											/>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											/>
										</svg>
										{isEditing ? "Actualizando..." : "Agregando..."}
									</div>
								) : (
									<span>
										{isEditing ? "Actualizar Plato" : "Agregar Plato"}
									</span>
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
