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
          DEFAULT: '#0A0B10',
          container: '#12141C',
          'container-high': '#1A1E29',
        },
        secondary: {
          DEFAULT: '#FF6B00', // Premium Orange
          accent: '#7000FF', // Purple
        },
        surface: {
          DEFAULT: '#000000',
          container: '#0A0B10',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
        'glow-conic': 'conic-gradient(from 180deg at 50% 50%, #FF6B00 0deg, #7000FF 120deg, #FF6B00 360deg)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
        'glow-orange': '0 0 20px rgba(255, 107, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
