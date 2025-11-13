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
		<div className="absolute top-16 right-0 left-0 z-10 origin-top transform animate-slideDown bg-white px-4 py-4 shadow-xl transition-all duration-300 md:hidden">
			<div className="flex flex-col space-y-3">
				<div className="flex items-center border-gray-100 border-b py-3">
					<div className="mr-3 rounded-full bg-[#004E71] bg-opacity-10 p-2">
						<svg className="h-5 w-5 text-[#003A57]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
					</div>
					<span className="font-medium text-[#003A57]">{userData?.name}</span>
				</div>

				<div className="flex flex-col space-y-1">
					{menuItems.map((item) => (
						<button
							key={item.id}
							onClick={() => {
								setActiveSection(item.id);
								setShowMobileMenu(false);
							}}
							className={`flex items-center rounded-lg px-4 py-3 ${
								activeSection === item.id
									? "bg-blue-50 font-medium text-blue-600"
									: "text-gray-700 hover:bg-gray-50"
							}`}
						>
							<svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								{item.icon}
							</svg>
							{item.label}
						</button>
					))}
				</div>

				<div className="mt-2 border-gray-100 border-t pt-2">
					<button
						onClick={onLogout}
						className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#1a1a1a] to-[#404040] px-4 py-3 font-medium text-white shadow-md"
					>
						<svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
