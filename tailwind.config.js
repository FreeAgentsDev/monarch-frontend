/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Navy corporativo — marca Monarch.
        primary: {
          50: '#eef2f9',
          100: '#d9e2f1',
          200: '#b7c8e3',
          300: '#8aa4cf',
          400: '#5c7bb5',
          500: '#3d5c99',
          600: '#2b477d',
          700: '#243c67',
          800: '#1f3155',
          900: '#182543',
          950: '#0f1830',
        },
        // Acento dorado sobrio para detalles premium.
        accent: {
          50: '#fbf7ec',
          100: '#f5ead0',
          200: '#e9d3a1',
          300: '#dcb96c',
          400: '#cfa043',
          500: '#b8862f',
          600: '#9a6d25',
          700: '#7c5620',
          800: '#654620',
          900: '#563b1e',
        },
      },
    },
  },
  plugins: [],
}
