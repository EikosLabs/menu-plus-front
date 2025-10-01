import React from "react";

const Navigation = ({ userData, showMobileMenu, setShowMobileMenu, activeSection, setActiveSection, onLogout }) => {
	return (
		<nav className="sticky top-0 z-20 bg-gradient-to-r from-[#003A57] to-[#004E71] p-4 shadow-xl transition-all duration-300">
			<div className="container mx-auto flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<div className="mr-2 rounded-lg bg-white p-1.5 shadow-md">
						<img src="/favicon.svg" alt="Menu Plus Logo" className="h-6 w-6" />
					</div>
					<h1 className="font-bold text-lg text-white md:text-xl">Menu Plus</h1>
				</div>

				<div className="hidden items-center space-x-6 md:flex">
					<div className="flex items-center text-white">
						<svg className="mr-2 h-5 w-5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
						<span className="font-medium">{userData?.name}</span>
					</div>

					<button
						onClick={onLogout}
						className="flex transform items-center rounded-lg bg-gradient-to-r from-[#1a1a1a] to-[#404040] px-4 py-2 font-medium text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110"
					>
						<svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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