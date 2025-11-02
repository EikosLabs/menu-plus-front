/** @type {import('tailwindcss').Config} */
module.exports = {
	// O export default si es un archivo .mjs
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		extend: {
			colors: {
				// Ultra Aesthetic Neobrutalist Color Palette
				'neo-black': '#000000ff',
				'neo-flame': '#cf5c36ff',
				'neo-flame-dark': '#a84a2c',
				'neo-flame-light': '#e67a57',
				'neo-flame-lighter': '#f39878',
				'neo-lavender': '#eee5e9ff',
				'neo-lavender-dark': '#d8c9ce',
				'neo-lavender-darker': '#c5b0b6',
				'neo-gray': '#7c7c7cff',
				'neo-sunset': '#efc88bff',
				'neo-sunset-dark': '#d9b36f',
				'neo-sunset-light': '#f5daa9',
				'neo-sunset-lighter': '#fae8c3',
			},
			fontFamily: {
				sans: ["Poppins", "sans-serif"],
			},
			boxShadow: {
				'neo-sm': '4px 4px 0px #000000',
				'neo-md': '6px 6px 0px #000000',
				'neo-lg': '8px 8px 0px #000000',
				'neo-xl': '12px 12px 0px #000000',
				'neo-2xl': '16px 16px 0px #000000',
				'neo-flame': '6px 6px 0px #cf5c36',
				'neo-sunset': '6px 6px 0px #efc88b',
				'neo-gray': '6px 6px 0px #7c7c7c',
			},
			borderWidth: {
				'neo': '4px',
				'neo-thick': '6px',
				'neo-extra': '8px',
			},
			animation: {
				float: "float 6s ease-in-out infinite",
				"fade-up": "fadeUp 0.6s ease forwards",
				"fade-in": "fadeIn 1s ease forwards",
				fadeIn: "fadeIn 0.5s ease-out forwards",
			},
			keyframes: {
				float: {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-20px)" },
				},
				fadeUp: {
					from: { opacity: "0", transform: "translateY(20px)" }, // Asegurando estado inicial para fadeUp
					to: { opacity: "1", transform: "translateY(0)" },
				},
				fadeIn: {
					from: { opacity: "0" }, // Asegurando estado inicial para fadeIn
					to: { opacity: "1" },
				},
			},
		},
	},
	plugins: [],
};
