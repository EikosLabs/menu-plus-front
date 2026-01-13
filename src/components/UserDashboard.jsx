import React, { useState, useEffect, Suspense, lazy } from "react";
import { useAuth } from "../hooks/useAuth";
import { useBusinesses } from "../hooks/useBusinesses";
import Navigation from "./ui/Navigation";
import MobileMenu from "./ui/MobileMenu";
import LoadingSpinner from "./ui/LoadingSpinner";
import ErrorAlert from "./ui/ErrorAlert";
import DashboardHeader from "./ui/DashboardHeader";
import Footer from "./ui/Footer";
import MultiImageMenuScanner from "./MultiImageMenuScanner";
import MenuAnalysisReview from "./MenuAnalysisReview";
import ProfileCompletionWidget from "./business/ProfileCompletionWidget";

const BusinessSection = lazy(() => import("./sections/BusinessSection"));
const ProfileSection = lazy(() => import("./sections/ProfileSection"));
const TemplateSection = lazy(() => import("./sections/TemplateSection"));

import UpgradeModal from "./subscription/UpgradeModal";
import { useSubscription } from "../hooks/useSubscription";

export default function UserDashboard() {
	const { userData, setUserData, loading: authLoading, logout, refreshUserData } = useAuth();
	const { businesses, setBusinesses, loading: businessLoading, error, setError, isRefreshing, addBusiness, addMenu, fetchBusinesses, refreshBusinesses } = useBusinesses();
	const { checkLimit } = useSubscription();

	const [showAddBusiness, setShowAddBusiness] = useState(false);
	const [showAddMenu, setShowAddMenu] = useState(false);
	const [selectedBusinessId, setSelectedBusinessId] = useState(null);
	const [showMobileMenu, setShowMobileMenu] = useState(false);
	const [activeSection, setActiveSection] = useState("negocios");
	const [showMenuScanner, setShowMenuScanner] = useState(false);
	const [showAnalysisReview, setShowAnalysisReview] = useState(false);
	const [analysisData, setAnalysisData] = useState(null);
	const [selectedMenuId, setSelectedMenuId] = useState(null);
	const [selectedFoodBusinessId, setSelectedFoodBusinessId] = useState(null);

	const [showUpgradeModal, setShowUpgradeModal] = useState(false);
	const [upgradeTrigger, setUpgradeTrigger] = useState("feature");

	// Wrappers for limits
	const handleSetShowAddBusiness = (show) => {
		if (show) {
			if (checkLimit('businesses', businesses?.length || 0)) {
				setShowAddBusiness(true);
			} else {
				setUpgradeTrigger('businesses');
				setShowUpgradeModal(true);
			}
		} else {
			setShowAddBusiness(false);
		}
	};

	const handleSetShowAddMenu = (show) => {
		if (show) {
			// Find total menus count? Or per business? usually global limit for free tier
			const totalMenus = businesses?.reduce((acc, b) => acc + (b.menus?.length || 0), 0) || 0;
			if (checkLimit('menus', totalMenus)) {
				setShowAddMenu(true);
			} else {
				setUpgradeTrigger('menus');
				setShowUpgradeModal(true);
			}
		} else {
			setShowAddMenu(false);
		}
	};

	// Verificar si el usuario necesita completar el onboarding
	useEffect(() => {
		if (businessLoading) return; // Esperar a que carguen los negocios

		const hasBusinesses = businesses && businesses.length > 0;

		// Si no tiene negocios, redirigir a onboarding (aplica tanto para registro normal como Google)
		if (!hasBusinesses) {
			// Limpiar la bandera de onboarding si existe
			localStorage.removeItem('needs_onboarding');
			window.location.href = '/onboarding';
			return;
		}

	}, [businesses, businessLoading]);

	const handleBusinessAdded = async (newBusiness) => {
		try {
			await addBusiness(newBusiness);
			await refreshUserData(); // Actualizar los datos del usuario
			setShowAddBusiness(false);
		} catch (error) {
			console.error("Error al agregar el negocio:", error);
		}
	};

	const handleMenuAdded = (newMenu) => {
		addMenu(newMenu);
		setShowAddMenu(false);
	};

	const handleMenuScanner = (businessId, menuId) => {
		setSelectedFoodBusinessId(businessId);
		setSelectedMenuId(menuId);
		setShowMenuScanner(true);
	};

	// ... (rest of methods)

	if (authLoading || businessLoading) {
		return <LoadingSpinner />;
	}

	return (
		<div className="flex min-h-screen flex-col bg-neo-lavender relative">
			<UpgradeModal
				isOpen={showUpgradeModal}
				onClose={() => setShowUpgradeModal(false)}
				trigger={upgradeTrigger}
			/>

			{/* Animated Background Pattern */}
			<div className="absolute inset-0 neo-bg-dots opacity-10 pointer-events-none"></div>

			<Navigation
				userData={userData}
				showMobileMenu={showMobileMenu}
				setShowMobileMenu={setShowMobileMenu}
				activeSection={activeSection}
				setActiveSection={setActiveSection}
				onLogout={logout}
			/>

			{showMobileMenu && (
				<MobileMenu
					userData={userData}
					activeSection={activeSection}
					setActiveSection={setActiveSection}
					setShowMobileMenu={setShowMobileMenu}
					onLogout={logout}
				/>
			)}

			<main className="container mx-auto flex-grow px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 xl:py-10 pb-20 relative z-0">
				<DashboardHeader activeSection={activeSection} />
				<ErrorAlert error={error} onClose={() => setError(null)} />

				{/* Profile Completion Widget - Show when user has businesses */}
				{businesses && businesses.length > 0 && activeSection === "negocios" && (
					<div className="mb-6 max-w-md">
						<ProfileCompletionWidget
							businessData={businesses[0]}
							onSectionClick={(sectionId) => {
								// Handle section clicks for navigation
								console.log('Profile section clicked:', sectionId);
								// You can add navigation logic here
							}}
						/>
					</div>
				)}

				<Suspense fallback={<LoadingSpinner />}>
					{activeSection === "negocios" && (
						<BusinessSection
							businesses={businesses}
							setBusinesses={setBusinesses}
							userData={userData}
							showAddBusiness={showAddBusiness}
							setShowAddBusiness={handleSetShowAddBusiness}
							showAddMenu={showAddMenu}
							setShowAddMenu={handleSetShowAddMenu}
							selectedBusinessId={selectedBusinessId}
							setSelectedBusinessId={setSelectedBusinessId}
							onBusinessAdded={handleBusinessAdded}
							onMenuAdded={handleMenuAdded}
							onMenuScanner={handleMenuScanner}
							onRefresh={refreshBusinesses}
							isRefreshing={isRefreshing}
						/>
					)}

					{activeSection === "templates" && (
						<TemplateSection businesses={businesses} onTemplateUpdated={fetchBusinesses} />
					)}
					{activeSection === "perfil" && <ProfileSection />}
				</Suspense>

			</main>

			<Footer />

			{/* Menu Scanner Modal - Outside main to be above everything */}
			{showMenuScanner && (
				<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
					<div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-y-auto relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
						<MultiImageMenuScanner
							onAnalysisComplete={handleAnalysisComplete}
							onCancel={handleScannerCancel}
							menuId={selectedMenuId}
							foodBusinessId={selectedFoodBusinessId}
						/>
					</div>
				</div>
			)}

			{/* Analysis Review Modal - Outside main to be above everything */}
			{showAnalysisReview && analysisData && (
				<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" onClick={handleAnalysisBack}>
					<div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-y-auto relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
						<MenuAnalysisReview
							analysisData={analysisData}
							onBack={handleAnalysisBack}
							onComplete={handleAnalysisSaveComplete}
							menuId={selectedMenuId}
							foodBusinessId={selectedFoodBusinessId}
						/>
					</div>
				</div>
			)}

			<style jsx="true">{`
				@keyframes slideDown {
					from { transform: translateY(-20px); opacity: 0; }
					to { transform: translateY(0); opacity: 1; }
				}
				@keyframes fadeIn {
					from { opacity: 0; }
					to { opacity: 1; }
				}
				@keyframes fadeInUp {
					from { opacity: 0; transform: translateY(20px); }
					to { opacity: 1; transform: translateY(0); }
				}
				.animate-slideDown { animation: slideDown 0.3s ease-out forwards; }
				.animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
				.animate-fadeInUp { animation: fadeInUp 0.4s ease-out forwards; }
			`}</style>
		</div>
	);
}
