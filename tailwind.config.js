/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: '#0b0f19',
        muted: '#94a3b8',
        line: '#1e293b',
        brand: {
          DEFAULT: '#6366f1',
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          glow: '#818cf8',
        },
        surface: {
          DEFAULT: '#111827',
          card: 'rgba(17, 24, 39, 0.75)',
          border: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.05)',
        }
      },
      boxShadow: {
        panel: '0 12px 36px -4px rgba(0, 0, 0, 0.35)',
        glow: '0 0 25px -3px rgba(99, 102, 241, 0.3)',
        'glow-emerald': '0 0 25px -3px rgba(16, 185, 129, 0.3)',
        'glow-amber': '0 0 25px -3px rgba(245, 158, 11, 0.3)',
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.25)',
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15), transparent 70%)',
        'subtle-grid': 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
      }
    }
  },
  plugins: []
}

