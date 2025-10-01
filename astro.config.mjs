// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
    output: "server",
    integrations: [
        tailwind({
            applyBaseStyles: false, // Evitar CSS duplicado
        }),
        react()
    ],
    i18n: {
        defaultLocale: "es",
        locales: ["es", "en"],
        routing: {
            prefixDefaultLocale: false,
            redirectToDefaultLocale: true,
        },
        fallback: {
            en: "es",
        },
    },
    build: {
        inlineStylesheets: 'auto', // Inline CSS pequeños para reducir requests
    },
    vite: {
        build: {
            cssCodeSplit: true, // Code splitting para CSS
            rollupOptions: {
                output: {
                    manualChunks: {
                        'react-vendor': ['react', 'react-dom'],
                    },
                },
            },
        },
    },
});
