import React, { useState, useEffect } from "react";
import menuService from "../../services/menuService";

const availableFonts = [
	{ id: 'poppins', name: 'Poppins', family: "'Poppins', sans-serif", description: 'Moderna y legible', preview: 'Aa' },
	{ id: 'playfair', name: 'Playfair Display', family: "'Playfair Display', serif", description: 'Elegante y sofisticada', preview: 'Aa' },
	{ id: 'roboto', name: 'Roboto', family: "'Roboto', sans-serif", description: 'Limpia y profesional', preview: 'Aa' },
	{ id: 'montserrat', name: 'Montserrat', family: "'Montserrat', sans-serif", description: 'Geométrica y moderna', preview: 'Aa' },
	{ id: 'lora', name: 'Lora', family: "'Lora', serif", description: 'Clásica y legible', preview: 'Aa' },
	{ id: 'opensans', name: 'Open Sans', family: "'Open Sans', sans-serif", description: 'Neutral y versátil', preview: 'Aa' },
	{ id: 'raleway', name: 'Raleway', family: "'Raleway', sans-serif", description: 'Elegante y delgada', preview: 'Aa' },
	{ id: 'merriweather', name: 'Merriweather', family: "'Merriweather', serif", description: 'Tradicional y cálida', preview: 'Aa' }
];

const templates = [
	{
		id: 0,
		name: "Modern",
		description: "Neobrutalist: Bordes gruesos (4px), sombras pronunciadas y animaciones audaces.",
		preview: "/templates/modern-preview.jpg",
		style: "Bordes gruesos, sombras sólidas, transformaciones dinámicas",
		icon: "🎨",
		recommendedFont: 'poppins'
	},
	{
		id: 1,
		name: "Elegant",
		description: "Sofisticado: Sin bordes, sombras suaves y transiciones elegantes.",
		preview: "/templates/elegant-preview.jpg",
		style: "Sin bordes, sombras difusas, movimientos suaves",
		icon: "👔",
		recommendedFont: 'playfair'
	},
	{
		id: 2,
		name: "Casual",
		description: "Playful: Bordes redondeados (25px), rotaciones leves y diseño amigable.",
		preview: "/templates/casual-preview.jpg",
		style: "Bordes medianos, rotaciones playful, bordes punteados",
		icon: "🍔",
		recommendedFont: 'montserrat'
	},
	{
		id: 3,
		name: "Minimalist",
		description: "Limpio: Bordes delgados (1px), sombras sutiles y espacios amplios.",
		preview: "/templates/minimalist-preview.jpg",
		style: "Bordes finos, sombras mínimas, diseño espacioso",
		icon: "⚪",
		recommendedFont: 'roboto'
	},
	{
		id: 4,
		name: "Colorful",
		description: "Explosivo: Bordes gruesos variados, sombras grandes y transformaciones llamativas.",
		preview: "/templates/colorful-preview.jpg",
		style: "Bordes alternados, sombras grandes, efectos vibrantes",
		icon: "🌈",
		recommendedFont: 'poppins'
	},
	{
		id: 5,
		name: "Dark",
		description: "Premium: Glassmorphism, blur effects y sombras profundas para ambiente nocturno.",
		preview: "/templates/dark-preview.jpg",
		style: "Backdrop blur, transparencias, sombras profundas",
		icon: "🌙",
		recommendedFont: 'lora'
	},
	{
		id: 6,
		name: "Classic",
		description: "Tradicional: Bordes dobles (double), fuentes serif y diseño atemporal.",
		preview: "/templates/classic-preview.jpg",
		style: "Bordes dobles, fuentes serif, diseño clásico",
		icon: "📜",
		recommendedFont: 'merriweather'
	}
];

const TemplateSection = ({ businesses, onTemplateUpdated }) => {
	const [selectedTemplate, setSelectedTemplate] = useState(0);
	const [currentTemplate, setCurrentTemplate] = useState(0);
	const [selectedFont, setSelectedFont] = useState('poppins');
	const [currentFont, setCurrentFont] = useState('poppins');
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState(null);

	const business = businesses && businesses.length > 0 ? businesses[0] : null;

	useEffect(() => {
		if (business && business.template !== undefined) {
			setCurrentTemplate(business.template);
			setSelectedTemplate(business.template);
		}
		if (business && business.fontFamily) {
			setCurrentFont(business.fontFamily);
			setSelectedFont(business.fontFamily);
		} else if (business && business.template !== undefined) {
			// Set recommended font for the template
			const template = templates.find(t => t.id === business.template);
			if (template) {
				setCurrentFont(template.recommendedFont);
				setSelectedFont(template.recommendedFont);
			}
		}
	}, [business]);

	const handleTemplateSelect = (templateId) => {
		setSelectedTemplate(templateId);
		// Auto-select recommended font when changing template
		const template = templates.find(t => t.id === templateId);
		if (template) {
			setSelectedFont(template.recommendedFont);
		}
	};

	const handleFontSelect = (fontId) => {
		setSelectedFont(fontId);
	};

	const hasChanges = selectedTemplate !== currentTemplate || selectedFont !== currentFont;

	const handleSaveTemplate = async () => {
		if (!business) {
			setError("No se encontró ningún negocio");
			return;
		}

		if (!hasChanges) {
			setError("No hay cambios para guardar");
			return;
		}

		setLoading(true);
		setError(null);
		setSuccess(false);

		try {
			// Usar menuService para actualizar el negocio
			await menuService.updateFoodBusiness(business.id, {
				template: selectedTemplate,
				fontFamily: selectedFont
			});

			// Actualizar estado local
			setCurrentTemplate(selectedTemplate);
			setCurrentFont(selectedFont);
			setSuccess(true);

			// Recargar los datos del servidor si hay callback
			if (onTemplateUpdated) {
				await onTemplateUpdated();
			}

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
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 1 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
						</svg>
						Estilo del Menú (Template)
					</h2>
					<p className="neo-text text-neo-gray mb-2">
						<strong>Los templates definen el ESTILO visual</strong> (tipos de botones, bordes, sombras, animaciones).
					</p>
					<p className="neo-text text-neo-gray">
						Los <strong>colores vienen de tu negocio</strong> (configurados en la sección de Información del Negocio).
					</p>
				</div>

				{hasChanges && (
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
					<p className="neo-text-bold">¡Template y fuente actualizados exitosamente! Los cambios se verán reflejados en tu menú.</p>
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
						{/* Style Preview */}
						<div className="h-32 rounded-t-lg overflow-hidden relative bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
							<div className="text-center">
								<span className="text-5xl mb-2 block">{template.icon}</span>
								<p className="text-xs text-gray-600 font-semibold px-2">{template.style}</p>
							</div>
						</div>

						{/* Template Info */}
						<div className="p-4">
							<div className="flex items-center justify-between mb-2">
								<h3 className="neo-heading neo-h4">
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

			{/* Font Selection Section */}
			<div className="mt-8">
				<h3 className="flex items-center neo-heading neo-h4 text-xl mb-4">
					<svg className="mr-2 h-6 w-6 text-neo-flame" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
					Tipografía
				</h3>
				<p className="neo-text text-neo-gray mb-4">
					Selecciona la fuente que mejor represente tu marca. Cada template tiene una fuente recomendada, pero puedes elegir la que prefieras.
				</p>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{availableFonts.map((font) => {
						const currentSelectedTemplate = templates.find(t => t.id === selectedTemplate);
						const isRecommended = currentSelectedTemplate && currentSelectedTemplate.recommendedFont === font.id;
						
						return (
							<div
								key={font.id}
								onClick={() => handleFontSelect(font.id)}
								className={`neo-card-3d cursor-pointer p-4 text-center transition-all duration-300 hover:scale-105 ${
									selectedFont === font.id ? "ring-4 ring-neo-flame ring-offset-4" : ""
								} ${currentFont === font.id ? "border-4 border-green-500" : ""}`}
							>
								<div 
									className="text-5xl mb-2 font-bold"
									style={{ fontFamily: font.family }}
								>
									{font.preview}
								</div>
								<h4 className="neo-text-bold text-sm mb-1">{font.name}</h4>
								<p className="neo-text text-xs text-neo-gray mb-2">{font.description}</p>
								
								<div className="flex gap-2 justify-center flex-wrap">
									{currentFont === font.id && (
										<span className="neo-badge neo-badge-success text-xs">Activa</span>
									)}
									{selectedFont === font.id && currentFont !== font.id && (
										<span className="neo-badge neo-badge-primary text-xs">Seleccionada</span>
									)}
									{isRecommended && (
										<span className="neo-badge neo-badge-warning text-xs">⭐ Recomendada</span>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			<div className="mt-6 neo-card-3d-sunset p-4">
				<div className="flex items-start">
					<svg className="mr-3 h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<div>
						<p className="neo-text-bold mb-1">💡 ¿Cómo funciona?</p>
						<p className="neo-text text-sm mb-2">
							<strong>Template = Estilo:</strong> Define cómo se ven los botones, bordes, sombras y animaciones.
						</p>
						<p className="neo-text text-sm mb-2">
							<strong>Colores = Tu Negocio:</strong> Usa los colores primario, secundario y acento de tu marca (configurados en Información del Negocio).
						</p>
						<p className="neo-text text-sm">
							<strong>Tipografía:</strong> Cada template tiene una fuente recomendada, pero puedes usar la que prefieras.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
};

export default TemplateSection;
