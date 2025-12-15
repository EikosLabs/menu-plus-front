import React, { useState, useEffect } from 'react';

const SimpleSuperAdminDashboard = () => {
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos del sistema con manejo mejorado de errores
  useEffect(() => {
    const fetchSystemStats = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.PUBLIC_API_URL || '/api';

        // Obtener token de cookies (forma más confiable)
        const getTokenFromCookies = () => {
          const cookies = document.cookie.split(';');
          for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'auth_token') {
              return value;
            }
          }
          return null;
        };

        const token = getTokenFromCookies();

        if (!token) {
          console.error('No authentication token found in cookies');
          throw new Error('No authentication token found');
        }

        console.log('Making API call to:', `${API_URL}/superadmin/statistics`);

        // Llamar a la API de estadísticas del sistema
        const response = await fetch(`${API_URL}/superadmin/statistics`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include' // Incluir cookies
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('API Error:', response.status, errorData);
          throw new Error(`API Error ${response.status}: ${errorData}`);
        }

        const data = await response.json();
        console.log('SuperAdmin data received:', data);
        setSystemStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching system stats:', err);
        setError(err.message);
        // No mostrar datos vacíos, mantener el estado de error
      } finally {
        setLoading(false);
      }
    };

    fetchSystemStats();
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white neo-card-3d p-6 border-4 border-neo-black">
        <h2 className="text-2xl font-bold text-neo-flame mb-4">
          SuperAdmin Dashboard
          {loading && <span className="text-lg font-normal text-gray-500 ml-2">⏳ Cargando...</span>}
          {error && <span className="text-lg font-normal text-red-500 ml-2">⚠️ Error: {error}</span>}
          {!loading && !error && systemStats && <span className="text-lg font-normal text-green-500 ml-2">✅ Datos cargados</span>}
        </h2>
        <p className="text-gray-700 mb-4">
          Panel de administración del sistema con estadísticas en tiempo real.
        </p>

        {systemStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-neo-flame">{formatNumber(systemStats.totalUsers || 0)}</div>
              <div className="text-sm text-gray-600">Usuarios</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neo-lavender">{formatNumber(systemStats.totalBusinesses || 0)}</div>
              <div className="text-sm text-gray-600">Negocios</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neo-mint">{formatNumber(systemStats.totalMenus || 0)}</div>
              <div className="text-sm text-gray-600">Menús</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{formatNumber(systemStats.totalScans || 0)}</div>
              <div className="text-sm text-gray-600">Escaneos</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-neo-flame text-white p-6 neo-card-3d border-4 border-neo-black">
          <h3 className="text-lg font-bold mb-2">Usuarios Totales</h3>
          <p className="text-3xl font-black">
            {loading ? '-' : formatNumber(systemStats?.totalUsers || 0)}
          </p>
          <p className="text-sm opacity-90 mt-2">
            {loading ? 'Cargando...' : systemStats ? `Usuarios registrados` : 'Sin datos'}
          </p>
        </div>

        <div className="bg-neo-lavender p-6 neo-card-3d border-4 border-neo-black">
          <h3 className="text-lg font-bold mb-2">Negocios Activos</h3>
          <p className="text-3xl font-black">
            {loading ? '-' : formatNumber(systemStats?.totalBusinesses || 0)}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {loading ? 'Cargando...' : systemStats ? `Negocios creados` : 'Sin datos'}
          </p>
        </div>

        <div className="bg-neo-mint p-6 neo-card-3d border-4 border-neo-black">
          <h3 className="text-lg font-bold mb-2">Menús Creados</h3>
          <p className="text-3xl font-black">
            {loading ? '-' : formatNumber(systemStats?.totalMenus || 0)}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {loading ? 'Cargando...' : systemStats ? `Menús digitales` : 'Sin datos'}
          </p>
        </div>

        <div className="bg-orange-500 text-white p-6 neo-card-3d border-4 border-neo-black">
          <h3 className="text-lg font-bold mb-2">Total Escaneos</h3>
          <p className="text-3xl font-black">
            {loading ? '-' : formatNumber(systemStats?.totalScans || 0)}
          </p>
          <p className="text-sm opacity-90 mt-2">
            {loading ? 'Cargando...' : systemStats ? `Códigos QR escaneados` : 'Sin datos'}
          </p>
        </div>

        <div className="bg-purple-500 text-white p-6 neo-card-3d border-4 border-neo-black">
          <h3 className="text-lg font-bold mb-2">Usuarios Owner</h3>
          <p className="text-3xl font-black">
            {loading ? '-' : formatNumber(systemStats?.usersByRole?.["Owner"] || 0)}
          </p>
          <p className="text-sm opacity-90 mt-2">
            {loading ? 'Cargando...' : systemStats ? `Dueños de negocio` : 'Sin datos'}
          </p>
        </div>

        <div className="bg-blue-500 text-white p-6 neo-card-3d border-4 border-neo-black">
          <h3 className="text-lg font-bold mb-2">Usuarios Regulares</h3>
          <p className="text-3xl font-black">
            {loading ? '-' : formatNumber(systemStats?.usersByRole?.["User"] || 0)}
          </p>
          <p className="text-sm opacity-90 mt-2">
            {loading ? 'Cargando...' : systemStats ? `Clientes finales` : 'Sin datos'}
          </p>
        </div>
      </div>

      <div className="bg-white neo-card-3d p-6 border-4 border-neo-black">
        <h3 className="text-xl font-bold text-neo-flame mb-4">Panel de Control</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => window.location.href = '/admin-super/users'}
            className="bg-neo-flame text-white px-4 py-3 neo-card-3d border-4 border-neo-black hover:shadow-lg transition-shadow font-bold"
          >
            👥 Ver Todos los Usuarios
          </button>
          <button
            onClick={() => window.location.href = '/admin-super/businesses'}
            className="bg-neo-lavender px-4 py-3 neo-card-3d border-4 border-neo-black hover:shadow-lg transition-shadow font-bold"
          >
            🏢 Gestión de Negocios
          </button>
          <button
            onClick={() => window.location.href = '/admin-super/reports'}
            className="bg-neo-mint px-4 py-3 neo-card-3d border-4 border-neo-black hover:shadow-lg transition-shadow font-bold"
          >
            📊 Reportes y Estadísticas
          </button>
          <button
            onClick={() => window.location.href = '/admin-super/settings'}
            className="bg-gray-200 px-4 py-3 neo-card-3d border-4 border-neo-black hover:shadow-lg transition-shadow font-bold"
          >
            ⚙️ Configuración del Sistema
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-red-700 font-semibold">Error al cargar datos:</p>
            <p className="text-red-600 text-sm">{error}</p>
            <div className="mt-3 text-xs text-gray-500">
              <p>Por favor, verifica tu conexión e intenta recargando la página manualmente si el problema persiste.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleSuperAdminDashboard;