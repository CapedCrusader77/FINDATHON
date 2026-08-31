/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'Inter', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'monospace']
      },
      colors: {
        macos: {
          bg: '#08090d',
          surface: 'rgba(255, 255, 255, 0.04)',
          surfaceHover: 'rgba(255, 255, 255, 0.08)',
          surfaceActive: 'rgba(255, 255, 255, 0.12)',
          card: 'rgba(18, 22, 34, 0.75)',
          border: 'rgba(255, 255, 255, 0.10)',
          borderSubtle: 'rgba(255, 255, 255, 0.05)',
          borderHighlight: 'rgba(255, 255, 255, 0.20)',
          text: '#f8fafc',
          muted: '#94a3b8',
          subtle: '#64748b',
          accent: '#3b82f6',
          accentHover: '#60a5fa',
          purple: '#a855f7',
          pink: '#ec4899',
          amber: '#f59e0b',
          emerald: '#10b981',
          cyan: '#06b6d4',
          red: '#ff5f56',
          yellow: '#ffbd2e',
          green: '#27c93f'
        }
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)',
        dock: '0 20px 40px -8px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.25)',
        window: '0 25px 60px -15px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.10)',
        glowBlue: '0 0 25px -4px rgba(59, 130, 246, 0.45)',
        glowPurple: '0 0 25px -4px rgba(168, 85, 247, 0.45)',
        glowEmerald: '0 0 25px -4px rgba(16, 185, 129, 0.45)'
      },
      animation: {
        'mesh-slow': 'mesh 18s ease-in-out infinite alternate',
        'mesh-spin': 'meshSpin 25s linear infinite'
      },
      keyframes: {
        mesh: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(40px, -30px) scale(1.12)' },
          '100%': { transform: 'translate(-30px, 35px) scale(0.95)' }
        },
        meshSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      }
    }
  },
  plugins: []
}
