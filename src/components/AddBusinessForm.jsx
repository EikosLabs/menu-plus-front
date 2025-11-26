import React, { useState, useEffect } from "react";
import { useTranslation } from "../i18n/utils";
import menuService from "../services/menuService";
import { useErrorHandler } from "../hooks/useErrorHandler";
import ErrorAlert, { FieldError } from "./shared/ErrorAlert";
import { AppError } from "../utils/AppError";
import { ERROR_TYPES } from "../utils/errorTypes";
import { errorLogger } from "../utils/errorLogger";
import { validateRequired, validateEmail, validateUrl, validatePhone, validateFileType, validateFileSize } from "../utils/validation";
import { getAllCurrencies } from "../utils/currencies";
import CircularColorPicker from "./ui/CircularColorPicker";

export default function AddBusinessForm({ onBusinessAdded, onCancel, existingBusiness = null, isEditing = false }) {
	const { t } = useTranslation();
	const [formData, setFormData] = useState({
		name: existingBusiness?.name || "",
		description: existingBusiness?.description || "",
		slogan: existingBusiness?.slogan || "",
		address: existingBusiness?.address || "",
		phoneNumber: existingBusiness?.phoneNumber || "",
		email: existingBusiness?.email || "",
		facebookUrl: existingBusiness?.facebookUrl || "",
		instagramUrl: existingBusiness?.instagramUrl || "",
		twitterUrl: existingBusiness?.twitterUrl || "",
		whatsAppNumber: existingBusiness?.whatsAppNumber || "",
		primaryColor: existingBusiness?.primaryColor || "#1a1a1a",
		secondaryColor: existingBusiness?.secondaryColor || "#004E71",
		accentColor: existingBusiness?.accentColor || "#0A3342",
		businessCategoryId: existingBusiness?.businessCategoryId?.toString() || "",
		defaultCurrency: existingBusiness?.defaultCurrency ?? 0,
	});

	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(false);
	const [loadingCategories, setLoadingCategories] = useState(true);

	const [logoFile, setLogoFile] = useState(null);
	const [logoPreview, setLogoPreview] = useState(null);
	const [uploadingLogo, setUploadingLogo] = useState(false);

	const { error, fieldErrors, clearError, clearFieldError, handleError } = useErrorHandler();
	const [touched, setTouched] = useState({});

	useEffect(() => {
		const fetchCategories = async () => {
			setLoadingCategories(true);
			setCategories([]);
			setFormData((prev) => ({ ...prev, businessCategoryId: "" }));
			clearError();

			try {
				const backendCategories = await menuService.getBusinessCategories();
				setCategories(backendCategories);

				if (backendCategories && backendCategories.length > 0) {
					setFormData((prev) => ({
						...prev,
						businessCategoryId: backendCategories[0].id.toString(),
					}));
					errorLogger.info('Business categories loaded successfully', {
						count: backendCategories.length
					});
				} else {
					const noCategError = new AppError(
						ERROR_TYPES.NOT_FOUND,
						t("business.noCategoriesAvailable")
					);
					handleError(noCategError);
				}
			} catch (err) {
				const appError = err instanceof AppError ? err : new AppError(
					ERROR_TYPES.SERVER_ERROR,
					`${t("business.categoryLoadError")}. ${t("business.noCategoriesAvailable")}`
				);
				errorLogger.error(appError, { context: 'fetchCategories' });
				handleError(appError);
				setCategories([]);
			} finally {
				setLoadingCategories(false);
			}
		};

		fetchCategories();
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Clear field error when user starts typing
		if (touched[name] && fieldErrors[name]) {
			clearFieldError(name);
		}
	};

	const handleColorChange = (name, color) => {
		setFormData((prev) => ({
			...prev,
			[name]: color,
		}));

		// Clear field error when user changes color
		if (fieldErrors[name]) {
			clearFieldError(name);
		}
	};

	const handleBlur = (field) => {
		setTouched(prev => ({ ...prev, [field]: true }));
	};

	const getFieldError = (field) => {
		// Show server errors immediately, client validation only after touch
		if (fieldErrors[field]) return fieldErrors[field];
		if (!touched[field]) return null;

		const value = formData[field];

		switch (field) {
			case 'name':
				return validateRequired(value, 'El nombre del negocio');
			case 'email':
				return value ? validateEmail(value) : null;
			case 'phoneNumber':
				return value ? validatePhone(value, 'El teléfono') : null;
			case 'whatsAppNumber':
				return value ? validatePhone(value, 'El WhatsApp') : null;
			case 'facebookUrl':
			case 'instagramUrl':
			case 'twitterUrl':
				return value ? validateUrl(value, 'La URL') : null;
			default:
				return null;
		}
	};

	const handleLogoChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		clearError();

		// Validar tipo de archivo
		const typeError = validateFileType(file, [
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/gif",
			"image/webp",
		]);
		if (typeError) {
			handleError(new AppError(ERROR_TYPES.VALIDATION_ERROR, typeError));
			return;
		}

		// Validar tamaño (1MB max)
		const sizeError = validateFileSize(file, 1);
		if (sizeError) {
			handleError(new AppError(ERROR_TYPES.VALIDATION_ERROR, sizeError));
			return;
		}

		setLogoFile(file);

		const reader = new FileReader();
		reader.onload = (e) => {
			setLogoPreview(e.target.result);
		};
		reader.onerror = () => {
			handleError(new AppError(
				ERROR_TYPES.VALIDATION_ERROR,
				'Error al leer el archivo de imagen'
			));
		};
		reader.readAsDataURL(file);
	};

	const removeLogo = () => {
		setLogoFile(null);
		setLogoPreview(null);
		const fileInput = document.getElementById("logo");
		if (fileInput) {
			fileInput.value = "";
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		clearError();

		// Marcar todos los campos como tocados para mostrar errores de validación
		setTouched({
			name: true,
			email: true,
			phoneNumber: true,
			whatsAppNumber: true,
			facebookUrl: true,
			instagramUrl: true,
			twitterUrl: true,
		});

		// Validar estado de carga
		if (loadingCategories) {
			handleError(new AppError(
				ERROR_TYPES.VALIDATION_ERROR,
				t("business.loadingCategories")
			));
			return;
		}

		if (categories.length === 0) {
			handleError(new AppError(
				ERROR_TYPES.NOT_FOUND,
				t("business.noCategoriesAvailable")
			));
			return;
		}

		// Validar campos requeridos
		const nameError = validateRequired(formData.name, 'El nombre del negocio');
		const emailError = formData.email ? validateEmail(formData.email) : null;
		const phoneError = formData.phoneNumber ? validatePhone(formData.phoneNumber, 'El teléfono') : null;

		if (nameError || emailError || phoneError) {
			handleError(new AppError(
				ERROR_TYPES.VALIDATION_ERROR,
				'Por favor corrige los errores en el formulario',
				{
					fieldErrors: {
						...(nameError && { name: nameError }),
						...(emailError && { email: emailError }),
						...(phoneError && { phoneNumber: phoneError }),
					}
				}
			));
			return;
		}

		if (!formData.businessCategoryId) {
			handleError(new AppError(
				ERROR_TYPES.VALIDATION_ERROR,
				t("business.categoryRequired"),
				{ fieldErrors: { businessCategoryId: t("business.categoryRequired") } }
			));
			return;
		}

		setLoading(true);

		try {
			let imageKey = existingBusiness?.imageKey || null;

			// Subir logo si existe
			if (logoFile) {
				setUploadingLogo(true);
				try {
					imageKey = await menuService.uploadImage(logoFile);
					errorLogger.info('Logo uploaded successfully', { imageKey });
				} catch (imageError) {
					setUploadingLogo(false);
					setLoading(false);

					// El error de uploadImage ya es AppError con detalles específicos
					const uploadError = imageError instanceof AppError
						? imageError
						: new AppError(ERROR_TYPES.UPLOAD_ERROR, t("business.logoUploadError"));

					errorLogger.error(uploadError, { fileName: logoFile.name });
					handleError(uploadError);
					return;
				} finally {
					setUploadingLogo(false);
				}
			}

			const businessData = {
				...formData,
				businessCategoryId: Number.parseInt(formData.businessCategoryId),
				imageKey: imageKey,
			};

			let result;
			if (isEditing && existingBusiness) {
				// Actualizar negocio existente
				result = await menuService.updateFoodBusiness(existingBusiness.id, businessData);
				errorLogger.info('Business updated successfully', { businessId: existingBusiness.id });
			} else {
				// Crear nuevo negocio - el backend obtiene el userId del token
				result = await menuService.createFoodBusiness(businessData);
				errorLogger.info('Business created successfully', { businessId: result.id });
			}

			onBusinessAdded(result);
		} catch (err) {
			// El error ya es AppError desde menuService con tipos específicos
			const appError = err instanceof AppError
				? err
				: new AppError(ERROR_TYPES.SERVER_ERROR, `${t("errors.general")} ${err.message}`);

			errorLogger.error(appError, {
				context: isEditing ? 'updateBusiness' : 'createBusiness',
				businessId: existingBusiness?.id,
			});

			handleError(appError);
		} finally {
			setLoading(false);
			setUploadingLogo(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="animate-fadeIn space-y-4 sm:space-y-6">
			{error && (
				<ErrorAlert error={error} onClose={clearError} />
			)}

			<div className="neo-surface neo-border neo-shadow-md p-4 sm:p-5 md:p-6">
				<h3 className="mb-4 sm:mb-5 flex items-center neo-heading neo-h4 text-base sm:text-lg">
					<svg
						className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 text-neo-flame flex-shrink-0"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					{isEditing ? "Editar Información del Negocio" : t("business.basicInfo")}
				</h3>

				<div className="space-y-3 sm:space-y-4">
					<div>
						<label
							htmlFor="name"
							className="mb-1 block flex items-center neo-text neo-text-bold text-sm"
						>
							<svg
								className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#1a1a1a] flex-shrink-0"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
								/>
							</svg>
							{t("business.name")} *
						</label>
						<input
							type="text"
							id="name"
							name="name"
							required={true}
							value={formData.name}
							onChange={handleChange}
							onBlur={() => handleBlur('name')}
							className={`neo-input ${getFieldError('name') ? 'border-red-500' : ''}`}
							placeholder={t("business.namePlaceholder")}
						/>
						<FieldError error={getFieldError('name')} />
					</div>

					<div>
						<label
							htmlFor="description"
							className="mb-1 block flex items-center font-medium text-[#0A3342] text-sm"
						>
							<svg
								className="mr-1 h-4 w-4 text-[#1a1a1a]"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h7"
								/>
							</svg>
							{t("business.description")}
						</label>
						<textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={handleChange}
							rows="3"
							className="neo-input neo-textarea"
							placeholder={t("business.descriptionPlaceholder")}
						/>
					</div>

					<div>
						<label
							htmlFor="slogan"
							className="mb-1 block flex items-center font-medium text-[#0A3342] text-sm"
						>
							<svg
								className="mr-1 h-4 w-4 text-[#1a1a1a]"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
								/>
							</svg>
							{t("business.slogan")}
						</label>
						<input
							type="text"
							id="slogan"
							name="slogan"
							value={formData.slogan}
							onChange={handleChange}
							className="neo-input"
							placeholder={t("business.sloganPlaceholder")}
						/>
					</div>
				</div>
			</div>

			<div className="neo-surface neo-border neo-shadow-md p-6">
				<h3 className="mb-5 flex items-center neo-heading neo-h4">
					<svg
						className="mr-2 h-5 w-5 text-neo-flame"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
					{t("business.businessLogo")}
				</h3>

				<div className="space-y-4">
					<div>
						<label
							htmlFor="logo"
							className="mb-2 block flex items-center font-medium text-[#0A3342] text-sm"
						>
							<svg
								className="mr-1 h-4 w-4 text-[#1a1a1a]"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
							{t("business.uploadLogo")}
						</label>
						<p className="mb-3 text-slate-500 text-xs">
							{t("business.logoFormats")}
						</p>

						{logoPreview ? (
							<div className="relative inline-block">
								<div className="rounded-lg border-2 border-[#1a1a1a] bg-green-50 p-3">
									<img
										src={logoPreview}
										alt="Preview del logo"
										className="mx-auto h-32 w-32 rounded-lg object-cover"
									/>
									<p className="mt-2 text-center font-medium text-slate-600 text-sm">
										{logoFile?.name}
									</p>
									<p className="text-center text-slate-500 text-xs">
										{logoFile && (logoFile.size / 1024 / 1024).toFixed(2)} MB
									</p>
								</div>
								<button
									type="button"
									onClick={removeLogo}
									className="-top-2 -right-2 absolute flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
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
							<div className="rounded-lg border-2 border-slate-300 border-dashed p-6 text-center transition-colors hover:border-[#1a1a1a]">
								<input
									type="file"
									id="logo"
									accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
									onChange={handleLogoChange}
									className="hidden"
								/>
								<label
									htmlFor="logo"
									className="flex cursor-pointer flex-col items-center justify-center"
								>
									<svg
										className="mb-3 h-12 w-12 text-slate-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 6v6m0 0v6m0-6h6m-6 0H6"
										/>
									</svg>
									<span className="font-medium text-slate-600 text-sm">
										{t("business.dragDropImage")}
									</span>
									<span className="mt-1 text-slate-500 text-xs">
										{t("business.dragDropText")}
									</span>
								</label>
							</div>
						)}

						{uploadingLogo && (
							<div className="mt-3 flex items-center rounded-lg border border-blue-200 bg-blue-50 p-3">
								<svg
									className="mr-2 h-5 w-5 animate-spin text-blue-500"
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
								<span className="text-blue-700 text-sm">
									{t("business.uploadingLogo")}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="neo-surface neo-border neo-shadow-md p-6">
				<h3 className="mb-5 flex items-center neo-heading neo-h4">
					<svg
						className="mr-2 h-5 w-5 text-neo-flame"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
						/>
					</svg>
					Redes Sociales
				</h3>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<label
							htmlFor="facebookUrl"
							className="mb-1 block flex items-center font-medium text-[#0A3342] text-sm"
						>
							<svg
								className="mr-1 h-4 w-4 text-[#1a1a1a]"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
							</svg>
							Facebook
						</label>
						<input
							type="url"
							id="facebookUrl"
							name="facebookUrl"
							value={formData.facebookUrl}
							onChange={handleChange}
							className="neo-input"
							placeholder="https://facebook.com/tu-negocio"
						/>
					</div>

					<div>
						<label
							htmlFor="instagramUrl"
							className="mb-1 block flex items-center font-medium text-[#0A3342] text-sm"
						>
							<svg
								className="mr-1 h-4 w-4 text-[#1a1a1a]"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
							</svg>
							Instagram
						</label>
						<input
							type="url"
							id="instagramUrl"
							name="instagramUrl"
							value={formData.instagramUrl}
							onChange={handleChange}
							className="neo-input"
							placeholder="https://instagram.com/tu-negocio"
						/>
					</div>

					<div>
						<label
							htmlFor="twitterUrl"
							className="mb-1 block flex items-center font-medium text-[#0A3342] text-sm"
						>
							<svg
								className="mr-1 h-4 w-4 text-[#1a1a1a]"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
							</svg>
							Twitter / X
						</label>
						<input
							type="url"
							id="twitterUrl"
							name="twitterUrl"
							value={formData.twitterUrl}
							onChange={handleChange}
							className="neo-input"
							placeholder="https://twitter.com/tu-negocio"
						/>
					</div>

					<div>
						<label
							htmlFor="whatsAppNumber"
							className="mb-1 block flex items-center font-medium text-[#0A3342] text-sm"
						>
							<svg
								className="mr-1 h-4 w-4 text-[#1a1a1a]"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
							</svg>
							WhatsApp
						</label>
						<input
							type="tel"
							id="whatsAppNumber"
							name="whatsAppNumber"
							value={formData.whatsAppNumber}
							onChange={handleChange}
							className="neo-input"
							placeholder="+1234567890"
						/>
					</div>
				</div>
			</div>

			<div className="neo-surface neo-border neo-shadow-md p-6">
				<h3 className="mb-5 flex items-center neo-heading neo-h4">
					<svg
						className="mr-2 h-5 w-5 text-neo-flame"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
						/>
					</svg>
					🎨 Paleta de Colores
				</h3>

				<div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
					<div className="flex items-start gap-2">
						<svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<div>
							<p className="font-semibold text-blue-900 text-sm mb-1">💡 Selector de Colores con Teoría del Color</p>
							<p className="text-blue-700 text-xs">
								Usa las paletas armónicas (complementarios, análogos, triádicos) para crear combinaciones profesionales que se vean bien juntas.
							</p>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					<CircularColorPicker
						label="🎯 Color Primario"
						color={formData.primaryColor}
						onChange={(color) => handleColorChange('primaryColor', color)}
					/>

					<CircularColorPicker
						label="🌟 Color Secundario"
						color={formData.secondaryColor}
						onChange={(color) => handleColorChange('secondaryColor', color)}
					/>

					<CircularColorPicker
						label="✨ Color de Acento"
						color={formData.accentColor}
						onChange={(color) => handleColorChange('accentColor', color)}
					/>
				</div>

				{/* Vista previa de la paleta */}
				<div className="mt-6 p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
					<p className="text-sm font-semibold text-slate-700 mb-3">👁️ Vista Previa de Paleta</p>
					<div className="flex gap-2">
						<div className="flex-1 h-24 rounded-lg neo-shadow-md border-2 border-slate-300 flex items-center justify-center" style={{ backgroundColor: formData.primaryColor }}>
							<span className="text-white font-bold text-xs bg-black bg-opacity-50 px-2 py-1 rounded">Primario</span>
						</div>
						<div className="flex-1 h-24 rounded-lg neo-shadow-md border-2 border-slate-300 flex items-center justify-center" style={{ backgroundColor: formData.secondaryColor }}>
							<span className="text-white font-bold text-xs bg-black bg-opacity-50 px-2 py-1 rounded">Secundario</span>
						</div>
						<div className="flex-1 h-24 rounded-lg neo-shadow-md border-2 border-slate-300 flex items-center justify-center" style={{ backgroundColor: formData.accentColor }}>
							<span className="text-white font-bold text-xs bg-black bg-opacity-50 px-2 py-1 rounded">Acento</span>
						</div>
					</div>
				</div>
			</div>

			<div className="neo-surface neo-border neo-shadow-md p-6">
				<h3 className="mb-5 flex items-center neo-heading neo-h4">
					<svg
						className="mr-2 h-5 w-5 text-neo-flame"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
						/>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
						/>
					</svg>
					{t("business.contactInfo")}
				</h3>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<label
							htmlFor="address"
							className="mb-1 block flex items-center font-medium text-[#0A3342] text-sm"
						>
							<svg
								className="mr-1 h-4 w-4 text-[#1a1a1a]"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
							{t("business.address")}
						</label>
						<input
							type="text"
							id="address"
							name="address"
							value={formData.address}
							onChange={handleChange}
							className="neo-input"
							placeholder={t("business.addressPlaceholder")}
						/>
					</div>

					<div>
						<label
							htmlFor="phoneNumber"
							className="mb-1 block flex items-center font-medium text-[#0A3342] text-sm"
						>
							<svg
								className="mr-1 h-4 w-4 text-[#1a1a1a]"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
								/>
							</svg>
							{t("business.phoneNumber")}
						</label>
						<input
							type="tel"
							id="phoneNumber"
							name="phoneNumber"
							value={formData.phoneNumber}
							onChange={handleChange}
							onBlur={() => handleBlur('phoneNumber')}
							className={`neo-input ${getFieldError('phoneNumber') ? 'border-red-500' : ''}`}
							placeholder={t("business.phonePlaceholder")}
						/>
						<FieldError error={getFieldError('phoneNumber')} />
					</div>

					<div>
						<label
							htmlFor="email"
							className="mb-1 block flex items-center font-medium text-[#0A3342] text-sm"
						>
							<svg
								className="mr-1 h-4 w-4 text-[#1a1a1a]"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
								/>
							</svg>
							{t("business.email")}
						</label>
						<input
							type="email"
							id="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							onBlur={() => handleBlur('email')}
							className={`neo-input ${getFieldError('email') ? 'border-red-500' : ''}`}
							placeholder={t("business.emailPlaceholder")}
						/>
						<FieldError error={getFieldError('email')} />
					</div>

					<div>
						<label
							htmlFor="businessCategoryId"
							className="mb-1 block flex items-center font-medium text-[#0A3342] text-sm"
						>
							<svg
								className="mr-1 h-4 w-4 text-[#1a1a1a]"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
								/>
							</svg>
							{t("business.category")} *
						</label>

						{loadingCategories ? (
							<div className="flex w-full items-center justify-center rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5">
								<svg
									className="mr-2 h-5 w-5 animate-spin text-[#1a1a1a]"
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
								<span className="text-slate-600">
									{t("business.loadingCategories")}
								</span>
							</div>
						) : categories.length > 0 ? (
							<select
								id="businessCategoryId"
								name="businessCategoryId"
								required={true}
								value={formData.businessCategoryId}
								onChange={handleChange}
								className="neo-input neo-select"
							>
								{categories.map((category) => (
									<option key={category.id} value={category.id}>
										{category.name}
										{category.description
											? ` - ${category.description.substring(0, 30)}${category.description.length > 30 ? "..." : ""}`
											: ""}
									</option>
								))}
							</select>
						) : (
							<div className="text-red-500 text-sm">
								{t("business.noCategoriesAvailable")}
							</div>
						)}
					</div>
				</div>

				{/* Currency Selection */}
				<div>
					<label htmlFor="defaultCurrency" className="neo-label">
						Moneda Predeterminada
					</label>
					<select
						id="defaultCurrency"
						name="defaultCurrency"
						value={formData.defaultCurrency}
						onChange={handleChange}
						className="neo-input neo-select"
					>
						{getAllCurrencies().map((currency) => (
							<option key={currency.value} value={currency.value}>
								{currency.symbol} {currency.name} ({currency.code})
							</option>
						))}
					</select>
					<p className="neo-text text-xs text-neo-gray mt-1">
						Esta será la moneda mostrada en tu menú
					</p>
				</div>
			</div>

			<div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
				<button
					type="button"
					onClick={onCancel}
					className="neo-btn neo-btn-white flex items-center justify-center text-sm sm:text-base"
				>
					<svg
						className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0"
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
					{t("common.cancel")}
				</button>
				<button
					type="submit"
					disabled={
						loading ||
						loadingCategories ||
						categories.length === 0 ||
						uploadingLogo
					}
					className="neo-btn neo-btn-primary flex items-center justify-center text-sm sm:text-base"
				>
					{loading ? (
						<>
							<svg
								className="-ml-1 mr-2 h-5 w-5 animate-spin text-white"
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
							{uploadingLogo
								? t("business.uploadingLogo")
								: t("business.creatingBusiness")}
						</>
					) : (
						<>
							<svg
								className="mr-1 h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d={isEditing ? "M5 13l4 4L19 7" : "M12 6v6m0 0v6m0-6h6m-6 0H6"}
								/>
							</svg>
							{isEditing ? "Guardar Cambios" : t("business.createBusiness")}
						</>
					)}
				</button>
			</div>
		</form>
	);
}
