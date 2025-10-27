// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
    output: "server",
    adapter: node({
        mode: "standalone"
    }),
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
        },
        build: {
            minify: 'terser',
            terserOptions: {
                compress: {
                    drop_console: true,  // Remove console.log
                    drop_debugger: true, // Remove debugger statements
                },
                format: {
                    comments: false,     // Remove all comments
                },
            },
        },
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
