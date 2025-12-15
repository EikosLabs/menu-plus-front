import React, { useState, useMemo } from 'react';

const TrendsChart = ({
  registrationsByDay = [],
  businessRegistrationsByDay = [],
  loading = false
}) => {
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex space-x-2">
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="h-64 bg-gray-100 rounded-lg p-4">
          <div className="h-full flex items-end justify-around space-x-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex-1 bg-gray-200 rounded-t animate-pulse" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="neo-card-2d p-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
          <div className="neo-card-2d p-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
          <div className="neo-card-2d p-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Filter data based on time range
  const filteredData = useMemo(() => {
    const now = new Date();
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    const filteredUserRegs = registrationsByDay.filter(item =>
      new Date(item.date) >= cutoffDate
    );

    const filteredBusinessRegs = businessRegistrationsByDay.filter(item =>
      new Date(item.date) >= cutoffDate
    );

    return {
      userRegistrations: filteredUserRegs,
      businessRegistrations: filteredBusinessRegs
    };
  }, [registrationsByDay, businessRegistrationsByDay, timeRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const { userRegistrations, businessRegistrations } = filteredData;

    const totalUserRegs = userRegistrations.reduce((sum, item) => sum + item.count, 0);
    const totalBusinessRegs = businessRegistrations.reduce((sum, item) => sum + item.count, 0);

    const avgUserRegs = userRegistrations.length > 0
      ? Math.round(totalUserRegs / userRegistrations.length)
      : 0;

    const avgBusinessRegs = businessRegistrations.length > 0
      ? Math.round(totalBusinessRegs / businessRegistrations.length)
      : 0;

    // Find peak days
    const peakUserDay = userRegistrations.reduce((max, item) =>
      item.count > max.count ? item : max, userRegistrations[0] || { count: 0, date: '' }
    );

    const peakBusinessDay = businessRegistrations.reduce((max, item) =>
      item.count > max.count ? item : max, businessRegistrations[0] || { count: 0, date: '' }
    );

    return {
      totalUserRegs,
      totalBusinessRegs,
      avgUserRegs,
      avgBusinessRegs,
      peakUserDay,
      peakBusinessDay
    };
  }, [filteredData]);

  // Prepare data for chart
  const chartData = useMemo(() => {
    const allDates = new Set([
      ...filteredData.userRegistrations.map(item => item.date),
      ...filteredData.businessRegistrations.map(item => item.date)
    ]);

    return Array.from(allDates).sort().map(date => {
      const userReg = filteredData.userRegistrations.find(item => item.date === date);
      const businessReg = filteredData.businessRegistrations.find(item => item.date === date);

      return {
        date,
        userCount: userReg?.count || 0,
        businessCount: businessReg?.count || 0,
        total: (userReg?.count || 0) + (businessReg?.count || 0)
      };
    });
  }, [filteredData]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  // Format full date for tooltips
  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Calculate max value for chart scaling
  const maxValue = Math.max(
    ...chartData.map(item => Math.max(item.userCount, item.businessCount)),
    1
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="neo-heading neo-h5 text-gray-800">Tendencias de Registro</h3>

        {/* Time Range Selector */}
        <div className="flex p-1 bg-gray-100 rounded-lg">
          {[
            { key: '7d', label: '7 días' },
            { key: '30d', label: '30 días' },
            { key: '90d', label: '90 días' }
          ].map((range) => (
            <button
              key={range.key}
              onClick={() => setTimeRange(range.key)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                timeRange === range.key
                  ? 'bg-white text-neo-flame shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="neo-card-2d p-6">
        {chartData.length > 0 ? (
          <div className="space-y-4">
            {/* Chart Area */}
            <div className="h-64 relative">
              <div className="absolute inset-0 flex items-end justify-around space-x-1">
                {chartData.map((item, index) => (
                  <div
                    key={`${item.date}-${index}`}
                    className="flex-1 flex flex-col items-center space-y-1 group"
                    style={{ maxWidth: '60px' }}
                  >
                    {/* Bars */}
                    <div className="w-full flex items-end justify-center space-x-1" style={{ minHeight: '20px' }}>
                      {/* User registrations bar */}
                      <div
                        className="bg-blue-500 hover:bg-blue-600 transition-colors rounded-t flex items-start justify-center"
                        style={{
                          height: `${(item.userCount / maxValue) * 100}%`,
                          width: '40%'
                        }}
                        title={`Usuarios: ${item.userCount}`}
                      >
                        {item.userCount > 0 && (
                          <span className="text-xs text-white font-bold mt-1">
                            {item.userCount}
                          </span>
                        )}
                      </div>

                      {/* Business registrations bar */}
                      <div
                        className="bg-green-500 hover:bg-green-600 transition-colors rounded-t flex items-start justify-center"
                        style={{
                          height: `${(item.businessCount / maxValue) * 100}%`,
                          width: '40%'
                        }}
                        title={`Negocios: ${item.businessCount}`}
                      >
                        {item.businessCount > 0 && (
                          <span className="text-xs text-white font-bold mt-1">
                            {item.businessCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Date label */}
                    <div className="text-xs text-gray-600 text-center">
                      {formatDate(item.date)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
                <span>{maxValue}</span>
                <span>{Math.round(maxValue * 0.75)}</span>
                <span>{Math.round(maxValue * 0.5)}</span>
                <span>{Math.round(maxValue * 0.25)}</span>
                <span>0</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-gray-700">Usuarios</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-700">Negocios</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500">No hay datos de tendencias disponibles</p>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="neo-card-2d p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Usuarios</div>
              <div className="text-2xl font-black text-blue-600">
                {stats.totalUserRegs}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Promedio diario</div>
              <div className="text-lg font-bold text-blue-500">
                {stats.avgUserRegs}
              </div>
            </div>
          </div>
        </div>

        <div className="neo-card-2d p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Negocios</div>
              <div className="text-2xl font-black text-green-600">
                {stats.totalBusinessRegs}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Promedio diario</div>
              <div className="text-lg font-bold text-green-500">
                {stats.avgBusinessRegs}
              </div>
            </div>
          </div>
        </div>

        <div className="neo-card-2d p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Día Pico</div>
              <div className="text-lg font-black text-neo-flame">
                {stats.peakUserDay.count > stats.peakBusinessDay.count
                  ? formatFullDate(stats.peakUserDay.date)
                  : formatFullDate(stats.peakBusinessDay.date)
                }
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Registros</div>
              <div className="text-lg font-bold text-neo-flame">
                {Math.max(stats.peakUserDay.count, stats.peakBusinessDay.count)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendsChart;