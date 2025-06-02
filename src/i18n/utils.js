// Importar traducciones
import es from './locales/es.json';
import en from './locales/en.json';

// Diccionario de traducciones
const translations = {
  es,
  en
};

// Obtener idioma por defecto
export const defaultLang = 'es';
export const languages = {
  es: 'Español',
  en: 'English'
};

// Obtener idioma actual
export function getCurrentLang() {
  // En el navegador
  if (typeof window !== 'undefined') {
    // Primero intentar obtener del localStorage
    const savedLang = localStorage.getItem('preferred-language');
    if (savedLang && languages[savedLang]) {
      return savedLang;
    }
    
    // Luego intentar obtener de la URL
    const path = window.location.pathname;
    const langFromPath = path.split('/')[1];
    if (languages[langFromPath]) {
      return langFromPath;
    }
    
    // Finalmente usar el idioma del navegador
    const browserLang = navigator.language.split('-')[0];
    return languages[browserLang] ? browserLang : defaultLang;
  }
  
  // En el servidor (SSR) - obtener del pathname o usar default
  try {
    // Intentar obtener de globalThis si está disponible
    if (typeof globalThis !== 'undefined' && globalThis.Astro?.url) {
      const pathname = globalThis.Astro.url.pathname;
      const langFromPath = pathname.split('/')[1];
      if (languages[langFromPath]) {
        return langFromPath;
      }
    }
    
    return defaultLang;
  } catch (error) {
    return defaultLang;
  }
}

// Función para obtener texto traducido
export function t(key, lang = null) {
  const currentLang = lang || getCurrentLang();
  const keys = key.split('.');
  
  let translation = translations[currentLang];
  
  if (!translation) {
    translation = translations[defaultLang];
  }
  
  for (const k of keys) {
    translation = translation?.[k];
    if (!translation) break;
  }
  
  if (!translation) {
    // Fallback al idioma por defecto
    translation = translations[defaultLang];
    for (const k of keys) {
      translation = translation?.[k];
      if (!translation) break;
    }
  }
  
  return translation || key;
}

// Función para cambiar idioma
export function changeLang(newLang) {
  if (typeof window === 'undefined') return;
  
  if (!languages[newLang]) {
    console.warn(`Idioma '${newLang}' no soportado`);
    return;
  }
  
  // Guardar en localStorage
  localStorage.setItem('preferred-language', newLang);
  
  // Obtener la ruta actual sin el prefijo de idioma
  const currentPath = window.location.pathname;
  const pathSegments = currentPath.split('/').filter(segment => segment);
  
  // Remover el idioma actual de la ruta si existe
  if (languages[pathSegments[0]]) {
    pathSegments.shift();
  }
  
  // Construir nueva ruta
  let newPath = '';
  if (newLang !== defaultLang) {
    newPath = `/${newLang}`;
  }
  
  if (pathSegments.length > 0) {
    newPath += `/${pathSegments.join('/')}`;
  }
  
  if (!newPath) {
    newPath = '/';
  }
  
  // Navegar a la nueva ruta
  window.location.href = newPath;
}

// Función para obtener la URL localizada
export function localizeUrl(url, lang = null) {
  const targetLang = lang || getCurrentLang();
  
  if (targetLang === defaultLang) {
    return url;
  }
  
  // Limpiar la URL
  let cleanUrl = url.startsWith('/') ? url : `/${url}`;
  
  // Si ya tiene prefijo de idioma, removerlo
  const pathSegments = cleanUrl.split('/').filter(segment => segment);
  if (languages[pathSegments[0]]) {
    pathSegments.shift();
    cleanUrl = `/${pathSegments.join('/')}`;
  }
  
  return `/${targetLang}${cleanUrl === '/' ? '' : cleanUrl}`;
}

// Hook para usar en componentes React
export function useTranslation() {
  const currentLang = getCurrentLang();
  
  return {
    t: (key) => t(key, currentLang),
    currentLang,
    changeLang,
    languages,
    localizeUrl: (url) => localizeUrl(url, currentLang)
  };
}

// Función para formatear números según el idioma
export function formatNumber(number, lang = null) {
  const currentLang = lang || getCurrentLang();
  
  const formatters = {
    es: new Intl.NumberFormat('es-ES'),
    en: new Intl.NumberFormat('en-US')
  };
  
  return formatters[currentLang]?.format(number) || number;
}

// Función para formatear precios según el idioma
export function formatPrice(price, currency = 'USD', lang = null) {
  const currentLang = lang || getCurrentLang();
  
  const formatters = {
    es: new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }),
    en: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    })
  };
  
  return formatters[currentLang]?.format(price) || `${currency} ${price}`;
}

// Función para formatear fechas según el idioma
export function formatDate(date, lang = null) {
  const currentLang = lang || getCurrentLang();
  
  const formatters = {
    es: new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    en: new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };
  
  return formatters[currentLang]?.format(new Date(date)) || date;
} 