import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import menuService from '../services/menuService';
import BusinessList from './BusinessList';
import AddBusinessForm from './AddBusinessForm';
import AddMenuForm from './AddMenuForm';

export default function UserDashboard() {
  const [userData, setUserData] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddBusiness, setShowAddBusiness] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeSection, setActiveSection] = useState('negocios');

  useEffect(() => {
    const currentUserId = authService.getUserId();

    if (!currentUserId) {
      console.log('UserDashboard: No authenticated user ID found. Redirecting to login.');
      window.location.href = '/login';
      return; // Detener la ejecución si no hay ID de usuario
    }

    // Si el usuario está autenticado, proceder a cargar sus datos.
    // El middleware.js ya debería proteger esta ruta, pero esta es una doble verificación.
    if (!authService.isAuthenticated()) {
      console.log('UserDashboard: isAuthenticated is false. Redirecting to login.');
      window.location.href = '/login';
      return;
    }
    
    const fetchData = async () => {
      setLoading(true); 
      try {
          const userDataForState = {
          id: currentUserId,
          name: `Usuario (ID: ${currentUserId})`,
          email: `user_${currentUserId}@example.com`, 
          role: "Cliente"
        };
        setUserData(userDataForState);
        
        console.log("UserDashboard: Fetching businesses for user ID:", currentUserId);
        
        const userBusinesses = await menuService.getUserBusinesses(currentUserId);
        setBusinesses(userBusinesses);
        setError(null);
      } catch (error) {
        console.error("UserDashboard: Error fetching data:", error);
        setError("No se pudieron cargar los datos del dashboard. Por favor, verifique su conexión e intente de nuevo.");
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleAddBusinessClick = () => {
    setShowAddBusiness(true);
    setShowAddMenu(false);
  };

  const handleAddMenuClick = (businessId) => {
    setSelectedBusinessId(businessId);
    setShowAddMenu(true);
    setShowAddBusiness(false);
  };

  const handleBusinessAdded = async (newBusiness) => {
    try {
      const userBusinesses = await menuService.getUserBusinesses(userData.id);
      setBusinesses(userBusinesses);
      setShowAddBusiness(false);
    } catch (error) {
      console.error("Error al recargar los negocios:", error);
      setError("Se agregó el negocio pero no se pudo actualizar la lista. Por favor, recarga la página.");
      
      setBusinesses(prevBusinesses => [...prevBusinesses, {
        ...newBusiness,
        menus: []
      }]);
    }
  };

  const handleMenuAdded = async (newMenu) => {
    try {
      setBusinesses(prevBusinesses =>
        prevBusinesses.map(business =>
          business.id === newMenu.foodBusinessId
            ? { ...business, menus: [newMenu], hasMenu: true }
            : business
        )
      );
      setShowAddMenu(false);
      setError(null);
      console.log('UserDashboard: Estado de businesses actualizado con el nuevo menú (optimista).', newMenu);

    } catch (error) {
      console.error("UserDashboard: Error al actualizar UI después de añadir menú:", error);
      setError("Se agregó el menú pero ocurrió un error al actualizar la vista. Por favor, recarga la página.");
    }
  };

  const handleLogout = () => {
    authService.logout();
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="bg-white p-8 rounded-xl shadow-xl flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E05C33]"></div>
          <p className="text-[#004E71] mt-4 font-medium text-lg">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F8FAFC] to-[#EEF6FB] transition-all duration-300">
      <nav className="bg-gradient-to-r from-[#003A57] to-[#004E71] p-4 shadow-xl sticky top-0 z-20 transition-all duration-300">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-white rounded-lg p-1.5 mr-2 shadow-md">
              <img src="/favicon.svg" alt="Menu Plus Logo" className="w-6 h-6" />
            </div>
            <h1 className="text-white font-bold text-lg md:text-xl">Menu Plus</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              <span className="font-medium">{userData?.name}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-[#E05C33] to-[#FF7E45] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center hover:brightness-110 transform hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
          
          <button 
            className="md:hidden text-white p-2 focus:outline-none"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label={showMobileMenu ? "Cerrar menú" : "Abrir menú"}
          >
            {showMobileMenu ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {showMobileMenu && (
        <div className="md:hidden bg-white shadow-xl py-4 px-4 absolute top-16 left-0 right-0 z-10 transition-all duration-300 transform origin-top animate-slideDown">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center py-3 border-b border-gray-100">
              <div className="bg-[#004E71] bg-opacity-10 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#003A57]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-[#003A57] font-medium">{userData?.name}</span>
            </div>
            
            <div className="flex flex-col space-y-1">
              <button 
                onClick={() => { setActiveSection('negocios'); setShowMobileMenu(false); }}
                className={`py-3 px-4 rounded-lg flex items-center ${activeSection === 'negocios' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Mis Negocios
              </button>
              
              <button 
                onClick={() => { setActiveSection('estadisticas'); setShowMobileMenu(false); }}
                className={`py-3 px-4 rounded-lg flex items-center ${activeSection === 'estadisticas' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Estadísticas
              </button>
              
              <button 
                onClick={() => { setActiveSection('perfil'); setShowMobileMenu(false); }}
                className={`py-3 px-4 rounded-lg flex items-center ${activeSection === 'perfil' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mi Perfil
              </button>
            </div>
            
            <div className="pt-2 border-t border-gray-100 mt-2">
              <button 
                onClick={handleLogout}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#E05C33] to-[#FF7E45] text-white font-medium rounded-lg shadow-md flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow container mx-auto px-4 py-6 md:py-8 md:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-xl p-5 mb-6 border border-gray-100 transform transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4A90E2] mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-[#4A90E2] font-medium">Panel de Control / {activeSection === 'negocios' ? 'Mis Negocios' : (activeSection === 'estadisticas' ? 'Estadísticas' : 'Mi Perfil')}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1A3A54] tracking-tight">Panel de Control</h1>
              <p className="text-gray-600 mt-2 text-base md:text-lg">Gestiona tu negocio y menú digital desde un solo lugar.</p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="bg-gradient-to-r from-[#EBF5F9] to-[#E6F4F8] rounded-lg p-4 flex items-start shadow-sm transform transition hover:shadow-md hover:translate-y-[-2px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#4A90E2] mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <p className="font-semibold text-[#1A3A54] text-base">Consejo Pro</p>
                  <p className="text-gray-700">Crea un menú atractivo para atraer más clientes a tu negocio.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-center mb-5 shadow-sm animate-fadeIn">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium text-sm md:text-base">{error}</span>
            <button 
              onClick={() => setError(null)} 
              className="ml-auto text-red-500 hover:text-red-700"
              aria-label="Cerrar mensaje de error"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {activeSection === 'negocios' && (
          <section className="mb-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-[#1A3A54] flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-7 md:w-7 mr-2 md:mr-3 text-[#E05C33]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Mi Negocio
            </h2>
            {businesses.length === 0 && (
              <button 
                onClick={handleAddBusinessClick}
                  className="bg-gradient-to-r from-[#E05C33] to-[#FF7E45] text-white font-medium py-2 md:py-3 px-4 md:px-5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center hover:brightness-110 text-sm md:text-base transform hover:scale-105"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Añadir Negocio</span>
              </button>
            )}
          </div>
          
          {businesses.length > 0 && (
              <div className="bg-gradient-to-r from-[#EBF5F9] to-[#E6F4F8] rounded-lg p-4 flex items-start mb-5 shadow-sm border border-blue-100 transform transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#4A90E2] mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm">
                <p className="font-semibold text-[#1A3A54] text-base">Información</p>
                <p className="text-gray-700">Cada usuario solo puede tener un negocio registrado en la plataforma y cada negocio solo puede tener un menú.</p>
              </div>
            </div>
          )}
          
            {showAddBusiness && (
              <div className="mb-6 animate-fadeInUp">
              <AddBusinessForm 
                userId={userData?.id}
                onBusinessAdded={handleBusinessAdded} 
                onCancel={() => setShowAddBusiness(false)}
              />
            </div>
            )}
            
            {businesses.length > 0 && !showAddBusiness && !showAddMenu && (
              <BusinessList 
                businesses={businesses} 
                onAddMenuClick={handleAddMenuClick} 
                setBusinesses={setBusinesses}
              />
            )}
            
            {showAddMenu && (
              <div className="mb-6 animate-fadeInUp">
              <AddMenuForm 
                businessId={selectedBusinessId} 
                onMenuAdded={handleMenuAdded} 
                onCancel={() => setShowAddMenu(false)}
              />
            </div>
            )}
          </section>
        )}

        {activeSection === 'estadisticas' && (
          <section className="mb-6 bg-white shadow-lg rounded-xl p-6 animate-fadeIn">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-[#1A3A54]">Estadísticas</h2>
            </div>
            <p className="text-gray-600 mb-6">Esta función estará disponible próximamente. ¡Mantente atento a las actualizaciones!</p>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 mb-4">
              <p className="text-blue-700 text-sm">Aquí podrás ver estadísticas sobre las visitas a tu menú, platillos populares y más.</p>
            </div>
          </section>
        )}

        {activeSection === 'perfil' && (
          <section className="mb-6 bg-white shadow-lg rounded-xl p-6 animate-fadeIn">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-[#1A3A54]">Mi Perfil</h2>
            </div>
            <p className="text-gray-600 mb-6">Esta función estará disponible próximamente. ¡Mantente atento a las actualizaciones!</p>
            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400 mb-4">
              <p className="text-purple-700 text-sm">Aquí podrás actualizar tus datos personales, cambiar tu contraseña y configurar preferencias.</p>
            </div>
          </section>
          )}
      </main>

      <footer className="bg-white py-4 border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} Menu Plus. Todos los derechos reservados.</p>
        </div>
      </footer>

      <style jsx>{`
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