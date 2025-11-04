import React, { useState, useEffect } from "react";
import { useTranslation } from "../i18n/utils";
import menuService from "../services/menuService";
import { COLORS, FILE_SIZE } from "../constants";

export default function AddBusinessForm({ userId, onBusinessAdded, onCancel, existingBusiness = null, isEditing = false }) {
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
		primaryColor: existingBusiness?.primaryColor || COLORS.PRIMARY,
		secondaryColor: existingBusiness?.secondaryColor || COLORS.SECONDARY,
		accentColor: existingBusiness?.accentColor || COLORS.ACCENT,
		businessCategoryId: existingBusiness?.businessCategoryId?.toString() || "",
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
			setFormData((prev) => ({ ...prev, businessCategoryId: "" }));

			try {
				const backendCategories = await menuService.getBusinessCategories();
				setCategories(backendCategories);

				if (backendCategories && backendCategories.length > 0) {
					setFormData((prev) => ({
						...prev,
						businessCategoryId: backendCategories[0].id.toString(),
					}));
				} else {
					setError(t("business.noCategoriesAvailable"));
				}
			} catch (_error) {
				setError(
					`${t("business.categoryLoadError")}. ${t("business.noCategoriesAvailable")}`,
				);
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
	};

	const handleLogoChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const validTypes = [
				"image/jpeg",
				"image/jpg",
				"image/png",
				"image/gif",
				"image/webp",
			];
			if (!validTypes.includes(file.type)) {
				setError(t("business.invalidImageFormat"));
				return;
			}
			if (file.size > FILE_SIZE.LOGO_MAX) {
				setError(t("business.imageSizeError"));
				return;
			}

			setLogoFile(file);

			const reader = new FileReader();
			reader.onload = (e) => {
				setLogoPreview(e.target.result);
			};
			reader.readAsDataURL(file);
		}
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
		setError(null);

		if (loadingCategories) {
			setError(t("business.loadingCategories"));
			return;
		}

		if (categories.length === 0) {
			setError(t("business.noCategoriesAvailable"));
			return;
		}

		setLoading(true);

		if (!userId) {
			setError(t("errors.unauthorized"));
			setLoading(false);
			return;
		}

		if (!formData.businessCategoryId) {
			setError(t("business.categoryRequired"));
			setLoading(false);
			return;
		}

		try {
			let imageKey = existingBusiness?.imageKey || null;

			if (logoFile) {
				setUploadingLogo(true);
				try {
					imageKey = await menuService.uploadImage(logoFile);
				} catch (_imageError) {
					setError(t("business.logoUploadError"));
					setLoading(false);
					setUploadingLogo(false);
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
			} else {
				// Crear nuevo negocio
				businessData.userId = Number.parseInt(userId, 10);
				result = await menuService.createFoodBusiness(businessData);
			}

			onBusinessAdded(result);
		} catch (err) {
			if (err.message?.includes("categoría")) {
				setError(t("business.categoryLoadError"));
			} else if (err.message?.includes("UserId")) {
				setError(t("errors.unauthorized"));
			} else if (
				err.message &&
				(err.message.includes("NetworkError") ||
					err.message.includes("conexión") ||
					err.message.includes("Failed to fetch") ||
					err.message.includes("CORS"))
			) {
				setError(t("errors.network"));
			} else {
				setError(`${t("errors.general")} ${err.message}`);
			}
		} finally {
			setLoading(false);
			setUploadingLogo(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="animate-fadeIn space-y-6">
			{error && (
				<div className="flex items-center rounded-md border-red-500 border-l-4 bg-red-100 p-4 text-red-700">
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
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
					<span>{error}</span>
				</div>
			)}

			<div className="rounded-xl border border-slate-100 bg-white p-6 shadow-md">
				<h3 className="mb-5 flex items-center font-semibold text-[#004E71] text-lg">
					<svg
						className="mr-2 h-5 w-5 text-[#1a1a1a]"
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

				<div className="space-y-4">
					<div>
						<label
							htmlFor="name"
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
							className="w-full rounded-lg border border-slate-300 px-4 py-2.5 transition-colors focus:border-[#1a1a1a] focus:outline-none focus:ring-[#1a1a1a]"
							placeholder={t("business.namePlaceholder")}
						/>
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
							className="w-full rounded-lg border border-slate-300 px-4 py-2.5 transition-colors focus:border-[#1a1a1a] focus:outline-none focus:ring-[#1a1a1a]"
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
							className="w-full rounded-lg border border-slate-300 px-4 py-2.5 transition-colors focus:border-[#1a1a1a] focus:outline-none focus:ring-[#1a1a1a]"
							placeholder={t("business.sloganPlaceholder")}
						/>
					</div>
				</div>
			</div>

			<div className="rounded-xl border border-slate-100 bg-white p-6 shadow-md">
				<h3 className="mb-5 flex items-center font-semibold text-[#004E71] text-lg">
					<svg
						className="mr-2 h-5 w-5 text-[#1a1a1a]"
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

			<div className="rounded-xl border border-slate-100 bg-white p-6 shadow-md">
				<h3 className="mb-5 flex items-center font-semibold text-[#004E71] text-lg">
					<svg
						className="mr-2 h-5 w-5 text-[#1a1a1a]"
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
							className="w-full rounded-lg border border-slate-300 px-4 py-2.5 transition-colors focus:border-[#1a1a1a] focus:outline-none focus:ring-[#1a1a1a]"
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
							className="w-full rounded-lg border border-slate-300 px-4 py-2.5 transition-colors focus:border-[#1a1a1a] focus:outline-none focus:ring-[#1a1a1a]"
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
							className="w-full rounded-lg border border-slate-300 px-4 py-2.5 transition-colors focus:border-[#1a1a1a] focus:outline-none focus:ring-[#1a1a1a]"
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
							className="w-full rounded-lg border border-slate-300 px-4 py-2.5 transition-colors focus:border-[#1a1a1a] focus:outline-none focus:ring-[#1a1a1a]"
							placeholder="+1234567890"
						/>
					</div>
				</div>
			</div>

			<div className="rounded-xl border border-slate-100 bg-white p-6 shadow-md">
				<h3 className="mb-5 flex items-center font-semibold text-[#004E71] text-lg">
					<svg
						className="mr-2 h-5 w-5 text-[#1a1a1a]"
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
					Paleta de Colores
				</h3>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<div>
						<label
							htmlFor="primaryColor"
							className="mb-1 block flex items-center font-medium text-[#0A3342] text-sm"
						>
							Color Primario
						</label>
						<div className="flex items-center space-x-2">
							<input
								type="color"
								id="primaryColor"
								name="primaryColor"
								value={formData.primaryColor}
								onChange={handleChange}
								className="h-10 w-20 cursor-pointer rounded border border-slate-300"
							/>
							<input
								type="text"
								value={formData.primaryColor}
								onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
								className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-[#1a1a1a] focus:outline-none"
								placeholder="#1a1a1a"
							/>
						</div>
					</div>

					<div>
						<label
							htmlFor="secondaryColor"
							className="mb-1 block flex items-center font-medium text-[#0A3342] text-sm"
						>
							Color Secundario
						</label>
						<div className="flex items-center space-x-2">
							<input
								type="color"
								id="secondaryColor"
								name="secondaryColor"
								value={formData.secondaryColor}
								onChange={handleChange}
								className="h-10 w-20 cursor-pointer rounded border border-slate-300"
							/>
							<input
								type="text"
								value={formData.secondaryColor}
								onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
								className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-[#1a1a1a] focus:outline-none"
								placeholder="#004E71"
							/>
						</div>
					</div>

					<div>
						<label
							htmlFor="accentColor"
							className="mb-1 block flex items-center font-medium text-[#0A3342] text-sm"
						>
							Color de Acento
						</label>
						<div className="flex items-center space-x-2">
							<input
								type="color"
								id="accentColor"
								name="accentColor"
								value={formData.accentColor}
								onChange={handleChange}
								className="h-10 w-20 cursor-pointer rounded border border-slate-300"
							/>
							<input
								type="text"
								value={formData.accentColor}
								onChange={(e) => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
								className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-[#1a1a1a] focus:outline-none"
								placeholder="#0A3342"
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="rounded-xl border border-slate-100 bg-white p-6 shadow-md">
				<h3 className="mb-5 flex items-center font-semibold text-[#004E71] text-lg">
					<svg
						className="mr-2 h-5 w-5 text-[#1a1a1a]"
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
							className="w-full rounded-lg border border-slate-300 px-4 py-2.5 transition-colors focus:border-[#1a1a1a] focus:outline-none focus:ring-[#1a1a1a]"
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
							className="w-full rounded-lg border border-slate-300 px-4 py-2.5 transition-colors focus:border-[#1a1a1a] focus:outline-none focus:ring-[#1a1a1a]"
							placeholder={t("business.phonePlaceholder")}
						/>
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
							className="w-full rounded-lg border border-slate-300 px-4 py-2.5 transition-colors focus:border-[#1a1a1a] focus:outline-none focus:ring-[#1a1a1a]"
							placeholder={t("business.emailPlaceholder")}
						/>
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
								className="w-full rounded-lg border border-slate-300 px-4 py-2.5 transition-colors focus:border-[#1a1a1a] focus:outline-none focus:ring-[#1a1a1a]"
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
			</div>

			<div className="flex justify-end space-x-3 pt-4">
				<button
					type="button"
					onClick={onCancel}
					className="flex items-center rounded-lg border border-slate-300 px-5 py-2.5 text-slate-700 transition-colors hover:bg-slate-50"
				>
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
					className="flex items-center rounded-lg bg-[#1a1a1a] px-5 py-2.5 text-white shadow-md transition-colors hover:bg-[#333333] disabled:bg-slate-400 disabled:shadow-none"
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
