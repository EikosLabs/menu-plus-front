import React, { useState, useEffect } from 'react';

const ProfileCompletionWidget = ({ businessData, onSectionClick }) => {
  const [completionData, setCompletionData] = useState(null);

  useEffect(() => {
    if (businessData) {
      calculateCompletion();
    }
  }, [businessData]);

  const calculateCompletion = () => {
    const checks = [
      { key: 'name', label: 'Nombre', completed: businessData.name && businessData.name.trim().length > 0 },
      { key: 'description', label: 'Descripción', completed: businessData.description && businessData.description.trim().length > 10 },
      { key: 'phone', label: 'Teléfono', completed: businessData.phoneNumber && businessData.phoneNumber.trim().length > 0 },
      { key: 'address', label: 'Dirección', completed: businessData.address && businessData.address.trim().length > 0 },
      { key: 'logo', label: 'Logo', completed: businessData.imageKey || businessData.imageUrl },
      { key: 'colors', label: 'Color', completed: businessData.primaryColor }
    ];

    const completedCount = checks.filter(c => c.completed).length;
    const percentage = Math.round((completedCount / checks.length) * 100);
    const missingFields = checks.filter(c => !c.completed).map(c => c.label);

    setCompletionData({
      percentage,
      completed: completedCount,
      total: checks.length,
      missingFields
    });
  };

  // Don't render if 100% complete
  if (!completionData || completionData.percentage === 100) {
    return null;
  }

  const { percentage, completed, total, missingFields } = completionData;

  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 cursor-pointer hover:bg-amber-100 transition-all"
      onClick={() => onSectionClick && onSectionClick('complete-profile')}
    >
      {/* Icon + percentage */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-amber-500">⚠️</span>
        <span className="text-xs font-bold text-amber-700">
          {completed}/{total}
        </span>
      </div>

      {/* Missing fields list */}
      <div className="flex-1 min-w-0">
        <span className="text-xs text-amber-600">
          Falta: <span className="font-medium text-amber-800">{missingFields.join(', ')}</span>
        </span>
      </div>
    </div>
  );
};

export default ProfileCompletionWidget;