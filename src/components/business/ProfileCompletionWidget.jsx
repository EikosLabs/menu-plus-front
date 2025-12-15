import React, { useState, useEffect } from 'react';

const DISMISS_STORAGE_KEY = 'profile_completion_dismissed';

const ProfileCompletionWidget = ({ businessData, onSectionClick, onDismiss }) => {
  const [completionData, setCompletionData] = useState(null);
  const [animateProgress, setAnimateProgress] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if widget was previously dismissed
    const dismissed = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (businessData && !isDismissed) {
      calculateCompletion();
      setTimeout(() => setAnimateProgress(true), 200);
    }
  }, [businessData, isDismissed]);

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsDismissed(true);
    localStorage.setItem(DISMISS_STORAGE_KEY, 'true');
    if (onDismiss) {
      onDismiss();
    }
  };

  // Don't render if dismissed
  if (isDismissed) {
    return null;
  }

  const calculateCompletion = () => {
    // Simplified calculation with key fields only
    const checks = [
      { key: 'name', completed: businessData.name && businessData.name.trim().length > 0, weight: 20 },
      { key: 'description', completed: businessData.description && businessData.description.trim().length > 10, weight: 15 },
      { key: 'phone', completed: businessData.phoneNumber && businessData.phoneNumber.trim().length > 0, weight: 15 },
      { key: 'address', completed: businessData.address && businessData.address.trim().length > 0, weight: 15 },
      { key: 'logo', completed: businessData.imageKey || businessData.imageUrl, weight: 20 },
      { key: 'colors', completed: businessData.primaryColor, weight: 15 }
    ];

    const completedScore = checks.reduce((sum, check) => sum + (check.completed ? check.weight : 0), 0);
    const maxScore = checks.reduce((sum, check) => sum + check.weight, 0);
    const percentage = Math.round((completedScore / maxScore) * 100);

    setCompletionData({
      percentage,
      completed: checks.filter(c => c.completed).length,
      total: checks.length,
      level: getLevel(percentage),
      nextGoal: getNextGoal(percentage)
    });
  };

  const getLevel = (percentage) => {
    if (percentage >= 90) return { emoji: '🏆', color: 'text-yellow-500' };
    if (percentage >= 70) return { emoji: '⭐', color: 'text-purple-500' };
    if (percentage >= 50) return { emoji: '🚀', color: 'text-blue-500' };
    if (percentage >= 30) return { emoji: '🌱', color: 'text-green-500' };
    return { emoji: '💪', color: 'text-gray-500' };
  };

  const getNextGoal = (percentage) => {
    if (percentage >= 90) return { target: 100, text: '¡Casi perfecto!' };
    if (percentage >= 70) return { target: 90, text: 'Nivel Experto' };
    if (percentage >= 50) return { target: 70, text: 'Nivel Avanzado' };
    if (percentage >= 30) return { target: 50, text: 'Nivel Intermedio' };
    return { target: 30, text: 'Sigue así' };
  };

  if (!completionData) {
    return (
      <div className="neo-surface neo-border rounded-lg p-4 bg-white">
        <div className="animate-pulse">
          <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="h-2 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  const { percentage, completed, total, level, nextGoal } = completionData;
  const isHighCompletion = percentage >= 70;

  return (
    <div
      className={`neo-surface neo-border rounded-lg p-4 transition-all duration-300 cursor-pointer ${isHighCompletion
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
        : 'bg-white hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
        }`}
      onClick={() => onSectionClick && onSectionClick('complete-profile')}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-lg ${level.color}`}>{level.emoji}</span>
          <span className="font-bold text-sm text-gray-800">Perfil</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="font-black text-lg text-gray-800">{percentage}%</div>
          <button
            onClick={handleDismiss}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Cerrar"
            title="Cerrar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-2 border border-gray-300">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isHighCompletion ? 'bg-green-500' : 'bg-neo-flame'
              }`}
            style={{
              width: animateProgress ? `${percentage}%` : '0%',
              transition: 'width 0.8s ease-out'
            }}
          ></div>
        </div>

        {/* Small indicator dot */}
        {percentage < 100 && (
          <div
            className="absolute -top-1 w-4 h-4 bg-neo-yellow border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-500"
            style={{
              left: animateProgress ? `${Math.min(percentage, 95)}%` : '0%',
              transform: 'translateX(-50%)'
            }}
          ></div>
        )}
      </div>

      {/* Subtle motivational text */}
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-gray-600">
          {completed}/{total} completado
        </p>
        {percentage < 100 && (
          <p className="text-xs font-medium text-neo-flame">
            +{nextGoal.target - percentage}%
          </p>
        )}
      </div>

      {/* Completion celebration badge (only when high completion) */}
      {isHighCompletion && (
        <div className="mt-3 flex items-center justify-center">
          <div className="bg-green-100 border-2 border-green-500 px-3 py-1 rounded-full">
            <span className="text-xs font-bold text-green-700">
              {percentage === 100 ? '🎉 ¡Perfecto!' : nextGoal.text}
            </span>
          </div>
        </div>
      )}

      {/* Completion pulse animation for low completion */}
      {percentage < 50 && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-neo-flame rounded-full animate-pulse"></div>
      )}
    </div>
  );
};

export default ProfileCompletionWidget;