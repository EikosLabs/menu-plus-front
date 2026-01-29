import React, { useState, useEffect } from "react";
import menuService from "../../services/menuService";
import { useTranslation } from "../../i18n/utils";

const availableFonts = [
	{ id: 'poppins', name: 'Poppins', family: "'Poppins', sans-serif", description: 'Moderna', preview: 'Aa' },
	{ id: 'playfair', name: 'Playfair', family: "'Playfair Display', serif", description: 'Elegante', preview: 'Aa' },
	{ id: 'roboto', name: 'Roboto', family: "'Roboto', sans-serif", description: 'Limpia', preview: 'Aa' },
	{ id: 'montserrat', name: 'Montserrat', family: "'Montserrat', sans-serif", description: 'Geométrica', preview: 'Aa' },
	{ id: 'lora', name: 'Lora', family: "'Lora', serif", description: 'Clásica', preview: 'Aa' },
	{ id: 'opensans', name: 'Open Sans', family: "'Open Sans', sans-serif", description: 'Neutral', preview: 'Aa' },
	{ id: 'raleway', name: 'Raleway', family: "'Raleway', sans-serif", description: 'Delgada', preview: 'Aa' },
	{ id: 'merriweather', name: 'Merriweather', family: "'Merriweather', serif", description: 'Cálida', preview: 'Aa' }
];

const templates = [
	{
		id: 0,
		name: "Modern",
		description: "Neobrutalist: Bordes gruesos y sombras.",
		preview: "/templates/modern-preview.jpg",
		style: "Neobrutalism",
		icon: "🎨",
		recommendedFont: 'poppins'
	},
	{
		id: 1,
		name: "Elegant",
		description: "Sofisticado: Sombras suaves.",
		preview: "/templates/elegant-preview.jpg",
		style: "Minimal",
		icon: "👔",
		recommendedFont: 'playfair'
	},
	{
		id: 2,
		name: "Casual",
		description: "Playful: Diseño amigable.",
		preview: "/templates/casual-preview.jpg",
		style: "Fun",
		icon: "🍔",
		recommendedFont: 'montserrat'
	},
	{
		id: 3,
		name: "Minimalist",
		description: "Limpio: Espacios amplios.",
		preview: "/templates/minimalist-preview.jpg",
		style: "Clean",
		icon: "⚪",
		recommendedFont: 'roboto'
	},
	{
		id: 4,
		name: "Colorful",
		description: "Explosivo: Efectos vibrantes.",
		preview: "/templates/colorful-preview.jpg",
		style: "Vibrant",
		icon: "🌈",
		recommendedFont: 'poppins'
	},
	{
		id: 5,
		name: "Dark",
		description: "Premium: Modo nocturno.",
		preview: "/templates/dark-preview.jpg",
		style: "Dark",
		icon: "🌙",
		recommendedFont: 'lora'
	},
	{
		id: 6,
		name: "Classic",
		description: "Tradicional: Diseño atemporal.",
		preview: "/templates/classic-preview.jpg",
		style: "Retro",
		icon: "📜",
		recommendedFont: 'merriweather'
	}
];

const TemplateSection = ({ businesses, onTemplateUpdated }) => {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState('style'); // style, shape, font
	const [selectedTemplate, setSelectedTemplate] = useState(0);
	const [currentTemplate, setCurrentTemplate] = useState(0);
	const [selectedFont, setSelectedFont] = useState('poppins');
	const [currentFont, setCurrentFont] = useState('poppins');
	const [selectedBorderRadius, setSelectedBorderRadius] = useState(12);
	const [currentBorderRadius, setCurrentBorderRadius] = useState(12);
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState(null);

	const business = businesses && businesses.length > 0 ? businesses[0] : null;

	useEffect(() => {
		if (business) {
			if (business.template !== undefined) {
				setCurrentTemplate(business.template);
				setSelectedTemplate(business.template);
			}
			if (business.fontFamily) {
				setCurrentFont(business.fontFamily);
				setSelectedFont(business.fontFamily);
			}
			if (business.borderRadius !== undefined) {
				setCurrentBorderRadius(business.borderRadius);
				setSelectedBorderRadius(business.borderRadius);
			}
		}
	}, [business]);

	const handleTemplateSelect = (templateId) => {
		setSelectedTemplate(templateId);
		const template = templates.find(t => t.id === templateId);
		if (template) {
			setSelectedFont(template.recommendedFont);
		}
	};

	const hasChanges = selectedTemplate !== currentTemplate || 
	                  selectedFont !== currentFont || 
	                  selectedBorderRadius !== currentBorderRadius;

	const handleSaveTemplate = async () => {
		if (!business) {
			setError("No se encontró ningún negocio");
			return;
		}

		setLoading(true);
		setError(null);
		setSuccess(false);

		try {
			await menuService.updateFoodBusiness(business.id, {
				template: selectedTemplate,
				fontFamily: selectedFont,
				borderRadius: selectedBorderRadius
			});

			setCurrentTemplate(selectedTemplate);
			setCurrentFont(selectedFont);
			setCurrentBorderRadius(selectedBorderRadius);
			setSuccess(true);

			if (onTemplateUpdated) {
				await onTemplateUpdated();
			}

			setTimeout(() => setSuccess(false), 3000);
		} catch (err) {
			console.error("Error:", err);
			setError(err.message || "Error al guardar los cambios");
		} finally {
			setLoading(false);
		}
	};

	if (!business) return null;

	const getPreviewFont = () => {
		return availableFonts.find(f => f.id === selectedFont)?.family || 'inherit';
	};

	return (
		<section className="animate-fadeIn pb-32 md:pb-0">
			{/* Header Simplificado */}
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h2 className="neo-heading neo-h3 text-2xl">{t("templates.title")}</h2>
					<p className="hidden md:block neo-text text-sm text-neo-gray">Personaliza el diseño de tu menú.</p>
				</div>
				<div className="hidden md:block">
					{hasChanges && (
						<button
							onClick={handleSaveTemplate}
							disabled={loading}
							className="neo-btn neo-btn-primary flex items-center shadow-lg"
						>
							{loading ? "Guardando..." : "Guardar Cambios"}
						</button>
					)}
				</div>
			</div>

			{success && (
				<div className="mb-4 neo-card-3d-success p-3 flex items-center animate-fadeIn rounded-xl">
					<span className="mr-2">✅</span>
					<p className="neo-text-bold text-sm">¡Cambios guardados!</p>
				</div>
			)}

			<div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
				
				{/* LIVE PREVIEW - Sticky on Mobile */}
				<div className="w-full lg:w-1/3 lg:sticky lg:top-24 z-10">
					<div className="neo-card-3d bg-white p-1 overflow-hidden sticky top-20 shadow-2xl ring-4 ring-neo-black/5">
						<div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center min-h-[280px] relative overflow-hidden transition-all duration-300">
							{/* Background Decoration */}
							<div className="absolute inset-0 opacity-5 pointer-events-none" 
								style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
							</div>

							{/* Mock Menu Item Card */}
							<div 
								className="w-full max-w-[240px] bg-white border border-gray-200 shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
								style={{ 
									borderRadius: `${selectedBorderRadius}px`,
									fontFamily: getPreviewFont()
								}}
							>
								<div className="h-28 bg-gray-200 relative overflow-hidden">
									<div className="absolute inset-0 flex items-center justify-center text-4xl">🍔</div>
									{/* Style Badge based on Template */}
									<div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm">
										{templates.find(t => t.id === selectedTemplate)?.style}
									</div>
								</div>
								<div className="p-4">
									<div className="h-4 w-3/4 bg-gray-800 rounded mb-2"></div>
									<div className="h-3 w-1/2 bg-gray-300 rounded mb-4"></div>
									<div className="flex justify-between items-center mt-2">
										<div className="h-5 w-16 bg-neo-flame rounded text-white text-xs flex items-center justify-center font-bold"
											style={{ borderRadius: `${Math.max(4, selectedBorderRadius/2)}px` }}
										>
											$12.00
										</div>
										<div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-lg shadow-sm">+</div>
									</div>
								</div>
							</div>
							
							<div className="mt-6 text-center">
								<p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-1">Vista Previa</p>
								<p className="text-sm font-bold text-gray-700" style={{ fontFamily: getPreviewFont() }}>
									{availableFonts.find(f => f.id === selectedFont)?.name} • {selectedBorderRadius}px
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* CONTROLS - Tabs Layout */}
				<div className="w-full lg:w-2/3">
					
					{/* Tabs Navigation */}
					<div className="flex p-1 bg-gray-100 rounded-xl mb-6 relative">
						<button 
							onClick={() => setActiveTab('style')}
							className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 z-10 ${
								activeTab === 'style' ? 'bg-white text-neo-black shadow-md' : 'text-gray-500 hover:text-gray-700'
							}`}
						>
							🎨 Estilo
						</button>
						<button 
							onClick={() => setActiveTab('shape')}
							className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 z-10 ${
								activeTab === 'shape' ? 'bg-white text-neo-black shadow-md' : 'text-gray-500 hover:text-gray-700'
							}`}
						>
							📐 Forma
						</button>
						<button 
							onClick={() => setActiveTab('font')}
							className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 z-10 ${
								activeTab === 'font' ? 'bg-white text-neo-black shadow-md' : 'text-gray-500 hover:text-gray-700'
							}`}
						>
							🔡 Texto
						</button>
					</div>

					{/* Tab Content: Styles */}
					{activeTab === 'style' && (
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-fadeIn">
							{templates.map((template) => (
								<div
									key={template.id}
									onClick={() => handleTemplateSelect(template.id)}
									className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 relative group ${
										selectedTemplate === template.id 
											? "border-neo-flame ring-2 ring-neo-flame/20 shadow-lg scale-[1.02]" 
											: "border-transparent bg-white shadow hover:shadow-md"
									}`}
								>
									<div className="h-24 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
										<span className="text-4xl transform group-hover:scale-110 transition-transform duration-300">{template.icon}</span>
										{selectedTemplate === template.id && (
											<div className="absolute top-2 right-2 bg-neo-flame text-white rounded-full p-1 shadow-sm">
												<svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
													<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
												</svg>
											</div>
										)}
									</div>
									<div className="p-3 text-center">
										<h4 className="font-bold text-sm text-gray-800">{template.name}</h4>
										<p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{template.description}</p>
									</div>
								</div>
							))}
						</div>
					)}

					{/* Tab Content: Shape (Border Radius) */}
					{activeTab === 'shape' && (
						<div className="animate-fadeIn bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
							<div className="mb-8">
								<div className="flex justify-between items-center mb-4">
									<h4 className="font-bold text-gray-800">Redondez</h4>
									<span className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-mono font-bold">{selectedBorderRadius}px</span>
								</div>
								
								<input
									type="range"
									min="0"
									max="24"
									step="4"
									value={selectedBorderRadius}
									onChange={(e) => setSelectedBorderRadius(parseInt(e.target.value, 10))}
									className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-neo-flame"
								/>
								<div className="flex justify-between mt-3 text-xs text-gray-400 font-bold uppercase">
									<span>0px</span>
									<span>12px</span>
									<span>24px</span>
								</div>
							</div>

							<div className="grid grid-cols-4 gap-3">
								{[0, 8, 16, 24].map((v) => (
									<button
										key={v}
										onClick={() => setSelectedBorderRadius(v)}
										className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${
											selectedBorderRadius === v 
												? "border-neo-flame bg-neo-flame/5 text-neo-flame" 
												: "border-gray-100 hover:border-gray-200 text-gray-500"
										}`}
									>
										<div className="w-8 h-8 border-2 border-current" style={{ borderRadius: `${v}px` }}></div>
										<span className="text-xs font-bold">{v}px</span>
									</button>
								))}
							</div>
						</div>
					)}

					{/* Tab Content: Typography */}
					{activeTab === 'font' && (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fadeIn">
							{availableFonts.map((font) => (
								<button
									key={font.id}
									onClick={() => setSelectedFont(font.id)}
									className={`flex items-center p-3 rounded-xl border-2 text-left transition-all ${
										selectedFont === font.id 
											? "border-neo-flame bg-white shadow-md" 
											: "border-transparent bg-white shadow-sm hover:bg-gray-50"
									}`}
								>
									<div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl font-bold text-gray-800 mr-4 shrink-0"
										style={{ fontFamily: font.family }}>
										Aa
									</div>
									<div>
										<h4 className="font-bold text-sm text-gray-900 mb-0.5">{font.name}</h4>
										<p className="text-xs text-gray-500">{font.description}</p>
									</div>
									{selectedFont === font.id && (
										<div className="ml-auto text-neo-flame">
											<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
											</svg>
										</div>
									)}
								</button>
							))}
						</div>
					)}

				</div>
			</div>

			{/* Floating Save Button - Always Visible on Mobile */}
			{hasChanges && (
				<div className="fixed bottom-4 left-4 right-4 z-50 md:hidden animate-slide-up">
					<button
						onClick={handleSaveTemplate}
						disabled={loading}
						className="neo-btn neo-btn-primary w-full py-3.5 shadow-2xl flex items-center justify-center rounded-2xl font-bold text-base"
					>
						{loading ? "Guardando..." : "Guardar Cambios"}
					</button>
				</div>
			)}
		</section>
	);
};

export default TemplateSection;
