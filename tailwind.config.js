/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        strava: '#FC4C02',
      },
      gridTemplateColumns: {
        '53': 'repeat(53, minmax(0, 1fr))',
      }
    },
  },
  plugins: [],
}