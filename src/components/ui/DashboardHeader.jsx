import React from "react";

const DashboardHeader = ({ activeSection }) => {
	const getSectionTitle = () => {
		switch (activeSection) {
			case "negocios":
				return "Mis Negocios";
			case "templates":
				return "Templates";
			case "estadisticas":
				return "Estadísticas";
			case "perfil":
				return "Mi Perfil";
			default:
				return "Mis Negocios";
		}
	};

	return (
		<div className="mb-4 sm:mb-6 neo-card-3d p-4 sm:p-6 mt-2">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
				<div>
					<div className="mb-2 flex items-center">
						<svg
							className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 text-neo-flame flex-shrink-0"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2.5}
								d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
							/>
						</svg>
						<span className="neo-text-bold text-neo-flame text-xs sm:text-sm truncate">
							Panel de Control / {getSectionTitle()}
						</span>
					</div>
					<h1 className="neo-heading neo-h2 text-2xl sm:text-3xl">
						Panel de Control
					</h1>
					<p className="neo-text text-neo-gray mt-1.5 sm:mt-2 text-sm sm:text-base">
						Gestiona tu negocio y menú digital desde un solo lugar.
					</p>
				</div>

				<div className="mt-3 sm:mt-4 md:mt-0">
					<div className="neo-card-3d-sunset p-3 sm:p-4 max-w-xs">
						<div className="flex items-start">
							<svg
								className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2.5}
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<div className="min-w-0">
								<p className="neo-text-bold mb-1 text-sm sm:text-base">💡 Consejo Pro</p>
								<p className="neo-text text-xs sm:text-sm">
									Crea un menú atractivo para atraer más clientes a tu negocio.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DashboardHeader;
