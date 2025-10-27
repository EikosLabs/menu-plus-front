// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
    output: "server",
    integrations: [tailwind(), react()],
    server: {
        host: true,
    },
    vite: {
        server: {
            allowedHosts: [
                'menusesqr.online',
                'www.menusesqr.online',
                'menusesqr.com',
                'www.menusesqr.com',
                'localhost',
                '51.222.207.222'
            ]
        }
    },
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
});
