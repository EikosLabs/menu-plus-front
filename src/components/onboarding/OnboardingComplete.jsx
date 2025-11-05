import React, { useEffect } from 'react';

/**
 * Pantalla de éxito al completar el onboarding
 */
export default function OnboardingComplete({ 
  businessName, 
  onContinue 
}) {
  // Auto-redirect después de 4 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onContinue) {
        onContinue();
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neo-lavender neo-bg-dots p-3 sm:p-4">
      <div className="max-w-2xl w-full text-center animate-fadeInUp">
        {/* Success Icon with Animation */}
        <div className="mb-4 sm:mb-6 relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-neo-flame rounded-full flex items-center justify-center neo-shadow-xl neo-border animate-pulse">
            <svg
              className="w-12 h-12 sm:w-16 sm:h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ animation: 'checkmark 0.6s ease-in-out' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="neo-heading neo-h2 text-2xl sm:text-3xl md:text-4xl text-neo-black mb-2 sm:mb-3 px-2">
          ¡Felicidades! 🎉
        </h1>

        <p className="neo-text text-base sm:text-lg md:text-xl text-neo-black mb-1.5 sm:mb-2 px-2">
          Tu negocio <span className="neo-text-bold text-neo-flame">{businessName}</span> ha sido creado exitosamente
        </p>

        <p className="neo-text text-sm sm:text-base opacity-70 mb-5 sm:mb-6 px-2">
          Ahora puedes empezar a crear tu menú digital
        </p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-5 sm:mb-6 max-w-3xl mx-auto px-2">
          <div className="neo-card-3d bg-white p-3 sm:p-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neo-sunset rounded-full flex items-center justify-center mx-auto mb-2 neo-border-thick">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-neo-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="neo-text neo-text-bold mb-0.5 text-xs sm:text-sm">Negocio Configurado</h3>
            <p className="neo-text text-xs opacity-70">Información básica lista</p>
          </div>

          <div className="neo-card-3d bg-white p-3 sm:p-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neo-lavender rounded-full flex items-center justify-center mx-auto mb-2 neo-border-thick">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-neo-flame" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="neo-text neo-text-bold mb-0.5 text-xs sm:text-sm">Perfil Completo</h3>
            <p className="neo-text text-xs opacity-70">Listo para usar</p>
          </div>

          <div className="neo-card-3d bg-white p-3 sm:p-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neo-flame rounded-full flex items-center justify-center mx-auto mb-2 neo-border-thick">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="neo-text neo-text-bold mb-0.5 text-xs sm:text-sm">Listo para Crear</h3>
            <p className="neo-text text-xs opacity-70">Agrega tu menú</p>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="neo-btn neo-btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
        >
          <span>Ir al Dashboard</span>
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        <p className="neo-text text-xs opacity-60 mt-2.5 sm:mt-3 px-2">
          Serás redirigido automáticamente en unos segundos...
        </p>
      </div>


    </div>
  );
}
