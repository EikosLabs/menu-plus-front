import React, { useState, useEffect, useCallback } from 'react';
import SystemStatsCard from './SystemStatsCard.jsx';
import UserActivityTable from './UserActivityTable.jsx';
import BusinessOverviewChart from './BusinessOverviewChart.jsx';
import TrendsChart from './TrendsChart.jsx';
import SuperAdminService from '../../services/superadminService.js';
import { ApiClient } from '../../services/ApiClient.js';
import authService from '../../services/authService.js';
import { TokenInterceptor } from '../../services/tokenInterceptor.js';

const SuperAdminDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create API client using the same pattern as menuService
  const API_URL = import.meta.env.PUBLIC_API_URL || '/api';
  const tokenInterceptor = new TokenInterceptor(authService);
  const apiClient = new ApiClient(API_URL, authService, tokenInterceptor);
  const superadminService = new SuperAdminService(apiClient);

  // Load user data and check SuperAdmin role
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (!authService.isAuthenticated()) {
          window.location.href = '/login';
          return;
        }

        if (authService.isTokenExpired()) {
          authService.logout();
          window.location.href = '/login';
          return;
        }

        const isSuperAdmin = authService.isSuperAdmin();
        const userId = authService.getUserId();

        if (!isSuperAdmin) {
          window.location.href = '/dashboard';
          return;
        }

        setUserData({
          id: userId,
          name: "Super Administrator",
          email: `superadmin@menusesqr.online`,
          role: "Super Admin",
          isSuperAdmin: true,
        });
      } catch (error) {
        console.error('Error loading user data:', error);
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neo-lavender">
        <div className="neo-card-3d p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neo-flame"></div>
        </div>
      </div>
    );
  }

  if (!userData?.isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neo-lavender">
        <div className="neo-card-3d p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 3.329-1.414l3.414-3.414a2 2 0 002.828 0l-1.414 1.414a2 2 0 00-2.828 0 2 2 0 002.828 0z" />
              </svg>
            </div>
            <h1 className="neo-heading neo-h3 text-neo-flame mb-4">Acceso Denegado</h1>
            <p className="text-gray-600 mb-6">
              No tienes permisos de SuperAdmin para acceder a esta página.
            </p>
            <button
              onClick={() => window.location.href = "/dashboard"}
              className="neo-btn-primary w-full"
            >
              Ir al Dashboard Principal
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [systemStats, setSystemStats] = useState(null);
  const [userActivity, setUserActivity] = useState(null);
  const [businessOverview, setBusinessOverview] = useState(null);
  const [dataLoading, setDataLoading] = useState({
    stats: false,
    activity: false,
    business: false,
    trends: false
  });
  const [error, setError] = useState(null);

  // Load system statistics
  const loadSystemStats = useCallback(async () => {
    setDataLoading(prev => ({ ...prev, stats: true }));
    try {
      const data = await superadminService.getSystemStatistics();
      setSystemStats(data);
    } catch (error) {
      console.error('Error loading system stats:', error);
      setError('Error al cargar estadísticas del sistema');
    } finally {
      setDataLoading(prev => ({ ...prev, stats: false }));
    }
  }, []);

  // Load user activity
  const loadUserActivity = useCallback(async () => {
    setDataLoading(prev => ({ ...prev, activity: true }));
    try {
      const data = await superadminService.getUserActivity();
      setUserActivity(data);
    } catch (error) {
      console.error('Error loading user activity:', error);
      setError('Error al cargar actividad de usuarios');
    } finally {
      setDataLoading(prev => ({ ...prev, activity: false }));
    }
  }, []);

  // Load business overview
  const loadBusinessOverview = useCallback(async () => {
    setDataLoading(prev => ({ ...prev, business: true }));
    try {
      const data = await superadminService.getBusinessOverview();
      setBusinessOverview(data);
    } catch (error) {
      console.error('Error loading business overview:', error);
      setError('Error al cargar overview de negocios');
    } finally {
      setDataLoading(prev => ({ ...prev, business: false }));
    }
  }, []);

  // Load all data on mount
  useEffect(() => {
    loadSystemStats();
    loadUserActivity();
    loadBusinessOverview();
  }, []);

  // Format number with locale
  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  // Format percentage
  const formatPercentage = (num) => {
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="neo-card-3d p-6 border-2 border-red-500">
          <div className="text-red-500 font-medium">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 neo-btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neo-lavender">
      {/* SuperAdmin Header */}
      <div className="neo-card-3d m-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="neo-heading neo-h2 text-neo-flame">Panel de SuperAdmin</h1>
            <p className="text-gray-600 mt-2">
              Monitoreo del sistema y gestión de usuarios
            </p>
          </div>
          <button
            onClick={() => window.location.href = "/dashboard"}
            className="neo-btn-secondary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Dashboard
          </button>
        </div>
      </div>

      {/* SuperAdmin Dashboard */}
      <div className="p-4">
        <div className="space-y-6">
          {/* Header */}
          <div className="neo-card-3d p-6">
            <h2 className="neo-heading neo-h3 text-gray-800 mb-2">Panel de Administración</h2>
            <p className="text-gray-600">
              Monitor y gestiona todo el sistema MenuPlus
            </p>
          </div>

      {/* System Statistics Cards */}
      {systemStats && (
        <div className="grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <SystemStatsCard
            title="Usuarios Totales"
            value={formatNumber(systemStats.totalUsers)}
            change={systemStats.monthlyNewUsers}
            changeType={systemStats.monthlyNewUsers > 0 ? 'positive' : 'negative'}
            changeLabel="Este mes"
            trend={formatPercentage(systemStats.userGrowthRate)}
            icon="users"
            color="blue"
          />

          <SystemStatsCard
            title="Negocios Totales"
            value={formatNumber(systemStats.totalBusinesses)}
            change={systemStats.monthlyNewBusinesses}
            changeType={systemStats.monthlyNewBusinesses > 0 ? 'positive' : 'negative'}
            changeLabel="Este mes"
            trend={formatPercentage(systemStats.businessGrowthRate)}
            icon="business"
            color="green"
          />

          <SystemStatsCard
            title="Menús Activos"
            value={formatNumber(systemStats.totalScans)}
            change={systemStats.totalScans}
            changeType="neutral"
            changeLabel="Total"
            trend="0%"
            icon="menu"
            color="purple"
          />

          <SystemStatsCard
            title="Tasa de Actividad"
            value={formatPercentage(systemStats.businessOwnershipRate)}
            change={systemStats.usersWithBusinesses}
            changeType={systemStats.businessOwnershipRate > 50 ? 'positive' : 'warning'}
            changeLabel={`${systemStats.usersWithBusinesses} usuarios con negocio`}
            trend={formatPercentage(systemStats.businessOwnershipRate - 50)}
            icon="chart"
            color="orange"
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="xl:col-span-2 space-y-6">
          {/* Trends Chart */}
          {userActivity && (
            <div className="neo-card-3d p-6">
              <h3 className="neo-heading neo-h4 text-gray-800 mb-4">Tendencias de Registro</h3>
              <TrendsChart
                registrationsByDay={userActivity.userRegistrationsByDay}
                businessRegistrationsByDay={userActivity.businessRegistrationsByDay}
                loading={dataLoading.trends}
              />
            </div>
          )}

          {/* Business Overview */}
          {businessOverview && (
            <div className="neo-card-3d p-6">
              <h3 className="neo-heading neo-h4 text-gray-800 mb-4">Análisis de Negocios</h3>
              <BusinessOverviewChart
                categoryBreakdown={businessOverview.categoryBreakdown}
                topBusinessesByScans={businessOverview.topBusinessesByScans}
                topBusinessesByMenus={businessOverview.topBusinessesByMenus}
                loading={dataLoading.business}
              />
            </div>
          )}
        </div>

        {/* Right Column - Activity Tables */}
        <div className="space-y-6">
          {/* Recent Users */}
          {userActivity && (
            <div className="neo-card-3d p-6">
              <h3 className="neo-heading neo-h4 text-gray-800 mb-4">Usuarios Activos</h3>
              <UserActivityTable
                recentUsers={userActivity.recentUsers}
                activeUsers={userActivity.activeUsers}
                loading={dataLoading.activity}
              />
            </div>
          )}

          {/* Recent Businesses */}
          {userActivity && (
            <div className="neo-card-3d p-6">
              <h3 className="neo-heading neo-h4 text-gray-800 mb-4">Negocios Recientes</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {userActivity.recentBusinesses.map((business) => (
                  <div key={business.id} className="neo-card-2d p-3 hover:translate-y-1 transition-transform">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="neo-heading neo-h5 text-neo-flame">{business.name}</h4>
                        <p className="text-sm text-gray-600">{business.category}</p>
                        <p className="text-xs text-gray-500">{business.ownerName}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-neo-flame">
                          {formatNumber(business.totalScans)}
                        </div>
                        <div className="text-xs text-gray-500">scans</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {systemStats && (
        <div className="neo-card-3d p-6">
          <h3 className="neo-heading neo-h4 text-gray-800 mb-4">Estadísticas Rápidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-black text-neo-flame">
                {formatNumber(systemStats.totalMenus)}
              </div>
              <div className="text-sm text-gray-500">Menús Totales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-green-600">
                {formatNumber(systemStats.activeMenus)}
              </div>
              <div className="text-sm text-gray-500">Menús Activos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-blue-600">
                {formatPercentage(systemStats.userGrowthRate)}
              </div>
              <div className="text-sm text-gray-500">Crecimiento Usuarios</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-purple-600">
                {formatPercentage(systemStats.businessGrowthRate)}
              </div>
              <div className="text-sm text-gray-500">Crecimiento Negocios</div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;