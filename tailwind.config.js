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
          bg: '#0f1012',
          surface: '#151719',
          card: '#1b1d20',
          elevated: '#23262a',
          border: '#2a2e33',
          borderSubtle: '#202327',
          muted: '#9299a2',
          text: '#f4f1eb'
        },
        brand: {
          50: '#fff3ef',
          100: '#ffe2dc',
          200: '#ffc2b8',
          300: '#ff9d8d',
          400: '#ff8a78',
          500: '#f87567',
          600: '#dc5b50',
          700: '#b9443e',
          800: '#963b38',
          900: '#7b3532'
        }
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        elevated: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        glow: '0 0 30px -6px rgba(248, 117, 103, 0.25)',
        glowEmerald: '0 0 20px -4px rgba(130, 214, 174, 0.25)'
      }
    }
  },
  plugins: []
}
