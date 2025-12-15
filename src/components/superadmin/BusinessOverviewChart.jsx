import React, { useState } from 'react';

const BusinessOverviewChart = ({
  categoryBreakdown = {},
  topBusinessesByScans = [],
  topBusinessesByMenus = [],
  loading = false
}) => {
  const [activeView, setActiveView] = useState('categories');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex space-x-2 mb-6">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="neo-card-2d p-6">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="neo-card-2d p-6">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format number with locale
  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-ES').format(num || 0);
  };

  // Calculate total for percentage calculations
  const totalBusinesses = Object.values(categoryBreakdown).reduce((sum, count) => sum + count, 0);

  // Category breakdown view
  const CategoriesView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="neo-card-2d p-6">
          <h3 className="neo-heading neo-h5 text-gray-800 mb-4">Distribución por Categorías</h3>

          {Object.entries(categoryBreakdown).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(categoryBreakdown)
                .sort(([,a], [,b]) => b - a)
                .map(([category, count]) => {
                  const percentage = totalBusinesses > 0 ? (count / totalBusinesses * 100).toFixed(1) : 0;

                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {category || 'Sin categoría'}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{formatNumber(count)}</span>
                          <span className="text-xs text-gray-500">({percentage}%)</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-neo-flame to-orange-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No hay datos de categorías</p>
            </div>
          )}
        </div>

        {/* Category Summary Stats */}
        <div className="neo-card-2d p-6">
          <h3 className="neo-heading neo-h5 text-gray-800 mb-4">Resumen de Categorías</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-black text-blue-600">
                {Object.keys(categoryBreakdown).length}
              </div>
              <div className="text-sm text-gray-600">Categorías Totales</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-black text-green-600">
                {formatNumber(totalBusinesses)}
              </div>
              <div className="text-sm text-gray-600">Negocios Totales</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-xl font-black text-purple-600">
                {Object.entries(categoryBreakdown).length > 0
                  ? Object.entries(categoryBreakdown).sort(([,a], [,b]) => b - a)[0][0]
                  : 'N/A'
                }
              </div>
              <div className="text-sm text-gray-600">Categoría Principal</div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-xl font-black text-orange-600">
                {Object.entries(categoryBreakdown).length > 0
                  ? formatNumber(Object.entries(categoryBreakdown).sort(([,a], [,b]) => b - a)[0][1])
                  : '0'
                }
              </div>
              <div className="text-sm text-gray-600">Negocios en Principal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Top businesses by scans view
  const TopScansView = () => (
    <div className="space-y-6">
      <div className="neo-card-2d p-6">
        <h3 className="neo-heading neo-h5 text-gray-800 mb-4">Top Negocios por Scans</h3>

        {topBusinessesByScans.length > 0 ? (
          <div className="space-y-4">
            {topBusinessesByScans.map((business, index) => (
              <div key={business.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-400 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-400 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Business Info */}
                  <div>
                    <h4 className="neo-heading neo-h5 text-gray-800">{business.name}</h4>
                    <p className="text-sm text-gray-600">{business.category || 'Sin categoría'}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className="text-2xl font-black text-neo-flame">
                    {formatNumber(business.totalScans)}
                  </div>
                  <div className="text-sm text-gray-500">scans totales</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No hay datos de scans disponibles</p>
          </div>
        )}
      </div>
    </div>
  );

  // Top businesses by menus view
  const TopMenusView = () => (
    <div className="space-y-6">
      <div className="neo-card-2d p-6">
        <h3 className="neo-heading neo-h5 text-gray-800 mb-4">Top Negocios por Menús</h3>

        {topBusinessesByMenus.length > 0 ? (
          <div className="space-y-4">
            {topBusinessesByMenus.map((business, index) => (
              <div key={business.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-400 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-400 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Business Info */}
                  <div>
                    <h4 className="neo-heading neo-h5 text-gray-800">{business.name}</h4>
                    <p className="text-sm text-gray-600">{business.category || 'Sin categoría'}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className="text-2xl font-black text-green-600">
                    {formatNumber(business.menuCount)}
                  </div>
                  <div className="text-sm text-gray-500">menús creados</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No hay datos de menús disponibles</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* View Selector */}
      <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setActiveView('categories')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === 'categories'
              ? 'bg-white text-neo-flame shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📊 Categorías
        </button>

        <button
          onClick={() => setActiveView('scans')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === 'scans'
              ? 'bg-white text-neo-flame shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📈 Top Scans
        </button>

        <button
          onClick={() => setActiveView('menus')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === 'menus'
              ? 'bg-white text-neo-flame shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📋 Top Menús
        </button>
      </div>

      {/* Content based on selected view */}
      {activeView === 'categories' && <CategoriesView />}
      {activeView === 'scans' && <TopScansView />}
      {activeView === 'menus' && <TopMenusView />}
    </div>
  );
};

export default BusinessOverviewChart;