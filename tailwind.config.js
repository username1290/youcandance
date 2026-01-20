/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',
        danger: 'var(--danger-color)',
        warning: 'var(--warning-color)',
        background: 'var(--bg-color)',
        text: 'var(--text-color)',
      }
    },
  },
  plugins: [],
}