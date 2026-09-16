/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        doom: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#064e3b',
          900: '#022c22',
          950: '#011711',
          glow: '#00ff88',
          accent: '#00e575',
          dark: '#050a08',
          card: 'rgba(5, 12, 9, 0.72)',
          border: 'rgba(16, 185, 129, 0.28)',
        },
        tva: {
          gold: '#f59e0b',
          amber: '#d97706',
          dark: '#1c1204',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
        display: ['"Cinzel"', '"Montserrat"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'doom-glow': '0 0 35px rgba(0, 255, 136, 0.4), inset 0 0 15px rgba(0, 255, 136, 0.2)',
        'doom-glow-sm': '0 0 15px rgba(0, 255, 136, 0.3)',
        'doom-card': '0 8px 32px 0 rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 255, 136, 0.15)',
        'quantum-glow': '0 0 35px rgba(6, 182, 212, 0.4), 0 0 15px rgba(236, 72, 153, 0.3)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'doom-pulse': 'doomPulse 2s ease-in-out infinite',
        'glitch': 'glitch 4s ease-in-out infinite',
      },
      keyframes: {
        doomPulse: {
          '0%, 100%': { opacity: '0.9', filter: 'drop-shadow(0 0 12px rgba(0, 255, 136, 0.6))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 25px rgba(0, 255, 136, 0.95))' },
        },
        glitch: {
          '0%, 92%, 100%': { transform: 'translate(0)' },
          '93%': { transform: 'translate(-2px, 1px)' },
          '95%': { transform: 'translate(2px, -1px)' },
          '97%': { transform: 'translate(-1px, -1px)' },
        }
      }
    },
  },
  plugins: [],
}
