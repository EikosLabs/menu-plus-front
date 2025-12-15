import React from 'react';

const SystemStatsCard = ({
  title,
  value,
  change,
  changeType,
  changeLabel,
  trend,
  icon,
  color = 'blue'
}) => {
  // Color configurations
  const colorConfig = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      value: 'text-blue-600',
      trendPositive: 'text-green-600',
      trendNegative: 'text-red-600',
      trendNeutral: 'text-gray-600'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      value: 'text-green-600',
      trendPositive: 'text-green-600',
      trendNegative: 'text-red-600',
      trendNeutral: 'text-gray-600'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      value: 'text-purple-600',
      trendPositive: 'text-green-600',
      trendNegative: 'text-red-600',
      trendNeutral: 'text-gray-600'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-600',
      value: 'text-orange-600',
      trendPositive: 'text-green-600',
      trendNegative: 'text-red-600',
      trendNeutral: 'text-gray-600'
    }
  };

  const colors = colorConfig[color] || colorConfig.blue;

  // Icon mapping
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'users':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'business':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'menu':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case 'chart':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // Format change value
  const formatChange = (value) => {
    if (value === null || value === undefined) return '0';
    const num = typeof value === 'string' ? parseInt(value, 10) : value;
    if (isNaN(num)) return '0';
    return num.toLocaleString('es-ES');
  };

  // Get trend color
  const getTrendColor = (trendValue, type) => {
    if (type === 'positive') return colors.trendPositive;
    if (type === 'negative') return colors.trendNegative;
    return colors.trendNeutral;
  };

  return (
    <div className={`neo-card-3d p-6 ${colors.bg} border-2 ${colors.border} hover:translate-y-1 transition-transform`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors.bg} ${colors.icon}`}>
          {getIcon(icon)}
        </div>
        <div className="text-right">
          <div className={`text-2xl font-black ${colors.value}`}>
            {value}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="neo-heading neo-h5 text-gray-800">
          {title}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{changeLabel}:</span>
            <span className={`font-bold text-sm ${getTrendColor(change, changeType)}`}>
              {changeType === 'positive' && '+'}
              {formatChange(change)}
            </span>
          </div>

          {trend && (
            <div className={`text-sm font-medium ${getTrendColor(trend, changeType)}`}>
              {trend}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemStatsCard;