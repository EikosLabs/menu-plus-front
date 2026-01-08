import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import existing translation files
import es from './locales/es.json';
import en from './locales/en.json';

// Initialize i18next
i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            es: { translation: es },
            en: { translation: en },
        },
        fallbackLng: 'es',
        supportedLngs: ['es', 'en'],

        detection: {
            // Order of detection
            order: ['path', 'localStorage', 'navigator'],
            // Keys for storage
            lookupLocalStorage: 'preferred-language',
            // Path detection: /en/dashboard -> en
            lookupFromPathIndex: 0,
            // Cache selected language
            caches: ['localStorage'],
        },

        interpolation: {
            escapeValue: false, // React already escapes
        },

        react: {
            useSuspense: false, // Avoid issues with SSR/Astro
        },
    });

export default i18n;
