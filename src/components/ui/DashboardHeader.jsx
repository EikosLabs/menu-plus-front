import React from "react";
import { useTranslation } from "../../i18n/utils";

const DashboardHeader = ({ activeSection }) => {
    const { t } = useTranslation();
    const getSectionTitle = () => {
        switch (activeSection) {
            case "negocios":
                return t("dashboard.myBusinesses");
            case "templates":
                return t("navigation.templates");
            case "estadisticas":
                return t("navigation.dashboard");
            case "perfil":
                return t("navigation.profile");
            default:
                return t("dashboard.myBusinesses");
        }
    };

	return (
		<div className="mb-4 sm:mb-6 lg:mb-8 neo-card-3d p-4 sm:p-6 lg:p-8 mt-4 sm:mt-6 lg:mt-8">
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
				{/* Title Section */}
				<div className="lg:col-span-8">
                    <div className="mb-3 sm:mb-4 flex items-center">
						<svg
							className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-neo-flame flex-shrink-0"
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
                        <span className="neo-text-bold text-neo-flame text-xs sm:text-sm lg:text-base truncate">
                            {t("dashboard.title")} / {getSectionTitle()}
                        </span>
                    </div>
                    <h1 className="neo-heading neo-h2 text-xl sm:text-2xl lg:text-3xl xl:text-4xl break-words">
                        {t("dashboard.title")}
                    </h1>
                    <p className="neo-text text-neo-gray mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg max-w-3xl">
                        {t("dashboard.welcome")}
                    </p>
                </div>

				{/* Pro Tip Section */}
				<div className="lg:col-span-4">
					<div className="neo-card-3d-sunset p-4 sm:p-5 lg:p-6 h-full">
						<div className="flex items-start gap-3 sm:gap-4">
							<svg
								className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 flex-shrink-0 text-neo-flame mt-0.5"
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
							<div className="min-w-0 flex-1">
                                <p className="neo-text-bold mb-2 text-sm sm:text-base lg:text-lg">💡 {t("dashboard.proTipTitle")}</p>
                                <p className="neo-text text-xs sm:text-sm lg:text-base leading-relaxed">
                                    {t("dashboard.proTipText")}
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