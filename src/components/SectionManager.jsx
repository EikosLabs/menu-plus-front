import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import menuService from "../services/menuService";
import { useTranslation } from "../i18n/utils";

export default function SectionManager({
	menuId,
	onSectionAdded,
	onSectionMoved,
	onClose,
}) {
	const { t } = useTranslation();
	const [sections, setSections] = useState([]);
	const [newSection, setNewSection] = useState({ name: "", description: "" });
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (menuId) {
			loadSections();
		}
	}, [menuId]);

	const loadSections = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const fetchedSections = await menuService.getSections(menuId);
			setSections(fetchedSections || []);
		} catch (error) {
			setError(`Error al cargar las secciones: ${error.message}`);
		} finally {
			setIsLoading(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setNewSection((prev) => ({ ...prev, [name]: value }));
	};

	const handleAddSection = async (e) => {
		e.preventDefault();
		if (!newSection.name.trim()) {
			setError("El nombre de la sección es requerido");
			return;
		}

		try {
			setIsLoading(true);
			setError(null);
			const createdSection = await menuService.createSection(
				menuId,
				newSection,
			);
			setSections((prev) => [...prev, createdSection]);
			setNewSection({ name: "", description: "" });

			if (onSectionAdded) {
				onSectionAdded(createdSection);
			}
		} catch (error) {
			setError(`Error al crear la sección: ${error.message}`);
		} finally {
			setIsLoading(false);
		}
	};

	const handleMoveUp = async (sectionId) => {
		// Encontrar la sección actual en el array ordenado
		const sortedSections = sections.sort((a, b) => a.order - b.order);
		const currentIndex = sortedSections.findIndex(section => section.id === sectionId);

		// Verificar si ya está en la primera posición
		if (currentIndex <= 0) {
			return;
		}

		try {
			setIsLoading(true);
			setError(null);
			const updatedSection = await menuService.moveSectionUp(menuId, sectionId);

			if (onSectionMoved) {
				onSectionMoved(updatedSection);
			}

			// Recargar las secciones para obtener el orden actualizado
			await loadSections();
		} catch (error) {
			console.error('Error al mover sección hacia arriba:', error);
			setError(`Error al mover la sección: ${error.message}`);
		} finally {
			setIsLoading(false);
		}
	};

	const handleMoveDown = async (sectionId) => {
		// Encontrar la sección actual en el array ordenado
		const sortedSections = sections.sort((a, b) => a.order - b.order);
		const currentIndex = sortedSections.findIndex(section => section.id === sectionId);

		// Verificar si ya está en la última posición
		if (currentIndex >= sortedSections.length - 1 || currentIndex === -1) {
			return;
		}

		try {
			setIsLoading(true);
			setError(null);
			const updatedSection = await menuService.moveSectionDown(menuId, sectionId);

			if (onSectionMoved) {
				onSectionMoved(updatedSection);
			}

			// Recargar las secciones para obtener el orden actualizado
			await loadSections();
		} catch (error) {
			console.error('Error al mover sección hacia abajo:', error);
			setError(`Error al mover la sección: ${error.message}`);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteSection = async (sectionId) => {
		if (!window.confirm("¿Estás seguro de eliminar esta sección? Esto también eliminará todos los platos asociados.")) {
			return;
		}

		try {
			setIsLoading(true);
			setError(null);
			await menuService.deleteSection(menuId, sectionId);
			setSections((prev) => prev.filter(s => s.id !== sectionId));

			// Recargar para asegurar sincronización
			await loadSections();
		} catch (error) {
			setError(`Error al eliminar la sección: ${error.message}`);
		} finally {
			setIsLoading(false);
		}
	};

	const handleModalClick = (e) => {
		e.stopPropagation();
	};

	// Bloquear scroll cuando el modal está abierto
	useEffect(() => {
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, []);

	useEffect(() => {
		const handleEscapeKey = (e) => {
			if (e.key === "Escape" && !isLoading && onClose) {
				onClose();
			}
		};

		document.addEventListener("keydown", handleEscapeKey);
		return () => {
			document.removeEventListener("keydown", handleEscapeKey);
		};
	}, [isLoading, onClose]);

	const modalContent = (
		<div
			className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 transition-all duration-300 p-4"
			onClick={onClose}
		>
			<div
				className="w-full max-w-xl max-h-[85vh] transform animate-fadeInUp overflow-y-auto bg-white neo-border neo-shadow-2xl transition-all duration-300"
				onClick={handleModalClick}
			>
				<div className="relative p-4 sm:p-5">
					<button
						onClick={onClose}
						className="absolute top-3 right-3 neo-btn neo-btn-sm bg-neo-lavender hover:bg-neo-lavender-dark"
						aria-label="Cerrar modal"
						disabled={isLoading}
					>
						<svg
							className="h-5 w-5"
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

					<div className="mb-4 flex items-center">
						<div className="mr-3 flex-shrink-0 rounded-lg bg-neo-sunset bg-opacity-10 p-2.5">
							<svg
								className="h-6 w-6 text-neo-sunset"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M4 6h16M4 12h16M4 18h7"
								/>
							</svg>
						</div>
						<h2 className="neo-heading neo-h4 text-lg sm:text-xl">
							Gestionar Secciones
						</h2>
					</div>

					{error && (
						<div className="mb-4 neo-alert neo-alert-error animate-fadeIn">
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

					<form onSubmit={handleAddSection} className="space-y-3 sm:space-y-4">
						<div>
							<label
								htmlFor="name"
								className="mb-1 block font-medium text-gray-700 text-sm"
							>
								Nombre de la sección
							</label>
							<input
								type="text"
								id="name"
								name="name"
								value={newSection.name}
								onChange={handleInputChange}
								className="neo-input w-full"
								placeholder="Ej: Entradas, Platos Principales, Postres..."
								required={true}
								disabled={isLoading}
							/>
						</div>

						<div>
							<label
								htmlFor="description"
								className="mb-1 block font-medium text-gray-700 text-sm"
							>
								Descripción (opcional)
							</label>
							<textarea
								id="description"
								name="description"
								value={newSection.description}
								onChange={handleInputChange}
								className="neo-input neo-textarea w-full"
								placeholder="Descripción breve de la sección..."
								rows={3}
								disabled={isLoading}
							/>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="neo-btn neo-btn-primary w-full"
						>
							{isLoading ? (
								<div className="flex items-center justify-center">
									<svg
										className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
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
									Agregando...
								</div>
							) : (
								t("sections.addSection")
							)}
						</button>
					</form>

					<div className="mt-6">
						<h4 className="mb-3 neo-heading neo-h4">
							Secciones actuales
						</h4>

						{sections.length === 0 ? (
							<div className="neo-surface neo-border rounded-lg py-6 text-center">
								<p className="neo-text text-gray-500">No hay secciones creadas</p>
							</div>
						) : (
							<div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
								{sections
									.sort((a, b) => a.order - b.order)
									.map((section, index) => (
										<div
											key={section.id}
											className="flex items-center justify-between neo-surface neo-border rounded-lg p-3 sm:p-4 transition-shadow hover:neo-shadow-md"
										>
											<div className="flex-1 min-w-0 mr-3">
												<p className="neo-heading neo-h5 truncate">
													{section.name}
												</p>
												{section.description && (
													<p className="mt-1 neo-text text-gray-600 text-xs sm:text-sm truncate">
														{section.description}
													</p>
												)}
											</div>
											<div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
												<button
													onClick={() => handleMoveUp(section.id)}
													disabled={isLoading || index === 0}
													className={`neo-btn neo-btn-sm p-1.5 sm:p-2 ${index === 0
														? "opacity-50 cursor-not-allowed bg-gray-200"
														: "bg-neo-sky hover:bg-neo-sky-dark"
														}`}
													title={
														index === 0
															? "No se puede mover hacia arriba (ya está en la primera posición)"
															: "Mover hacia arriba"
													}
												>
													<svg
														className="h-4 w-4 sm:h-5 sm:w-5"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M5 15l7-7 7 7"
														/>
													</svg>
												</button>
												<button
													onClick={() => handleMoveDown(section.id)}
													disabled={isLoading || index === sections.length - 1}
													className={`neo-btn neo-btn-sm p-1.5 sm:p-2 ${index === sections.length - 1
														? "opacity-50 cursor-not-allowed bg-gray-200"
														: "bg-neo-sky hover:bg-neo-sky-dark"
														}`}
													title={
														index === sections.length - 1
															? "No se puede mover hacia abajo (ya está en la última posición)"
															: "Mover hacia abajo"
													}
												>
													<svg
														className="h-4 w-4 sm:h-5 sm:w-5"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M19 9l-7 7-7-7"
														/>
													</svg>
												</button>
												<button
													onClick={() => handleDeleteSection(section.id)}
													disabled={isLoading}
													className="neo-btn neo-btn-sm p-1.5 sm:p-2 bg-red-100 hover:bg-red-200 text-red-600 border-red-200"
													title="Eliminar sección"
												>
													<svg
														className="h-4 w-4 sm:h-5 sm:w-5"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
														/>
													</svg>
												</button>
											</div>
										</div>
									))}
							</div>
						)}
					</div>
				</div>
			</div>

			<style jsx={true}>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeInUp { animation: fadeInUp 0.3s ease-out forwards; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
		</div>
	);

	return typeof document !== 'undefined'
		? createPortal(modalContent, document.body)
		: null;
}
