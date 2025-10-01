import React from "react";

const DashboardHeader = ({ activeSection }) => {
	const getSectionTitle = () => {
		switch (activeSection) {
			case "negocios":
				return "Mis Negocios";
			case "estadisticas":
				return "Estadísticas";
			case "perfil":
				return "Mi Perfil";
			default:
				return "Mis Negocios";
		}
	};

	return (
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
							Panel de Control / {getSectionTitle()}
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
							<p className="font-semibold text-[#1A3A54] text-base">Consejo Pro</p>
							<p className="text-gray-700">
								Crea un menú atractivo para atraer más clientes a tu negocio.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DashboardHeader;