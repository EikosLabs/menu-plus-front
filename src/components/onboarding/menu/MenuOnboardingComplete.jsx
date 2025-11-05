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
    <div className="min-h-screen flex items-center justify-center bg-neo-lavender neo-bg-dots p-3 sm:p-4">
      <div className="max-w-3xl w-full text-center">
        {/* Success Icon with Animation */}
        <div className="mb-4 sm:mb-6 relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-neo-flame rounded-full flex items-center justify-center neo-shadow-xl neo-border-thick animate-pulse">
            <span className="text-4xl sm:text-5xl">🎉</span>
          </div>

          {/* Floating food emojis */}
          <div className="absolute inset-0 pointer-events-none hidden sm:block">
            {['🍕', '🍔', '🍰', '🍹', '☕', '🥗', '🍝', '🍣'].map((emoji, i) => (
              <div
                key={i}
                className="absolute text-2xl md:text-3xl"
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
        <h1 className="neo-heading text-2xl sm:text-3xl md:text-4xl text-neo-black mb-2 sm:mb-3 px-2">
          ¡Tu menú está listo! 🎊
        </h1>

        <p className="neo-text text-base sm:text-lg md:text-xl text-neo-black mb-1.5 sm:mb-2 px-2">
          <span className="neo-text-bold text-neo-flame">{businessName}</span> ya tiene su primer menú digital
        </p>

        <p className="neo-text text-sm sm:text-base opacity-70 mb-5 sm:mb-6 px-2">
          Tus clientes podrán ver tus deliciosos platos
        </p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-5 sm:mb-6 max-w-3xl mx-auto px-2">
          <div className="neo-card-3d bg-white p-3 sm:p-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neo-sunset rounded-full flex items-center justify-center mx-auto mb-2 neo-border-thick">
              <span className="text-xl sm:text-2xl">📋</span>
            </div>
            <h3 className="neo-text neo-text-bold mb-0.5 text-xs sm:text-sm truncate">{menuName}</h3>
            <p className="neo-text text-xs opacity-70">Menú creado</p>
          </div>

          <div className="neo-card-3d bg-white p-3 sm:p-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neo-sky rounded-full flex items-center justify-center mx-auto mb-2 neo-border-thick">
              <span className="text-xl sm:text-2xl">📁</span>
            </div>
            <h3 className="neo-text neo-text-bold mb-0.5 text-xs sm:text-sm truncate">{sectionName}</h3>
            <p className="neo-text text-xs opacity-70">Sección organizada</p>
          </div>

          <div className="neo-card-3d bg-white p-3 sm:p-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neo-lavender rounded-full flex items-center justify-center mx-auto mb-2 neo-border-thick">
              <span className="text-xl sm:text-2xl">🍽️</span>
            </div>
            <h3 className="neo-text neo-text-bold mb-0.5 text-xs sm:text-sm truncate">{itemName}</h3>
            <p className="neo-text text-xs opacity-70">Primer plato</p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="neo-card-3d bg-white p-3 sm:p-5 mb-5 sm:mb-6 max-w-xl mx-auto">
          <h3 className="neo-h5 text-neo-black mb-3 text-sm sm:text-base">¿Qué sigue?</h3>
          <div className="space-y-2 sm:space-y-2.5 text-left">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-neo-flame rounded-full flex items-center justify-center neo-border">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="neo-text text-xs sm:text-sm">Agrega más platos a tu menú</p>
            </div>
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-neo-flame rounded-full flex items-center justify-center neo-border">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="neo-text text-xs sm:text-sm">Crea más secciones para organizar mejor</p>
            </div>
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-neo-flame rounded-full flex items-center justify-center neo-border">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="neo-text text-xs sm:text-sm">Comparte tu menú con código QR</p>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="neo-btn neo-btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
        >
          <span>Ver mi Dashboard</span>
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        <p className="neo-text text-xs opacity-60 mt-2.5 sm:mt-3 px-2">
          Serás redirigido automáticamente en unos segundos...
        </p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
            opacity: 1;
          }
        }
      `}} />
    </div>
  );
}
