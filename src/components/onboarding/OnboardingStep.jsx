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
    <div className="step-container" role="region" aria-label={title}>
      <div className="step-header">
        {icon && (
          <div className="step-icon" aria-hidden="true">
            {icon}
          </div>
        )}
        <h2 className="onboarding-title">{title}</h2>
        {description && (
          <p className="onboarding-subtitle mt-2">{description}</p>
        )}
      </div>
      
      <div className="step-content">
        {children}
      </div>
    </div>
  );
}
