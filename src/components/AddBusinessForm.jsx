import React, { useState, useEffect } from "react";
import { useTranslation } from "../i18n/utils";
import menuService from "../services/menuService";
import { useErrorHandler } from "../hooks/useErrorHandler";
import ErrorAlert from "./shared/ErrorAlert";
import FormField, { TextAreaField, SelectField } from "./ui/FormField";
import ImageUploader from "./shared/ImageUploader";
import LocationPicker from "./shared/LocationPicker";
import { AppError } from "../utils/AppError";
import { ERROR_TYPES } from "../utils/errorTypes";
import { errorLogger } from "../utils/errorLogger";
import { validateRequired, validateEmail, validateUrl, validatePhone } from "../utils/validation";
import { getAllCurrencies } from "../utils/currencies";
import CircularColorPicker from "./ui/CircularColorPicker";
import { THEME_PALETTES } from "../utils/themePalettes";

export default function AddBusinessForm({ onBusinessAdded, onCancel, existingBusiness = null, isEditing = false }) {
	const { t } = useTranslation();
	const [formData, setFormData] = useState({
		name: existingBusiness?.name || "",
		description: existingBusiness?.description || "",
		slogan: existingBusiness?.slogan || "",
		address: existingBusiness?.address || "",
		latitude: existingBusiness?.latitude ?? null,
		longitude: existingBusiness?.longitude ?? null,
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

	// Sync formData with existingBusiness when it changes
	useEffect(() => {
		if (existingBusiness && isEditing) {
			setFormData(prev => ({
				...prev,
				name: existingBusiness.name || "",
				description: existingBusiness.description || "",
				slogan: existingBusiness.slogan || "",
				address: existingBusiness.address || "",
				latitude: existingBusiness.latitude ?? null,
				longitude: existingBusiness.longitude ?? null,
				phoneNumber: existingBusiness.phoneNumber || "",
				email: existingBusiness.email || "",
				facebookUrl: existingBusiness.facebookUrl || "",
				instagramUrl: existingBusiness.instagramUrl || "",
				twitterUrl: existingBusiness.twitterUrl || "",
				whatsAppNumber: existingBusiness.whatsAppNumber || "",
				primaryColor: existingBusiness.primaryColor || "#1a1a1a",
				secondaryColor: existingBusiness.secondaryColor || "#004E71",
				accentColor: existingBusiness.accentColor || "#0A3342",
				businessCategoryId: existingBusiness.businessCategoryId?.toString() || prev.businessCategoryId,
				defaultCurrency: existingBusiness.defaultCurrency ?? prev.defaultCurrency,
			}));
		}
	}, [existingBusiness, isEditing]);

	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(false);
	const [loadingCategories, setLoadingCategories] = useState(true);

	const [logoFile, setLogoFile] = useState(null);
	// Prioritize logoFile preview if available, otherwise fall back to existing imageKey
	// Note: Ensure that the image key is not empty and construct the full URL correctly
	const [logoPreview, setLogoPreview] = useState(null);
	const [uploadingLogo, setUploadingLogo] = useState(false);

	// Update logo preview if existingBusiness changes (e.g. when switching between businesses)
	useEffect(() => {
		// El backend devuelve imageUrl con la URL completa de la imagen
		if ((existingBusiness?.imageUrl || existingBusiness?.imageKey) && !logoFile) {
			// Usar imageUrl directamente si está disponible (URL completa del backend)
			// Si no, intentar con imageKey construyendo la URL
			if (existingBusiness.imageUrl) {
				setLogoPreview(existingBusiness.imageUrl);
			} else if (existingBusiness.imageKey) {
				const baseUrl = menuService.apiClient.baseUrl.replace(/\/$/, '');
				setLogoPreview(`${baseUrl}/images/${existingBusiness.imageKey}`);
			}
		} else if (!logoFile) {
			setLogoPreview(null);
		}
	}, [existingBusiness, logoFile]);

	const { error, fieldErrors, clearError, clearFieldError, handleError } = useErrorHandler();
	const [touched, setTouched] = useState({});

	useEffect(() => {
		const fetchCategories = async () => {
			setLoadingCategories(true);
			setCategories([]);
			if (!isEditing) setFormData((prev) => ({ ...prev, businessCategoryId: "" }));
			clearError();

			try {
				const backendCategories = await menuService.getBusinessCategories();
				setCategories(backendCategories);

				if (backendCategories && backendCategories.length > 0 && !isEditing && !formData.businessCategoryId) {
					setFormData((prev) => ({
						...prev,
						businessCategoryId: backendCategories[0].id.toString(),
					}));
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
	}, [isEditing]);

	const handleChange = (name, value) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		if (touched[name] && fieldErrors[name]) {
			clearFieldError(name);
		}
	};

	// Adaptador para FormField
	const handleFieldChange = (e) => {
		const { name, value } = e.target;
		handleChange(name, value);
	};

	const handleColorChange = (name, color) => {
		handleChange(name, color);
	};

	const handleBlur = (e) => {
		const { name } = e.target;
		setTouched(prev => ({ ...prev, [name]: true }));
	};

	const getFieldError = (field) => {
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
		// Validate that e.target.files exists and has at least one file
		if (!e.target?.files || e.target.files.length === 0) {
			return;
		}

		const file = e.target.files[0];
		if (!file) return;

		clearError();
		setLogoFile(file);
		
		const reader = new FileReader();
		reader.onload = (e) => {
			setLogoPreview(e.target.result);
		};
		reader.readAsDataURL(file);
	};

	const removeLogo = () => {
		setLogoFile(null);
		setLogoPreview(null);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		clearError();

		// Marcar todos los campos como tocados
		const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {});
		setTouched(allTouched);

		if (loadingCategories) {
			handleError(new AppError(ERROR_TYPES.VALIDATION_ERROR, t("business.loadingCategories")));
			return;
		}

		if (categories.length === 0) {
			handleError(new AppError(ERROR_TYPES.NOT_FOUND, t("business.noCategoriesAvailable")));
			return;
		}

		// Validaciones
		const nameError = validateRequired(formData.name, 'El nombre del negocio');
		const emailError = formData.email ? validateEmail(formData.email) : null;
		const phoneError = formData.phoneNumber ? validatePhone(formData.phoneNumber, 'El teléfono') : null;

		if (nameError || emailError || phoneError) {
			handleError(new AppError(
				ERROR_TYPES.VALIDATION_ERROR,
				'Por favor corrige los errores en el formulario'
			));
			return;
		}

		if (!formData.businessCategoryId) {
			handleError(new AppError(ERROR_TYPES.VALIDATION_ERROR, t("business.categoryRequired")));
			return;
		}

	setLoading(true);

	try {
		let imageKey = existingBusiness?.imageKey || null;

		if (logoFile) {
			setUploadingLogo(true);
			try {
				imageKey = await menuService.uploadImage(logoFile);
				errorLogger.info('Logo uploaded successfully', { imageKey });
			} catch (imageError) {
				const uploadError = imageError instanceof AppError
					? imageError
					: new AppError(ERROR_TYPES.UPLOAD_ERROR, t("business.logoUploadError"));
				handleError(uploadError);
				setLoading(false);
				setUploadingLogo(false);
				return;
			} finally {
				setUploadingLogo(false);
			}
		}

		const businessData = {
			...formData,
			businessCategoryId: Number.parseInt(formData.businessCategoryId),
			latitude: formData.latitude || 0,
			longitude: formData.longitude || 0,
			imageKey: imageKey,
		};

		let result;
		if (isEditing && existingBusiness) {
			result = await menuService.updateFoodBusiness(existingBusiness.id, businessData);
		} else {
			result = await menuService.createFoodBusiness(businessData);
		}

		onBusinessAdded(result);
	} catch (err) {
		const appError = err instanceof AppError
			? err
			: new AppError(ERROR_TYPES.SERVER_ERROR, `${t("errors.general")} ${err.message}`);
		handleError(appError);
	} finally {
		setLoading(false);
	}
};	const handlePresetClick = (palette) => {
		setFormData(prev => ({
			...prev,
			primaryColor: palette.primary,
			secondaryColor: palette.secondary,
			accentColor: palette.accent
		}));
	};

	return (
		<form onSubmit={handleSubmit} className="animate-fadeIn space-y-4 sm:space-y-6">
			{error && <ErrorAlert error={error} onClose={clearError} />}

			<div className="neo-surface neo-border neo-shadow-md p-4 sm:p-5 md:p-6">
				<h3 className="mb-4 sm:mb-5 flex items-center neo-heading neo-h4 text-base sm:text-lg">
					<svg className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 text-neo-flame flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					{isEditing ? "Editar Información del Negocio" : t("business.basicInfo")}
				</h3>

				<div className="space-y-3 sm:space-y-4">
					<FormField
						label={`${t("business.name")}`}
						name="name"
						value={formData.name}
						onChange={handleFieldChange}
						onBlur={handleBlur}
						error={getFieldError('name')}
						required={true}
						placeholder={t("business.namePlaceholder")}
					/>

					<TextAreaField
						label={t("business.description")}
						name="description"
						value={formData.description}
						onChange={handleFieldChange}
						onBlur={handleBlur}
						rows={3}
						placeholder={t("business.descriptionPlaceholder")}
					/>

					<FormField
						label={t("business.slogan")}
						name="slogan"
						value={formData.slogan}
						onChange={handleFieldChange}
						onBlur={handleBlur}
						placeholder={t("business.sloganPlaceholder")}
					/>

					<SelectField
						label={t("business.category")}
						name="businessCategoryId"
						value={formData.businessCategoryId}
						onChange={handleFieldChange}
						onBlur={handleBlur}
						options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
						required={true}
						placeholder={loadingCategories ? t("business.loadingCategories") : t("business.selectCategory")}
						disabled={loadingCategories}
					/>

					<SelectField
						label="Moneda Predeterminada"
						name="defaultCurrency"
						value={formData.defaultCurrency}
						onChange={handleFieldChange}
						onBlur={handleBlur}
						options={getAllCurrencies().map(curr => ({
							value: curr.value,
							label: `${curr.symbol} ${curr.name} (${curr.code})`
						}))}
						placeholder="Selecciona la moneda"
					/>
				</div>
			</div>

			{/* Logo Upload */}
			<div className="neo-surface neo-border neo-shadow-md p-4 sm:p-5 md:p-6">
				<h3 className="mb-4 sm:mb-5 flex items-center neo-heading neo-h4 text-base sm:text-lg">
					<svg className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 text-neo-flame flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
					{t("business.logo")}
				</h3>
				
				<ImageUploader
					label="Logo del Negocio"
					preview={logoPreview}
					onFileChange={handleLogoChange}
					onClearImage={removeLogo}
					acceptedFormats="JPEG, PNG, GIF, WebP hasta 10MB"
					error={getFieldError('logoFile')}
				/>
			</div>

			{/* Contact Info */}
			<div className="neo-surface neo-border neo-shadow-md p-4 sm:p-5 md:p-6">
				<h3 className="mb-4 sm:mb-5 flex items-center neo-heading neo-h4 text-base sm:text-lg">
				<svg className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 text-neo-flame flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
				{t("business.contactInfo")}
			</h3>

			<div className="space-y-3 sm:space-y-4">
				<FormField
					label={t("business.address")}
					name="address"
					value={formData.address}
					onChange={handleFieldChange}
					onBlur={handleBlur}
					placeholder={t("business.addressPlaceholder")}
				/>

				<LocationPicker
					address={formData.address}
					latitude={formData.latitude}
					longitude={formData.longitude}
					onLocationChange={({address, latitude, longitude}) => {
						setFormData(prev => ({
							...prev,
							address: address,
							latitude: latitude,
							longitude: longitude
						}));
					}}
					error={getFieldError('location')}
				/>

				<div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
					<FormField
						label={t("business.phone")}
						name="phoneNumber"
						type="tel"
						value={formData.phoneNumber}
						onChange={handleFieldChange}
						onBlur={handleBlur}
						error={getFieldError('phoneNumber')}
						placeholder="+1 234 567 8900"
					/>

					<FormField
						label={t("business.email")}
						name="email"
						type="email"
						value={formData.email}
						onChange={handleFieldChange}
						onBlur={handleBlur}
						error={getFieldError('email')}
						placeholder="contacto@ejemplo.com"
					/>
				</div>					<div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
						<FormField
							label="WhatsApp"
							name="whatsAppNumber"
							type="tel"
							value={formData.whatsAppNumber}
							onChange={handleFieldChange}
							onBlur={handleBlur}
							error={getFieldError('whatsAppNumber')}
							placeholder="+1 234 567 8900"
						/>
					</div>
				</div>
			</div>

			{/* Social Media */}
			<div className="neo-surface neo-border neo-shadow-md p-4 sm:p-5 md:p-6">
				<h3 className="mb-4 sm:mb-5 flex items-center neo-heading neo-h4 text-base sm:text-lg">
					<svg className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 text-neo-flame flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
					</svg>
					{t("business.socialMedia")}
				</h3>

				<div className="space-y-3 sm:space-y-4">
					<FormField
						label="Facebook"
						name="facebookUrl"
						value={formData.facebookUrl}
						onChange={handleFieldChange}
						onBlur={handleBlur}
						error={getFieldError('facebookUrl')}
						placeholder="https://facebook.com/..."
					/>

					<FormField
						label="Instagram"
						name="instagramUrl"
						value={formData.instagramUrl}
						onChange={handleFieldChange}
						onBlur={handleBlur}
						error={getFieldError('instagramUrl')}
						placeholder="https://instagram.com/..."
					/>

					<FormField
						label="Twitter / X"
						name="twitterUrl"
						value={formData.twitterUrl}
						onChange={handleFieldChange}
						onBlur={handleBlur}
						error={getFieldError('twitterUrl')}
						placeholder="https://twitter.com/..."
					/>
				</div>
			</div>

			{/* Brand Colors */}
			<div className="neo-surface neo-border neo-shadow-md p-4 sm:p-5 md:p-6">
				<h3 className="mb-4 sm:mb-5 flex items-center neo-heading neo-h4 text-base sm:text-lg">
					<svg className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 text-neo-flame flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
					</svg>
					{t("business.colors")}
				</h3>

				<div className="mb-6">
					<h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Presets Recomendados</h4>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
						{Object.values(THEME_PALETTES).map((palette, index) => (
							<button
								key={index}
								type="button"
								onClick={() => handlePresetClick(palette)}
								className="flex flex-col gap-1 p-2 border-2 border-transparent hover:border-gray-200 rounded-lg transition-all hover:bg-gray-50 text-left group"
							>
								<div className="flex w-full h-8 rounded-md overflow-hidden border border-gray-200 shadow-sm">
									<div className="flex-1" style={{ backgroundColor: palette.primary }} />
									<div className="flex-1" style={{ backgroundColor: palette.secondary }} />
									<div className="flex-1" style={{ backgroundColor: palette.accent }} />
								</div>
								<span className="text-xs font-medium text-gray-600 group-hover:text-black truncate w-full">
									{palette.name}
								</span>
							</button>
						))}
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<CircularColorPicker
						color={formData.primaryColor}
						onChange={(c) => handleColorChange("primaryColor", c)}
						label={t("business.primaryColor")}
					/>
					<CircularColorPicker
						color={formData.secondaryColor}
						onChange={(c) => handleColorChange("secondaryColor", c)}
						label={t("business.secondaryColor")}
					/>
					<CircularColorPicker
						color={formData.accentColor}
						onChange={(c) => handleColorChange("accentColor", c)}
						label={t("business.accentColor")}
					/>
				</div>
			</div>

			<div className="mt-6 sm:mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
				<button
					type="button"
					onClick={onCancel}
					disabled={loading || uploadingLogo}
					className="neo-btn neo-btn-secondary w-full sm:w-auto"
				>
					{t("common.cancel")}
				</button>
				<button
					type="submit"
					disabled={loading || uploadingLogo}
					className="neo-btn neo-btn-primary w-full sm:w-auto relative"
				>
					{loading || uploadingLogo ? (
						<>
							<span className="opacity-0">{isEditing ? t("common.saveChanges") : t("business.add")}</span>
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
							</div>
						</>
					) : (
						isEditing ? t("common.saveChanges") : t("business.add")
					)}
				</button>
			</div>
		</form>
	);
}
