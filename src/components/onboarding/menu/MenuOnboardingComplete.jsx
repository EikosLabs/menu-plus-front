import React, { useEffect } from 'react';

export default function MenuOnboardingComplete({ 
  menuName,
  sectionName,
  itemName,
  businessName,
  onContinue 
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onContinue) {
        onContinue();
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4">
      <div className="max-w-2xl w-full text-center animate-fadeInUp">
        {/* Success Animation */}
        <div className="mb-6 md:mb-8 relative">
          <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
            <span className="text-4xl md:text-6xl">🎉</span>
          </div>
          
          {/* Floating emojis */}
          <div className="absolute inset-0 pointer-events-none">
            {['🍕', '🍔', '🍰', '🍹', '☕', '🥗', '🍝', '🍣'].map((emoji, i) => (
              <div
                key={i}
                className="absolute text-4xl"
                style={{
                  left: `${10 + (i * 12)}%`,
                  top: `${20 + (i % 3) * 20}%`,
                  animation: `float ${2 + (i % 3)}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`
                }}
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 md:mb-4 px-2">
          ¡Tu menú está listo! 🎊
        </h1>
        
        <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-2 px-2">
          <span className="font-semibold text-purple-600">{businessName}</span> ya tiene su primer menú digital
        </p>
        
        <p className="text-base md:text-lg text-gray-500 mb-6 md:mb-8 px-2">
          Tus clientes podrán ver tus deliciosos platos
        </p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8 max-w-3xl mx-auto px-2">
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg transform hover:scale-105 transition-transform">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
              <span className="text-2xl md:text-3xl">📋</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-1 text-sm md:text-base">{menuName}</h3>
            <p className="text-xs md:text-sm text-gray-600">Menú creado</p>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg transform hover:scale-105 transition-transform">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
              <span className="text-2xl md:text-3xl">📁</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-1 text-sm md:text-base">{sectionName}</h3>
            <p className="text-xs md:text-sm text-gray-600">Sección organizada</p>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg transform hover:scale-105 transition-transform">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
              <span className="text-2xl md:text-3xl">🍽️</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-1 text-sm md:text-base">{itemName}</h3>
            <p className="text-xs md:text-sm text-gray-600">Primer plato agregado</p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg mb-6 md:mb-8 max-w-xl mx-auto">
          <h3 className="font-bold text-gray-800 mb-3 md:mb-4 text-sm md:text-base">¿Qué sigue?</h3>
          <div className="space-y-2 md:space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-700">Agrega más platos a tu menú</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-700">Crea más secciones para organizar mejor</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-700">Comparte tu menú con código QR</p>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 w-full sm:w-auto text-sm md:text-base"
        >
          <span>Ver mi Dashboard</span>
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4 px-2">
          Serás redirigido automáticamente en unos segundos...
        </p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }
      `}} />
    </div>
  );
}
