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
      const userBusinesses = await menuService.getUserBusinesses(userData.id);
      setBusinesses(userBusinesses);
      setShowAddMenu(false);
    } catch (error) {
      console.error("Error al recargar los negocios:", error);
      setError("Se agregó el menú pero no se pudo actualizar la lista. Por favor, recarga la página.");
      
      setBusinesses(prevBusinesses => 
        prevBusinesses.map(business => {
          if (business.id === selectedBusinessId) {
            return {
              ...business,
              menus: [newMenu] 
            };
          }
          return business;
        })
      );
    }
  };

  const handleLogout = () => {
    authService.logout();
    
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#E6F4F8]">
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E05C33]"></div>
          <p className="text-[#004E71] mt-4 font-medium">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#E6F4F8]">
          {}
      <nav className="bg-gradient-to-r from-[#003A57] to-[#004E71] p-4 shadow-xl sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-white rounded-lg p-1.5 mr-3 shadow-md">
              <svg className="w-6 h-6 text-[#E05C33]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-wide">Menu Plus</span>
          </div>
          <div className="flex items-center">
            <div className="hidden md:flex items-center mr-6">
              <span className="text-white opacity-75 mr-1">|</span>
              <span className="text-white ml-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {userData.name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-[#E05C33] to-[#FF7E45] text-white font-medium py-2 px-5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center hover:brightness-110"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow container mx-auto px-4 py-8 md:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-xl p-7 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4A90E2] mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-[#4A90E2] font-medium">Panel de Control / Mis Negocios</span>
              </div>
              <h1 className="text-3xl font-bold text-[#1A3A54] tracking-tight">Panel de Control</h1>
              <p className="text-gray-600 mt-2 text-lg">Gestiona tu negocio y menú digital desde un solo lugar.</p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="bg-gradient-to-r from-[#EBF5F9] to-[#E6F4F8] rounded-lg p-4 flex items-start shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#4A90E2] mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        
        
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#1A3A54] flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-[#E05C33]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Mi Negocio
            </h2>
            {businesses.length === 0 && (
              <button 
                onClick={handleAddBusinessClick}
                className="bg-gradient-to-r from-[#E05C33] to-[#FF7E45] text-white font-medium py-3 px-5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center hover:brightness-110"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Añadir Negocio</span>
              </button>
            )}
          </div>
          
          {businesses.length > 0 && (
            <div className="bg-gradient-to-r from-[#EBF5F9] to-[#E6F4F8] rounded-lg p-4 flex items-start mb-6 shadow-sm border border-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#4A90E2] mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm">
                <p className="font-semibold text-[#1A3A54] text-base">Información</p>
                <p className="text-gray-700">Cada usuario solo puede tener un negocio registrado en la plataforma y cada negocio solo puede tener un menú.</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-center mb-6 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}
          
          {showAddBusiness ? (
            <div className="mb-8">
              <AddBusinessForm 
                userId={userData?.id}
                onBusinessAdded={handleBusinessAdded} 
                onCancel={() => setShowAddBusiness(false)}
              />
            </div>
          ) : null}
          
          {showAddMenu ? (
            <div className="mb-8">
              <AddMenuForm 
                businessId={selectedBusinessId} 
                onMenuAdded={handleMenuAdded} 
                onCancel={() => setShowAddMenu(false)}
              />
            </div>
          ) : null}
          
          {businesses.length > 0 ? (
            <BusinessList 
              businesses={businesses} 
              onAddMenuClick={handleAddMenuClick} 
            />
          ) : (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-14 text-center shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="bg-gradient-to-r from-[#EBF5F9] to-[#E6F4F8] inline-flex p-5 rounded-full mb-6 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-[#4A90E2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#1A3A54] mb-3">No tienes un negocio registrado</h3>
              <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg">Para comenzar a crear un menú digital, debes registrar tu negocio. ¡Es rápido y sencillo!</p>
              <button 
                onClick={handleAddBusinessClick}
                className="bg-gradient-to-r from-[#E05C33] to-[#FF7E45] text-white font-semibold py-3.5 px-8 rounded-lg shadow-lg transition-all duration-300 inline-flex items-center hover:shadow-xl hover:brightness-110"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Crear Mi Negocio
              </button>
            </div>
          )}
        </section>
      </main>

      <footer className="bg-gradient-to-r from-[#003A57] to-[#004E71] text-center py-5">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-white">
          <p className="text-sm mb-2 md:mb-0 font-medium">
            &copy; {new Date().getFullYear()} Menu Plus. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-sm hover:text-[#FFB178] transition-colors font-medium">Términos de Servicio</a>
            <a href="#" className="text-sm hover:text-[#FFB178] transition-colors font-medium">Privacidad</a>
            <a href="#" className="text-sm hover:text-[#FFB178] transition-colors font-medium">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
} 