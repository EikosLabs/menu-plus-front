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
			<div className="mb-6 flex items-center justify-between">
				<h2 className="flex items-center neo-heading neo-h3">
					<svg
						className="mr-2 h-6 w-6 text-neo-flame md:mr-3 md:h-7 md:w-7"
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
				{businesses.length === 0 && (
					<button
						onClick={handleAddBusinessClick}
						className="neo-btn neo-btn-primary flex items-center"
					>
						<svg
							className="mr-2 h-5 w-5"
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
				<div className="mb-6 neo-card-3d-sunset p-4">
					<div className="flex items-start">
						<svg
							className="mr-3 h-6 w-6 flex-shrink-0"
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
						<div>
							<p className="neo-text-bold mb-1">ℹ️ Información</p>
							<p className="neo-text text-sm">
								Cada usuario solo puede tener un negocio registrado en la plataforma y cada negocio solo puede tener un menú.
							</p>
						</div>
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
