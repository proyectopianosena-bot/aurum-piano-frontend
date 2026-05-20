/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['Montserrat', 'sans-serif'],
      },
      colors: {
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8C97A',
          dim: '#7a5c1e',
          pale: '#f0e6c8',
        },
      },
      letterSpacing: {
        ultra: '0.5em',
        wide2: '0.3em',
        wide3: '0.4em',
      },
    },
  },
  plugins: [],
}