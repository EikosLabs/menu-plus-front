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
      { key: 'name', label: 'Nombre', completed: businessData.name && businessData.name.trim().length > 0, weight: 20 },
      { key: 'description', label: 'Descripción', completed: businessData.description && businessData.description.trim().length > 10, weight: 15 },
      { key: 'phone', label: 'Teléfono', completed: businessData.phoneNumber && businessData.phoneNumber.trim().length > 0, weight: 15 },
      { key: 'address', label: 'Dirección', completed: businessData.address && businessData.address.trim().length > 0, weight: 15 },
      { key: 'logo', label: 'Logo', completed: businessData.imageKey || businessData.imageUrl, weight: 20 },
      { key: 'colors', label: 'Color', completed: businessData.primaryColor, weight: 15 }
    ];

    const completedScore = checks.reduce((sum, check) => sum + (check.completed ? check.weight : 0), 0);
    const maxScore = checks.reduce((sum, check) => sum + check.weight, 0);
    const percentage = Math.round((completedScore / maxScore) * 100);

    // Get missing fields (first 2 for subtle hint)
    const missingFields = checks.filter(c => !c.completed).map(c => c.label).slice(0, 2);

    setCompletionData({
      percentage,
      completed: checks.filter(c => c.completed).length,
      total: checks.length,
      level: getLevel(percentage),
      nextGoal: getNextGoal(percentage),
      missingFields
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

  const { percentage, completed, total, level, nextGoal, missingFields } = completionData;
  const isComplete = percentage === 100;

  // Super minimal single-line widget
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all cursor-pointer ${isComplete
          ? 'bg-green-50 border-green-200'
          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
        }`}
      onClick={() => onSectionClick && onSectionClick('complete-profile')}
    >
      {/* Emoji + percentage */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-sm">{level.emoji}</span>
        <span className={`text-xs font-bold ${isComplete ? 'text-green-600' : 'text-gray-700'}`}>
          {percentage}%
        </span>
      </div>

      {/* Mini progress bar */}
      <div className="flex-1 min-w-0">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-neo-flame'
              }`}
            style={{ width: animateProgress ? `${percentage}%` : '0%' }}
          />
        </div>
      </div>

      {/* Missing fields hint OR complete badge */}
      {isComplete ? (
        <span className="text-xs text-green-600 font-medium flex-shrink-0">✓</span>
      ) : missingFields && missingFields.length > 0 ? (
        <span className="text-xs text-gray-400 truncate max-w-[120px] flex-shrink-0" title={`Falta: ${missingFields.join(', ')}`}>
          {missingFields[0]}
        </span>
      ) : null}

      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        aria-label="Cerrar"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default ProfileCompletionWidget;