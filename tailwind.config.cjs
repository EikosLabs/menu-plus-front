/** @type {import('tailwindcss').Config} */
module.exports = { // O export default si es un archivo .mjs
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      // colors: {
      //   primary: '#E05C33',
      //   secondary: '#004E71',
      //   accent: '#FF9B54',
      //   background: '#E6F4F8', // Color de fondo principal de la landing
      //   text: '#0A3342',       // Color de texto principal de la landing
      //   'slate-800': '#1e293b', // Manteniendo un gris oscuro para elementos de UI si es necesario
      //   'slate-900': '#0f172a',
      //   'sky-400': '#38bdf8',
      //   'sky-500': '#0ea5e9',
      // },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 1s ease forwards',
        'fadeIn': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' }, // Asegurando estado inicial para fadeUp
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          'from': { opacity: '0' }, // Asegurando estado inicial para fadeIn
          'to': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} 