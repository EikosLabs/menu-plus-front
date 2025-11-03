import React from 'react';

/**
 * Contenedor genérico para cada paso del onboarding
 * Proporciona estructura consistente con animaciones
 */
export default function OnboardingStep({ 
  title, 
  description, 
  icon, 
  children, 
  isActive = true 
}) {
  if (!isActive) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-3 py-4 sm:py-6 animate-fadeIn" role="region" aria-label={title}>
      <div className="text-center mb-4">
        {icon && (
          <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 text-neo-flame" aria-hidden="true">
            {icon}
          </div>
        )}
        <h2 className="neo-heading neo-h3 text-neo-black text-xl sm:text-2xl">{title}</h2>
        {description && (
          <p className="neo-text mt-1.5 sm:mt-2 text-sm sm:text-base text-neo-black opacity-70">{description}</p>
        )}
      </div>

      <div className="neo-card neo-shadow-md bg-white p-4 sm:p-5 md:p-6">
        {children}
      </div>
    </div>
  );
}
