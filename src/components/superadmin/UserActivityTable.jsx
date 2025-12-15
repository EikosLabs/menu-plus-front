import React, { useState } from 'react';

const UserActivityTable = ({ recentUsers, activeUsers, loading = false }) => {
  const [activeTab, setActiveTab] = useState('recent');

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex space-x-4 mb-4">
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="neo-card-2d p-4">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatLastLogin = (dateString) => {
    if (!dateString) return 'Nunca';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) {
      return formatDate(dateString);
    } else if (diffDays > 0) {
      return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else {
      return 'Justo ahora';
    }
  };

  const UserRow = ({ user, type }) => (
    <div className="neo-card-2d p-4 hover:translate-y-1 transition-transform">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-neo-flame to-neo-purple rounded-full flex items-center justify-center text-white font-black text-sm">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="neo-heading neo-h5 text-gray-800 truncate">
                {user.fullName || 'Usuario sin nombre'}
              </h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                user.role === 'Super Admin' ? 'bg-red-100 text-red-800' :
                user.role === 'Owner' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {user.role || 'User'}
              </span>
            </div>

            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
              <span className="truncate">{user.email}</span>
              {user.businessName && (
                <span className="text-neo-flame font-medium">
                  🏢 {user.businessName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Activity Info */}
        <div className="text-right">
          {type === 'recent' && (
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Registrado</div>
              <div className="text-sm font-medium text-gray-800">
                {formatDate(user.createdAt)}
              </div>
            </div>
          )}

          {type === 'active' && (
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Último login</div>
              <div className="text-sm font-medium text-gray-800">
                {formatLastLogin(user.lastLoginAt)}
              </div>
              {user.hasBusiness && (
                <div className="text-xs text-green-600 font-medium">
                  ✓ Con negocio
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setActiveTab('recent')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'recent'
              ? 'bg-white text-neo-flame shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Usuarios Recientes
          {recentUsers && (
            <span className="ml-2 px-2 py-1 bg-neo-flame text-white text-xs rounded-full">
              {recentUsers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'active'
              ? 'bg-white text-neo-flame shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Usuarios Activos
          {activeUsers && (
            <span className="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded-full">
              {activeUsers.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'recent' && (
          <div className="space-y-3">
            {recentUsers && recentUsers.length > 0 ? (
              recentUsers.slice(0, 10).map((user) => (
                <UserRow key={user.id} user={user} type="recent" />
              ))
            ) : (
              <div className="neo-card-2d p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="neo-heading neo-h5 text-gray-600 mb-2">No hay usuarios recientes</h3>
                <p className="text-sm text-gray-500">No se han registrado nuevos usuarios recientemente</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'active' && (
          <div className="space-y-3">
            {activeUsers && activeUsers.length > 0 ? (
              activeUsers.slice(0, 10).map((user) => (
                <UserRow key={user.id} user={user} type="active" />
              ))
            ) : (
              <div className="neo-card-2d p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="neo-heading neo-h5 text-gray-600 mb-2">No hay actividad reciente</h3>
                <p className="text-sm text-gray-500">No se ha registrado actividad de usuarios recientemente</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Show More Link */}
      <div className="text-center pt-4">
        <button className="neo-btn-secondary text-sm">
          Ver todos los usuarios →
        </button>
      </div>
    </div>
  );
};

export default UserActivityTable;