// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
      },
      colors: {
        mac: {
          bg: '#F5F5F7',
          panel: '#FFFFFF',
          border: '#E5E5E5',
          accent: '#007AFF',
        }
      }
    },
  },
  plugins: [],
}