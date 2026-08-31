/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { ink: '#18212f', muted: '#667085', line: '#e6e9ef', brand: '#4668e8' },
      boxShadow: { panel: '0 8px 28px rgba(23, 36, 56, 0.06)' }
    }
  },
  plugins: []
}
