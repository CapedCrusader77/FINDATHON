/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      colors: {
        dark: {
          bg: '#0c0e14',
          surface: '#11141d',
          card: '#161922',
          elevated: '#1b1f2b',
          border: '#222634',
          borderSubtle: '#181b26',
          muted: '#8b949e',
          text: '#f0f3f6'
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81'
        }
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        elevated: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        glow: '0 0 20px -4px rgba(99, 102, 241, 0.25)',
        glowEmerald: '0 0 20px -4px rgba(16, 185, 129, 0.25)'
      }
    }
  },
  plugins: []
}
