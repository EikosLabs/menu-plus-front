/**
 * Formulario de negocio refactorizado
 * Antes: 969 líneas | Ahora: ~350 líneas (-64% código)
 * Utiliza hooks personalizados y componentes reutilizables
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "../i18n/utils";
import menuService from "../services/menuService";
import { useBusinessCategories } from "../hooks/useCategories";
import { useImageUpload } from "../hooks/useImageUpload";
import { FormInput, FormTextarea, FormSelect, FormColorPicker } from "./ui/FormInput";

const ICONS = {
	business: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
	description: "M4 6h16M4 12h16m-7 6h7",
	slogan: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z",
	location: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
	phone: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
	email: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
	category: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
	image: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
	social: "M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
};

export default function AddBusinessForm({ userId, onBusinessAdded, onCancel, existingBusiness = null, isEditing = false }) {
	const { t } = useTranslation();
	const { categories, loading: loadingCategories } = useBusinessCategories();
	const imageUpload = useImageUpload({ maxSize: 1024 * 1024 }); // 1MB

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
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Establecer categoría por defecto cuando carguen
	useEffect(() => {
		if (categories.length > 0 && !formData.businessCategoryId) {
			setFormData(prev => ({ ...prev, businessCategoryId: categories[0].id.toString() }));
		}
	}, [categories]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);

		// Validaciones básicas
		if (loadingCategories) {
			setError(t("business.loadingCategories"));
			return;
		}
		if (categories.length === 0) {
			setError(t("business.noCategoriesAvailable"));
			return;
		}
		if (!userId) {
			setError(t("errors.unauthorized"));
			return;
		}
		if (!formData.businessCategoryId) {
			setError(t("business.categoryRequired"));
			return;
		}

		setLoading(true);

		try {
			let imageKey = existingBusiness?.imageKey || null;

			// Subir logo si hay uno nuevo
			if (imageUpload.file) {
				imageUpload.setIsUploading(true);
				try {
					imageKey = await menuService.uploadImage(imageUpload.file);
				} catch {
					setError(t("business.logoUploadError"));
					setLoading(false);
					imageUpload.setIsUploading(false);
					return;
				} finally {
					imageUpload.setIsUploading(false);
				}
			}

			const businessData = {
				...formData,
				businessCategoryId: Number.parseInt(formData.businessCategoryId),
				imageKey
			};

			let result;
			if (isEditing && existingBusiness) {
				result = await menuService.updateFoodBusiness(existingBusiness.id, businessData);
			} else {
				businessData.userId = Number.parseInt(userId, 10);
				result = await menuService.createFoodBusiness(businessData);
			}

			onBusinessAdded(result);
		} catch (err) {
			const errorMsg = err.message || "";
			if (errorMsg.includes("categoría")) {
				setError(t("business.categoryLoadError"));
			} else if (errorMsg.includes("UserId")) {
				setError(t("errors.unauthorized"));
			} else if (errorMsg.match(/NetworkError|conexión|Failed to fetch|CORS/i)) {
				setError(t("errors.network"));
			} else {
				setError(`${t("errors.general")} ${errorMsg}`);
			}
		} finally {
			setLoading(false);
			imageUpload.setIsUploading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="animate-fadeIn space-y-6">
			{/* Error Alert */}
			{error && (
				<div className="flex items-center rounded-md border-red-500 border-l-4 bg-red-100 p-4 text-red-700">
					<svg className="mr-2 h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
					<span>{error}</span>
				</div>
			)}

			{imageUpload.error && (
				<div className="flex items-center rounded-md border-red-500 border-l-4 bg-red-100 p-4 text-red-700">
					<span>{imageUpload.error}</span>
				</div>
			)}

			{/* Información Básica */}
			<div className="rounded-xl border border-slate-100 bg-white p-6 shadow-md">
				<h3 className="mb-5 font-semibold text-[#004E71] text-lg">
					{isEditing ? "Editar Información del Negocio" : t("business.basicInfo")}
				</h3>

				<div className="space-y-4">
					<FormInput
						label={t("business.name")}
						icon={ICONS.business}
						name="name"
						value={formData.name}
						onChange={handleChange}
						placeholder={t("business.namePlaceholder")}
						required
					/>

					<FormTextarea
						label={t("business.description")}
						icon={ICONS.description}
						name="description"
						value={formData.description}
						onChange={handleChange}
						placeholder={t("business.descriptionPlaceholder")}
						rows={3}
					/>

					<FormInput
						label={t("business.slogan")}
						icon={ICONS.slogan}
						name="slogan"
						value={formData.slogan}
						onChange={handleChange}
						placeholder={t("business.sloganPlaceholder")}
					/>
				</div>
			</div>

			{/* Logo Section */}
			<div className="rounded-xl border border-slate-100 bg-white p-6 shadow-md">
				<h3 className="mb-5 font-semibold text-[#004E71] text-lg">
					{t("business.businessLogo")}
				</h3>

				<div className="space-y-4">
					<div>
						<label htmlFor="logo" className="mb-2 block font-medium text-[#0A3342] text-sm">
							{t("business.uploadLogo")}
						</label>
						<p className="mb-3 text-slate-500 text-xs">{t("business.logoFormats")}</p>

						{imageUpload.preview ? (
							<div className="relative inline-block">
								<div className="rounded-lg border-2 border-[#1a1a1a] bg-green-50 p-3">
									<img src={imageUpload.preview} alt="Preview del logo" className="mx-auto h-32 w-32 rounded-lg object-cover" />
									<p className="mt-2 text-center font-medium text-slate-600 text-sm">{imageUpload.file?.name}</p>
								</div>
								<button
									type="button"
									onClick={() => {
										imageUpload.reset();
										imageUpload.clearFileInput('logo');
									}}
									className="-top-2 -right-2 absolute flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
								>
									<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						) : (
							<div className="rounded-lg border-2 border-slate-300 border-dashed p-6 text-center hover:border-[#1a1a1a]">
								<input
									type="file"
									id="logo"
									accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
									onChange={imageUpload.handleFileChange}
									className="hidden"
								/>
								<label htmlFor="logo" className="flex cursor-pointer flex-col items-center justify-center">
									<svg className="mb-3 h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
									</svg>
									<span className="font-medium text-slate-600 text-sm">{t("business.dragDropImage")}</span>
								</label>
							</div>
						)}

						{imageUpload.isUploading && (
							<div className="mt-3 flex items-center rounded-lg border border-blue-200 bg-blue-50 p-3">
								<svg className="mr-2 h-5 w-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
								</svg>
								<span className="text-blue-700 text-sm">{t("business.uploadingLogo")}</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Contacto */}
			<div className="rounded-xl border border-slate-100 bg-white p-6 shadow-md">
				<h3 className="mb-5 font-semibold text-[#004E71] text-lg">
					Información de Contacto
				</h3>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<FormInput
						label={t("business.address")}
						icon={ICONS.location}
						name="address"
						value={formData.address}
						onChange={handleChange}
						placeholder={t("business.addressPlaceholder")}
					/>

					<FormInput
						label={t("business.phone")}
						icon={ICONS.phone}
						name="phoneNumber"
						type="tel"
						value={formData.phoneNumber}
						onChange={handleChange}
						placeholder={t("business.phonePlaceholder")}
					/>

					<FormInput
						label={t("business.email")}
						icon={ICONS.email}
						name="email"
						type="email"
						value={formData.email}
						onChange={handleChange}
						placeholder={t("business.emailPlaceholder")}
					/>

					<FormSelect
						label={t("business.category")}
						icon={ICONS.category}
						name="businessCategoryId"
						value={formData.businessCategoryId}
						onChange={handleChange}
						options={categories}
						loading={loadingCategories}
						loadingText={t("business.loadingCategories")}
						emptyText={t("business.noCategoriesAvailable")}
						required
					/>
				</div>
			</div>

			{/* Redes Sociales */}
			<div className="rounded-xl border border-slate-100 bg-white p-6 shadow-md">
				<h3 className="mb-5 font-semibold text-[#004E71] text-lg">Redes Sociales</h3>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<FormInput
						label="Facebook"
						name="facebookUrl"
						type="url"
						value={formData.facebookUrl}
						onChange={handleChange}
						placeholder="https://facebook.com/tu-negocio"
					/>

					<FormInput
						label="Instagram"
						name="instagramUrl"
						type="url"
						value={formData.instagramUrl}
						onChange={handleChange}
						placeholder="https://instagram.com/tu-negocio"
					/>

					<FormInput
						label="Twitter/X"
						name="twitterUrl"
						type="url"
						value={formData.twitterUrl}
						onChange={handleChange}
						placeholder="https://twitter.com/tu-negocio"
					/>

					<FormInput
						label="WhatsApp"
						name="whatsAppNumber"
						type="tel"
						value={formData.whatsAppNumber}
						onChange={handleChange}
						placeholder="+52 123 456 7890"
					/>
				</div>
			</div>

			{/* Colores */}
			<div className="rounded-xl border border-slate-100 bg-white p-6 shadow-md">
				<h3 className="mb-5 font-semibold text-[#004E71] text-lg">Colores del Negocio</h3>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<FormColorPicker
						label="Color Primario"
						name="primaryColor"
						value={formData.primaryColor}
						onChange={handleChange}
						required
					/>

					<FormColorPicker
						label="Color Secundario"
						name="secondaryColor"
						value={formData.secondaryColor}
						onChange={handleChange}
						required
					/>

					<FormColorPicker
						label="Color de Acento"
						name="accentColor"
						value={formData.accentColor}
						onChange={handleChange}
						required
					/>
				</div>
			</div>

			{/* Botones */}
			<div className="flex justify-end space-x-3 pt-4">
				<button
					type="button"
					onClick={onCancel}
					className="flex items-center rounded-lg border border-slate-300 px-5 py-2.5 text-slate-700 hover:bg-slate-50"
				>
					{t("common.cancel")}
				</button>

				<button
					type="submit"
					disabled={loading || loadingCategories || categories.length === 0 || imageUpload.isUploading}
					className="flex items-center rounded-lg bg-[#1a1a1a] px-5 py-2.5 text-white shadow-md hover:bg-[#333333] disabled:bg-slate-400"
				>
					{loading ? (
						<>
							<svg className="-ml-1 mr-2 h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
							</svg>
							{imageUpload.isUploading ? t("business.uploadingLogo") : t("business.creatingBusiness")}
						</>
					) : (
						<>{isEditing ? "Guardar Cambios" : t("business.createBusiness")}</>
					)}
				</button>
			</div>
		</form>
	);
}
