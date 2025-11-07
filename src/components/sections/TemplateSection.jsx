import React, { useState, useEffect } from "react";

const templates = [
	{
		id: 0,
		name: "Modern",
		description: "Gradientes y animaciones modernas. Ideal para negocios contemporáneos.",
		preview: "/templates/modern-preview.jpg",
		colors: {
			primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
			secondary: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
			bg: "linear-gradient(135deg, #f8f5ff 0%, #fff5f5 100%)"
		},
		icon: "🎨"
	},
	{
		id: 1,
		name: "Elegant",
		description: "Sofisticado y lujoso para restaurantes de alta gama.",
		preview: "/templates/elegant-preview.jpg",
		colors: {
			primary: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
			secondary: "linear-gradient(135deg, #c9a961 0%, #b8942a 100%)",
			bg: "linear-gradient(135deg, #fdfcfa 0%, #f5f3ef 100%)"
		},
		icon: "👔"
	},
	{
		id: 2,
		name: "Casual",
		description: "Amigable y vibrante para cafeterías y fast food.",
		preview: "/templates/casual-preview.jpg",
		colors: {
			primary: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
			secondary: "linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)",
			bg: "linear-gradient(135deg, #fff8e1 0%, #ffe0b2 100%)"
		},
		icon: "🍔"
	},
	{
		id: 3,
		name: "Minimalist",
		description: "Limpio y minimalista. Menos es más.",
		preview: "/templates/minimalist-preview.jpg",
		colors: {
			primary: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
			secondary: "linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)",
			bg: "#ffffff"
		},
		icon: "⚪"
	},
	{
		id: 4,
		name: "Colorful",
		description: "Vibrante y llamativo para negocios juveniles.",
		preview: "/templates/colorful-preview.jpg",
		colors: {
			primary: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
			secondary: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
			bg: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
		},
		icon: "🌈"
	},
	{
		id: 5,
		name: "Dark",
		description: "Oscuro y premium con toques dorados.",
		preview: "/templates/dark-preview.jpg",
		colors: {
			primary: "linear-gradient(135deg, #141E30 0%, #243B55 100%)",
			secondary: "linear-gradient(135deg, #DAA520 0%, #FFD700 100%)",
			bg: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)"
		},
		icon: "🌙"
	},
	{
		id: 6,
		name: "Classic",
		description: "Tradicional y atemporal con tonos tierra.",
		preview: "/templates/classic-preview.jpg",
		colors: {
			primary: "linear-gradient(135deg, #8B4513 0%, #A0522D 100%)",
			secondary: "linear-gradient(135deg, #CD853F 0%, #DEB887 100%)",
			bg: "linear-gradient(135deg, #FDF5E6 0%, #FAF0E6 100%)"
		},
		icon: "📜"
	}
];

const TemplateSection = ({ businesses }) => {
	const [selectedTemplate, setSelectedTemplate] = useState(0);
	const [currentTemplate, setCurrentTemplate] = useState(0);
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState(null);

	const business = businesses && businesses.length > 0 ? businesses[0] : null;

	useEffect(() => {
		if (business && business.template !== undefined) {
			setCurrentTemplate(business.template);
			setSelectedTemplate(business.template);
		}
	}, [business]);

	const handleTemplateSelect = (templateId) => {
		setSelectedTemplate(templateId);
	};

	const handleSaveTemplate = async () => {
		if (!business) {
			setError("No se encontró ningún negocio");
			return;
		}

		if (selectedTemplate === currentTemplate) {
			setError("Este template ya está seleccionado");
			return;
		}

		setLoading(true);
		setError(null);
		setSuccess(false);

		try {
			const token = localStorage.getItem("token");
			const API_URL = import.meta.env.PUBLIC_API_URL || "/api";

			const response = await fetch(`${API_URL}/food-businesses/${business.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`
				},
				body: JSON.stringify({
					template: selectedTemplate
				})
			});

			if (!response.ok) {
				throw new Error("Error al actualizar el template");
			}

			setCurrentTemplate(selectedTemplate);
			setSuccess(true);
			setTimeout(() => setSuccess(false), 3000);
		} catch (err) {
			console.error("Error:", err);
			setError(err.message || "Error al guardar el template");
		} finally {
			setLoading(false);
		}
	};

	if (!business) {
		return (
			<section className="mb-6 animate-fadeIn">
				<div className="neo-card-3d p-8 text-center">
					<svg className="mx-auto h-16 w-16 text-neo-gray mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
					</svg>
					<h3 className="neo-heading neo-h3 mb-2">No tienes negocios</h3>
					<p className="neo-text text-neo-gray">Primero debes crear un negocio para personalizar su template.</p>
				</div>
			</section>
		);
	}

	return (
		<section className="mb-6 animate-fadeIn">
			<div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h2 className="flex items-center neo-heading neo-h3 text-2xl mb-2">
						<svg className="mr-2 h-7 w-7 text-neo-flame" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
						</svg>
						Templates del Menú
					</h2>
					<p className="neo-text text-neo-gray">
						Personaliza el diseño de tu menú digital. Elige el template que mejor represente tu negocio.
					</p>
				</div>

				{selectedTemplate !== currentTemplate && (
					<button
						onClick={handleSaveTemplate}
						disabled={loading}
						className="neo-btn neo-btn-primary flex items-center w-full sm:w-auto"
					>
						{loading ? (
							<>
								<svg className="animate-spin mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Guardando...
							</>
						) : (
							<>
								<svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
								Guardar Template
							</>
						)}
					</button>
				)}
			</div>

			{success && (
				<div className="mb-6 neo-card-3d-success p-4 flex items-center animate-fadeIn">
					<svg className="mr-3 h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<p className="neo-text-bold">¡Template actualizado exitosamente! Los cambios se verán reflejados en tu menú.</p>
				</div>
			)}

			{error && (
				<div className="mb-6 neo-card-3d-warning p-4 flex items-center animate-fadeIn">
					<svg className="mr-3 h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<p className="neo-text">{error}</p>
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{templates.map((template) => (
					<div
						key={template.id}
						onClick={() => handleTemplateSelect(template.id)}
						className={`neo-card-3d cursor-pointer transition-all duration-300 hover:scale-105 ${
							selectedTemplate === template.id ? "ring-4 ring-neo-flame ring-offset-4" : ""
						} ${currentTemplate === template.id ? "border-4 border-green-500" : ""}`}
					>
						{/* Color Preview */}
						<div className="h-32 rounded-t-lg overflow-hidden relative">
							<div
								className="absolute inset-0"
								style={{ background: template.colors.bg }}
							/>
							<div className="absolute inset-0 flex items-center justify-center gap-2">
								<div
									className="w-16 h-16 rounded-lg shadow-lg"
									style={{ background: template.colors.primary }}
								/>
								<div
									className="w-12 h-12 rounded-lg shadow-lg"
									style={{ background: template.colors.secondary }}
								/>
							</div>
						</div>

						{/* Template Info */}
						<div className="p-4">
							<div className="flex items-center justify-between mb-2">
								<h3 className="neo-heading neo-h4 flex items-center gap-2">
									<span className="text-2xl">{template.icon}</span>
									{template.name}
								</h3>
								{currentTemplate === template.id && (
									<span className="neo-badge neo-badge-success text-xs">Activo</span>
								)}
								{selectedTemplate === template.id && currentTemplate !== template.id && (
									<span className="neo-badge neo-badge-primary text-xs">Seleccionado</span>
								)}
							</div>
							<p className="neo-text text-sm text-neo-gray">{template.description}</p>
						</div>

						{/* Selection indicator */}
						{selectedTemplate === template.id && (
							<div className="absolute top-2 right-2 bg-neo-flame text-white rounded-full p-2">
								<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
								</svg>
							</div>
						)}
					</div>
				))}
			</div>

			<div className="mt-6 neo-card-3d-sunset p-4">
				<div className="flex items-start">
					<svg className="mr-3 h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<div>
						<p className="neo-text-bold mb-1">💡 Consejo Pro</p>
						<p className="neo-text text-sm">
							Elige un template que refleje la personalidad de tu negocio. Puedes cambiar de template en cualquier momento sin perder tu contenido.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
};

export default TemplateSection;
