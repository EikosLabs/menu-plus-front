import React from "react";
import AddBusinessForm from "../AddBusinessForm";
import AddMenuForm from "../AddMenuForm";
import BusinessList from "../BusinessList";

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
	onMenuAdded
}) => {
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
		<section className="mb-6 animate-fadeIn">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="flex items-center font-bold text-[#1A3A54] text-xl md:text-2xl">
					<svg
						className="mr-2 h-6 w-6 text-[#1a1a1a] md:mr-3 md:h-7 md:w-7"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
						/>
					</svg>
					Mi Negocio
				</h2>
				{businesses.length === 0 && (
					<button
						onClick={handleAddBusinessClick}
						className="flex transform items-center rounded-lg bg-gradient-to-r from-[#1a1a1a] to-[#404040] px-4 py-2 font-medium text-sm text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:brightness-110 md:px-5 md:py-3 md:text-base"
					>
						<svg
							className="mr-1.5 h-4 w-4 md:mr-2 md:h-5 md:w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
						</svg>
						<span>Añadir Negocio</span>
					</button>
				)}
			</div>

			{businesses.length > 0 && (
				<div className="mb-5 flex transform items-start rounded-lg border border-blue-100 bg-gradient-to-r from-[#EBF5F9] to-[#E6F4F8] p-4 shadow-sm transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md">
					<svg
						className="mr-3 h-6 w-6 flex-shrink-0 text-[#4A90E2]"
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
						<p className="font-semibold text-[#1A3A54] text-base">Información</p>
						<p className="text-gray-700">
							Cada usuario solo puede tener un negocio registrado en la plataforma y cada negocio solo puede tener un menú.
						</p>
					</div>
				</div>
			)}

			{showAddBusiness && (
				<div className="mb-6 animate-fadeInUp">
					<AddBusinessForm
						userId={userData?.id}
						onBusinessAdded={onBusinessAdded}
						onCancel={() => {
							setShowAddBusiness(false);
							setEditingBusiness(null);
						}}
						existingBusiness={editingBusiness}
						isEditing={!!editingBusiness}
					/>
				</div>
			)}

			{businesses.length > 0 && !showAddBusiness && !showAddMenu && (
				<BusinessList
					businesses={businesses}
					onAddMenuClick={handleAddMenuClick}
					onEditBusinessClick={handleEditBusinessClick}
					setBusinesses={setBusinesses}
				/>
			)}

			{showAddMenu && (
				<div className="mb-6 animate-fadeInUp">
					<AddMenuForm
						businessId={selectedBusinessId}
						onMenuAdded={onMenuAdded}
						onCancel={() => setShowAddMenu(false)}
					/>
				</div>
			)}
		</section>
	);
};

export default BusinessSection;