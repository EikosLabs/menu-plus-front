import React from "react";

const Navigation = ({ userData, showMobileMenu, setShowMobileMenu, activeSection, setActiveSection, onLogout }) => {
	return (
		<nav className="sticky top-0 z-20 bg-white border-b-neo-extra border-neo-black shadow-lg">
			<div className="container mx-auto flex items-center justify-between p-4">
				<div className="flex items-center space-x-3">
					<div className="neo-icon-3d neo-icon-3d-flame w-10 h-10">
						<img src="/favicon.svg" alt="Menu Plus Logo" className="h-5 w-5" />
					</div>
					<h1 class="neo-heading neo-h4 text-neo-flame mb-0">Menu Plus</h1>
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
