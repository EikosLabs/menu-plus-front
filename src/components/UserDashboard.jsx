import React, { useState, useEffect, Suspense, lazy } from "react";
import { useAuth } from "../hooks/useAuth";
import { useBusinesses } from "../hooks/useBusinesses";
import Navigation from "./ui/Navigation";
import MobileMenu from "./ui/MobileMenu";
import LoadingSpinner from "./ui/LoadingSpinner";
import ErrorAlert from "./ui/ErrorAlert";
import DashboardHeader from "./ui/DashboardHeader";

const BusinessSection = lazy(() => import("./sections/BusinessSection"));
const StatsSection = lazy(() => import("./sections/StatsSection"));
const ProfileSection = lazy(() => import("./sections/ProfileSection"));
const TemplateSection = lazy(() => import("./sections/TemplateSection"));

export default function UserDashboard() {
	const { userData, setUserData, loading: authLoading, logout, refreshUserData } = useAuth();
	const { businesses, setBusinesses, loading: businessLoading, error, setError, addBusiness, addMenu, fetchBusinesses } = useBusinesses();
	
	const [showAddBusiness, setShowAddBusiness] = useState(false);
	const [showAddMenu, setShowAddMenu] = useState(false);
	const [selectedBusinessId, setSelectedBusinessId] = useState(null);
	const [showMobileMenu, setShowMobileMenu] = useState(false);
	const [activeSection, setActiveSection] = useState("negocios");

	// Verificar si el usuario necesita completar el onboarding
	useEffect(() => {
		if (businessLoading) return; // Esperar a que carguen los negocios
		
		const needsOnboarding = localStorage.getItem('needs_onboarding');
		const hasBusinesses = businesses && businesses.length > 0;
		
		// 1. Si no tiene negocios, redirigir a onboarding del negocio
		if (needsOnboarding === 'true' && !hasBusinesses) {
			window.location.href = '/onboarding';
			return;
		}
		
		// 2. Si tiene negocio pero no tiene menú, redirigir a onboarding del menú
		if (hasBusinesses) {
			const business = businesses[0];
			const hasMenu = business.menus && business.menus.length > 0;
			
			if (!hasMenu) {
				// No tiene menú, activar onboarding del menú
				localStorage.setItem('needs_menu_onboarding', 'true');
				window.location.href = '/menu-onboarding';
			} else {
				// Ya tiene menú, limpiar el flag si existe
				localStorage.removeItem('needs_menu_onboarding');
			}
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

	if (authLoading || businessLoading) {
		return <LoadingSpinner />;
	}

	return (
		<div className="flex min-h-screen flex-col bg-neo-lavender relative">
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

			<main className="container mx-auto flex-grow px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 relative z-0">
				<DashboardHeader activeSection={activeSection} />
				<ErrorAlert error={error} onClose={() => setError(null)} />


				<Suspense fallback={<LoadingSpinner />}>
					{activeSection === "negocios" && (
						<BusinessSection
							businesses={businesses}
							setBusinesses={setBusinesses}
							userData={userData}
							showAddBusiness={showAddBusiness}
							setShowAddBusiness={setShowAddBusiness}
							showAddMenu={showAddMenu}
							setShowAddMenu={setShowAddMenu}
							selectedBusinessId={selectedBusinessId}
							setSelectedBusinessId={setSelectedBusinessId}
							onBusinessAdded={handleBusinessAdded}
							onMenuAdded={handleMenuAdded}
						/>
					)}

					{activeSection === "templates" && (
						<TemplateSection businesses={businesses} onTemplateUpdated={fetchBusinesses} />
					)}
					{activeSection === "estadisticas" && <StatsSection />}
					{activeSection === "perfil" && <ProfileSection />}
				</Suspense>
			</main>

			<footer className="mt-auto bg-neo-black text-white border-t-neo-thick border-neo-flame py-6 relative z-0">
				<div className="container mx-auto px-4 text-center">
					<p className="neo-text text-white/80">© {new Date().getFullYear()} Menu Plus. Todos los derechos reservados.</p>
				</div>
			</footer>

			<style jsx={true}>{`
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
