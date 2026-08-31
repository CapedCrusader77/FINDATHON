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
          bg: '#0a0b10',
          surface: '#11131c',
          card: '#161924',
          elevated: '#1e2232',
          border: '#262a3c',
          borderSubtle: '#1d202e',
          muted: '#8e94a8',
          text: '#f3f4f8'
        },
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#818cf8',
          600: '#6366f1',
          700: '#4f46e5',
          800: '#4338ca',
          900: '#3730a3',
          950: '#1e1b4b'
        }
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        elevated: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        glow: '0 0 24px -4px rgba(99, 102, 241, 0.25)',
        glowEmerald: '0 0 20px -4px rgba(16, 185, 129, 0.25)'
      }
    }
  },
  plugins: []
}
