import { useEffect, useState } from "react";
import menuService from "../services/menuService";

export default function SectionManager({
	menuId,
	onSectionAdded,
	onSectionMoved,
	onClose,
}) {
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
		try {
			setIsLoading(true);
			setError(null);
			const updatedSection = await menuService.moveSectionUp(menuId, sectionId);

			if (onSectionMoved) {
				onSectionMoved(updatedSection);
			}
		} catch (error) {
			setError(`Error al mover la sección: ${error.message}`);
		} finally {
			setIsLoading(false);
		}
	};

	const handleMoveDown = async (sectionId) => {
		try {
			setIsLoading(true);
			setError(null);
			const updatedSection = await menuService.moveSectionDown(
				menuId,
				sectionId,
			);

			if (onSectionMoved) {
				onSectionMoved(updatedSection);
			}
		} catch (error) {
			setError(`Error al mover la sección: ${error.message}`);
		} finally {
			setIsLoading(false);
		}
	};

	const handleModalClick = (e) => {
		e.stopPropagation();
	};

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

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50 backdrop-blur-sm transition-all duration-300"
			onClick={onClose}
		>
			<div
				className="m-4 max-h-[90vh] w-full max-w-2xl transform animate-fadeInUp overflow-y-auto rounded-xl bg-white shadow-2xl transition-all duration-300"
				onClick={handleModalClick}
			>
				<div className="relative p-6 md:p-8">
					<button
						onClick={onClose}
						className="absolute top-4 right-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						aria-label="Cerrar modal"
						disabled={isLoading}
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
						<div className="mr-4 flex-shrink-0 rounded-lg bg-blue-500 bg-opacity-10 p-3.5">
							<svg
								className="h-7 w-7 text-blue-600"
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
						<h2 className="font-bold text-2xl text-gray-800 sm:text-3xl">
							Gestionar Secciones
						</h2>
					</div>

					{error && (
						<div className="mb-6 animate-fadeIn rounded-md border-red-500 border-l-4 bg-red-50 p-3.5 text-red-700">
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

					<form onSubmit={handleAddSection}>
						<div className="mb-4">
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
								className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-colors focus:border-blue-500 focus:ring-blue-500"
								placeholder="Ej: Entradas, Platos Principales, Postres..."
								required={true}
								disabled={isLoading}
							/>
						</div>

						<div className="mb-4">
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
								className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-colors focus:border-blue-500 focus:ring-blue-500"
								placeholder="Descripción breve de la sección..."
								rows={3}
								disabled={isLoading}
							/>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="mb-6 w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
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
								"Agregar Sección"
							)}
						</button>
					</form>

					<div>
						<h4 className="mb-2 font-medium text-base text-gray-800">
							Secciones actuales
						</h4>

						{sections.length === 0 ? (
							<p className="rounded-lg bg-gray-50 py-4 text-center text-gray-500">
								No hay secciones creadas
							</p>
						) : (
							<div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
								{sections
									.sort((a, b) => a.order - b.order)
									.map((section) => (
										<div
											key={section.id}
											className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-sm"
										>
											<div>
												<p className="font-medium text-gray-800">
													{section.name}
												</p>
												{section.description && (
													<p className="mt-1 text-gray-600 text-sm">
														{section.description}
													</p>
												)}
											</div>
											<div className="flex space-x-2">
												<button
													onClick={() => handleMoveUp(section.id)}
													disabled={isLoading || section.order === 0}
													className="rounded p-1.5 text-blue-600 transition-colors hover:bg-gray-100 hover:text-blue-800 disabled:opacity-50"
													title="Mover hacia arriba"
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
															strokeWidth={2}
															d="M5 15l7-7 7 7"
														/>
													</svg>
												</button>
												<button
													onClick={() => handleMoveDown(section.id)}
													disabled={
														isLoading || section.order === sections.length - 1
													}
													className="rounded p-1.5 text-blue-600 transition-colors hover:bg-gray-100 hover:text-blue-800 disabled:opacity-50"
													title="Mover hacia abajo"
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
															strokeWidth={2}
															d="M19 9l-7 7-7-7"
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
}
