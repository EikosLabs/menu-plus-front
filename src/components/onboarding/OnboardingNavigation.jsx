import React from 'react';

/**
 * Componente de navegación para el onboarding
 * Maneja los botones de Atrás, Siguiente, Omitir y Finalizar
 */
export default function OnboardingNavigation({ 
  currentStep, 
  totalSteps, 
  isValid, 
  isSaving, 
  canSkip = false,
  onNext, 
  onPrev, 
  onSkip 
}) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="navigation-container">
      {/* Botón Atrás */}
      {!isFirstStep && (
        <button
          type="button"
          onClick={onPrev}
          disabled={isSaving}
          className="btn btn-secondary"
          aria-label="Volver al paso anterior"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Atrás</span>
        </button>
      )}

      {/* Espaciador para empujar los botones a la derecha cuando no hay botón Atrás */}
      {isFirstStep && <div className="flex-1" />}

      {/* Botón Omitir (solo para pasos opcionales) */}
      {canSkip && !isLastStep && (
        <button
          type="button"
          onClick={onSkip}
          disabled={isSaving}
          className="btn btn-secondary"
          aria-label="Omitir este paso"
        >
          <span>Omitir</span>
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Botón Siguiente / Finalizar */}
      <button
        type="button"
        onClick={onNext}
        disabled={!isValid || isSaving}
        className={`btn btn-primary ${isSaving ? 'btn-loading' : ''}`}
        aria-label={isLastStep ? 'Finalizar y crear negocio' : 'Continuar al siguiente paso'}
      >
        {!isSaving && (
          <>
            <span>{isLastStep ? 'Crear mi negocio' : 'Siguiente'}</span>
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={isLastStep ? 'M5 13l4 4L19 7' : 'M9 5l7 7-7 7'}
              />
            </svg>
          </>
        )}
        {isSaving && <span className="ml-2">Guardando...</span>}
      </button>
    </div>
  );
}
