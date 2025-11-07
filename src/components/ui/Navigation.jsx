import React from "react";

const Navigation = ({ userData, showMobileMenu, setShowMobileMenu, activeSection, setActiveSection, onLogout }) => {
	const navItems = [
		{
			id: "negocios",
			label: "Negocios",
			icon: (
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
				/>
			)
		},
		{
			id: "templates",
			label: "Templates",
			icon: (
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 4 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
				/>
			)
		},
		{
			id: "estadisticas",
			label: "Estadísticas",
			icon: (
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
				/>
			)
		},
		{
			id: "perfil",
			label: "Perfil",
			icon: (
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
				/>
			)
		}
	];

	return (
		<nav className="sticky top-0 z-20 bg-white border-b-neo-extra border-neo-black shadow-lg">
			<div className="container mx-auto flex items-center justify-between p-4">
				<div className="flex items-center space-x-3">
					<div className="neo-icon-3d neo-icon-3d-flame w-10 h-10">
						<img src="/favicon.svg" alt="Menu Plus Logo" className="h-5 w-5" />
					</div>
					<h1 class="neo-heading neo-h4 text-neo-flame mb-0">Menu Plus</h1>
				</div>

				{/* Desktop Navigation Menu */}
				<div className="hidden lg:flex items-center space-x-2">
					{navItems.map((item) => (
						<button
							key={item.id}
							onClick={() => setActiveSection(item.id)}
							className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
								activeSection === item.id
									? "bg-neo-flame text-white neo-shadow"
									: "text-neo-black hover:bg-neo-lavender"
							}`}
						>
							<svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								{item.icon}
							</svg>
							<span className="neo-text-bold text-sm">{item.label}</span>
						</button>
					))}
				</div>

				<div className="hidden items-center space-x-6 md:flex">
					<div className="flex items-center neo-text neo-text-bold">
						<svg className="mr-2 h-5 w-5 text-neo-flame" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
						<span>{userData?.name}</span>
					</div>

					<button
						onClick={onLogout}
						className="neo-btn neo-btn-primary flex items-center"
					>
						<svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
						</svg>
						Cerrar Sesión
					</button>
				</div>

				<button
					className="p-2 neo-btn neo-btn-outline md:hidden"
					onClick={() => setShowMobileMenu(!showMobileMenu)}
					aria-label={showMobileMenu ? "Cerrar menú" : "Abrir menú"}
				>
					{showMobileMenu ? (
						<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					) : (
						<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					)}
				</button>
			</div>
		</nav>
	);
};

export default Navigation;
