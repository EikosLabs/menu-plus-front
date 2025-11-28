import React from "react";
import { useTranslation } from "../../i18n/utils";

const Navigation = ({ userData, showMobileMenu, setShowMobileMenu, activeSection, setActiveSection, onLogout }) => {
    const { t } = useTranslation();
    const navItems = [
        {
            id: "negocios",
            label: t("navigation.businesses"),
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
            label: t("navigation.templates"),
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
            label: t("navigation.dashboard"),
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
            label: t("navigation.profile"),
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
		<nav className="sticky top-0 z-50 bg-white border-b-neo-extra border-neo-black shadow-lg">
			<div className="container mx-auto px-3 sm:px-4">
				<div className="flex items-center justify-between h-14 sm:h-16">
					{/* Logo and Brand */}
					<div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
						<div className="neo-icon-3d neo-icon-3d-flame w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
							<img src="/favicon.svg" alt="Menu Plus Logo" className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
						<h1 className="neo-heading neo-h4 text-neo-flame mb-0 truncate text-sm sm:text-base">Menu Plus</h1>
					</div>

					{/* Desktop Navigation Menu */}
					<div className="hidden lg:flex items-center space-x-1 sm:space-x-2">
						{navItems.map((item) => (
							<button
								key={item.id}
								onClick={() => setActiveSection(item.id)}
								className={`flex items-center px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base ${
									activeSection === item.id
										? "bg-neo-flame text-white neo-shadow"
										: "text-neo-black hover:bg-neo-lavender"
								}`}
							>
								<svg className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									{item.icon}
								</svg>
								<span className="neo-text-bold truncate">{item.label}</span>
							</button>
						))}
					</div>

					{/* User Actions - Desktop */}
					<div className="hidden md:flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
						<div className="flex items-center neo-text neo-text-bold min-w-0">
							<svg className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 text-neo-flame flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
							<span className="truncate text-sm sm:text-base">{userData?.name}</span>
						</div>

						<button
							onClick={onLogout}
							className="neo-btn neo-btn-primary flex items-center text-sm sm:text-base px-3 py-2 sm:px-4"
						>
							<svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
							</svg>
							<span className="hidden sm:inline">{t("auth.logout")}</span>
							<span className="sm:hidden">Salir</span>
						</button>
					</div>

					{/* Mobile Menu Button */}
					<button
						className="p-2 neo-btn neo-btn-outline md:hidden rounded-lg hover:bg-neo-lavender transition-colors"
						onClick={() => setShowMobileMenu(!showMobileMenu)}
						aria-label={showMobileMenu ? t("common.close") : t("common.open")}
					>
						{showMobileMenu ? (
							<svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						) : (
							<svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
							</svg>
						)}
					</button>
				</div>

				{/* Mobile Navigation Bar */}
				<div className="hidden md:flex lg:hidden border-t border-gray-200 py-2">
					<div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
						{navItems.map((item) => (
							<button
								key={item.id}
								onClick={() => setActiveSection(item.id)}
								className={`flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
									activeSection === item.id
										? "bg-neo-flame text-white neo-shadow"
										: "text-neo-black hover:bg-neo-lavender"
								}`}
							>
								<svg className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									{item.icon}
								</svg>
								<span className="neo-text-bold truncate">{item.label}</span>
							</button>
						))}
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navigation;
