import React, { useState, useEffect } from "react";
import menuService from "../services/menuService";

export default function AddMenuForm({ businessId, onMenuAdded, onCancel }) {
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		foodBusinessId: businessId,
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [business, setBusiness] = useState(null);
	const [status, setStatus] = useState("");

	useEffect(() => {
		const checkBusiness = async () => {
			setStatus("Verificando el negocio...");
			try {
				const businessData = await menuService.getFoodBusiness(businessId);
				setBusiness(businessData);

				if (businessData.menus && businessData.menus.length > 0) {
					setError(
						"Este negocio ya tiene un menú. No se pueden crear más menús.",
					);
					setStatus("Este negocio ya tiene un menú.");
				} else {
					setStatus(
						"Negocio verificado correctamente. Puede crear un nuevo menú.",
					);
				}
			} catch (_err) {
				setError("Error al verificar el negocio. Por favor, intente de nuevo.");
				setStatus("Error al verificar el negocio.");
			}
		};

		if (businessId) {
			checkBusiness();
		} else {
			setError("No se ha especificado un negocio válido");
			setStatus("Error: No hay negocio seleccionado");
		}
	}, [businessId]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		if (error) {
			setError(null);
		}
	};

	const validateForm = () => {
		if (!formData.name.trim()) {
			setError("El nombre del menú es requerido");
			setStatus("Error: Nombre del menú requerido");
			return false;
		}

		if (!businessId) {
			setError("No se ha especificado un negocio válido");
			setStatus("Error: No hay negocio seleccionado");
			return false;
		}

		if (business?.menus?.length > 0) {
			setError("Este negocio ya tiene un menú. No se pueden crear más menús.");
			setStatus("Error: Negocio ya tiene un menú");
			return false;
		}

		setStatus("Formulario válido, puede proceder");
		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		setStatus("Iniciando proceso de creación...");

		if (!validateForm()) {
			return;
		}

		setLoading(true);
		setStatus("Creando menú...");

		try {
			const newMenu = await menuService.createMenu(formData);

			if (newMenu?.id) {
				setStatus("¡Menú creado exitosamente!");
				onMenuAdded(newMenu);
			} else {
				throw new Error("El servidor no devolvió un ID válido para el menú");
			}
		} catch (err) {
			setError(
				err.message || "Error al crear el menú. Por favor, intente de nuevo.",
			);
			setStatus("Error al crear el menú");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="menu-form animate-fadeIn neo-space-lg"
		>
			{error && (
				<div className="neo-alert neo-alert-error flex items-center">
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

			{status && !error && (
				<div className="neo-alert neo-alert-info flex items-center">
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
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span>{status}</span>
				</div>
			)}

			<div className="neo-card neo-shadow-lg bg-white p-6">
				<div className="mb-6 flex items-center">
					<div className="mr-3 rounded-lg bg-neo-lavender p-2.5">
						<svg
							className="h-6 w-6 text-neo-black"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
							/>
						</svg>
					</div>
					<h3 className="neo-heading neo-h3">
						Crear Nuevo Menú
					</h3>
				</div>

				<div className="neo-space-md">
					<div>
						<label
							htmlFor="name"
							className="neo-text neo-text-bold mb-2 block flex items-center"
						>
							<svg
								className="mr-1 h-4 w-4 text-neo-black"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
								/>
							</svg>
							Nombre del Menú *
						</label>
						<input
							type="text"
							id="name"
							name="name"
							required={true}
							value={formData.name}
							onChange={handleChange}
							className="neo-input w-full"
							placeholder="Ej. Menú de Desayunos, Carta Principal, etc."
						/>
					</div>

					<div>
						<label
							htmlFor="description"
							className="neo-text neo-text-bold mb-2 block flex items-center"
						>
							<svg
								className="mr-1 h-4 w-4 text-neo-black"
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
							Descripción
						</label>
						<textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={handleChange}
							rows="4"
							className="neo-textarea w-full"
							placeholder="Describe brevemente este menú"
						/>
					</div>
				</div>

				<div className="mt-8 neo-border-top pt-6">
					<div className="flex flex-col items-center justify-between md:flex-row">
						<p className="neo-text text-sm mb-4 md:mb-0 opacity-70">
							<svg
								className="mr-1 inline h-4 w-4 text-neo-black"
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
							Después de crear el menú, podrás añadir platos y categorías.
						</p>

						<div className="flex neo-space-sm">
							<button
								type="button"
								onClick={onCancel}
								className="neo-btn neo-btn-outline flex items-center"
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
								Cancelar
							</button>
							<button
								type="submit"
								disabled={loading}
								className="neo-btn neo-btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
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
										Creando...
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
										Crear Menú
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			</div>
		</form>
	);
}
