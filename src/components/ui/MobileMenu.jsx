import React from "react";
import { useTranslation } from "../../i18n/utils";

const MobileMenu = ({ userData, activeSection, setActiveSection, setShowMobileMenu, onLogout }) => {
    const { t } = useTranslation();
    const menuItems = [
        {
            id: "negocios",
            label: t("dashboard.myBusinesses"),
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
					d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
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
		<div className="fixed top-14 sm:top-16 right-0 left-0 z-50 bg-white shadow-2xl md:hidden border-l-neo-thick border-r-neo-thick border-b-neo-thick border-neo-black max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto">
			<div className="px-4 py-4 sm:px-6 sm:py-6">
				{/* User Info */}
				<div className="flex items-center border-b border-gray-200 pb-4 sm:pb-6 mb-4 sm:mb-6">
					<div className="mr-3 sm:mr-4 rounded-full bg-neo-lavender p-2 sm:p-3 border-2 border-neo-flame">
						<svg className="h-5 w-5 sm:h-6 sm:w-6 text-neo-flame" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
					</div>
					<div className="min-w-0">
						<p className="neo-text-bold text-neo-black text-sm sm:text-base truncate">{userData?.name}</p>
						<p className="neo-text text-neo-gray text-xs sm:text-sm truncate">{userData?.email}</p>
					</div>
				</div>

				{/* Menu Items */}
				<div className="flex flex-col space-y-1 sm:space-y-2 mb-4 sm:mb-6">
					{menuItems.map((item) => (
						<button
							key={item.id}
							onClick={() => {
								setActiveSection(item.id);
								setShowMobileMenu(false);
							}}
							className={`flex items-center rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-200 ${
								activeSection === item.id
									? "neo-card-3d-sunset bg-neo-flame text-white"
									: "neo-card-3d text-neo-black hover:bg-neo-lavender"
							}`}
						>
							<svg className="mr-3 h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								{item.icon}
							</svg>
							<span className="neo-text-bold text-sm sm:text-base truncate">{item.label}</span>
						</button>
					))}
				</div>

				{/* Logout Button */}
				<div className="border-t border-gray-200 pt-4 sm:pt-6">
					<button
						onClick={onLogout}
						className="neo-btn neo-btn-danger w-full flex items-center justify-center text-sm sm:text-base py-2.5 sm:py-3"
					>
						<svg className="mr-2 h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
						</svg>
						{t("auth.logout")}
					</button>
				</div>
			</div>
		</div>
	);
};

export default MobileMenu;
