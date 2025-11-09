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
    <div className="max-w-2xl mx-auto px-2 sm:px-3 py-2 sm:py-3 md:py-4 animate-fadeIn" role="region" aria-label={title}>
      <div className="text-center mb-2 sm:mb-3">
        {icon && (
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 text-neo-flame" aria-hidden="true">
            {icon}
          </div>
        )}
        <h2 className="neo-heading neo-h3 text-neo-black text-lg sm:text-xl md:text-2xl">{title}</h2>
        {description && (
          <p className="neo-text mt-1 sm:mt-1.5 md:mt-2 text-xs sm:text-sm md:text-base text-neo-black opacity-70">{description}</p>
        )}
      </div>

      <div className="neo-card neo-shadow-md bg-white p-3 sm:p-4 md:p-5">
        {children}
      </div>
    </div>
  );
}
