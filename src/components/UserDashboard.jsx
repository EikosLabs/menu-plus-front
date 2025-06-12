import React, { useState, useEffect } from "react";
import authService from "../services/authService";
import menuService from "../services/menuService";
import AddBusinessForm from "./AddBusinessForm";
import AddMenuForm from "./AddMenuForm";
import BusinessList from "./BusinessList";

export default function UserDashboard() {
	const [userData, setUserData] = useState(null);
	const [businesses, setBusinesses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showAddBusiness, setShowAddBusiness] = useState(false);
	const [showAddMenu, setShowAddMenu] = useState(false);
	const [selectedBusinessId, setSelectedBusinessId] = useState(null);
	const [showMobileMenu, setShowMobileMenu] = useState(false);
	const [activeSection, setActiveSection] = useState("negocios");

	useEffect(() => {
		console.log("🔍 Dashboard - iniciando verificación de autenticación");

		// Verificar si hay token antes de hacer otras verificaciones
		if (!authService.isAuthenticated()) {
			console.log("🔍 Dashboard - no autenticado, redirigiendo a login");
			window.location.href = "/login";
			return;
		}

		const currentUserId = authService.getUserId();
		console.log("🔍 Dashboard - userId obtenido:", currentUserId);

		// Si no podemos obtener el userId pero tenemos token, usar un ID temporal
		const userId = currentUserId || 1;
		console.log("🔍 Dashboard - userId final a usar:", userId);

		const fetchData = async () => {
			setLoading(true);
			try {
				console.log("🔍 Dashboard - obteniendo negocios para userId:", userId);
				const userBusinesses = await menuService.getUserBusinesses(userId);
				console.log("🔍 Dashboard - negocios obtenidos:", userBusinesses);
				setBusinesses(userBusinesses);

				const businessName =
					userBusinesses.length > 0 ? userBusinesses[0].name : "Mi Negocio";

				const userDataForState = {
					id: userId,
					name: businessName,
					email: `user_${userId}@example.com`,
					role: "Owner",
				};
				setUserData(userDataForState);
				console.log("🔍 Dashboard - userData configurado:", userDataForState);

				setError(null);
			} catch (error) {
				console.log("🔍 Dashboard - error al cargar datos:", error.message);
				setError(
					"No se pudieron cargar los datos del dashboard. Por favor, verifique su conexión e intente de nuevo.",
				);
				setBusinesses([]);

				const userDataForState = {
					id: userId,
					name: "Mi Negocio",
					email: `user_${userId}@example.com`,
					role: "Owner",
				};
				setUserData(userDataForState);
			} finally {
				setLoading(false);
				console.log("🔍 Dashboard - carga completada");
			}
		};

		fetchData();
	}, []);

	const handleAddBusinessClick = () => {
		setShowAddBusiness(true);
		setShowAddMenu(false);
	};

	const handleAddMenuClick = (businessId) => {
		setSelectedBusinessId(businessId);
		setShowAddMenu(true);
		setShowAddBusiness(false);
	};

	const handleBusinessAdded = async (newBusiness) => {
		try {
			const userBusinesses = await menuService.getUserBusinesses(userData.id);
			setBusinesses(userBusinesses);

			const businessName =
				userBusinesses.length > 0 ? userBusinesses[0].name : newBusiness.name;
			setUserData((prev) => ({ ...prev, name: businessName }));

			setShowAddBusiness(false);
		} catch (_error) {
			setError(
				"Se agregó el negocio pero no se pudo actualizar la lista. Por favor, recarga la página.",
			);

			setBusinesses((prevBusinesses) => [
				...prevBusinesses,
				{
					...newBusiness,
					menus: [],
				},
			]);

			if (newBusiness.name) {
				setUserData((prev) => ({ ...prev, name: newBusiness.name }));
			}
		}
	};

	const handleMenuAdded = async (newMenu) => {
		try {
			setBusinesses((prevBusinesses) =>
				prevBusinesses.map((business) =>
					business.id === newMenu.foodBusinessId
						? { ...business, menus: [newMenu], hasMenu: true }
						: business,
				),
			);
			setShowAddMenu(false);
			setError(null);
		} catch (_error) {
			setError(
				"Se agregó el menú pero ocurrió un error al actualizar la vista. Por favor, recarga la página.",
			);
		}
	};

	const handleLogout = () => {
		authService.logout();
		document.cookie =
			"auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
		window.location.href = "/login";
	};

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
				<div className="flex flex-col items-center rounded-xl bg-white p-8 shadow-xl">
					<div className="h-16 w-16 animate-spin rounded-full border-[#1a1a1a] border-t-4 border-b-4" />
					<p className="mt-4 font-medium text-[#004E71] text-lg">
						Cargando información...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col bg-gradient-to-br from-[#F8FAFC] to-[#EEF6FB] transition-all duration-300">
			<nav className="sticky top-0 z-20 bg-gradient-to-r from-[#003A57] to-[#004E71] p-4 shadow-xl transition-all duration-300">
				<div className="container mx-auto flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<div className="mr-2 rounded-lg bg-white p-1.5 shadow-md">
							<img
								src="/favicon.svg"
								alt="Menu Plus Logo"
								className="h-6 w-6"
							/>
						</div>
						<h1 className="font-bold text-lg text-white md:text-xl">
							Menu Plus
						</h1>
					</div>

					<div className="hidden items-center space-x-6 md:flex">
						<div className="flex items-center text-white">
							<svg
								className="mr-2 h-5 w-5 text-blue-200"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								/>
							</svg>
							<span className="font-medium">{userData?.name}</span>
						</div>

						<button
							onClick={handleLogout}
							className="flex transform items-center rounded-lg bg-gradient-to-r from-[#1a1a1a] to-[#404040] px-4 py-2 font-medium text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110"
						>
							<svg
								className="mr-1.5 h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
								/>
							</svg>
							Cerrar Sesión
						</button>
					</div>

					<button
						className="p-2 text-white focus:outline-none md:hidden"
						onClick={() => setShowMobileMenu(!showMobileMenu)}
						aria-label={showMobileMenu ? "Cerrar menú" : "Abrir menú"}
					>
						{showMobileMenu ? (
							<svg
								className="h-6 w-6"
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
						) : (
							<svg
								className="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						)}
					</button>
				</div>
			</nav>

			{showMobileMenu && (
				<div className="absolute top-16 right-0 left-0 z-10 origin-top transform animate-slideDown bg-white px-4 py-4 shadow-xl transition-all duration-300 md:hidden">
					<div className="flex flex-col space-y-3">
						<div className="flex items-center border-gray-100 border-b py-3">
							<div className="mr-3 rounded-full bg-[#004E71] bg-opacity-10 p-2">
								<svg
									className="h-5 w-5 text-[#003A57]"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
							</div>
							<span className="font-medium text-[#003A57]">
								{userData?.name}
							</span>
						</div>

						<div className="flex flex-col space-y-1">
							<button
								onClick={() => {
									setActiveSection("negocios");
									setShowMobileMenu(false);
								}}
								className={`flex items-center rounded-lg px-4 py-3 ${activeSection === "negocios" ? "bg-blue-50 font-medium text-blue-600" : "text-gray-700 hover:bg-gray-50"}`}
							>
								<svg
									className="mr-3 h-5 w-5"
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
								Mis Negocios
							</button>

							<button
								onClick={() => {
									setActiveSection("estadisticas");
									setShowMobileMenu(false);
								}}
								className={`flex items-center rounded-lg px-4 py-3 ${activeSection === "estadisticas" ? "bg-blue-50 font-medium text-blue-600" : "text-gray-700 hover:bg-gray-50"}`}
							>
								<svg
									className="mr-3 h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
									/>
								</svg>
								Estadísticas
							</button>

							<button
								onClick={() => {
									setActiveSection("perfil");
									setShowMobileMenu(false);
								}}
								className={`flex items-center rounded-lg px-4 py-3 ${activeSection === "perfil" ? "bg-blue-50 font-medium text-blue-600" : "text-gray-700 hover:bg-gray-50"}`}
							>
								<svg
									className="mr-3 h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
								Mi Perfil
							</button>
						</div>

						<div className="mt-2 border-gray-100 border-t pt-2">
							<button
								onClick={handleLogout}
								className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#1a1a1a] to-[#404040] px-4 py-3 font-medium text-white shadow-md"
							>
								<svg
									className="mr-2 h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
									/>
								</svg>
								Cerrar Sesión
							</button>
						</div>
					</div>
				</div>
			)}

			<main className="container mx-auto flex-grow px-4 py-6 md:px-6 md:py-8 lg:px-8">
				<div className="mb-6 transform rounded-xl border border-gray-100 bg-white p-5 shadow-lg transition-all duration-300 hover:shadow-xl">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between">
						<div>
							<div className="mb-2 flex items-center">
								<svg
									className="mr-1 h-5 w-5 text-[#4A90E2]"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
									/>
								</svg>
								<span className="font-medium text-[#4A90E2]">
									Panel de Control /{" "}
									{activeSection === "negocios"
										? "Mis Negocios"
										: activeSection === "estadisticas"
											? "Estadísticas"
											: "Mi Perfil"}
								</span>
							</div>
							<h1 className="font-bold text-2xl text-[#1A3A54] tracking-tight md:text-3xl">
								Panel de Control
							</h1>
							<p className="mt-2 text-base text-gray-600 md:text-lg">
								Gestiona tu negocio y menú digital desde un solo lugar.
							</p>
						</div>

						<div className="mt-4 md:mt-0">
							<div className="flex transform items-start rounded-lg bg-gradient-to-r from-[#EBF5F9] to-[#E6F4F8] p-4 shadow-sm transition hover:translate-y-[-2px] hover:shadow-md">
								<svg
									className="mr-2 h-6 w-6 flex-shrink-0 text-[#4A90E2]"
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
								<div className="text-sm">
									<p className="font-semibold text-[#1A3A54] text-base">
										Consejo Pro
									</p>
									<p className="text-gray-700">
										Crea un menú atractivo para atraer más clientes a tu
										negocio.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{error && (
					<div className="mb-5 flex animate-fadeIn items-center rounded-md border-red-500 border-l-4 bg-red-50 p-4 text-red-700 shadow-sm">
						<svg
							className="mr-2 h-5 w-5 flex-shrink-0 text-red-500 md:mr-3 md:h-6 md:w-6"
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
						<span className="font-medium text-sm md:text-base">{error}</span>
						<button
							onClick={() => setError(null)}
							className="ml-auto text-red-500 hover:text-red-700"
							aria-label="Cerrar mensaje de error"
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
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				)}

				{activeSection === "negocios" && (
					<section className="mb-6 animate-fadeIn">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="flex items-center font-bold text-[#1A3A54] text-xl md:text-2xl">
								<svg
									className="mr-2 h-6 w-6 text-[#1a1a1a] md:mr-3 md:h-7 md:w-7"
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
								Mi Negocio
							</h2>
							{businesses.length === 0 && (
								<button
									onClick={handleAddBusinessClick}
									className="flex transform items-center rounded-lg bg-gradient-to-r from-[#1a1a1a] to-[#404040] px-4 py-2 font-medium text-sm text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:brightness-110 md:px-5 md:py-3 md:text-base"
								>
									<svg
										className="mr-1.5 h-4 w-4 md:mr-2 md:h-5 md:w-5"
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
									<span>Añadir Negocio</span>
								</button>
							)}
						</div>

						{businesses.length > 0 && (
							<div className="mb-5 flex transform items-start rounded-lg border border-blue-100 bg-gradient-to-r from-[#EBF5F9] to-[#E6F4F8] p-4 shadow-sm transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md">
								<svg
									className="mr-3 h-6 w-6 flex-shrink-0 text-[#4A90E2]"
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
								<div className="text-sm">
									<p className="font-semibold text-[#1A3A54] text-base">
										Información
									</p>
									<p className="text-gray-700">
										Cada usuario solo puede tener un negocio registrado en la
										plataforma y cada negocio solo puede tener un menú.
									</p>
								</div>
							</div>
						)}

						{showAddBusiness && (
							<div className="mb-6 animate-fadeInUp">
								<AddBusinessForm
									userId={userData?.id}
									onBusinessAdded={handleBusinessAdded}
									onCancel={() => setShowAddBusiness(false)}
								/>
							</div>
						)}

						{businesses.length > 0 && !showAddBusiness && !showAddMenu && (
							<BusinessList
								businesses={businesses}
								onAddMenuClick={handleAddMenuClick}
								setBusinesses={setBusinesses}
							/>
						)}

						{showAddMenu && (
							<div className="mb-6 animate-fadeInUp">
								<AddMenuForm
									businessId={selectedBusinessId}
									onMenuAdded={handleMenuAdded}
									onCancel={() => setShowAddMenu(false)}
								/>
							</div>
						)}
					</section>
				)}

				{activeSection === "estadisticas" && (
					<section className="mb-6 animate-fadeIn rounded-xl bg-white p-6 shadow-lg">
						<div className="mb-4 flex items-center">
							<div className="mr-4 rounded-full bg-blue-100 p-3">
								<svg
									className="h-6 w-6 text-blue-600"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
									/>
								</svg>
							</div>
							<h2 className="font-bold text-[#1A3A54] text-xl md:text-2xl">
								Estadísticas
							</h2>
						</div>
						<p className="mb-6 text-gray-600">
							Esta función estará disponible próximamente. ¡Mantente atento a
							las actualizaciones!
						</p>
						<div className="mb-4 rounded-lg border-blue-400 border-l-4 bg-blue-50 p-4">
							<p className="text-blue-700 text-sm">
								Aquí podrás ver estadísticas sobre las visitas a tu menú, platos
								populares y más.
							</p>
						</div>
					</section>
				)}

				{activeSection === "perfil" && (
					<section className="mb-6 animate-fadeIn rounded-xl bg-white p-6 shadow-lg">
						<div className="mb-4 flex items-center">
							<div className="mr-4 rounded-full bg-purple-100 p-3">
								<svg
									className="h-6 w-6 text-purple-600"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
							</div>
							<h2 className="font-bold text-[#1A3A54] text-xl md:text-2xl">
								Mi Perfil
							</h2>
						</div>
						<p className="mb-6 text-gray-600">
							Esta función estará disponible próximamente. ¡Mantente atento a
							las actualizaciones!
						</p>
						<div className="mb-4 rounded-lg border-purple-400 border-l-4 bg-purple-50 p-4">
							<p className="text-purple-700 text-sm">
								Aquí podrás actualizar tus datos personales, cambiar tu
								contraseña y configurar preferencias.
							</p>
						</div>
					</section>
				)}
			</main>

			<footer className="mt-auto border-gray-200 border-t bg-white py-4">
				<div className="container mx-auto px-4 text-center text-gray-600 text-sm">
					<p>
						© {new Date().getFullYear()} Menu Plus. Todos los derechos
						reservados.
					</p>
				</div>
			</footer>

			<style jsx={true}>{`
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.3s ease-out forwards; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.4s ease-out forwards; }
      `}</style>
		</div>
	);
}
