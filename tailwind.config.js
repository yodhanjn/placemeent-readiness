/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B0000',
          hover: '#6E0000',
          light: '#fdf2f2',
        },
      },
    },
  },
  plugins: [],
}
