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
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fadeIn" role="region" aria-label={title}>
      <div className="text-center neo-space-lg">
        {icon && (
          <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-neo-flame" aria-hidden="true">
            {icon}
          </div>
        )}
        <h2 className="neo-heading neo-h2 text-neo-black">{title}</h2>
        {description && (
          <p className="neo-text mt-2 text-neo-black opacity-70">{description}</p>
        )}
      </div>

      <div className="neo-card neo-shadow-lg bg-white p-6 md:p-8">
        {children}
      </div>
    </div>
  );
}
