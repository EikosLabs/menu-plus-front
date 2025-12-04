// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import node from "@astrojs/node";
import sentry from "@sentry/astro";

// https://astro.build/config
export default defineConfig({
    output: "server",
    adapter: node({
        mode: "standalone"
    }),
    integrations: [tailwind(), react(), sentry()],
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
            ],
            proxy: {
                '/api': {
                    target: 'http://172.19.0.4:8080',
                    changeOrigin: true,
                    rewrite: (path) => path,
                    bodyLimit: 50 * 1024 * 1024, // 50MB
                    configure: (proxy, options) => {
                        proxy.on('proxyReq', (proxyReq, req, res) => {
                            // Handle large file uploads
                            if (req.headers['content-length'] && parseInt(req.headers['content-length']) > 50 * 1024 * 1024) {
                                proxyReq.setHeader('content-length', req.headers['content-length']);
                            }
                        });
                    }
                }
            }
        },
        build: {
            minify: 'terser',
            terserOptions: {
                compress: {
                    drop_console: false,  // Keep console.log for debugging
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
