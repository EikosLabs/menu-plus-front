import React, { useState, useEffect } from "react";
import { useTranslation } from "../i18n/utils";
import menuService from "../services/menuService";

export default function AddBusinessForm({ userId, onBusinessAdded, onCancel }) {
	const { t } = useTranslation();
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

			if (file.size > maxSize) {
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
			let imageKey = null;

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
				userId: Number.parseInt(userId, 10),
				businessCategoryId: Number.parseInt(formData.businessCategoryId),
				imageKey: imageKey,
			};

			const newBusiness = await menuService.createFoodBusiness(businessData);

			onBusinessAdded(newBusiness);
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
					{t("business.basicInfo")}
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
									d="M12 6v6m0 0v6m0-6h6m-6 0H6"
								/>
							</svg>
							{t("business.createBusiness")}
						</>
					)}
				</button>
			</div>
		</form>
	);
}
