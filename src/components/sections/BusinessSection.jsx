import React from "react";
import { useTranslation, formatNumber } from "../../i18n/utils";
import AddBusinessForm from "../AddBusinessForm";
import AddMenuForm from "../AddMenuForm";
import BusinessList from "../BusinessListSafe";

const BusinessSection = ({
	businesses,
	setBusinesses,
	userData,
	showAddBusiness,
	setShowAddBusiness,
	showAddMenu,
	setShowAddMenu,
	selectedBusinessId,
	setSelectedBusinessId,
	onBusinessAdded,
	onMenuAdded,
	onMenuScanner,
	onRefresh,
	isRefreshing
}) => {
	const { t } = useTranslation();
	const [editingBusiness, setEditingBusiness] = React.useState(null);

	const handleAddBusinessClick = () => {
		setEditingBusiness(null);
		setShowAddBusiness(true);
		setShowAddMenu(false);
	};

	const handleEditBusinessClick = (business) => {
		setEditingBusiness(business);
		setShowAddBusiness(true);
		setShowAddMenu(false);
	};

	const handleAddMenuClick = (businessId) => {
		setSelectedBusinessId(businessId);
		setShowAddMenu(true);
		setShowAddBusiness(false);
	};

	return (
		<section className="mb-6 sm:mb-8 lg:mb-10 animate-fadeIn">
			{/* Header with Title and Actions */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mb-6 sm:mb-8">
				<div className="lg:col-span-8">
					<h2 className="flex items-center neo-heading neo-h3 text-xl sm:text-2xl lg:text-3xl mb-2 sm:mb-3">
						<svg
							className="mr-2 h-5 w-5 text-neo-flame sm:mr-3 sm:h-6 sm:w-6 lg:mr-4 lg:h-7 lg:w-7 flex-shrink-0"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2.5}
								d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
							/>
						</svg>
						{t("dashboard.myBusinesses")}
					</h2>
					<p className="neo-text text-neo-gray text-sm sm:text-base lg:text-lg max-w-2xl">
						{t("dashboard.welcome")}
					</p>

					{/* Stats Summary */}
					<div className="mt-4 inline-flex items-center bg-white border-2 border-neo-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg px-4 py-2">
						<div className="mr-3 bg-neo-yellow p-1.5 rounded border border-black">
							<svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
							</svg>
						</div>
						<div>
							<p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t("common.totalViews")}</p>
							<p className="text-xl font-black text-neo-black leading-none">
								{formatNumber(businesses?.reduce((acc, business) => {
									return acc + (business.menus?.reduce((menuAcc, menu) => {
										return menuAcc + (menu.scanCount || menu.ScanCount || 0);
									}, 0) || 0);
								}, 0) || 0)}
							</p>
						</div>
					</div>
				</div>

				{businesses.length === 0 && (
					<div className="lg:col-span-4 flex lg:justify-end">
						<button
							onClick={handleAddBusinessClick}
							className="neo-btn neo-btn-primary flex items-center text-sm sm:text-base w-full lg:w-auto justify-center"
						>
							<svg
								className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
							</svg>
							<span>{t("business.addBusiness")}</span>
						</button>
					</div>
				)}
			</div>

			{/* Forms */}
			{
				showAddBusiness && (
					<div className="mb-6 sm:mb-8 animate-fadeInUp">
						<AddBusinessForm
							onBusinessAdded={onBusinessAdded}
							onCancel={() => {
								setShowAddBusiness(false);
								setEditingBusiness(null);
							}}
							existingBusiness={editingBusiness}
							isEditing={!!editingBusiness}
						/>
					</div>
				)
			}

			{/* Business List */}
			{
				businesses.length > 0 && !showAddBusiness && !showAddMenu && (
					<div className="animate-fadeIn">
						<BusinessList
							businesses={businesses}
							onAddMenuClick={handleAddMenuClick}
							onEditBusinessClick={handleEditBusinessClick}
							setBusinesses={setBusinesses}
							onMenuScanner={onMenuScanner}
							onRefresh={onRefresh}
							isRefreshing={isRefreshing}
						/>
					</div>
				)
			}

			{/* Add Menu Form */}
			{
				showAddMenu && (
					<div className="mb-6 sm:mb-8 animate-fadeInUp">
						<AddMenuForm
							onMenuAdded={onMenuAdded}
							onCancel={() => setShowAddMenu(false)}
						/>
					</div>
				)
			}
		</section >
	);
};

export default BusinessSection;