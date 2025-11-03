import React from 'react';

/**
 * Componente de indicador de progreso para el onboarding
 * Muestra el progreso del usuario a través de los pasos
 */
export default function OnboardingProgress({ 
  currentStep, 
  totalSteps, 
  completedSteps = [],
  stepLabels = []
}) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  
  const getStepStatus = (stepNumber) => {
    if (completedSteps.includes(stepNumber)) {
      return 'completed';
    }
    if (stepNumber === currentStep) {
      return 'active';
    }
    return 'pending';
  };
  
  const getLineStatus = (stepNumber) => {
    // La línea después del paso está completada si el paso está completado
    return completedSteps.includes(stepNumber) ? 'completed' : 'pending';
  };

  return (
    <div className="neo-card bg-white neo-border-bottom p-6">
      <div className="hidden md:flex items-center justify-between w-full max-w-4xl mx-auto">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all neo-border neo-border-thick
                ${completedSteps.includes(step) ? 'bg-neo-flame text-white neo-shadow-flame' : ''}
                ${step === currentStep ? 'bg-neo-black text-white neo-shadow-lg scale-110' : ''}
                ${!completedSteps.includes(step) && step !== currentStep ? 'bg-neo-lavender text-neo-black' : ''}
              `}>
                {completedSteps.includes(step) ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span>{step}</span>
                )}
              </div>
              {stepLabels[index] && (
                <span className="mt-2 neo-text text-xs text-center text-neo-black max-w-[80px]">
                  {stepLabels[index]}
                </span>
              )}
            </div>

            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 neo-border transition-all ${getLineStatus(step) === 'completed' ? 'bg-neo-flame' : 'bg-neo-lavender'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Mobile/Tablet View - Simplified */}
      <div className="md:hidden flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold neo-border
                ${completedSteps.includes(step) ? 'bg-neo-flame text-white' : ''}
                ${step === currentStep ? 'bg-neo-black text-white' : ''}
                ${!completedSteps.includes(step) && step !== currentStep ? 'bg-neo-lavender text-neo-black' : ''}
              `}>
                {completedSteps.includes(step) ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span className="text-sm">{step}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 w-4 ${getLineStatus(step) === 'completed' ? 'bg-neo-flame' : 'bg-neo-lavender'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="neo-text neo-text-bold text-sm">
          Paso {currentStep} de {totalSteps}
        </div>
      </div>
    </div>
  );
}
