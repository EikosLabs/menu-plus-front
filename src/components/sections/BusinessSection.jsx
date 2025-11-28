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
						Mi Negocio
					</h2>
					<p className="neo-text text-neo-gray text-sm sm:text-base lg:text-lg max-w-2xl">
						Gestiona tu negocio y menús digitales desde aquí
					</p>
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
							<span>Añadir Negocio</span>
						</button>
					</div>
				)}
			</div>

			{/* Info Message */}
			{businesses.length > 0 && (
				<div className="mb-6 sm:mb-8 neo-card-3d-sunset p-4 sm:p-5 lg:p-6">
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
							<p className="neo-text-bold mb-2 text-sm sm:text-base lg:text-lg">ℹ️ Información Importante</p>
							<p className="neo-text text-xs sm:text-sm lg:text-base leading-relaxed">
								Cada usuario solo puede tener un negocio registrado en la plataforma y cada negocio solo puede tener un menú principal.
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Forms */}
			{showAddBusiness && (
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
			)}

			{/* Business List */}
			{businesses.length > 0 && !showAddBusiness && !showAddMenu && (
				<div className="animate-fadeIn">
					<BusinessList
						businesses={businesses}
						onAddMenuClick={handleAddMenuClick}
						onEditBusinessClick={handleEditBusinessClick}
						setBusinesses={setBusinesses}
					/>
				</div>
			)}

			{/* Add Menu Form */}
			{showAddMenu && (
				<div className="mb-6 sm:mb-8 animate-fadeInUp">
					<AddMenuForm
						onMenuAdded={onMenuAdded}
						onCancel={() => setShowAddMenu(false)}
					/>
				</div>
			)}
		</section>
	);
};

export default BusinessSection;