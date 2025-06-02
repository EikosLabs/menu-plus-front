import React, { useState, useEffect } from 'react';
import { useTranslation, changeLang, languages } from '../i18n/utils';

export default function LanguageSwitcher({ className = '' }) {
  const { t, currentLang } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // No renderizar hasta que se monte en el cliente para evitar hidration mismatch
  if (!mounted) {
    return (
      <div className={`relative ${className}`}>
        <button className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.11 9.908l1.928-1.928" />
          </svg>
          <span className="text-sm font-medium text-slate-700">...</span>
        </button>
      </div>
    );
  }

  const handleLanguageChange = (lang) => {
    changeLang(lang);
    setIsOpen(false);
  };

  const currentLanguageName = languages[currentLang] || languages.es;
  const availableLanguages = Object.entries(languages).filter(([code]) => code !== currentLang);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E05C33] focus:border-[#E05C33]"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.11 9.908l1.928-1.928M21 14l-5.5 5.5L12 16l4-4" />
        </svg>
        <span className="text-sm font-medium text-slate-700">{currentLanguageName}</span>
        <svg 
          className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Overlay para cerrar el dropdown */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
            <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              {t('common.language')}
            </div>
            
            {/* Idioma actual */}
            <div className="px-3 py-2 flex items-center space-x-3 bg-[#E05C33] bg-opacity-10">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#E05C33] rounded-full"></div>
                <span className="text-sm font-medium text-[#E05C33]">{currentLanguageName}</span>
              </div>
              <span className="text-xs text-[#E05C33] ml-auto">{t('common.current', 'Actual')}</span>
            </div>
            
            {/* Otros idiomas disponibles */}
            {availableLanguages.map(([langCode, langName]) => (
              <button
                key={langCode}
                onClick={() => handleLanguageChange(langCode)}
                className="w-full px-3 py-2 text-left flex items-center space-x-3 hover:bg-slate-50 transition-colors focus:outline-none focus:bg-slate-50"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                  <span className="text-sm text-slate-700">{langName}</span>
                </div>
                
                {/* Iconos de bandera para cada idioma */}
                <div className="ml-auto">
                  {langCode === 'es' && (
                    <span className="text-lg">🇪🇸</span>
                  )}
                  {langCode === 'en' && (
                    <span className="text-lg">🇺🇸</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 