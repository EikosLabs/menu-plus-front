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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-2xl w-full text-center animate-fadeInUp">
        {/* Success Icon with Animation */}
        <div className="mb-6 md:mb-8 relative">
          <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <svg 
              className="w-16 h-16 md:w-20 md:h-20 text-white" 
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
          
          {/* Confetti Effect */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'][i % 5],
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `confetti ${1 + Math.random()}s ease-out forwards`,
                  animationDelay: `${Math.random() * 0.5}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 md:mb-4 px-2">
          ¡Felicidades! 🎉
        </h1>
        
        <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-2 px-2">
          Tu negocio <span className="font-semibold text-green-600">{businessName}</span> ha sido creado exitosamente
        </p>
        
        <p className="text-base md:text-lg text-gray-500 mb-6 md:mb-8 px-2">
          Ahora puedes empezar a crear tu menú digital
        </p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8 max-w-3xl mx-auto px-2">
          <div className="bg-white rounded-lg p-4 md:p-6 shadow-md">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1 text-sm md:text-base">Negocio Configurado</h3>
            <p className="text-xs md:text-sm text-gray-600">Tu información básica está lista</p>
          </div>

          <div className="bg-white rounded-lg p-4 md:p-6 shadow-md">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1 text-sm md:text-base">Perfil Completo</h3>
            <p className="text-xs md:text-sm text-gray-600">Tu perfil está listo para usar</p>
          </div>

          <div className="bg-white rounded-lg p-4 md:p-6 shadow-md">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1 text-sm md:text-base">Listo para Crear</h3>
            <p className="text-xs md:text-sm text-gray-600">Empieza a agregar tu menú</p>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transform hover:scale-105 transition-all duration-200 w-full sm:w-auto text-sm md:text-base"
        >
          <span>Ir al Dashboard</span>
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4 px-2">
          Serás redirigido automáticamente en unos segundos...
        </p>
      </div>


    </div>
  );
}
